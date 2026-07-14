import { prisma } from '../../config/prisma.js'
import { AppError } from '../../utils/AppError.js'
import { matchProvince } from '../../utils/provinces.js'
import { generateInsights } from './adminAi.service.js'
import { sendOrganizerWarningEmail } from '../../utils/mailer.js'
import { getUserTiers, adminSetTier as adminSetTierService } from '../subscriptions/subscription.service.js'
import { getMonthlyPrice } from '../subscriptions/plans.js'
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

export async function deleteUser(adminId, userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new AppError(404, 'Pengguna tidak ditemukan')
  if (user.role === 'ADMIN') throw new AppError(400, 'Akun admin tidak bisa dihapus lewat halaman ini')

  // Sebagian besar relasi (Application/Profile/organizedEvents dst.) sudah
  // onDelete: Cascade di schema.prisma. Tapi 3 tabel ini merujuk User via FK
  // "siapa yang melakukan aksi" (CommunicationLog.sentById, VolunteerAssignment
  // .assignedById, OrganizerWarning.organizerId) TANPA onDelete cascade/setNull
  // — dites langsung terhadap DB (bukan cuma dibaca dari schema): Postgres
  // TIDAK menunda FK check ini sampai cascade Event selesai, jadi harus
  // dibersihkan manual dulu sebelum prisma.user.delete(), else P2003.
  await prisma.$transaction([
    prisma.communicationLog.deleteMany({ where: { sentById: userId } }),
    prisma.volunteerAssignment.deleteMany({ where: { assignedById: userId } }),
    prisma.organizerWarning.deleteMany({ where: { organizerId: userId } }),
    prisma.auditLog.create({
      data: { actorId: adminId, action: 'Menghapus akun pengguna', targetType: 'User', targetId: userId, targetLabel: user.name },
    }),
    prisma.user.delete({ where: { id: userId } }),
  ])
}

// ============================================
// Events (FR-020)
// ============================================

function serializeAdminEvent(event, filledSlots, organizerTier = 'FREE') {
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
    // ActiVibe Plus — organizer PLUS_STARTER/PLUS_PRO dapat prioritas review
    // (disortir ke atas, lihat listEvents) + label "Premium" di UI admin.
    organizerTier,
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

  // ActiVibe Plus — prioritas review: organizer PLUS_STARTER/PLUS_PRO
  // disortir ke atas (stable sort, createdAt desc tetap jadi urutan sekunder,
  // lihat komentar organizerTier di serializeAdminEvent).
  const tierByOrganizerId = await getUserTiers(events.map((e) => e.organizerId))
  const serialized = await Promise.all(
    events.map(async (e) => serializeAdminEvent(e, await countFilledSlots(e.id), tierByOrganizerId.get(e.organizerId) ?? 'FREE')),
  )
  return serialized.sort((a, b) => Number(b.organizerTier !== 'FREE') - Number(a.organizerTier !== 'FREE'))
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
// Penutupan Dini (Event.closedBeforeSchedule) — organizer menutup event
// sebelum endDate lewat dgn partisipasi rendah (lihat event.service.js
// closeEvent & frontend eventLifecycle.ts). Admin cuma mereview & bisa
// mengirim peringatan tercatat — bukan strike/suspend otomatis.
// ============================================

function serializePrematureClosure(event) {
  const lastWarning = event.organizerWarnings[0]
  return {
    id: event.id,
    title: event.title,
    organizerName: event.organizer.name,
    closedAt: event.closedAt ? event.closedAt.toISOString() : null,
    endDate: toDateOnly(event.endDate),
    participationRatePercentAtClose: event.participationRatePercentAtClose ?? 0,
    hasWarning: Boolean(lastWarning),
    lastWarningMessage: lastWarning?.message ?? undefined,
    lastWarningAt: lastWarning ? lastWarning.createdAt.toISOString() : undefined,
  }
}

export async function listPrematureClosures() {
  const events = await prisma.event.findMany({
    where: { closedBeforeSchedule: true },
    include: {
      organizer: true,
      organizerWarnings: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { closedAt: 'desc' },
  })
  return events.map(serializePrematureClosure)
}

export async function sendOrganizerWarning(adminId, eventId, message) {
  const event = await prisma.event.findUnique({ where: { id: eventId }, include: { organizer: true } })
  if (!event) throw new AppError(404, 'Kegiatan tidak ditemukan')
  if (!event.closedBeforeSchedule) {
    throw new AppError(400, 'Event ini bukan penutupan dini, tidak bisa dikirim peringatan')
  }

  await prisma.organizerWarning.create({
    data: {
      eventId,
      organizerId: event.organizerId,
      adminId,
      message: message.trim(),
      participationRatePercent: event.participationRatePercentAtClose ?? 0,
    },
  })

  if (event.organizer.email) {
    sendOrganizerWarningEmail(event.organizer.email, {
      organizerName: event.organizer.name,
      eventTitle: event.title,
      message: message.trim(),
      participationRatePercent: event.participationRatePercentAtClose ?? 0,
    }).catch((err) => console.error('[admin] gagal mengirim email peringatan penutupan dini:', err))
  }

  await prisma.auditLog.create({
    data: {
      actorId: adminId,
      action: 'Mengirim peringatan penutupan dini',
      targetType: 'Event',
      targetId: eventId,
      targetLabel: event.title,
    },
  })

  const refreshed = await prisma.event.findUnique({
    where: { id: eventId },
    include: { organizer: true, organizerWarnings: { orderBy: { createdAt: 'desc' }, take: 1 } },
  })
  return serializePrematureClosure(refreshed)
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
    userEmail: app.user.email,
    eventTitle: app.event.title,
    attended: app.attended,
    impactMetricLabel: app.event.impactMetricLabel,
    impactValue: app.impactValue ?? 0,
    impactUnit: app.event.impactMetricUnit ?? '',
    date: toDateOnly(app.event.startDate),
  }))
}

// Ringkasan partisipasi per kategori event, dipakai KPI card di halaman
// Partisipasi (FR-021 export). Count = jumlah Application attended
// non-null (definisi sama dgn "Total Aktif" milik getParticipationSummary()),
// dikelompokkan per Event.category. Trend = growth bulan ini vs bulan lalu
// berdasar Event.startDate (kapan kegiatannya berlangsung — konsisten dgn
// listParticipation() yang juga memfilter dari startDate, bukan dari kapan
// attendance-nya ditandai organizer).
export async function getParticipationByCategory() {
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const tracked = await prisma.application.findMany({
    where: { attended: { not: null } },
    select: { event: { select: { category: true, startDate: true } } },
  })

  const totals = new Map()
  const thisMonthCounts = new Map()
  const lastMonthCounts = new Map()

  for (const { event } of tracked) {
    const category = event?.category
    if (!category) continue
    totals.set(category, (totals.get(category) ?? 0) + 1)
    if (event.startDate >= thisMonthStart) {
      thisMonthCounts.set(category, (thisMonthCounts.get(category) ?? 0) + 1)
    } else if (event.startDate >= lastMonthStart && event.startDate < thisMonthStart) {
      lastMonthCounts.set(category, (lastMonthCounts.get(category) ?? 0) + 1)
    }
  }

  return Array.from(totals.entries())
    .map(([category, count]) => {
      const current = thisMonthCounts.get(category) ?? 0
      const previous = lastMonthCounts.get(category) ?? 0
      // previous === 0 sengaja dikembalikan null (bukan 0% atau +100%) —
      // tidak ada baseline yang valid untuk dihitung growth-nya.
      const growthPct = previous > 0 ? Math.round(((current - previous) / previous) * 100) : null
      return { category, count, growthPct }
    })
    .sort((a, b) => b.count - a.count)
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
    // deletedAt: null — defense-in-depth, organisasi yang sudah di-soft-delete
    // (Settings > Security) tidak boleh ikut kehitung di statistik region admin
    // walau status-nya somehow masih ACTIVE (softDeleteMyOrganization sengaja
    // tidak mengubah status, lihat organization.service.js).
    prisma.organization.findMany({ where: { status: 'ACTIVE', deletedAt: null }, select: { location: true, createdAt: true } }),
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
  // deletedAt: null — defense-in-depth, sama alasan dgn getRegionDistribution di atas.
  return prisma.organization.count({ where: { isVerified: false, status: 'ACTIVE', deletedAt: null } })
}

// Ringkasan angka nyata dipakai admin.service.js sendiri (getOverviewStats)
// DAN adminAi.service.js (insight cards + chat) — satu sumber angka supaya
// AI tidak pernah dikasih data yang berbeda dari yang ditampilkan di dashboard.
export async function buildDashboardSummary() {
  const [totalUsers, pendingEvents, approvedEvents, ongoingEvents, rejectedEvents, participation, regionData, pendingEventsAgingCount, unverifiedOrganizationCount, userGrowth] =
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
      getUserGrowth(),
    ])

  const topGrowingRegion =
    regionData.regions
      .filter((r) => r.volunteerCount > 0 || r.ngoCount > 0)
      .sort((a, b) => b.growth - a.growth)[0] ?? null

  // Pendaftar bulan ini vs bulan lalu, diturunkan dari 2 bucket terakhir
  // getUserGrowth() (bukan query baru) — dipakai adminAi.service.js utk
  // kartu rekomendasi pemasaran kalau pendaftar menurun.
  const months = userGrowth.months.length
  const registrantTrend = {
    thisMonth: months >= 1 ? userGrowth.volunteer[months - 1] + userGrowth.organizer[months - 1] : 0,
    lastMonth: months >= 2 ? userGrowth.volunteer[months - 2] + userGrowth.organizer[months - 2] : 0,
  }

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
    registrantTrend,
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

// ============================================
// ActiVibe Plus — Revenue (nav baru "Revenue" di grup Manajemen, sejajar
// "Pengguna"/"Kegiatan"). Pembayaran di-mock (lihat subscriptions/plans.js) —
// angka di sini murni dari Transaction yang tercatat lewat checkout self-serve
// (method 'simulasi') ATAU override manual admin (method 'admin-manual',
// amount 0, lihat adminSetTier di bawah).
// ============================================

export async function getRevenueSummary() {
  const [transactions, activeSubscriptions, totalUsers] = await Promise.all([
    prisma.transaction.findMany({ where: { status: 'SUCCESS' } }),
    prisma.subscription.findMany({ where: { status: 'ACTIVE' } }),
    prisma.user.count(),
  ])

  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0)

  const now = new Date()
  const activeByTier = { PLUS_STARTER: 0, PLUS_PRO: 0 }
  // MRR (Monthly Recurring Revenue) — dihitung dari harga efektif per bulan
  // tiap subscriber ACTIVE saat ini (audience+cycle row-nya sendiri, BUKAN
  // harga tunggal per tier lagi — organizer/volunteer & monthly/yearly beda
  // harga sejak subscription dipecah per audience, lihat plans.js), BUKAN
  // dari total historis Transaction (yang bisa termasuk langganan yang
  // sudah cancelled/expired).
  let mrr = 0
  for (const sub of activeSubscriptions) {
    if (sub.currentPeriodEnd && sub.currentPeriodEnd < now) continue
    if (sub.tier === 'PLUS_STARTER') activeByTier.PLUS_STARTER += 1
    else if (sub.tier === 'PLUS_PRO') activeByTier.PLUS_PRO += 1
    if (sub.tier === 'PLUS_STARTER' || sub.tier === 'PLUS_PRO') {
      mrr += getMonthlyPrice(sub.tier, sub.audience, sub.billingCycle)
    }
  }

  const paidSubscribers = activeByTier.PLUS_STARTER + activeByTier.PLUS_PRO
  const subscriberCounts = {
    FREE: Math.max(0, totalUsers - paidSubscribers),
    PLUS_STARTER: activeByTier.PLUS_STARTER,
    PLUS_PRO: activeByTier.PLUS_PRO,
  }

  const recentTransactions = await prisma.transaction.findMany({
    orderBy: { paidAt: 'desc' },
    take: 20,
    include: { subscription: { include: { user: { select: { name: true, email: true, role: true } } } } },
  })

  return {
    totalRevenue,
    mrr,
    subscriberCounts,
    recentTransactions: recentTransactions.map((t) => ({
      id: t.id,
      userName: t.subscription.user.name,
      userEmail: t.subscription.user.email,
      userRole: t.subscription.user.role,
      tier: t.tier,
      audience: t.audience,
      billingCycle: t.billingCycle,
      amount: t.amount,
      method: t.method,
      status: t.status,
      paidAt: t.paidAt,
    })),
  }
}

// Semua user ORGANIZER/VOLUNTEER (bukan cuma yang sudah pernah checkout) —
// supaya admin bisa granting paket manual ke user yang belum pernah
// bersentuhan dengan Subscription sama sekali (masih FREE implisit, lihat
// getUserTier), bukan cuma mengelola yang sudah ada baris Subscription-nya.
export async function listSubscriptions() {
  const users = await prisma.user.findMany({
    where: { role: { in: ['ORGANIZER', 'VOLUNTEER'] } },
    select: { id: true, name: true, email: true, role: true, subscription: true },
    orderBy: { createdAt: 'desc' },
  })
  const now = new Date()
  return users.map((u) => {
    const sub = u.subscription
    const expired = Boolean(sub?.currentPeriodEnd && sub.currentPeriodEnd < now)
    const tier = !sub || sub.status === 'CANCELLED' || expired ? 'FREE' : sub.tier
    return {
      userId: u.id,
      userName: u.name,
      userEmail: u.email,
      userRole: u.role,
      tier,
      audience: sub?.audience ?? null,
      billingCycle: sub?.billingCycle ?? null,
      status: sub?.status ?? 'ACTIVE',
      currentPeriodEnd: sub?.currentPeriodEnd ?? null,
    }
  })
}

// Jalur "approve manual" — admin override tier seorang user tanpa lewat
// checkout self-serve (mis. pembayaran offline/manual di luar sistem).
export async function adminSetSubscriptionTier(adminId, userId, tier) {
  const result = await adminSetTierService(userId, tier)
  await prisma.auditLog.create({
    data: {
      actorId: adminId,
      action: `Mengubah paket ActiVibe Plus user jadi ${tier}`,
      targetType: 'User',
      targetId: userId,
    },
  })
  return result
}

// ============================================
// Certificate Templates — library global yg dikelola admin, dipakai
// backend/src/modules/certificates/certificate.service.js. Cuma SATU baris
// isActive true di satu waktu (dipakai generate() organizer manapun).
// ============================================
export async function listCertificateTemplates() {
  const templates = await prisma.certificateTemplate.findMany({
    include: { uploadedBy: { select: { name: true } }, _count: { select: { versions: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return templates.map((t) => ({
    id: t.id,
    name: t.name,
    fileUrl: t.fileUrl,
    isActive: t.isActive,
    uploadedByName: t.uploadedBy.name,
    usageCount: t._count.versions,
    createdAt: t.createdAt.toISOString(),
  }))
}

export async function createCertificateTemplate(adminId, { name, file }) {
  if (!name || !name.trim()) throw new AppError(400, 'Nama template wajib diisi')
  if (!file) throw new AppError(400, 'Pilih file template terlebih dahulu')
  const template = await prisma.certificateTemplate.create({
    data: {
      name,
      fileUrl: `/uploads/certificate-templates/${file.filename}`,
      uploadedById: adminId,
    },
  })
  await prisma.auditLog.create({
    data: { actorId: adminId, action: 'Menambahkan template sertifikat', targetType: 'CertificateTemplate', targetId: template.id, targetLabel: name },
  })
  return template
}

export async function setActiveCertificateTemplate(adminId, templateId) {
  const template = await prisma.certificateTemplate.findUnique({ where: { id: templateId } })
  if (!template) throw new AppError(404, 'Template tidak ditemukan')

  await prisma.$transaction([
    prisma.certificateTemplate.updateMany({ where: { isActive: true }, data: { isActive: false } }),
    prisma.certificateTemplate.update({ where: { id: templateId }, data: { isActive: true } }),
  ])

  await prisma.auditLog.create({
    data: { actorId: adminId, action: 'Mengaktifkan template sertifikat', targetType: 'CertificateTemplate', targetId: templateId, targetLabel: template.name },
  })
}

export async function deleteCertificateTemplate(adminId, templateId) {
  const template = await prisma.certificateTemplate.findUnique({
    where: { id: templateId },
    include: { _count: { select: { versions: true } } },
  })
  if (!template) throw new AppError(404, 'Template tidak ditemukan')
  if (template._count.versions > 0) {
    throw new AppError(409, 'Template ini sudah pernah dipakai menerbitkan sertifikat, tidak bisa dihapus')
  }

  await prisma.certificateTemplate.delete({ where: { id: templateId } })
  await prisma.auditLog.create({
    data: { actorId: adminId, action: 'Menghapus template sertifikat', targetType: 'CertificateTemplate', targetId: templateId, targetLabel: template.name },
  })
}
