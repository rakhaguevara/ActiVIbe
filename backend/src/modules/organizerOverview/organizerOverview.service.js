import { prisma } from '../../config/prisma.js'
import { generateInsights } from './organizerOverviewAi.service.js'

const ACTIVE_EVENT_STATUSES = ['PUBLISHED', 'ONGOING']
const PENDING_APPLICANT_STATUSES = ['APPLIED', 'UNDER_REVIEW']
const ACCEPTED_APPLICANT_STATUSES = ['ACCEPTED', 'CHECKED_IN', 'COMPLETED']
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

// Ringkasan angka nyata dipakai organizerOverview.service.js sendiri
// (getOrganizerOverviewStats) DAN organizerOverviewAi.service.js (insight
// cards + chat) — satu sumber angka, sama spt buildDashboardSummary milik
// admin, supaya AI tidak pernah dikasih angka yang beda dari yang tampil di
// dashboard.
export async function buildOrganizerSummary(organizerId) {
  const events = await prisma.event.findMany({
    where: { organizerId },
    select: { id: true, status: true, endDate: true },
  })
  const eventIds = events.map((e) => e.id)
  const today = startOfToday()

  const [pendingApplicants, acceptedVolunteers, todayAttendance, applicantsGrowth, recentActivity, totals, thisMonth] =
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
    ])

  const activeEvents = events.filter((e) => ACTIVE_EVENT_STATUSES.includes(e.status)).length
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
  }
}

export async function getOrganizerOverviewStats(organizerId) {
  const summary = await buildOrganizerSummary(organizerId)
  const aiInsights = await generateInsights(summary)
  return { ...summary, aiInsights }
}
