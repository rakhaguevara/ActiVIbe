// Retrieval terstruktur (bukan vector/embedding) — dipakai adminKnowledge.service.js
// & organizerKnowledge.service.js utk memilih subset data paling relevan dari
// tabel yang di-fetch (dibatasi `take` di query Prisma), berdasarkan keyword
// hasil aiKeywordSearch.js. Kalau tidak ada keyword yang cocok sama sekali
// (mis. pertanyaan umum "gimana performa bulan ini?"), fallback ke urutan
// terbaru (recency) supaya AI tetap dapat konteks, bukan array kosong.

export function scoreRelevance(searchableTexts, keywords) {
  if (keywords.length === 0) return 0
  const haystack = searchableTexts.filter(Boolean).join(' ').toLowerCase()
  return keywords.reduce((score, kw) => (haystack.includes(kw) ? score + 1 : score), 0)
}

export function rankAndTake(records, getSearchableTexts, keywords, limit, getDate) {
  const scored = records.map((r) => ({ r, score: scoreRelevance(getSearchableTexts(r), keywords) }))
  const hasMatches = scored.some((s) => s.score > 0)

  const sorted = hasMatches
    ? scored.sort((a, b) => b.score - a.score || compareDate(b.r, a.r, getDate))
    : scored.sort((a, b) => compareDate(b.r, a.r, getDate))

  return sorted.slice(0, limit).map((s) => s.r)
}

function compareDate(a, b, getDate) {
  if (!getDate) return 0
  return new Date(getDate(a)) - new Date(getDate(b))
}

export function truncate(text, max = 300) {
  if (!text) return text
  return text.length > max ? `${text.slice(0, max)}…` : text
}
