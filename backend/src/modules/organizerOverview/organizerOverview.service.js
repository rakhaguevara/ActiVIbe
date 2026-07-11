import { prisma } from '../../config/prisma.js'
import { AppError } from '../../utils/AppError.js'
import { generateInsights } from './organizerOverviewAi.service.js'
import { getUserTier } from '../subscriptions/subscription.service.js'

const ACTIVE_EVENT_STATUSES = ['PUBLISHED', 'ONGOING']
const PENDING_APPLICANT_STATUSES = ['APPLIED', 'UNDER_REVIEW']
const ACCEPTED_APPLICANT_STATUSES = ['ACCEPTED', 'CHECKED_IN', 'COMPLETED']
// Sama persis FILLED_SLOT_STATUSES di events/event.service.js — diduplikasi
// lokal (bukan diimpor), pola sama getApplicantsGrowth di file ini: modul ini
// sengaja tidak bergantung ke modul events.
const FILLED_SLOT_STATUSES = ['APPLIED', 'UNDER_REVIEW', 'ACCEPTED', 'WAITLISTED', 'CHECKED_IN', 'COMPLETED', 'NO_SHOW']
const MONTH_LABELS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function monthKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}`
}

function isSameMonth(date, ref) {
  return date.getFullYear() === ref.getFullYear() && date.getMonth() === ref.getMonth()
}

// Metrik dampak dinamis: kategori event yang paling sering ditutup organizer
// ini menentukan angka & label yang ditampilkan (lihat komentar categoryMetrics
// di schema.prisma utk bentuk per kategori) — bukan selalu "Trees" spt desain
// awal, supaya organizer non-Lingkungan tetap dapat angka yang bermakna.
function computeImpactMetric(events) {
  const withReport = events.filter((e) => e.closeReport)
  const categoryCounts = new Map()
  for (const e of withReport) {
    const cat = e.category ?? 'Umum'
    categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1)
  }
  const dominant = Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  function sum(values) {
    return values.reduce((a, b) => a + b, 0)
  }

  if (dominant === 'Lingkungan') {
    const value = sum(
      withReport.filter((e) => e.category === dominant).map((e) => e.closeReport.categoryMetrics?.treesPlanted ?? 0),
    )
    return { category: dominant, label: 'Pohon Ditanam', unit: 'Pohon', value }
  }

  if (dominant === 'Pendidikan' || dominant === 'Kesehatan' || dominant === 'Sosial') {
    const value = sum(
      withReport.filter((e) => e.category === dominant).map((e) => e.closeReport.categoryMetrics?.peopleImpacted ?? 0),
    )
    return { category: dominant, label: 'Orang Terdampak', unit: 'Orang', value }
  }

  if (dominant === 'Seni & Budaya') {
    const rates = withReport
      .filter((e) => e.category === dominant)
      .map((e) => e.closeReport.categoryMetrics?.successRatePercent)
      .filter((v) => typeof v === 'number')
    const value = rates.length > 0 ? Math.round(sum(rates) / rates.length) : 0
    return { category: dominant, label: 'Rata-rata Keberhasilan Acara', unit: '%', value }
  }

  // Teknologi/Umum/tidak ada event selesai sama sekali -> jam kontribusi,
  // satu-satunya metrik yang selalu ada terlepas dari kategori.
  const value = Math.round(sum(withReport.map((e) => e.closeReport.totalContributionHours ?? 0)))
  return { category: dominant, label: 'Jam Kontribusi', unit: 'Jam', value }
}

async function getImpactTotals(organizerId, { thisMonthOnly } = {}) {
  const now = new Date()
  const [completedEvents, volunteersReached] = await Promise.all([
    prisma.event.findMany({
      where: { organizerId, status: 'COMPLETED' },
      select: { category: true, closeReport: { select: { categoryMetrics: true, totalContributionHours: true, createdAt: true } } },
    }),
    prisma.application.count({
      where: {
        event: { organizerId },
        status: { in: ACCEPTED_APPLICANT_STATUSES },
        ...(thisMonthOnly ? { appliedAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } } : {}),
      },
    }),
  ])

  const scopedEvents = thisMonthOnly
    ? completedEvents.filter((e) => e.closeReport && isSameMonth(e.closeReport.createdAt, now))
    : completedEvents

  return {
    eventsCompleted: scopedEvents.filter((e) => e.closeReport).length,
    volunteersReached,
    contributionHours: Math.round(scopedEvents.reduce((sum, e) => sum + (e.closeReport?.totalContributionHours ?? 0), 0)),
    impact: computeImpactMetric(scopedEvents),
  }
}

// Roster "hari ini": VolunteerAssignment yang shift-nya jatuh hari ini,
// dioverlay status Application (pola sama getEventAttendance di event.service.js,
// tapi lintas semua event organizer & difilter ke tanggal hari ini).
async function getTodayAttendance(organizerId) {
  const start = startOfToday()
  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  const assignments = await prisma.volunteerAssignment.findMany({
    where: { eventShift: { shiftDate: { gte: start, lt: end }, eventRole: { event: { organizerId } } } },
    include: { application: { select: { status: true } } },
  })

  const expected = assignments.length
  const checkedIn = assignments.filter((a) => ['CHECKED_IN', 'COMPLETED'].includes(a.application.status)).length
  return { expected, checkedIn, pct: expected > 0 ? Math.round((checkedIn / expected) * 100) : 0 }
}

// Pendaftaran baru per bulan (6 bulan terakhir) lintas seluruh event
// organizer — pola bucket bulan sama dgn admin.service.js getUserGrowth(),
// diduplikasi lokal (bukan diimpor dari modul admin) krn cuma ~10 baris dan
// modul ini tidak seharusnya bergantung ke modul admin.
async function getApplicantsGrowth(eventIds) {
  const now = new Date()
  const months = []
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ key: monthKey(d), label: MONTH_LABELS_ID[d.getMonth()] })
  }
  if (eventIds.length === 0) {
    return { months: months.map((m) => m.label), counts: months.map(() => 0) }
  }

  const rangeStart = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const applications = await prisma.application.findMany({
    where: { eventId: { in: eventIds }, appliedAt: { gte: rangeStart } },
    select: { appliedAt: true },
  })

  const byMonth = new Map(months.map((m) => [m.key, 0]))
  for (const app of applications) {
    const key = monthKey(app.appliedAt)
    if (byMonth.has(key)) byMonth.set(key, byMonth.get(key) + 1)
  }

  return { months: months.map((m) => m.label), counts: months.map((m) => byMonth.get(m.key)) }
}

// Event aktif (published/ongoing) dengan pendaftaran masih sepi (<50% quota)
// padahal startDate (= "tenggat" implisit — tidak ada field deadline
// pendaftaran terpisah, volunteer tidak bisa daftar setelah event mulai)
// sudah &lt;=7 hari lagi. Dipakai organizerOverviewAi.service.js utk kartu
// "Boost Event" (fallback deterministik) & untuk mengarahkan riset "Cari Ide
// Campaign/Event Baru" ke event yang paling butuh.
async function getEventsNeedingBoost(activeEvents) {
  if (activeEvents.length === 0) return []

  const ids = activeEvents.map((e) => e.id)
  const counts = await prisma.application.groupBy({
    by: ['eventId'],
    where: { eventId: { in: ids }, status: { in: FILLED_SLOT_STATUSES } },
    _count: { _all: true },
  })
  const filledByEventId = new Map(counts.map((c) => [c.eventId, c._count._all]))

  const today = startOfToday()
  return activeEvents
    .map((e) => {
      const filled = filledByEventId.get(e.id) ?? 0
      const fillRatio = e.quota > 0 ? filled / e.quota : 0
      const daysUntilStart = Math.ceil((e.startDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
      return { id: e.id, title: e.title, quota: e.quota, filled, fillRatio, daysUntilStart }
    })
    .filter((e) => e.daysUntilStart >= 0 && e.daysUntilStart <= 7 && e.fillRatio < 0.5)
    .sort((a, b) => a.daysUntilStart - b.daysUntilStart)
    .slice(0, 2)
}

function serializeAuditLog(log) {
  return {
    id: log.id,
    action: log.action,
    targetLabel: log.targetLabel ?? '',
    timestamp: log.createdAt.toISOString(),
  }
}

async function getRecentActivity(organizerId) {
  const logs = await prisma.auditLog.findMany({
    where: { actorId: organizerId },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })
  return logs.map(serializeAuditLog)
}

// Peringatan admin (Event.closedBeforeSchedule -> OrganizerWarning) yang
// belum di-dismiss organizer — dipakai banner Dashboard Home (bukan dropdown
// notifikasi, yang masih static stub, lihat CLAUDE.md). Hanya diambil lintas
// event organizer ini sendiri (organizerId di-filter langsung, tidak lewat
// eventIds — OrganizerWarning.organizerId sudah scoped saat dibuat admin).
async function getActiveWarnings(organizerId) {
  const warnings = await prisma.organizerWarning.findMany({
    where: { organizerId, acknowledgedAt: null },
    include: { event: { select: { id: true, title: true } } },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })
  return warnings.map((w) => ({
    id: w.id,
    eventId: w.eventId,
    eventTitle: w.event.title,
    message: w.message,
    participationRatePercent: w.participationRatePercent,
    createdAt: w.createdAt.toISOString(),
  }))
}

export async function acknowledgeOrganizerWarning(organizerId, warningId) {
  const warning = await prisma.organizerWarning.findUnique({ where: { id: warningId } })
  if (!warning || warning.organizerId !== organizerId) {
    throw new AppError(404, 'Peringatan tidak ditemukan')
  }
  await prisma.organizerWarning.update({ where: { id: warningId }, data: { acknowledgedAt: new Date() } })
}

// Ringkasan angka nyata dipakai organizerOverview.service.js sendiri
// (getOrganizerOverviewStats) DAN organizerOverviewAi.service.js (insight
// cards + chat) — satu sumber angka, sama spt buildDashboardSummary milik
// admin, supaya AI tidak pernah dikasih angka yang beda dari yang tampil di
// dashboard.
export async function buildOrganizerSummary(organizerId) {
  const events = await prisma.event.findMany({
    where: { organizerId },
    select: { id: true, title: true, status: true, endDate: true, startDate: true, quota: true },
  })
  const eventIds = events.map((e) => e.id)
  const today = startOfToday()
  const activeEventRows = events.filter((e) => ACTIVE_EVENT_STATUSES.includes(e.status))

  const [pendingApplicants, acceptedVolunteers, todayAttendance, applicantsGrowth, recentActivity, totals, thisMonth, warnings, eventsNeedingBoost] =
    await Promise.all([
      eventIds.length
        ? prisma.application.count({ where: { eventId: { in: eventIds }, status: { in: PENDING_APPLICANT_STATUSES } } })
        : 0,
      eventIds.length
        ? prisma.application.count({ where: { eventId: { in: eventIds }, status: { in: ACCEPTED_APPLICANT_STATUSES } } })
        : 0,
      getTodayAttendance(organizerId),
      getApplicantsGrowth(eventIds),
      getRecentActivity(organizerId),
      getImpactTotals(organizerId),
      getImpactTotals(organizerId, { thisMonthOnly: true }),
      getActiveWarnings(organizerId),
      getEventsNeedingBoost(activeEventRows),
    ])

  const activeEvents = activeEventRows.length
  const eventsNeedClosing = events.filter((e) => ACTIVE_EVENT_STATUSES.includes(e.status) && e.endDate < today).length

  return {
    activeEvents,
    pendingApplicants,
    acceptedVolunteers,
    eventsNeedClosing,
    todayAttendance,
    applicantsGrowth,
    recentActivity,
    totals,
    thisMonth,
    warnings,
    eventsNeedingBoost,
  }
}

export async function getOrganizerOverviewStats(organizerId) {
  const summary = await buildOrganizerSummary(organizerId)
  const tier = await getUserTier(organizerId)
  const aiInsights = await generateInsights(summary, tier)
  // aiInsightsUnlocked: false berarti kartu di atas "insight biasa" (fallback
  // deterministik), bukan rekomendasi AI asli — dipakai frontend utk badge/
  // upsell "AI Management Recommendation khusus ActiVibe Plus Pro".
  return { ...summary, aiInsights, aiInsightsUnlocked: tier === 'PLUS_PRO' }
}
