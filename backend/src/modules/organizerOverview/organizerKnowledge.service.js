// Retrieval terstruktur data milik organizer ini utk "Ask AI" (bukan cuma
// angka agregat dari buildOrganizerSummary() spt sebelumnya) — mirror
// admin/adminKnowledge.service.js, TAPI setiap query WAJIB di-scope
// `organizerId` (lihat where di bawah) supaya tidak ada risiko bocor data
// organizer lain lewat chat, konsisten dgn prinsip yang sudah ada di
// organizerOverviewAi.service.js.
import { prisma } from '../../config/prisma.js'
import { extractKeywordsFromMessages } from '../../utils/aiKeywordSearch.js'
import { rankAndTake, truncate } from '../../utils/aiRelevanceRank.js'

const LIMIT_PER_CATEGORY = 12
const FETCH_BOUND = 300

export async function buildOrganizerKnowledgeContext(organizerId, messages) {
  const keywords = extractKeywordsFromMessages(messages)

  const events = await prisma.event.findMany({
    where: { organizerId },
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
      applications: { select: { status: true } },
      feedbacks: { select: { rating: true, comment: true } },
      closeReport: {
        select: {
          narrativeSummary: true,
          volunteersPresentCount: true,
          totalContributionHours: true,
          constraintsNotes: true,
          impactSummary: true,
          categoryMetrics: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: FETCH_BOUND,
  })

  const subOrganizers = await prisma.subOrganizer.findMany({
    where: { organization: { ownerId: organizerId } },
    select: { name: true, whatsapp: true, email: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: FETCH_BOUND,
  })

  const rankedEvents = rankAndTake(
    events,
    (e) => [
      e.title,
      e.description,
      e.category,
      e.location,
      ...(e.feedbacks ?? []).map((f) => f.comment),
      e.closeReport?.narrativeSummary,
      e.closeReport?.constraintsNotes,
    ],
    keywords,
    LIMIT_PER_CATEGORY,
    (e) => e.createdAt,
  ).map((e) => {
    const applicantStatusCounts = (e.applications ?? []).reduce((acc, a) => {
      acc[a.status] = (acc[a.status] ?? 0) + 1
      return acc
    }, {})
    const ratings = (e.feedbacks ?? []).map((f) => f.rating)
    const avgRating = ratings.length ? Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10 : null

    return {
      title: e.title,
      category: e.category,
      status: e.status,
      location: e.location,
      quota: e.quota,
      startDate: e.startDate,
      endDate: e.endDate,
      description: truncate(e.description, 250),
      applicantStatusCounts,
      feedbackAvgRating: avgRating,
      feedbackComments: (e.feedbacks ?? []).map((f) => truncate(f.comment, 200)).filter(Boolean).slice(0, 5),
      closeReport: e.closeReport
        ? {
            narrativeSummary: truncate(e.closeReport.narrativeSummary, 250),
            volunteersPresentCount: e.closeReport.volunteersPresentCount,
            totalContributionHours: e.closeReport.totalContributionHours,
            constraintsNotes: truncate(e.closeReport.constraintsNotes, 200),
            categoryMetrics: e.closeReport.categoryMetrics,
          }
        : null,
    }
  })

  const rankedSubOrganizers = rankAndTake(
    subOrganizers,
    (s) => [s.name, s.whatsapp, s.email],
    keywords,
    LIMIT_PER_CATEGORY,
    (s) => s.createdAt,
  ).map((s) => ({ name: s.name, whatsapp: s.whatsapp, email: s.email }))

  return {
    events: rankedEvents,
    subOrganizers: rankedSubOrganizers,
  }
}
