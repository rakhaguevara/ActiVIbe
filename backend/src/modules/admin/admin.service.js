import { prisma } from '../../config/prisma.js'
import { AppError } from '../../utils/AppError.js'
import { matchProvince } from '../../utils/provinces.js'
import { generateInsights } from './adminAi.service.js'
import bcrypt from 'bcryptjs'

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

export async function updateUserPassword(adminId, userId, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new AppError(404, 'Pengguna tidak ditemukan')

  const hashedPassword = await bcrypt.hash(newPassword, 10)
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  })

  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  })

  await prisma.auditLog.create({
    data: {
      actorId: adminId,
      action: 'Mengubah password pengguna',
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
    // Additive: dokumen verifikasi & galeri — belum ada UI review admin utk ini
    // (di luar scope saat ini), tapi datanya sudah diekspos supaya UI review
    // di masa depan tidak butuh perubahan backend lagi.
    eventMode: event.eventMode,
    mapLink: event.mapLink ?? undefined,
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
  }
}

function serializeDocumentSlot(url, fileName) {
  return url ? { url, fileName: fileName ?? '' } : null
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
    include: { organizer: true, approvedBy: true, galleryImages: { orderBy: { sortOrder: 'asc' } }, legalDocuments: true },
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
    include: { organizer: true, approvedBy: true, galleryImages: { orderBy: { sortOrder: 'asc' } }, legalDocuments: true },
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
    include: { organizer: true, approvedBy: true, galleryImages: { orderBy: { sortOrder: 'asc' } }, legalDocuments: true },
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

// ============================================
// Dashboard widgets (user growth, participation, region map, AI insights)
// ============================================

const REAL_EVENT_STATUSES = ['PUBLISHED', 'ONGOING', 'COMPLETED']
const MONTH_LABELS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function monthKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}`
}

// Pendaftaran baru per bulan (6 bulan terakhir), dipisah Volunteer vs
// Organizer, untuk chart "Pertumbuhan Pengguna" di dashboard admin.
export async function getUserGrowth() {
  const now = new Date()
  const months = []
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ key: monthKey(d), label: MONTH_LABELS_ID[d.getMonth()] })
  }
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const users = await prisma.user.findMany({
    where: { role: { in: ['VOLUNTEER', 'ORGANIZER'] }, createdAt: { gte: rangeStart } },
    select: { role: true, createdAt: true },
  })

  const volunteerByMonth = new Map(months.map((m) => [m.key, 0]))
  const organizerByMonth = new Map(months.map((m) => [m.key, 0]))
  for (const u of users) {
    const key = monthKey(u.createdAt)
    if (u.role === 'VOLUNTEER' && volunteerByMonth.has(key)) volunteerByMonth.set(key, volunteerByMonth.get(key) + 1)
    if (u.role === 'ORGANIZER' && organizerByMonth.has(key)) organizerByMonth.set(key, organizerByMonth.get(key) + 1)
  }

  return {
    months: months.map((m) => m.label),
    volunteer: months.map((m) => volunteerByMonth.get(m.key)),
    organizer: months.map((m) => organizerByMonth.get(m.key)),
  }
}

// "Total Aktif" = jumlah Application yang attendance-nya sudah diisi
// organizer lewat close-event flow (FR-017/FR-048-049) — bukan sekadar
// jumlah user unik, keputusan produk dikonfirmasi lewat pertanyaan user.
export async function getParticipationSummary() {
  const tracked = await prisma.application.findMany({
    where: { attended: { not: null } },
    select: { attended: true, impactValue: true },
  })

  const totalActive = tracked.length
  const attendedCount = tracked.filter((a) => a.attended).length
  const impactFilledCount = tracked.filter((a) => (a.impactValue ?? 0) > 0).length

  return {
    totalActive,
    attendancePct: totalActive ? Math.round((attendedCount / totalActive) * 100) : 0,
    impactFilledPct: totalActive ? Math.round((impactFilledCount / totalActive) * 100) : 0,
  }
}

// Distribusi per provinsi untuk peta Region Distribution. Organization/Profile/
// Event.location adalah teks bebas (belum ada field provinsi baku), jadi
// dicocokkan via matchProvince() (keyword/alias, BUKAN geocoding presisi) —
// entri yang tidak cocok provinsi mana pun sengaja tidak dihitung.
export async function getRegionDistribution() {
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
  const recentSince = new Date(Date.now() - THIRTY_DAYS_MS)
  const priorSince = new Date(Date.now() - 2 * THIRTY_DAYS_MS)

  const [profiles, organizations, events, attendedApplications] = await Promise.all([
    prisma.profile.findMany({
      where: { location: { not: null } },
      select: { location: true, user: { select: { role: true, createdAt: true } } },
    }),
    prisma.organization.findMany({ where: { status: 'ACTIVE' }, select: { location: true, createdAt: true } }),
    prisma.event.findMany({ where: { status: { in: REAL_EVENT_STATUSES } }, select: { location: true } }),
    prisma.application.findMany({
      where: { attended: true },
      select: { impactValue: true, event: { select: { location: true } } },
    }),
  ])

  const buckets = new Map()
  function bucketFor(province) {
    if (!buckets.has(province.geoName)) {
      buckets.set(province.geoName, {
        province,
        volunteerCount: 0,
        ngoCount: 0,
        eventCount: 0,
        hours: 0,
        recentGrowthUnits: 0,
        priorGrowthUnits: 0,
      })
    }
    return buckets.get(province.geoName)
  }

  for (const profile of profiles) {
    if (profile.user.role !== 'VOLUNTEER') continue
    const province = matchProvince(profile.location)
    if (!province) continue
    const bucket = bucketFor(province)
    bucket.volunteerCount += 1
    if (profile.user.createdAt >= recentSince) bucket.recentGrowthUnits += 1
    else if (profile.user.createdAt >= priorSince) bucket.priorGrowthUnits += 1
  }

  for (const org of organizations) {
    const province = matchProvince(org.location)
    if (!province) continue
    const bucket = bucketFor(province)
    bucket.ngoCount += 1
    if (org.createdAt >= recentSince) bucket.recentGrowthUnits += 1
    else if (org.createdAt >= priorSince) bucket.priorGrowthUnits += 1
  }

  for (const event of events) {
    const province = matchProvince(event.location)
    if (!province) continue
    bucketFor(province).eventCount += 1
  }

  // "hours" adalah perkiraan (sum impactValue applications attended=true) —
  // unit impactMetricUnit berbeda tiap event (jam, bibit, dst), jadi angka ini
  // representasi "total poin dampak", bukan jam relawan literal.
  for (const app of attendedApplications) {
    const province = matchProvince(app.event.location)
    if (!province) continue
    bucketFor(province).hours += app.impactValue ?? 0
  }

  const regions = Array.from(buckets.values()).map((b) => {
    const growth =
      b.priorGrowthUnits > 0
        ? Math.round(((b.recentGrowthUnits - b.priorGrowthUnits) / b.priorGrowthUnits) * 100)
        : b.recentGrowthUnits > 0
          ? 100
          : 0
    return {
      id: b.province.displayName.toLowerCase().replace(/\s+/g, '-'),
      name: b.province.displayName,
      volunteerCount: b.volunteerCount,
      eventCount: b.eventCount,
      ngoCount: b.ngoCount,
      hours: Math.round(b.hours),
      growth,
    }
  })

  return { regions }
}

async function getPendingEventsAgingCount() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
  return prisma.event.count({ where: { status: 'PENDING_APPROVAL', createdAt: { lte: cutoff } } })
}

async function getUnverifiedOrganizationCount() {
  // status: ACTIVE saja — organisasi PENDING_VERIFICATION belum diaktivasi
  // pemiliknya (belum klik link email), jadi belum relevan utk admin verifikasi.
  return prisma.organization.count({ where: { isVerified: false, status: 'ACTIVE' } })
}

// Ringkasan angka nyata dipakai admin.service.js sendiri (getOverviewStats)
// DAN adminAi.service.js (insight cards + chat) — satu sumber angka supaya
// AI tidak pernah dikasih data yang berbeda dari yang ditampilkan di dashboard.
export async function buildDashboardSummary() {
  const [totalUsers, pendingEvents, approvedEvents, ongoingEvents, rejectedEvents, participation, regionData, pendingEventsAgingCount, unverifiedOrganizationCount] =
    await Promise.all([
      prisma.user.count({ where: { role: { in: ['VOLUNTEER', 'ORGANIZER'] } } }),
      prisma.event.count({ where: { status: 'PENDING_APPROVAL' } }),
      prisma.event.count({ where: { status: { in: ['PUBLISHED', 'ONGOING', 'COMPLETED'] } } }),
      prisma.event.count({ where: { status: 'ONGOING' } }),
      prisma.event.count({ where: { status: 'REJECTED' } }),
      getParticipationSummary(),
      getRegionDistribution(),
      getPendingEventsAgingCount(),
      getUnverifiedOrganizationCount(),
    ])

  const topGrowingRegion =
    regionData.regions
      .filter((r) => r.volunteerCount > 0 || r.ngoCount > 0)
      .sort((a, b) => b.growth - a.growth)[0] ?? null

  return {
    totalUsers,
    pendingEvents,
    approvedEvents,
    ongoingEvents,
    rejectedEvents,
    participation,
    topGrowingRegion: topGrowingRegion ? { name: topGrowingRegion.name, growth: topGrowingRegion.growth } : null,
    pendingEventsAgingCount,
    unverifiedOrganizationCount,
  }
}

export async function getOverviewStats() {
  const [summary, recentLogs, userGrowth] = await Promise.all([
    buildDashboardSummary(),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { actor: true } }),
    getUserGrowth(),
  ])

  const aiInsights = await generateInsights(summary)

  return {
    totalUsers: summary.totalUsers,
    pendingEvents: summary.pendingEvents,
    approvedEvents: summary.approvedEvents,
    ongoingEvents: summary.ongoingEvents,
    rejectedEvents: summary.rejectedEvents,
    recentActivity: recentLogs.map(serializeAuditLog),
    userGrowth,
    participation: summary.participation,
    aiInsights,
  }
}
