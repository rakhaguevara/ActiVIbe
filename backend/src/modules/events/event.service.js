import { prisma } from '../../config/prisma.js'
import { AppError } from '../../utils/AppError.js'

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
  const created = await prisma.event.create({
    data: {
      organizerId,
      title: data.title.trim(),
      description: data.description.trim(),
      location: data.location.trim(),
      quota: data.quota,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: data.status.toUpperCase(),
      impactMetricLabel: data.impactMetricLabel.trim(),
      impactMetricUnit: data.impactMetricUnit?.trim() || null,
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
