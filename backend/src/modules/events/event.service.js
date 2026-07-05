import { prisma } from '../../config/prisma.js'
import { AppError } from '../../utils/AppError.js'
import { CATEGORY_SYMBOLS } from '../recommendations/recommendation.data.js'
import { ensureOrganizationForOwner } from '../organizations/organization.service.js'

// Status "pendaftaran terisi" — sama dengan definisi filledSlots di seluruh
// app: semua status Application KECUALI yang berarti batal/ditolak.
const FILLED_SLOT_STATUSES = ['APPLIED', 'UNDER_REVIEW', 'ACCEPTED', 'WAITLISTED', 'CHECKED_IN', 'COMPLETED', 'NO_SHOW']

// Status event yang boleh dilihat volunteer — PUBLISHED (dibuka pendaftaran)
// dan ONGOING (sedang berjalan, masih relevan utk dilihat/didaftar susulan).
const VOLUNTEER_VISIBLE_STATUSES = ['PUBLISHED', 'ONGOING']

const PUBLIC_EVENT_INCLUDE = {
  organizer: true,
  organization: true,
  eventSkills: { include: { skill: true } },
  eventInterests: { include: { interest: true } },
}

async function filledSlotsByEventId(eventIds) {
  if (eventIds.length === 0) return new Map()
  const counts = await prisma.application.groupBy({
    by: ['eventId'],
    where: { eventId: { in: eventIds }, status: { in: FILLED_SLOT_STATUSES } },
    _count: { _all: true },
  })
  return new Map(counts.map((c) => [c.eventId, c._count._all]))
}

// Bentuk publik (volunteer-facing) — SENGAJA terpisah dari serializeEvent()
// yang berbentuk organizer (roles/requirements, bukan skills/interests/organizerName).
function serializePublicEvent(event, filledSlots) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    category: event.category ?? 'Umum',
    location: event.location,
    organizerName: event.organizer.name,
    organizationId: event.organizationId,
    quota: event.quota,
    filledSlots,
    startDate: toDateOnly(event.startDate),
    endDate: toDateOnly(event.endDate),
    skills: event.eventSkills.map((es) => es.skill.name),
    interests: event.eventInterests.map((ei) => ei.interest.name),
    motivationTags: event.motivationTags,
    dayType: event.dayType,
    symbol: CATEGORY_SYMBOLS[event.category] ?? '✨',
    status: event.status.toLowerCase(),
  }
}

// Nama relasi di schema.prisma adalah "eventRoles" (bukan "roles") — field ini
// cuma dipakai internal utk query Prisma; response API tetap pakai "roles"
// (lihat serializeEvent) supaya cocok dgn frontend types/organizer.ts.
const EVENT_INCLUDE = {
  eventRoles: { include: { shifts: true } },
  requirements: true,
}

// "Z" dipasang sengaja: shiftDate/startTime/endTime cuma perlu jam dinding
// yang konsisten disimpan & dibaca lagi (lihat toTimeOnly, yang juga baca
// via toISOString/UTC) — bukan klaim literal UTC. Tanpa "Z", new Date() parse
// string ini sebagai waktu LOKAL server lalu toISOString() menampilkannya
// sudah tergeser sesuai offset timezone server (mis. "08:00" jadi "01:00"
// kalau server WIB/UTC+7) — itu bug yang sempat kejadian, ini fix-nya.
function combineDateTime(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}:00Z`)
}

function toDateOnly(date) {
  return date.toISOString().slice(0, 10)
}

function toTimeOnly(date) {
  return date.toISOString().slice(11, 16)
}

function serializeShift(shift) {
  return {
    id: shift.id,
    eventRoleId: shift.eventRoleId,
    shiftDate: toDateOnly(shift.shiftDate),
    startTime: toTimeOnly(shift.startTime),
    endTime: toTimeOnly(shift.endTime),
    quota: shift.quota,
    locationPoint: shift.locationPoint ?? '',
  }
}

function serializeRole(role) {
  return {
    id: role.id,
    eventId: role.eventId,
    roleName: role.roleName,
    roleDescription: role.roleDescription ?? '',
    maxVolunteers: role.maxVolunteers,
    shifts: (role.shifts ?? []).map(serializeShift),
  }
}

function serializeRequirement(requirement) {
  return {
    id: requirement.id,
    eventId: requirement.eventId,
    title: requirement.title,
    type: requirement.type.toLowerCase(),
    isMandatory: requirement.isMandatory,
  }
}

function serializeEvent(event) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    location: event.location,
    quota: event.quota,
    startDate: toDateOnly(event.startDate),
    endDate: toDateOnly(event.endDate),
    status: event.status.toLowerCase(),
    impactMetricLabel: event.impactMetricLabel,
    impactMetricUnit: event.impactMetricUnit ?? '',
    roles: (event.eventRoles ?? []).map(serializeRole),
    requirements: (event.requirements ?? []).map(serializeRequirement),
  }
}

function shiftsCreateData(shifts) {
  return (shifts ?? []).map((shift) => ({
    shiftDate: new Date(shift.shiftDate),
    startTime: combineDateTime(shift.shiftDate, shift.startTime),
    endTime: combineDateTime(shift.shiftDate, shift.endTime),
    quota: shift.quota,
    locationPoint: shift.locationPoint ?? null,
  }))
}

export async function createEvent(organizerId, data) {
  // Setiap organizer yang membuat event pertama kalinya otomatis dapat
  // Organization asli di baliknya (FindOrganizationPage butuh entitas nyata,
  // bukan sekadar User role=ORGANIZER) — lihat organization.service.js.
  const organizer = await prisma.user.findUnique({ where: { id: organizerId } })
  const organization = await ensureOrganizationForOwner(organizerId, {
    name: organizer.name,
    email: organizer.email ?? '',
    phone: organizer.phone ?? '',
  })

  const created = await prisma.event.create({
    data: {
      organizerId,
      organizationId: organization.id,
      title: data.title.trim(),
      description: data.description.trim(),
      location: data.location.trim(),
      quota: data.quota,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: data.status.toUpperCase(),
      impactMetricLabel: data.impactMetricLabel.trim(),
      impactMetricUnit: data.impactMetricUnit?.trim() || null,
      category: data.category?.trim() || null,
      motivationTags: data.motivationTags ?? [],
      dayType: data.dayType ?? null,
      eventSkills: { create: (data.skillIds ?? []).map((skillId) => ({ skillId })) },
      eventInterests: { create: (data.interestIds ?? []).map((interestId) => ({ interestId })) },
      eventRoles: {
        create: (data.roles ?? []).map((role) => ({
          roleName: role.roleName.trim(),
          roleDescription: role.roleDescription?.trim() || null,
          maxVolunteers: role.maxVolunteers,
          shifts: { create: shiftsCreateData(role.shifts) },
        })),
      },
    },
    include: EVENT_INCLUDE,
  })

  // Cuma dicatat saat benar-benar diajukan ke admin (bukan disimpan sbg draft)
  // — draft masih "kerjaan organizer sendiri", belum jadi aktivitas penting
  // yg perlu diaudit (FR-022/FR-052).
  if (created.status === 'PENDING_APPROVAL') {
    await prisma.auditLog.create({
      data: {
        actorId: organizerId,
        action: 'Mengajukan kegiatan baru',
        targetType: 'Event',
        targetId: created.id,
        targetLabel: created.title,
      },
    })
  }

  return serializeEvent(created)
}

export async function listMyEvents(organizerId) {
  const events = await prisma.event.findMany({
    where: { organizerId },
    include: EVENT_INCLUDE,
    orderBy: { createdAt: 'desc' },
  })
  return events.map(serializeEvent)
}

async function findOwnedEventOrThrow(organizerId, eventId) {
  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event || event.organizerId !== organizerId) {
    throw new AppError(404, 'Event tidak ditemukan')
  }
  return event
}

export async function getEventForOrganizer(organizerId, eventId) {
  await findOwnedEventOrThrow(organizerId, eventId)

  const event = await prisma.event.findUnique({ where: { id: eventId }, include: EVENT_INCLUDE })
  const serialized = serializeEvent(event)

  // Event tidak punya kolom impactValue sendiri (lihat schema.prisma) — nilai
  // dampak dicatat per-volunteer di ImpactLog. Untuk tampilan ringkasan event,
  // ambil satu nilai representatif (semua volunteer di event yg sama dapat
  // angka yang sama dari closeEvent, lihat closeEvent() di bawah).
  const impactLog = await prisma.impactLog.findFirst({
    where: { application: { eventId } },
    select: { value: true },
  })
  if (impactLog) {
    serialized.impactValue = impactLog.value
  }

  return serialized
}

export async function addRole(organizerId, eventId, data) {
  await findOwnedEventOrThrow(organizerId, eventId)

  const role = await prisma.eventRole.create({
    data: {
      eventId,
      roleName: data.roleName.trim(),
      roleDescription: data.roleDescription?.trim() || null,
      maxVolunteers: data.maxVolunteers,
      shifts: { create: shiftsCreateData(data.shifts) },
    },
    include: { shifts: true },
  })

  return serializeRole(role)
}

export async function addRequirement(organizerId, eventId, data) {
  await findOwnedEventOrThrow(organizerId, eventId)

  const requirement = await prisma.eventRequirement.create({
    data: {
      eventId,
      title: data.title.trim(),
      type: data.type.toUpperCase(),
      isMandatory: data.isMandatory ?? true,
    },
  })

  return serializeRequirement(requirement)
}

export async function closeEvent(organizerId, eventId, { finalStatuses, impactValue }) {
  const event = await findOwnedEventOrThrow(organizerId, eventId)

  await prisma.$transaction(async (tx) => {
    for (const [applicationId, status] of Object.entries(finalStatuses)) {
      const application = await tx.application.findUnique({ where: { id: applicationId } })
      if (!application || application.eventId !== eventId) {
        throw new AppError(400, `Application ${applicationId} bukan bagian dari event ini`)
      }

      const upperStatus = status.toUpperCase()
      const attended = upperStatus === 'COMPLETED'

      await tx.application.update({
        where: { id: applicationId },
        data: { status: upperStatus, attended, impactValue: attended ? impactValue : null },
      })

      if (attended) {
        await tx.impactLog.upsert({
          where: { applicationId },
          update: { metricLabel: event.impactMetricLabel, value: impactValue, unit: event.impactMetricUnit ?? '' },
          create: {
            applicationId,
            metricLabel: event.impactMetricLabel,
            value: impactValue,
            unit: event.impactMetricUnit ?? '',
          },
        })
      }
    }

    await tx.event.update({ where: { id: eventId }, data: { status: 'COMPLETED' } })
  })

  return getEventForOrganizer(organizerId, eventId)
}

// ============================================
// Volunteer-facing (publik): browse & detail — dipakai FindActivityPage dan
// sbg sumber katalog matchable events utk recommendation.service.js.
// ============================================

export async function listPublishedEventsForVolunteer({ keyword, category, location, skill } = {}) {
  const where = {
    status: { in: VOLUNTEER_VISIBLE_STATUSES },
    ...(keyword ? { title: { contains: keyword, mode: 'insensitive' } } : {}),
    ...(category ? { category: { equals: category, mode: 'insensitive' } } : {}),
    ...(location ? { location: { contains: location, mode: 'insensitive' } } : {}),
    ...(skill ? { eventSkills: { some: { skill: { name: { equals: skill, mode: 'insensitive' } } } } } : {}),
  }
  const events = await prisma.event.findMany({ where, include: PUBLIC_EVENT_INCLUDE, orderBy: { startDate: 'asc' } })
  const filledSlots = await filledSlotsByEventId(events.map((e) => e.id))
  return events.map((event) => serializePublicEvent(event, filledSlots.get(event.id) ?? 0))
}

export async function getPublishedEventById(eventId) {
  const event = await prisma.event.findUnique({ where: { id: eventId }, include: PUBLIC_EVENT_INCLUDE })
  if (!event || !VOLUNTEER_VISIBLE_STATUSES.includes(event.status)) {
    throw new AppError(404, 'Kegiatan tidak ditemukan')
  }
  const filledSlots = await filledSlotsByEventId([eventId])
  return serializePublicEvent(event, filledSlots.get(eventId) ?? 0)
}

// Katalog event yang dipakai algoritma matching (matchScore.js) — bentuknya
// sama persis dgn serializePublicEvent tapi tanpa perlu filledSlots per-item
// dihitung 2x kalau nanti dipanggil bareng listing; dipisah fungsi supaya
// recommendation.service.js tidak perlu tahu detail query Prisma-nya.
export async function listMatchableEvents() {
  return listPublishedEventsForVolunteer()
}

// ============================================
// Sinyal perilaku volunteer (buka & simpan event) — dipakai behavioral boost
// di recommendation.service.js. Dipisah dr endpoint listing/detail supaya
// tracking tidak tergantung strategi fetch detail yg dipakai frontend.
// ============================================

export async function logEventView(eventId, userId) {
  // Gagal log tidak boleh bikin request gagal — ini cuma telemetri.
  try {
    await prisma.eventView.create({ data: { eventId, userId: userId ?? null } })
  } catch {
    // eventId tidak valid (FK violation) — abaikan, bukan tanggung jawab endpoint ini
  }
}

export async function bookmarkEvent(userId, eventId) {
  try {
    await prisma.eventBookmark.create({ data: { userId, eventId } })
  } catch (err) {
    // P2002 = sudah pernah di-bookmark sebelumnya — idempotent, bukan error
    if (err?.code !== 'P2002') throw err
  }
}

export async function unbookmarkEvent(userId, eventId) {
  await prisma.eventBookmark.deleteMany({ where: { userId, eventId } })
}

export async function listMyBookmarkedEventIds(userId) {
  const bookmarks = await prisma.eventBookmark.findMany({ where: { userId }, select: { eventId: true } })
  return bookmarks.map((b) => b.eventId)
}
