// Ambang tier mengikuti aturan produk (sumber kebenarannya di backend:
// getRelevance() di modules/recommendations/recommendation.service.js):
//   0–49  kurang cocok · 50–79 sedikit relevan · 80–100 sangat relevan & cocok
// File ini hanya memetakan skor ke token warna badge — label teksnya ambil
// dari field `relevanceLabel` di response API, jangan hardcode di komponen.

export type MatchTier = 'success' | 'info' | 'warning'

export function getMatchTier(score: number): MatchTier {
  if (score >= 80) return 'success'
  if (score >= 50) return 'info'
  return 'warning'
}
