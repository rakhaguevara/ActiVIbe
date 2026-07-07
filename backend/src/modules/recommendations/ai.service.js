// Layer AI untuk sistem rekomendasi FR-005 — orkestrator multi-provider.
//
// Mendukung 3 mesin AI dengan kontrak yang sama (lihat providers/):
//   - claude  (ANTHROPIC_API_KEY)  — providers/claude.provider.js
//   - openai  (OPENAI_API_KEY)     — providers/openai.provider.js  (ChatGPT)
//   - gemini  (GEMINI_API_KEY)     — providers/gemini.provider.js
//
// Pemilihan provider lewat env AI_PROVIDER:
//   - "claude" | "openai" | "gemini" → paksa provider itu (kalau key-nya ada)
//   - kosong / "auto"                → provider pertama yang punya key,
//                                      urutan prioritas: claude → openai → gemini
//
// Peran AI: menerima profil user + kandidat event yang SUDAH diskor algoritma
// rule-based (matchScore.js), lalu menghasilkan per event:
//   - matchScore final  — boleh menyesuaikan skor rule-based maksimum ±10 poin
//                         (di-clamp lagi di server), jadi rating tetap auditable
//   - matchReasoning    — 1 kalimat bahasa Indonesia kenapa event cocok/kurang cocok
//   - fitBadgeLabel     — label badge pendek (mis. "Cocok dengan minat lingkunganmu")
//   - symbol            — emoji simbol yang paling mewakili kecocokan
//
// Kalau tidak ada API key sama sekali atau panggilan gagal, seluruh flow tetap
// jalan pakai hasil rule-based + template reasoning (lihat buildFallback) —
// sesuai mitigasi cold-start di PRD Section 10.

import { env } from '../../config/env.js'
import { claudeProvider } from './providers/claude.provider.js'
import { openaiProvider } from './providers/openai.provider.js'
import { geminiProvider } from './providers/gemini.provider.js'
import { resolveAiProvider } from '../../utils/aiProviderResolver.js'

const MAX_SCORE_DRIFT = 10

// Urutan = prioritas saat AI_PROVIDER kosong/"auto".
const PROVIDERS = [claudeProvider, openaiProvider, geminiProvider]

// JSON Schema bersama semua provider (Claude output_config, OpenAI json_schema
// strict, Gemini responseSchema — Gemini membuang additionalProperties sendiri
// di providers/gemini.provider.js).
const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    // Analisis profil untuk Card 1 layar hasil personalisasi (pasca-onboarding)
    analysis: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        recommendedRole: { type: 'string' },
      },
      required: ['summary', 'recommendedRole'],
      additionalProperties: false,
    },
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          eventId: { type: 'string' },
          matchScore: { type: 'integer' },
          matchReasoning: { type: 'string' },
          fitBadgeLabel: { type: 'string' },
          symbol: { type: 'string' },
        },
        required: ['eventId', 'matchScore', 'matchReasoning', 'fitBadgeLabel', 'symbol'],
        additionalProperties: false,
      },
    },
  },
  required: ['analysis', 'recommendations'],
  additionalProperties: false,
}

const SYSTEM_PROMPT = `Kamu adalah mesin personalisasi ActiVibe, platform volunteer Indonesia.
Tugasmu menilai kecocokan kegiatan volunteer untuk satu user berdasarkan profilnya.

Untuk setiap event kamu menerima skor rule-based (anchor) beserta rinciannya.
Aturan:
- analysis.summary: 2–3 kalimat bahasa Indonesia yang menganalisis profil user
  secara personal — sebut hobi/minat dominannya, jurusan/pendidikan (kalau ada),
  motivasi volunteering-nya, lalu simpulkan peran volunteer yang paling cocok
  DAN kaitkan dengan lokasi user kalau diketahui. Gaya contoh: "Dari analisis
  profilmu, kamu suka fotografi — kamu akan sangat cocok sebagai volunteer
  dokumentasi di acara seni & musik, terutama yang ada di sekitar Yogyakarta."
- analysis.recommendedRole: nama peran volunteer paling cocok, singkat
  (mis. "Volunteer Dokumentasi", "Relawan Pengajar"), tanpa emoji.
- matchScore final harus berada dalam rentang anchor ±${MAX_SCORE_DRIFT} poin dan 0–100.
- matchReasoning: TEPAT satu kalimat bahasa Indonesia yang hangat dan spesifik,
  sebut minat/skill user yang relevan (mis. "Minat lingkunganmu dan skill kerja
  tim sangat dibutuhkan di kegiatan ini."). Jangan sebut angka skor.
- fitBadgeLabel: label pendek (maks 6 kata) untuk badge di card, tanpa emoji.
- symbol: SATU emoji yang paling mewakili alasan kecocokan (boleh pakai emoji
  default kategori event, atau ganti kalau ada alasan lebih personal).
- Kembalikan SEMUA event yang diberikan, jangan menambah event baru.`

export function resolveProvider() {
  return resolveAiProvider(PROVIDERS, env.AI_PROVIDER, 'recommendations')
}

function clampScore(aiScore, anchor) {
  const bounded = Math.min(anchor + MAX_SCORE_DRIFT, Math.max(anchor - MAX_SCORE_DRIFT, aiScore))
  return Math.min(100, Math.max(0, Math.round(bounded)))
}

function buildPrompt(profile, ranked) {
  const userSummary = {
    interests: (profile.interests ?? []).map((i) => i.name),
    skills: (profile.skills ?? []).map((s) => s.name),
    availability: profile.availability,
    motivation: profile.motivation,
    location: profile.location,
    // education sengaja TIDAK masuk hitungan Match Score (lihat backend/README.md
    // Section 4) — tapi boleh dipakai AI untuk narasi analisis profil.
    education: profile.education,
    bio: profile.bio,
  }

  const events = ranked.map(({ event, score, breakdown }) => ({
    eventId: event.id,
    title: event.title,
    category: event.category,
    description: event.description,
    location: event.location,
    dayType: event.dayType,
    skillsNeeded: event.skills,
    interestTags: event.interests,
    motivationTags: event.motivationTags,
    defaultSymbol: event.symbol,
    anchorScore: score,
    anchorBreakdown: breakdown,
  }))

  return `PROFIL USER:\n${JSON.stringify(userSummary, null, 2)}\n\nKANDIDAT EVENT (sudah diskor rule-based):\n${JSON.stringify(events, null, 2)}`
}

// Fallback tanpa AI: reasoning template dari komponen breakdown paling kuat.
export function buildFallback({ event, score, breakdown }) {
  let matchReasoning
  let fitBadgeLabel
  if (breakdown.skill.matched.length > 0) {
    matchReasoning = `Skill ${breakdown.skill.matched.join(' dan ')} yang kamu punya jadi kebutuhan utama di kegiatan ini.`
    fitBadgeLabel = 'Skill-mu sangat dibutuhkan di sini'
  } else if (breakdown.interest.matched.length > 0) {
    matchReasoning = `Kegiatan ini sejalan dengan minatmu di bidang ${breakdown.interest.matched.join(' dan ')}.`
    fitBadgeLabel = 'Cocok dengan minatmu'
  } else {
    matchReasoning = `Kegiatan ${event.category.toLowerCase()} ini bisa jadi pengalaman baru untuk memperluas portofolio volunteermu.`
    fitBadgeLabel = 'Kesempatan eksplorasi baru'
  }

  return {
    matchScore: score,
    matchReasoning,
    fitBadgeLabel,
    symbol: event.symbol,
    aiGenerated: false,
  }
}

/**
 * Enrich hasil ranking rule-based dengan penilaian AI (provider aktif).
 * @param {object} profile hasil getProfile()
 * @param {Array}  ranked  hasil rankEvents() — [{event, score, breakdown}]
 * @returns {Promise<{results: Map, provider: string|null, analysis: object|null}>}
 *   results: Map<eventId, {matchScore, matchReasoning, fitBadgeLabel, symbol, aiGenerated}>
 *   provider: nama provider yang benar-benar dipakai, null kalau fallback
 *   analysis: {summary, recommendedRole} dari AI — null saat fallback
 */
export async function enrichWithAi(profile, ranked) {
  const fallback = new Map(ranked.map((item) => [item.event.id, buildFallback(item)]))

  const provider = resolveProvider()
  if (!provider) return { results: fallback, provider: null, analysis: null }

  try {
    const parsed = await provider.generate({
      system: SYSTEM_PROMPT,
      prompt: buildPrompt(profile, ranked),
      schema: OUTPUT_SCHEMA,
    })

    const anchors = new Map(ranked.map((item) => [item.event.id, item.score]))
    const results = new Map(fallback)
    let enrichedCount = 0

    for (const rec of parsed.recommendations ?? []) {
      if (!anchors.has(rec.eventId)) continue
      results.set(rec.eventId, {
        matchScore: clampScore(rec.matchScore, anchors.get(rec.eventId)),
        matchReasoning: rec.matchReasoning,
        fitBadgeLabel: rec.fitBadgeLabel,
        symbol: rec.symbol || results.get(rec.eventId).symbol,
        aiGenerated: true,
      })
      enrichedCount += 1
    }

    const analysis =
      parsed.analysis?.summary && parsed.analysis?.recommendedRole
        ? { summary: parsed.analysis.summary, recommendedRole: parsed.analysis.recommendedRole }
        : null

    return { results, provider: enrichedCount > 0 ? provider.name : null, analysis }
  } catch (error) {
    // Jangan gagalkan halaman rekomendasi gara-gara AI down — pakai fallback.
    console.error(`[recommendations] Enrichment via ${provider.name} gagal, pakai rule-based:`, error.message)
    return { results: fallback, provider: null, analysis: null }
  }
}
