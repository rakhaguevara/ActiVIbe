import { prisma } from '../../config/prisma.js'
import { AppError } from '../../utils/AppError.js'

export async function applyToEvent({ userId, eventId, whatsapp, motivation, availability }) {
  try {
    const application = await prisma.application.create({
      data: { userId, eventId, whatsapp, motivation, availability },
      select: {
        id: true,
        eventId: true,
        status: true,
        appliedAt: true,
      },
    })
    return application
  } catch (err) {
    // P2002 = unique constraint violation (sudah pernah mendaftar)
    if (err?.code === 'P2002') {
      const conflict = new Error('Kamu sudah mendaftar ke kegiatan ini.')
      conflict.statusCode = 409
      throw conflict
    }
    // P2003 = foreign key violation (eventId tidak ada di tabel Event)
    if (err?.code === 'P2003') {
      const notFound = new Error('Kegiatan tidak ditemukan.')
      notFound.statusCode = 404
      throw notFound
    }
    throw err
  }
}

// Event di-embed langsung (bukan cuma eventId) supaya frontend tidak perlu
// join manual ke sumber data lain utk menampilkan riwayat pendaftaran — join
// manual ke mockEvents sebelumnya diam-diam membuang aplikasi yang eventId-nya
// tidak ada di data mock (bug), lihat ApplicationHistoryPage.tsx.
export async function getMyApplications(userId) {
  const applications = await prisma.application.findMany({
    where: { userId },
    select: {
      eventId: true,
      status: true,
      appliedAt: true,
      event: {
        select: {
          id: true,
          title: true,
          location: true,
          category: true,
          startDate: true,
          endDate: true,
          organizer: { select: { name: true } },
        },
      },
    },
    orderBy: { appliedAt: 'desc' },
  })
  return applications.map((app) => ({
    eventId: app.eventId,
    status: app.status,
    appliedAt: app.appliedAt,
    event: {
      id: app.event.id,
      title: app.event.title,
      location: app.event.location,
      category: app.event.category ?? 'Umum',
      organizerName: app.event.organizer.name,
      startDate: app.event.startDate.toISOString().slice(0, 10),
      endDate: app.event.endDate.toISOString().slice(0, 10),
    },
  }))
}

// ============================================
// Organizer-facing: sisi lain dari Application yang sama — bukan modul baru,
// karena "applicant" di dashboard organizer ya baris Application ini juga,
// cuma dibaca/diubah dari perspektif organizer bukan volunteer.
// ============================================

const APPLICANT_INCLUDE = {
  user: {
    include: {
      userSkills: { include: { skill: true } },
      userInterests: { include: { interest: true } },
    },
  },
  assignments: { orderBy: { assignedAt: 'desc' }, take: 1 },
  organizerNotes: { orderBy: { createdAt: 'asc' } },
  requirementStatuses: true,
}

// matchScore/matchReasoning sengaja tidak ada — itu FR-005 (Predictive Match
// Score AI), belum dibangun. Daripada dipalsukan, frontend menampilkan
// "Belum ada Match Score AI" saat field ini undefined.
function serializeApplicant(app, previousEventsCompleted) {
  const latestAssignment = app.assignments?.[0]
  const requirementStatuses = app.requirementStatuses ?? []
  let requirementStatus = 'not_started'
  if (requirementStatuses.length > 0) {
    if (requirementStatuses.every((r) => r.status === 'COMPLETED')) {
      requirementStatus = 'completed'
    } else if (requirementStatuses.some((r) => r.status !== 'NOT_STARTED')) {
      requirementStatus = 'in_progress'
    }
  }

  return {
    id: app.id,
    eventId: app.eventId,
    volunteerName: app.user.name,
    email: app.user.email ?? '',
    skills: (app.user.userSkills ?? []).map((us) => us.skill.name),
    interests: (app.user.userInterests ?? []).map((ui) => ui.interest.name),
    availability: app.availability,
    previousEventsCompleted,
    status: app.status.toLowerCase(),
    assignedRoleId: latestAssignment?.eventRoleId,
    assignedShiftId: latestAssignment?.eventShiftId,
    requirementStatus,
    notes: (app.organizerNotes ?? []).map((n) => n.note),
    appliedAt: app.appliedAt.toISOString().slice(0, 10),
  }
}

async function getApplicantDetail(applicationId) {
  const app = await prisma.application.findUniqueOrThrow({
    where: { id: applicationId },
    include: APPLICANT_INCLUDE,
  })
  const previousEventsCompleted = await prisma.application.count({
    where: { userId: app.userId, status: 'COMPLETED' },
  })
  return serializeApplicant(app, previousEventsCompleted)
}

async function assertOwnsEvent(organizerId, eventId) {
  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event || event.organizerId !== organizerId) {
    throw new AppError(404, 'Event tidak ditemukan')
  }
}

async function assertOwnsApplication(organizerId, applicationId) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { event: true },
  })
  if (!application || application.event.organizerId !== organizerId) {
    throw new AppError(404, 'Pendaftar tidak ditemukan')
  }
  return application
}

export async function listApplicantsForEvent(organizerId, eventId) {
  await assertOwnsEvent(organizerId, eventId)

  const applications = await prisma.application.findMany({
    where: { eventId },
    include: APPLICANT_INCLUDE,
    orderBy: { appliedAt: 'desc' },
  })

  const userIds = applications.map((a) => a.userId)
  const completedCounts = await prisma.application.groupBy({
    by: ['userId'],
    where: { userId: { in: userIds }, status: 'COMPLETED' },
    _count: { _all: true },
  })
  const completedByUser = new Map(completedCounts.map((c) => [c.userId, c._count._all]))

  return applications.map((app) => serializeApplicant(app, completedByUser.get(app.userId) ?? 0))
}

export async function updateApplicationStatus(organizerId, applicationId, status) {
  await assertOwnsApplication(organizerId, applicationId)
  await prisma.application.update({
    where: { id: applicationId },
    data: { status: status.toUpperCase() },
  })
  return getApplicantDetail(applicationId)
}

export async function addOrganizerNote(organizerId, applicationId, note) {
  await assertOwnsApplication(organizerId, applicationId)
  await prisma.organizerNote.create({
    data: { organizerId, applicationId, note: note.trim() },
  })
  return getApplicantDetail(applicationId)
}

export async function assignApplicant(organizerId, applicationId, eventRoleId, eventShiftId) {
  await assertOwnsApplication(organizerId, applicationId)
  await prisma.volunteerAssignment.upsert({
    where: { applicationId_eventShiftId: { applicationId, eventShiftId } },
    update: { eventRoleId, assignedById: organizerId },
    create: { applicationId, eventRoleId, eventShiftId, assignedById: organizerId },
  })
  return getApplicantDetail(applicationId)
}
