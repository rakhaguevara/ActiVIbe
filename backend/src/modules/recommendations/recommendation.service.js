// Orkestrasi rekomendasi personal (FR-005):
//   1. Ambil profil user (minat, skill, availability, motivation, lokasi)
//   2. Skor semua event dummy dengan algoritma rule-based (matchScore.js)
//   3. Enrich dengan AI: rating final + reasoning + badge + simbol + analisis
//      profil (fallback otomatis ke rule-based kalau AI tidak tersedia)

import { getProfile } from '../profile/profile.service.js'
import { DUMMY_EVENTS } from './recommendation.data.js'
import { rankEvents } from './matchScore.js'
import { enrichWithAi, buildFallback } from './ai.service.js'

// Aturan tier kecocokan (keputusan produk "make your activity with vibe"):
//   0–49  = kurang  → "Kurang Cocok"
//   50–79 = cukup   → "Sedikit Relevan"
//   80–100= sangat  → "Sangat Relevan & Cocok"
// Frontend menampilkan label ini apa adanya — jangan hitung ulang di client
// supaya aturannya satu sumber. (utils/matchScore.ts frontend hanya memetakan
// skor ke warna badge dengan ambang yang sama.)
export function getRelevance(score) {
  if (score >= 80) return { tier: 'sangat', label: 'Sangat Relevan & Cocok' }
  if (score >= 50) return { tier: 'cukup', label: 'Sedikit Relevan' }
  return { tier: 'kurang', label: 'Kurang Cocok' }
}

// Chart "afinitas kategori" untuk Card 1 layar hasil personalisasi: rata-rata
// Match Score rule-based per kategori event, urut tertinggi. Dihitung
// deterministik (bukan oleh AI) supaya grafiknya selalu ada & auditable.
function computeCategoryAffinity(ranked) {
  const byCategory = new Map()
  for (const { event, score } of ranked) {
    const scores = byCategory.get(event.category) ?? []
    scores.push(score)
    byCategory.set(event.category, scores)
  }
  return [...byCategory.entries()]
    .map(([label, scores]) => ({
      label,
      score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }))
    .sort((a, b) => b.score - a.score)
}

// Analisis fallback tanpa AI — template dari sinyal profil terkuat.
function buildFallbackAnalysis(profile, affinity) {
  const topCategory = affinity[0]?.label ?? 'volunteer'
  const interests = (profile.interests ?? []).map((i) => i.name)
  const interestPart =
    interests.length > 0 ? `kamu tertarik pada ${interests.slice(0, 2).join(' dan ')}` : 'profilmu masih bisa dilengkapi'
  const locationPart = profile.location ? `, terutama kegiatan di sekitar ${profile.location}` : ''

  return {
    summary: `Dari data profilmu, ${interestPart} — kategori kegiatan yang paling sesuai untukmu adalah ${topCategory}${locationPart}.`,
    recommendedRole: `Volunteer ${topCategory}`,
  }
}

export async function getRecommendations(userId) {
  const profile = await getProfile(userId)
  const ranked = rankEvents(profile, DUMMY_EVENTS)

  // Profil tanpa sinyal sama sekali (belum onboarding) tidak perlu panggilan
  // AI — skornya pasti netral semua, AI tidak punya bahan personalisasi.
  // Ini juga yang bikin dashboard cepat saat dibuka pertama kali sebelum
  // wizard onboarding selesai.
  const hasSignal =
    (profile.interests?.length ?? 0) > 0 ||
    (profile.skills?.length ?? 0) > 0 ||
    Boolean(profile.availability) ||
    Boolean(profile.motivation)

  const { results: enriched, provider: aiProvider, analysis: aiAnalysis } = hasSignal
    ? await enrichWithAi(profile, ranked)
    : {
        results: new Map(ranked.map((item) => [item.event.id, buildFallback(item)])),
        provider: null,
        analysis: null,
      }

  const recommendations = ranked
    .map(({ event, score, breakdown }) => {
      const ai = enriched.get(event.id)
      const relevance = getRelevance(ai.matchScore)
      return {
        // Data event untuk card di dashboard
        id: event.id,
        title: event.title,
        description: event.description,
        category: event.category,
        location: event.location,
        organizerName: event.organizerName,
        quota: event.quota,
        filledSlots: event.filledSlots,
        startDate: event.startDate,
        endDate: event.endDate,
        skills: event.skills,
        // Hasil personalisasi
        matchScore: ai.matchScore,
        matchReasoning: ai.matchReasoning,
        fitBadgeLabel: ai.fitBadgeLabel,
        symbol: ai.symbol,
        aiGenerated: ai.aiGenerated,
        // Tier kecocokan sesuai aturan produk (lihat getRelevance di atas)
        relevanceTier: relevance.tier,
        relevanceLabel: relevance.label,
        // Rincian skor rule-based — dipakai panel breakdown di EventDetailPanel
        ruleBasedScore: score,
        breakdown,
      }
    })
    // Urut ulang pakai skor final (AI bisa menggeser urutan dalam batas ±10)
    .sort((a, b) => b.matchScore - a.matchScore)

  const profileComplete =
    (profile.interests?.length ?? 0) > 0 &&
    (profile.skills?.length ?? 0) > 0 &&
    Boolean(profile.availability)

  const affinity = computeCategoryAffinity(ranked)

  return {
    profileComplete,
    aiEnabled: recommendations.some((r) => r.aiGenerated),
    // Mesin AI yang dipakai request ini: "claude" | "openai" | "gemini" | null (fallback)
    aiProvider,
    // Card 1 layar hasil personalisasi: narasi analisis + grafik afinitas kategori
    analysis: {
      ...(aiAnalysis ?? buildFallbackAnalysis(profile, affinity)),
      location: profile.location ?? null,
      chart: affinity,
      aiGenerated: Boolean(aiAnalysis),
    },
    recommendations,
  }
}
