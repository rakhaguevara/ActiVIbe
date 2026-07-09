import { prisma } from '../../config/prisma.js'
import { AppError } from '../../utils/AppError.js'
import { CATEGORY_SYMBOLS } from '../recommendations/recommendation.data.js'
import { ensureOrganizationForOwner } from '../organizations/organization.service.js'
import { findOwnedSubOrganizer } from '../subOrganizers/subOrganizer.service.js'
import { isEventDocumentSetComplete } from './event.validation.js'

// Status "pendaftaran terisi" — sama dengan definisi filledSlots di seluruh
// app: semua status Application KECUALI yang berarti batal/ditolak.
const FILLED_SLOT_STATUSES = ['APPLIED', 'UNDER_REVIEW', 'ACCEPTED', 'WAITLISTED', 'CHECKED_IN', 'COMPLETED', 'NO_SHOW']

// Status event yang boleh dilihat volunteer — PUBLISHED (dibuka pendaftaran)
// dan ONGOING (sedang berjalan, masih relevan utk dilihat/didaftar susulan).
const VOLUNTEER_VISIBLE_STATUSES = ['PUBLISHED', 'ONGOING']

const PUBLIC_EVENT_INCLUDE = {
  organizer: { include: { profile: true } },
  organization: true,
  eventSkills: { include: { skill: true } },
  eventInterests: { include: { interest: true } },
  // Cuma galeri foto yang diekspos ke volunteer — dokumen kepatuhan (proposal,
  // legal, dst.) sengaja TIDAK ikut include ini (lihat EVENT_INCLUDE, privasi).
  galleryImages: { orderBy: { sortOrder: 'asc' } },
}

// "Women respect" (KAI-style): status Application yang dihitung sbg "peserta
// perempuan yang benar-benar akan hadir" — cuma yang sudah ACCEPTED+ (bukan
// semua yang APPLIED), keputusan produk supaya angkanya akurat, bukan sekadar
// jumlah pendaftar. Lihat serializePublicEvent (femaleAcceptedCount).
const FEMALE_APPLICANT_STATUSES = ['ACCEPTED', 'CHECKED_IN', 'COMPLETED']

async function filledSlotsByEventId(eventIds) {
  if (eventIds.length === 0) return new Map()
  const counts = await prisma.application.groupBy({
    by: ['eventId'],
    where: { eventId: { in: eventIds }, status: { in: FILLED_SLOT_STATUSES } },
    _count: { _all: true },
  })
  return new Map(counts.map((c) => [c.eventId, c._count._all]))
}

async function femaleAcceptedCountByEventId(eventIds) {
  if (eventIds.length === 0) return new Map()
  const counts = await prisma.application.groupBy({
    by: ['eventId'],
    where: {
      eventId: { in: eventIds },
      status: { in: FEMALE_APPLICANT_STATUSES },
      user: { profile: { gender: 'FEMALE' } },
    },
    _count: { _all: true },
  })
  return new Map(counts.map((c) => [c.eventId, c._count._all]))
}

// Bentuk publik (volunteer-facing) — SENGAJA terpisah dari serializeEvent()
// yang berbentuk organizer (roles/requirements, bukan skills/interests/organizerName).
function serializePublicEvent(event, filledSlots, femaleAcceptedCount) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    category: event.category ?? 'Umum',
    location: event.location,
    organizerName: event.organizer.name,
    // "Pembina" (fitur women respect) = organizer/pembuat event — tidak ada
    // konsep PIC lapangan terpisah di data model saat ini.
    organizerGender: event.organizer.profile?.gender ?? null,
    organizationId: event.organizationId,
    quota: event.quota,
    filledSlots,
    // Jumlah peserta perempuan yang sudah diterima (ACCEPTED+) — hanya
    // relevan/ditampilkan frontend kalau volunteer yg login FEMALE.
    femaleAcceptedCount,
    startDate: toDateOnly(event.startDate),
    endDate: toDateOnly(event.endDate),
    skills: event.eventSkills.map((es) => es.skill.name),
    interests: event.eventInterests.map((ei) => ei.interest.name),
    motivationTags: event.motivationTags,
    dayType: event.dayType,
    symbol: CATEGORY_SYMBOLS[event.category] ?? '✨',
    status: event.status.toLowerCase(),
    eventMode: event.eventMode,
    mapLink: event.mapLink ?? undefined,
    photos: (event.galleryImages ?? []).map((g) => g.imageUrl),
    registrationClosedAt: event.registrationClosedAt ? event.registrationClosedAt.toISOString() : undefined,
  }
}

// Nama relasi di schema.prisma adalah "eventRoles" (bukan "roles") — field ini
// cuma dipakai internal utk query Prisma; response API tetap pakai "roles"
// (lihat serializeEvent) supaya cocok dgn frontend types/organizer.ts.
const EVENT_INCLUDE = {
  eventRoles: { include: { shifts: true } },
  requirements: true,
  galleryImages: { orderBy: { sortOrder: 'asc' } },
  legalDocuments: true,
  closeReport: true,
  // Ditambahkan supaya serializeEvent() (organizer-facing) bisa mengekspos
  // skills/interests di Overview tab — sebelumnya cuma PUBLIC_EVENT_INCLUDE
  // yang fetch relasi ini.
  eventSkills: { include: { skill: true } },
  eventInterests: { include: { interest: true } },
}

// Satu slot dokumen pendukung (Section "Dokumen Pendukung") -> {url,fileName}
// atau null kalau belum diupload. Dipakai serializeEvent (organizer-facing only
// — lihat catatan privasi di PUBLIC_EVENT_INCLUDE, dokumen ini tidak pernah
// diekspos ke serializePublicEvent).
function serializeDocumentSlot(url, fileName) {
  return url ? { url, fileName: fileName ?? '' } : null
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
    category: event.category ?? undefined,
    motivationTags: event.motivationTags ?? [],
    dayType: event.dayType ?? undefined,
    archivedAt: event.archivedAt ? event.archivedAt.toISOString() : undefined,
    updatedAt: event.updatedAt.toISOString(),
    roles: (event.eventRoles ?? []).map(serializeRole),
    requirements: (event.requirements ?? []).map(serializeRequirement),
    eventMode: event.eventMode,
    mapLink: event.mapLink ?? undefined,
    organizationEntityType: event.organizationEntityType,
    onBehalfOfInstitution: event.onBehalfOfInstitution,
    documents: {
      proposal: serializeDocumentSlot(event.proposalDocUrl, event.proposalDocFileName),
      rundown: serializeDocumentSlot(event.rundownDocUrl, event.rundownDocFileName),
      poster: serializeDocumentSlot(event.posterImageUrl, event.posterImageFileName),
      responsibilityLetter: serializeDocumentSlot(event.responsibilityLetterUrl, event.responsibilityLetterFileName),
      locationPermit: serializeDocumentSlot(event.locationPermitUrl, event.locationPermitFileName),
      cooperationLetter: serializeDocumentSlot(event.cooperationLetterUrl, event.cooperationLetterFileName),
      assignmentLetter: serializeDocumentSlot(event.assignmentLetterUrl, event.assignmentLetterFileName),
    },
    legalDocuments: (event.legalDocuments ?? []).map((d) => ({
      docType: d.docType,
      url: d.fileUrl,
      fileName: d.fileName ?? '',
    })),
    galleryImages: (event.galleryImages ?? []).map((g) => g.imageUrl),
    declarationAcceptedAt: event.declarationAcceptedAt ? event.declarationAcceptedAt.toISOString() : undefined,
    skills: (event.eventSkills ?? []).map((es) => es.skill.name),
    interests: (event.eventInterests ?? []).map((ei) => ei.interest.name),
    picName: event.picName ?? undefined,
    picContact: event.picContact ?? undefined,
    picEmail: event.picEmail ?? undefined,
    picSubOrganizerId: event.picSubOrganizerId ?? undefined,
    registrationClosedAt: event.registrationClosedAt ? event.registrationClosedAt.toISOString() : undefined,
    closeReport: event.closeReport
      ? {
          narrativeSummary: event.closeReport.narrativeSummary,
          volunteersPresentCount: event.closeReport.volunteersPresentCount,
          totalContributionHours: event.closeReport.totalContributionHours,
          photoUrls: event.closeReport.photoUrls,
          constraintsNotes: event.closeReport.constraintsNotes ?? undefined,
          impactSummary: event.closeReport.impactSummary ?? undefined,
          categoryMetrics: event.closeReport.categoryMetrics ?? undefined,
        }
      : undefined,
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

// Business rule 1: satu organizer boleh punya banyak event di tanggal yang
// sama, TAPI harus beda PIC/pengurus penanggung jawab & dokumen (surat)
// kedua event lengkap — kalau tidak, tidak bisa didaftarkan/diajukan.
// Cuma dicek saat submit ke pending_approval (bukan draft — draft masih WIP
// bebas, sama seperti aturan kelengkapan dokumen lain di validateCreateEvent).
const ACTIVE_CONFLICT_STATUSES = ['DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'ONGOING']

function documentSlotOrNull(url) {
  return url ? { url } : null
}

async function assertNoPicConflict(organizerId, data) {
  const overlapping = await prisma.event.findMany({
    where: {
      organizerId,
      status: { in: ACTIVE_CONFLICT_STATUSES },
      startDate: { lte: new Date(data.endDate) },
      endDate: { gte: new Date(data.startDate) },
    },
    include: { legalDocuments: true },
  })
  if (overlapping.length === 0) return

  const newDocsComplete = isEventDocumentSetComplete({
    eventMode: data.eventMode,
    onBehalfOfInstitution: data.onBehalfOfInstitution,
    organizationEntityType: data.organizationEntityType,
    documents: data.documents,
    legalDocumentsCount: data.legalDocuments?.length ?? 0,
  })

  for (const existing of overlapping) {
    const samePic = (existing.picName ?? '').trim().toLowerCase() === (data.picName ?? '').trim().toLowerCase()
    if (samePic) {
      throw new AppError(
        409,
        `PIC/pengurus "${data.picName}" sudah ditugaskan ke event lain ("${existing.title}") pada tanggal yang sama. Gunakan PIC yang berbeda.`,
      )
    }

    const existingDocsComplete = isEventDocumentSetComplete({
      eventMode: existing.eventMode,
      onBehalfOfInstitution: existing.onBehalfOfInstitution,
      organizationEntityType: existing.organizationEntityType,
      documents: {
        proposal: documentSlotOrNull(existing.proposalDocUrl),
        rundown: documentSlotOrNull(existing.rundownDocUrl),
        poster: documentSlotOrNull(existing.posterImageUrl),
        responsibilityLetter: documentSlotOrNull(existing.responsibilityLetterUrl),
        locationPermit: documentSlotOrNull(existing.locationPermitUrl),
        assignmentLetter: documentSlotOrNull(existing.assignmentLetterUrl),
      },
      legalDocumentsCount: existing.legalDocuments.length,
    })

    if (!newDocsComplete || !existingDocsComplete) {
      throw new AppError(
        409,
        `Dokumen pendukung event ini dan/atau event "${existing.title}" pada tanggal yang sama belum lengkap. Lengkapi dokumen kedua event sebelum bisa didaftarkan bersamaan.`,
      )
    }
  }
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

  if (data.status === 'pending_approval') {
    await assertNoPicConflict(organizerId, data)
  }

  // picName/picContact/picEmail tetap snapshot teks yang dikirim frontend
  // (dipilih dari Sub Organizer ATAU diketik manual) — picSubOrganizerId cuma
  // dicatat kalau memang merujuk Sub Organizer milik organisasi organizer ini
  // (cegah reference lintas organisasi lain).
  if (data.picSubOrganizerId) {
    await findOwnedSubOrganizer(organizerId, data.picSubOrganizerId)
  }

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
      eventMode: data.eventMode ?? 'OFFLINE',
      mapLink: data.mapLink?.trim() || null,
      picName: data.picName?.trim() || null,
      picContact: data.picContact?.trim() || null,
      picEmail: data.picEmail?.trim() || null,
      picSubOrganizerId: data.picSubOrganizerId || null,
      organizationEntityType: data.organizationEntityType ?? 'INDIVIDU',
      onBehalfOfInstitution: data.onBehalfOfInstitution ?? false,
      proposalDocUrl: data.documents?.proposal?.url ?? null,
      proposalDocFileName: data.documents?.proposal?.fileName ?? null,
      rundownDocUrl: data.documents?.rundown?.url ?? null,
      rundownDocFileName: data.documents?.rundown?.fileName ?? null,
      posterImageUrl: data.documents?.poster?.url ?? null,
      posterImageFileName: data.documents?.poster?.fileName ?? null,
      responsibilityLetterUrl: data.documents?.responsibilityLetter?.url ?? null,
      responsibilityLetterFileName: data.documents?.responsibilityLetter?.fileName ?? null,
      locationPermitUrl: data.documents?.locationPermit?.url ?? null,
      locationPermitFileName: data.documents?.locationPermit?.fileName ?? null,
      cooperationLetterUrl: data.documents?.cooperationLetter?.url ?? null,
      cooperationLetterFileName: data.documents?.cooperationLetter?.fileName ?? null,
      assignmentLetterUrl: data.documents?.assignmentLetter?.url ?? null,
      assignmentLetterFileName: data.documents?.assignmentLetter?.fileName ?? null,
      declarationAcceptedAt: data.status === 'pending_approval' ? new Date() : null,
      declarationChecklist: data.declarationChecklist ?? undefined,
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
      legalDocuments: {
        create: (data.legalDocuments ?? []).map((doc) => ({
          docType: doc.docType,
          fileUrl: doc.url,
          fileName: doc.fileName ?? null,
        })),
      },
      galleryImages: {
        create: (data.galleryImages ?? []).slice(0, 6).map((image, index) => ({
          imageUrl: image.url,
          fileName: image.fileName ?? null,
          sortOrder: index,
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

  // impactValue tidak punya kolom sendiri di Event (lihat komentar di
  // getEventForOrganizer) — ambil satu ImpactLog representatif per event
  // dalam satu query batch supaya listMyEvents tidak N+1.
  const impactLogs = await prisma.impactLog.findMany({
    where: { application: { eventId: { in: events.map((e) => e.id) } } },
    select: { value: true, application: { select: { eventId: true } } },
  })
  const impactByEventId = new Map()
  for (const log of impactLogs) {
    if (!impactByEventId.has(log.application.eventId)) {
      impactByEventId.set(log.application.eventId, log.value)
    }
  }

  return events.map((event) => {
    const serialized = serializeEvent(event)
    const impactValue = impactByEventId.get(event.id)
    if (impactValue !== undefined) {
      serialized.impactValue = impactValue
    }
    return serialized
  })
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

// Business rule 1b: kategori tertentu punya field impact tambahan yang wajib
// diisi (lihat komentar categoryMetrics di schema.prisma) — validasi ringan
// di sini krn butuh event.category yang cuma tersedia di service layer
// (bukan di validateCloseEvent yang cuma lihat request body).
function assertCategoryMetricsValid(category, categoryMetrics) {
  if (category === 'Seni & Budaya') {
    const rate = categoryMetrics?.successRatePercent
    if (typeof rate !== 'number' || rate < 0 || rate > 100) {
      throw new AppError(400, 'Dampak keberhasilan acara (persen) wajib diisi 0-100 untuk kategori Seni & Budaya')
    }
  }
}

export async function closeEvent(organizerId, eventId, { finalStatuses, impactValue, closeReport }) {
  const event = await findOwnedEventOrThrow(organizerId, eventId)

  assertCategoryMetricsValid(event.category, closeReport.categoryMetrics)

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

    await tx.eventCloseReport.upsert({
      where: { eventId },
      update: {
        narrativeSummary: closeReport.narrativeSummary.trim(),
        volunteersPresentCount: closeReport.volunteersPresentCount,
        totalContributionHours: closeReport.totalContributionHours,
        photoUrls: closeReport.photoUrls ?? [],
        constraintsNotes: closeReport.constraintsNotes?.trim() || null,
        impactSummary: closeReport.impactSummary?.trim() || null,
        categoryMetrics: closeReport.categoryMetrics ?? undefined,
      },
      create: {
        eventId,
        narrativeSummary: closeReport.narrativeSummary.trim(),
        volunteersPresentCount: closeReport.volunteersPresentCount,
        totalContributionHours: closeReport.totalContributionHours,
        photoUrls: closeReport.photoUrls ?? [],
        constraintsNotes: closeReport.constraintsNotes?.trim() || null,
        impactSummary: closeReport.impactSummary?.trim() || null,
        categoryMetrics: closeReport.categoryMetrics ?? undefined,
      },
    })

    await tx.event.update({ where: { id: eventId }, data: { status: 'COMPLETED' } })
  })

  await prisma.auditLog.create({
    data: { actorId: organizerId, action: 'Menutup kegiatan', targetType: 'Event', targetId: eventId, targetLabel: event.title },
  })

  return getEventForOrganizer(organizerId, eventId)
}

// Roster kehadiran per event (FR-044-046) — VolunteerAssignment jadi daftar
// "expected" (siapa dijadwalkan di shift mana), dioverlay AttendanceLog utk
// tahu siapa yang sudah benar-benar check-in. Bentuk return match persis
// AttendanceRecord frontend (types/organizer.ts) supaya AttendancePage.tsx
// tidak perlu berubah.
export async function getEventAttendance(organizerId, eventId) {
  await findOwnedEventOrThrow(organizerId, eventId)

  const assignments = await prisma.volunteerAssignment.findMany({
    where: { eventShift: { eventRole: { eventId } } },
    include: { application: true },
  })
  if (assignments.length === 0) return []

  const logs = await prisma.attendanceLog.findMany({
    where: {
      applicationId: { in: assignments.map((a) => a.applicationId) },
      eventShiftId: { in: assignments.map((a) => a.eventShiftId) },
    },
    orderBy: { checkedInAt: 'desc' },
  })

  return assignments.map((a) => {
    const log = logs.find((l) => l.applicationId === a.applicationId && l.eventShiftId === a.eventShiftId)
    const appStatus = a.application.status
    const status = appStatus === 'NO_SHOW' ? 'no_show' : appStatus === 'CHECKED_IN' || appStatus === 'COMPLETED' ? 'checked_in' : 'expected'
    return {
      id: a.id,
      applicantId: a.applicationId,
      eventId,
      shiftId: a.eventShiftId,
      status,
      checkedInAt: log?.checkedInAt?.toISOString(),
      method: log?.method?.toLowerCase(),
    }
  })
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
  const eventIds = events.map((e) => e.id)
  const [filledSlots, femaleAcceptedCounts] = await Promise.all([
    filledSlotsByEventId(eventIds),
    femaleAcceptedCountByEventId(eventIds),
  ])
  return events.map((event) =>
    serializePublicEvent(event, filledSlots.get(event.id) ?? 0, femaleAcceptedCounts.get(event.id) ?? 0),
  )
}

export async function getPublishedEventById(eventId) {
  const event = await prisma.event.findUnique({ where: { id: eventId }, include: PUBLIC_EVENT_INCLUDE })
  if (!event || !VOLUNTEER_VISIBLE_STATUSES.includes(event.status)) {
    throw new AppError(404, 'Kegiatan tidak ditemukan')
  }
  const [filledSlots, femaleAcceptedCounts] = await Promise.all([
    filledSlotsByEventId([eventId]),
    femaleAcceptedCountByEventId([eventId]),
  ])
  return serializePublicEvent(event, filledSlots.get(eventId) ?? 0, femaleAcceptedCounts.get(eventId) ?? 0)
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

const VIEW_SOURCES = ['search', 'recommendation', 'direct']

export async function logEventView(eventId, userId, source) {
  // Gagal log tidak boleh bikin request gagal — ini cuma telemetri.
  try {
    await prisma.eventView.create({
      data: { eventId, userId: userId ?? null, source: VIEW_SOURCES.includes(source) ? source : 'direct' },
    })
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

// ============================================
// Sertifikat — diterbitkan organizer per volunteer yang menyelesaikan event
// (Application.status COMPLETED), lewat aksi eksplisit "Generate" (bukan
// otomatis saat close event, supaya organizer bisa cek data dulu).
// ============================================

export async function generateEventCertificates(organizerId, eventId) {
  const event = await findOwnedEventOrThrow(organizerId, eventId)
  if (event.status !== 'COMPLETED') {
    throw new AppError(400, 'Sertifikat cuma bisa diterbitkan utk event yang sudah selesai (COMPLETED)')
  }

  const completedApplications = await prisma.application.findMany({
    where: { eventId, status: 'COMPLETED' },
    select: { id: true, certificate: { select: { id: true } } },
  })
  const toIssue = completedApplications.filter((a) => !a.certificate)

  if (toIssue.length > 0) {
    await prisma.certificate.createMany({
      data: toIssue.map((a) => ({ applicationId: a.id, eventId })),
      skipDuplicates: true,
    })
  }

  const total = await prisma.certificate.count({ where: { eventId } })
  return { issued: toIssue.length, total }
}

export async function listEventCertificates(organizerId, eventId) {
  await findOwnedEventOrThrow(organizerId, eventId)
  const certificates = await prisma.certificate.findMany({
    where: { eventId },
    include: { application: { include: { user: { select: { name: true } } } } },
    orderBy: { issuedAt: 'desc' },
  })
  return certificates.map((c) => ({
    id: c.id,
    applicationId: c.applicationId,
    eventId: c.eventId,
    volunteerName: c.application.user.name,
    issuedAt: c.issuedAt.toISOString(),
  }))
}

// ============================================
// Rating/feedback event dari volunteer — hanya boleh diisi kalau volunteer
// benar-benar menyelesaikan keikutsertaannya (Application.status COMPLETED).
// ============================================

export async function submitEventFeedback(userId, eventId, { rating, comment }) {
  const application = await prisma.application.findUnique({ where: { userId_eventId: { userId, eventId } } })
  if (!application || application.status !== 'COMPLETED') {
    throw new AppError(403, 'Rating cuma bisa diberikan setelah kamu menyelesaikan kegiatan ini')
  }

  const feedback = await prisma.eventFeedback.upsert({
    where: { applicationId: application.id },
    update: { rating, comment: comment?.trim() || null },
    create: { applicationId: application.id, eventId, userId, rating, comment: comment?.trim() || null },
  })
  return { id: feedback.id, rating: feedback.rating, comment: feedback.comment }
}

export async function getEventFeedbackSummary(organizerId, eventId) {
  await findOwnedEventOrThrow(organizerId, eventId)
  const result = await prisma.eventFeedback.aggregate({
    where: { eventId },
    _avg: { rating: true },
    _count: { _all: true },
  })
  return { average: result._avg.rating, count: result._count._all }
}

// ============================================
// Traffic source — breakdown dari mana volunteer sampai ke halaman detail
// event, diagregasi lintas seluruh event milik organizer (bukan per-event,
// supaya cukup data utk persentase yang bermakna).
// ============================================

export async function getOrganizerTrafficSummary(organizerId) {
  const events = await prisma.event.findMany({ where: { organizerId }, select: { id: true } })
  const eventIds = events.map((e) => e.id)
  if (eventIds.length === 0) return { total: 0, bySource: {} }

  const grouped = await prisma.eventView.groupBy({
    by: ['source'],
    where: { eventId: { in: eventIds } },
    _count: { _all: true },
  })

  const total = grouped.reduce((sum, g) => sum + g._count._all, 0)
  const bySource = {}
  for (const g of grouped) {
    bySource[g.source ?? 'direct'] = g._count._all
  }
  return { total, bySource }
}

// ============================================
// Archive/restore — status ARCHIVED cuma bisa dicapai dari COMPLETED, dan
// cuma COMPLETED yang bisa dipulihkan dari ARCHIVED (lihat EventStatus enum).
// ============================================

export async function archiveEvent(organizerId, eventId) {
  const event = await findOwnedEventOrThrow(organizerId, eventId)
  if (event.status !== 'COMPLETED') {
    throw new AppError(400, 'Cuma event yang sudah selesai (COMPLETED) yang bisa diarsipkan')
  }
  await prisma.event.update({ where: { id: eventId }, data: { status: 'ARCHIVED', archivedAt: new Date() } })
  return getEventForOrganizer(organizerId, eventId)
}

export async function restoreEvent(organizerId, eventId) {
  const event = await findOwnedEventOrThrow(organizerId, eventId)
  if (event.status !== 'ARCHIVED') {
    throw new AppError(400, 'Cuma event yang diarsipkan yang bisa dipulihkan')
  }
  await prisma.event.update({ where: { id: eventId }, data: { status: 'COMPLETED', archivedAt: null } })
  return getEventForOrganizer(organizerId, eventId)
}

// "Close Pendaftaran" — beda dari closeEvent (COMPLETED) penuh: cuma menutup
// slot pendaftaran baru (dicek applyToEvent di application.service.js),
// event tetap published/ongoing dan bisa dilanjutkan ke closeEvent nanti.
export async function closeRegistration(organizerId, eventId) {
  const event = await findOwnedEventOrThrow(organizerId, eventId)
  if (!['PUBLISHED', 'ONGOING'].includes(event.status)) {
    throw new AppError(400, 'Pendaftaran hanya bisa ditutup untuk event yang sudah published/ongoing')
  }
  if (event.registrationClosedAt) {
    throw new AppError(400, 'Pendaftaran event ini sudah ditutup sebelumnya')
  }
  await prisma.event.update({ where: { id: eventId }, data: { registrationClosedAt: new Date() } })

  await prisma.auditLog.create({
    data: {
      actorId: organizerId,
      action: 'Menutup pendaftaran kegiatan',
      targetType: 'Event',
      targetId: eventId,
      targetLabel: event.title,
    },
  })

  return getEventForOrganizer(organizerId, eventId)
}
