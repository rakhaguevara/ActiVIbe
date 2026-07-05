// Sinyal perilaku volunteer (FR-005 behavioral boost): event yang sering
// dibuka (EventView) atau disimpan (EventBookmark) menaikkan skor event lain
// yang kategori/minatnya serupa — "user suka buka event tipe X, direkomendasikan
// yang serupa". Bookmark (like eksplisit) dibobot lebih tinggi dari view (buka pasif).
//
// Sengaja TIDAK mengubah WEIGHTS di matchScore.js (dikunci di backend/README.md)
// — ini post-adjustment terbatas, pola sama dengan clamp ±10 milik ai.service.js.
// Hanya boost positif (0..+10), bukan ±10: kekurangan overlap kategori/minat
// sudah tercermin di skor rule-based, tidak perlu dihukum dobel di sini.

import { prisma } from '../../config/prisma.js'

const VIEW_WEIGHT = 1
const BOOKMARK_WEIGHT = 3
const MAX_BOOST = 10

function bump(map, key, weight) {
  if (!key) return
  map.set(key, (map.get(key) ?? 0) + weight)
}

export async function getBehavioralAffinity(userId) {
  const [views, bookmarks] = await Promise.all([
    prisma.eventView.findMany({
      where: { userId },
      take: 200,
      orderBy: { viewedAt: 'desc' },
      select: { event: { select: { category: true, eventInterests: { select: { interest: { select: { name: true } } } } } } },
    }),
    prisma.eventBookmark.findMany({
      where: { userId },
      select: { event: { select: { category: true, eventInterests: { select: { interest: { select: { name: true } } } } } } },
    }),
  ])

  const affinity = new Map()
  for (const { event } of views) {
    bump(affinity, `category:${event.category}`, VIEW_WEIGHT)
    for (const ei of event.eventInterests) bump(affinity, `interest:${ei.interest.name}`, VIEW_WEIGHT)
  }
  for (const { event } of bookmarks) {
    bump(affinity, `category:${event.category}`, BOOKMARK_WEIGHT)
    for (const ei of event.eventInterests) bump(affinity, `interest:${ei.interest.name}`, BOOKMARK_WEIGHT)
  }
  return affinity
}

/**
 * @param {object} event    entri katalog dari listMatchableEvents() — perlu category & interests
 * @param {Map<string, number>} affinity hasil getBehavioralAffinity()
 * @returns {number} boost 0..MAX_BOOST
 */
export function behaviorBoost(event, affinity) {
  if (!affinity || affinity.size === 0) return 0

  const maxObserved = Math.max(...affinity.values())
  if (maxObserved <= 0) return 0

  const relevantWeight =
    (affinity.get(`category:${event.category}`) ?? 0) +
    (event.interests ?? []).reduce((sum, name) => sum + (affinity.get(`interest:${name}`) ?? 0), 0)

  return Math.round(Math.min(1, relevantWeight / maxObserved) * MAX_BOOST)
}
