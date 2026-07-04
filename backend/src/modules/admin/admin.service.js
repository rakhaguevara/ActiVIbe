import { prisma } from '../../config/prisma.js'
import { AppError } from '../../utils/AppError.js'

const ACCEPTED_APPLICATION_STATUSES = ['ACCEPTED', 'CHECKED_IN', 'COMPLETED']

const STATUS_FILTER_TO_PRISMA = {
  pending: ['PENDING_APPROVAL'],
  approved: ['PUBLISHED', 'ONGOING', 'COMPLETED'],
  rejected: ['REJECTED'],
}

const STATUS_ACTION_LABEL = {
  ACTIVE: 'Mengaktifkan akun pengguna',
  SUSPENDED: 'Menangguhkan akun pengguna',
  INACTIVE: 'Menonaktifkan akun pengguna',
}

function toDateOnly(date) {
  return date.toISOString().slice(0, 10)
}

// ============================================
// Users (FR-019)
// ============================================

async function countEventsJoined(user) {
  return user.role === 'ORGANIZER'
    ? prisma.event.count({ where: { organizerId: user.id } })
    : prisma.application.count({ where: { userId: user.id } })
}

function serializeUser(user, eventsJoined) {
  return {
    id: user.id,
    name: user.name,
    email: user.email ?? '',
    role: user.role,
    status: user.status.toLowerCase(),
    joinedAt: toDateOnly(user.createdAt),
    eventsJoined,
  }
}

export async function listUsers(role) {
  const where = { role: { in: ['VOLUNTEER', 'ORGANIZER'] } }
  if (role === 'VOLUNTEER' || role === 'ORGANIZER') {
    where.role = role
  }

  const users = await prisma.user.findMany({ where, orderBy: { createdAt: 'desc' } })
  return Promise.all(users.map(async (u) => serializeUser(u, await countEventsJoined(u))))
}

export async function updateUserStatus(adminId, userId, status) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new AppError(404, 'Pengguna tidak ditemukan')

  const upperStatus = status.toUpperCase()
  const updated = await prisma.user.update({ where: { id: userId }, data: { status: upperStatus } })

  if (upperStatus === 'SUSPENDED') {
    // Tendang keluar sesi aktifnya — suspend tanpa ini cuma label, user masih
    // bisa terus pakai access token lama sampai expired secara alami.
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  }

  await prisma.auditLog.create({
    data: {
      actorId: adminId,
      action: STATUS_ACTION_LABEL[upperStatus] ?? 'Mengubah status pengguna',
      targetType: 'User',
      targetId: userId,
      targetLabel: user.name,
    },
  })

  return serializeUser(updated, await countEventsJoined(updated))
}

// ============================================
// Events (FR-020)
// ============================================

function serializeAdminEvent(event, filledSlots) {
  const statusMap = {
    PENDING_APPROVAL: 'pending',
    PUBLISHED: 'approved',
    ONGOING: 'approved',
    COMPLETED: 'approved',
    REJECTED: 'rejected',
    DRAFT: 'pending',
  }

  return {
    id: event.id,
    title: event.title,
    category: event.category ?? undefined,
    organizerName: event.organizer.name,
    location: event.location,
    quota: event.quota,
    filledSlots,
    startDate: toDateOnly(event.startDate),
    endDate: toDateOnly(event.endDate),
    status: statusMap[event.status] ?? 'pending',
    impactMetricTemplate: event.impactMetricLabel,
    createdAt: toDateOnly(event.createdAt),
    approvedBy: event.approvedBy?.name,
    approvedAt: event.approvedAt ? toDateOnly(event.approvedAt) : undefined,
  }
}

async function countFilledSlots(eventId) {
  return prisma.application.count({ where: { eventId, status: { in: ACCEPTED_APPLICATION_STATUSES } } })
}

export async function listEvents(status) {
  const where = STATUS_FILTER_TO_PRISMA[status]
    ? { status: { in: STATUS_FILTER_TO_PRISMA[status] } }
    : { status: { not: 'DRAFT' } }

  const events = await prisma.event.findMany({
    where,
    include: { organizer: true, approvedBy: true },
    orderBy: { createdAt: 'desc' },
  })

  return Promise.all(events.map(async (e) => serializeAdminEvent(e, await countFilledSlots(e.id))))
}

async function findEventOrThrow(eventId) {
  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event) throw new AppError(404, 'Kegiatan tidak ditemukan')
  return event
}

export async function approveEvent(adminId, eventId, reviewNote) {
  await findEventOrThrow(eventId)

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: { status: 'PUBLISHED', approvedById: adminId, approvedAt: new Date(), reviewNote: reviewNote?.trim() || null },
    include: { organizer: true, approvedBy: true },
  })

  await prisma.auditLog.create({
    data: { actorId: adminId, action: 'Menyetujui kegiatan', targetType: 'Event', targetId: eventId, targetLabel: updated.title },
  })

  return serializeAdminEvent(updated, await countFilledSlots(eventId))
}

export async function rejectEvent(adminId, eventId, reviewNote) {
  await findEventOrThrow(eventId)

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: { status: 'REJECTED', approvedById: adminId, approvedAt: new Date(), reviewNote: reviewNote.trim() },
    include: { organizer: true, approvedBy: true },
  })

  await prisma.auditLog.create({
    data: { actorId: adminId, action: 'Menolak kegiatan', targetType: 'Event', targetId: eventId, targetLabel: updated.title },
  })

  return serializeAdminEvent(updated, await countFilledSlots(eventId))
}

export async function deleteEvent(adminId, eventId) {
  const event = await findEventOrThrow(eventId)

  await prisma.auditLog.create({
    data: { actorId: adminId, action: 'Menghapus kegiatan', targetType: 'Event', targetId: eventId, targetLabel: event.title },
  })

  await prisma.event.delete({ where: { id: eventId } })
}

// ============================================
// Participation export (FR-021)
// ============================================

export async function listParticipation(from, to) {
  const eventDateFilter = {}
  if (from) eventDateFilter.gte = new Date(from)
  if (to) eventDateFilter.lte = new Date(to)

  const applications = await prisma.application.findMany({
    where: {
      attended: { not: null },
      ...(from || to ? { event: { startDate: eventDateFilter } } : {}),
    },
    include: { user: true, event: true },
    orderBy: { event: { startDate: 'desc' } },
  })

  return applications.map((app) => ({
    id: app.id,
    userName: app.user.name,
    eventTitle: app.event.title,
    attended: app.attended,
    impactMetricLabel: app.event.impactMetricLabel,
    impactValue: app.impactValue ?? 0,
    impactUnit: app.event.impactMetricUnit ?? '',
    date: toDateOnly(app.event.startDate),
  }))
}

// ============================================
// Activity log (FR-022) + Overview (FR-018)
// ============================================

function serializeAuditLog(log) {
  return {
    id: log.id,
    actorName: log.actor?.name ?? 'Sistem',
    actorRole: log.actor?.role ?? 'ADMIN',
    action: log.action,
    targetLabel: log.targetLabel ?? '',
    timestamp: log.createdAt.toISOString(),
  }
}

export async function listActivityLog() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    include: { actor: true },
  })
  return logs.map(serializeAuditLog)
}

export async function getOverviewStats() {
  const [totalUsers, pendingEvents, approvedEvents, ongoingEvents, rejectedEvents, recentLogs] = await Promise.all([
    prisma.user.count({ where: { role: { in: ['VOLUNTEER', 'ORGANIZER'] } } }),
    prisma.event.count({ where: { status: 'PENDING_APPROVAL' } }),
    prisma.event.count({ where: { status: { in: ['PUBLISHED', 'ONGOING', 'COMPLETED'] } } }),
    prisma.event.count({ where: { status: 'ONGOING' } }),
    prisma.event.count({ where: { status: 'REJECTED' } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { actor: true } }),
  ])

  return {
    totalUsers,
    pendingEvents,
    approvedEvents,
    ongoingEvents,
    rejectedEvents,
    recentActivity: recentLogs.map(serializeAuditLog),
  }
}
