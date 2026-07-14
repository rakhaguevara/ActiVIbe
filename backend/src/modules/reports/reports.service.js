import { prisma } from '../../config/prisma.js'
import { buildOrganizerSummary } from '../organizerOverview/organizerOverview.service.js'

// Sama persis ACCEPTED_APPLICANT_STATUSES/ATTENDED di organizerOverview.service.js
// (diduplikasi lokal, bukan diimpor — pola yang sama dipakai modul itu sendiri:
// tiap modul organizer-scoped sengaja tidak saling bergantung utk konstanta kecil).
const ACCEPTED_APPLICANT_STATUSES = ['ACCEPTED', 'CHECKED_IN', 'COMPLETED']
const ATTENDED_STATUSES = ['CHECKED_IN', 'COMPLETED']

function serializeActivity(log) {
  return {
    id: log.id,
    action: log.action,
    targetLabel: log.targetLabel ?? '',
    timestamp: log.createdAt.toISOString(),
  }
}

// `to` dari <input type="date"> cuma tanggal (YYYY-MM-DD) — digeser ke akhir
// hari itu supaya inklusif. Pola sama communication.service.js listBroadcasts().
function buildDateFilter(from, to) {
  if (!from && !to) return undefined
  const filter = {}
  if (from) {
    const fromDate = new Date(from)
    if (!Number.isNaN(fromDate.getTime())) filter.gte = fromDate
  }
  if (to) {
    const toDate = new Date(to)
    if (!Number.isNaN(toDate.getTime())) {
      toDate.setHours(23, 59, 59, 999)
      filter.lte = toDate
    }
  }
  return Object.keys(filter).length > 0 ? filter : undefined
}

// Ringkasan laporan (dipakai "Unduh Laporan" Dashboard Home & ExportReportsView
// tipe "Overview") — satu sumber angka yang SAMA dgn Dashboard Home
// (buildOrganizerSummary), bukan dihitung ulang. {from,to} opsional TIDAK
// mengubah buildOrganizerSummary() sendiri (dipakai jg AI insight/Dashboard
// Home yg selalu mau angka "saat ini") — kalau diisi, laporan meng-scope
// ulang bagian yang benar2 berbasis rentang waktu (recentActivity, jumlah
// pendaftar baru) di atas hasil buildOrganizerSummary, additive saja.
export async function getReportsOverview(organizerId, { from, to } = {}) {
  const summary = await buildOrganizerSummary(organizerId)
  const dateFilter = buildDateFilter(from, to)
  if (!dateFilter) {
    return { ...summary, range: { from: from ?? null, to: to ?? null }, applicantsInRange: null }
  }

  const events = await prisma.event.findMany({ where: { organizerId }, select: { id: true } })
  const eventIds = events.map((e) => e.id)

  const [applicantsInRange, recentActivityInRange] = await Promise.all([
    eventIds.length ? prisma.application.count({ where: { eventId: { in: eventIds }, appliedAt: dateFilter } }) : 0,
    prisma.auditLog.findMany({
      where: { actorId: organizerId, createdAt: dateFilter },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ])

  return {
    ...summary,
    range: { from: from ?? null, to: to ?? null },
    applicantsInRange,
    recentActivity: recentActivityInRange.map(serializeActivity),
  }
}

// Breakdown per-event nyata (Event Breakdown report) — applicants/accepted/
// attended dihitung dari Application.status, contributionHours dari
// EventCloseReport kalau event sudah ditutup (null kalau belum, bukan 0
// karangan). startDate opsional difilter ke rentang {from,to}.
export async function getEventBreakdown(organizerId, { from, to } = {}) {
  const dateFilter = buildDateFilter(from, to)
  const events = await prisma.event.findMany({
    where: { organizerId, ...(dateFilter ? { startDate: dateFilter } : {}) },
    select: {
      id: true,
      title: true,
      status: true,
      category: true,
      startDate: true,
      endDate: true,
      applications: { select: { status: true } },
      closeReport: { select: { totalContributionHours: true } },
    },
    orderBy: { startDate: 'desc' },
  })

  return events.map((e) => {
    const applicantsCount = e.applications.length
    const acceptedCount = e.applications.filter((a) => ACCEPTED_APPLICANT_STATUSES.includes(a.status)).length
    const attendedCount = e.applications.filter((a) => ATTENDED_STATUSES.includes(a.status)).length
    return {
      eventId: e.id,
      title: e.title,
      status: e.status,
      category: e.category,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate.toISOString(),
      applicantsCount,
      acceptedCount,
      attendedCount,
      contributionHours: e.closeReport?.totalContributionHours ?? null,
    }
  })
}

// Search global "Search everything" di Dashboard Home — event (judul) +
// volunteer (nama, lewat Application) milik organizer ini saja. Cap total
// hasil & minimal 2 karakter supaya tidak membebani DB tiap keystroke.
export async function getGlobalSearch(organizerId, q) {
  const query = (q ?? '').trim()
  if (query.length < 2) return { results: [] }

  const [events, applications] = await Promise.all([
    prisma.event.findMany({
      where: { organizerId, title: { contains: query, mode: 'insensitive' } },
      select: { id: true, title: true },
      take: 5,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.application.findMany({
      where: { event: { organizerId }, user: { name: { contains: query, mode: 'insensitive' } } },
      select: { user: { select: { id: true, name: true } } },
      distinct: ['userId'],
      take: 5,
      orderBy: { updatedAt: 'desc' },
    }),
  ])

  const eventResults = events.map((e) => ({
    type: 'event',
    id: e.id,
    label: e.title,
    navigateTo: `/organizer/events/${e.id}`,
  }))
  // Belum ada halaman detail per-volunteer (dikonfirmasi tidak ada route
  // /organizer/volunteers/:id di manapun) — arahkan ke daftar volunteer.
  const volunteerResults = applications.map((a) => ({
    type: 'volunteer',
    id: a.user.id,
    label: a.user.name,
    navigateTo: '/organizer/volunteers',
  }))

  return { results: [...eventResults, ...volunteerResults].slice(0, 8) }
}
