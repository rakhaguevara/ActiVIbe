// Retrieval terstruktur data platform-wide utk "Ask AI" admin (bukan cuma
// angka agregat dari buildDashboardSummary() spt sebelumnya) — supaya AI bisa
// menjawab pertanyaan yang butuh detail nyata (mis. "organisasi mana yang
// belum terverifikasi?", "event apa yang feedback-nya jelek?"), bukan cuma
// angka ringkasan. Query di-bound (`take`) supaya tidak unbounded seiring data
// tumbuh; ranking relevansi (bukan vector search — lihat aiRelevanceRank.js)
// dipakai utk memilih subset paling relevan dari hasil query yang sudah
// dibatasi itu. Semua field yang dikembalikan sudah publik utk admin (tidak
// ada password/token/dsb yang ikut ter-select).
import { prisma } from '../../config/prisma.js'
import { extractKeywordsFromMessages } from '../../utils/aiKeywordSearch.js'
import { rankAndTake, truncate } from '../../utils/aiRelevanceRank.js'

const LIMIT_PER_CATEGORY = 12
const FETCH_BOUND = 300

export async function buildAdminKnowledgeContext(messages) {
  const keywords = extractKeywordsFromMessages(messages)

  const [organizations, events, feedbacks, closeReports] = await Promise.all([
    prisma.organization.findMany({
      // deletedAt: null — organisasi yang sudah di-soft-delete pemiliknya
      // sendiri (Settings > Security) tidak boleh dianggap entitas nyata yang
      // masih relevan buat dijawab "Ask AI" admin (beda dari PENDING_VERIFICATION/
      // DEACTIVATED yang memang sengaja tetap ikut, itu masih pertanyaan valid
      // spt "organisasi mana yang belum terverifikasi").
      where: { deletedAt: null },
      select: {
        name: true,
        location: true,
        causeAreas: true,
        status: true,
        isVerified: true,
        shortProfile: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: FETCH_BOUND,
    }),
    prisma.event.findMany({
      where: { status: { not: 'DRAFT' } },
      select: {
        title: true,
        description: true,
        category: true,
        status: true,
        location: true,
        quota: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        organizer: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: FETCH_BOUND,
    }),
    prisma.eventFeedback.findMany({
      select: {
        rating: true,
        comment: true,
        createdAt: true,
        event: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: FETCH_BOUND,
    }),
    prisma.eventCloseReport.findMany({
      select: {
        narrativeSummary: true,
        volunteersPresentCount: true,
        totalContributionHours: true,
        constraintsNotes: true,
        impactSummary: true,
        categoryMetrics: true,
        createdAt: true,
        event: { select: { title: true, category: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: FETCH_BOUND,
    }),
  ])

  const rankedOrganizations = rankAndTake(
    organizations,
    (o) => [o.name, o.location, ...(o.causeAreas ?? []), o.shortProfile],
    keywords,
    LIMIT_PER_CATEGORY,
    (o) => o.createdAt,
  ).map((o) => ({
    name: o.name,
    location: o.location,
    causeAreas: o.causeAreas,
    status: o.status,
    isVerified: o.isVerified,
    shortProfile: truncate(o.shortProfile, 200),
  }))

  const rankedEvents = rankAndTake(
    events,
    (e) => [e.title, e.description, e.category, e.location, e.organizer?.name],
    keywords,
    LIMIT_PER_CATEGORY,
    (e) => e.createdAt,
  ).map((e) => ({
    title: e.title,
    category: e.category,
    status: e.status,
    location: e.location,
    organizerName: e.organizer?.name,
    quota: e.quota,
    startDate: e.startDate,
    endDate: e.endDate,
    description: truncate(e.description, 250),
  }))

  const rankedFeedback = rankAndTake(
    feedbacks,
    (f) => [f.comment, f.event?.title],
    keywords,
    LIMIT_PER_CATEGORY,
    (f) => f.createdAt,
  ).map((f) => ({
    eventTitle: f.event?.title,
    rating: f.rating,
    comment: truncate(f.comment, 250),
  }))

  const rankedCloseReports = rankAndTake(
    closeReports,
    (c) => [c.narrativeSummary, c.constraintsNotes, c.impactSummary, c.event?.title],
    keywords,
    LIMIT_PER_CATEGORY,
    (c) => c.createdAt,
  ).map((c) => ({
    eventTitle: c.event?.title,
    category: c.event?.category,
    narrativeSummary: truncate(c.narrativeSummary, 250),
    volunteersPresentCount: c.volunteersPresentCount,
    totalContributionHours: c.totalContributionHours,
    constraintsNotes: truncate(c.constraintsNotes, 200),
    categoryMetrics: c.categoryMetrics,
  }))

  return {
    organizations: rankedOrganizations,
    events: rankedEvents,
    feedback: rankedFeedback,
    closeReports: rankedCloseReports,
  }
}
