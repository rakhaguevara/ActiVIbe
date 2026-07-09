// Client untuk endpoint rekomendasi personal FR-005 (backend
// GET /recommendations, auth via httpOnly cookie — pola sama dgn lib/api.ts).
//
// Panggilan bisa memakan beberapa detik saat layer AI Claude aktif — tampilkan
// skeleton/loading state, jangan blocking render dashboard.

import { apiFetch } from '../lib/apiFetch'

const API_URL = import.meta.env.VITE_API_URL ?? ''

export interface MatchBreakdownComponent {
  score: number
  weight: number
  matched?: string[]
}

export interface MatchBreakdown {
  skill: MatchBreakdownComponent
  interest: MatchBreakdownComponent
  motivation: MatchBreakdownComponent
  availability: MatchBreakdownComponent
  location: MatchBreakdownComponent
}

/** Tier kecocokan (aturan produk): 0–49 kurang, 50–79 cukup, 80–100 sangat */
export type RelevanceTier = 'kurang' | 'cukup' | 'sangat'

export interface AffinityChartItem {
  /** Nama kategori kegiatan (Lingkungan, Pendidikan, ...) */
  label: string
  /** Rata-rata Match Score rule-based kategori itu, 0–100 */
  score: number
}

/** Hasil analisis profil untuk Card 1 layar hasil personalisasi */
export interface ProfileAnalysis {
  /** Narasi 2–3 kalimat: hobi/minat → peran volunteer paling cocok + lokasi */
  summary: string
  /** Peran volunteer paling cocok, mis. "Volunteer Dokumentasi" */
  recommendedRole: string
  location: string | null
  /** Data grafik afinitas kategori, urut skor tertinggi */
  chart: AffinityChartItem[]
  aiGenerated: boolean
}

export interface RecommendedEvent {
  id: string
  title: string
  description: string
  category: string
  location: string
  organizerName: string
  /** Fitur "women respect" (KAI-style) — gender organizer/pembina & jumlah peserta
   * perempuan yang sudah diterima (ACCEPTED+). Cuma dirender kalau viewer FEMALE. */
  organizerGender: 'MALE' | 'FEMALE' | null
  femaleAcceptedCount: number
  quota: number
  filledSlots: number
  startDate: string
  endDate: string
  skills: string[]
  /** Foto galeri dokumentasi event (0-6), index 0 = thumbnail utama */
  photos: string[]
  /** Predictive Match Score final 0–100 (AI, atau rule-based saat fallback) */
  matchScore: number
  /** Satu kalimat reasoning kenapa event ini cocok (FR-005) */
  matchReasoning: string
  /** Label badge kecocokan — isi prop fitBadgeLabel di EventDetailPanel */
  fitBadgeLabel: string
  /** Emoji simbol kecocokan untuk card */
  symbol: string
  /** true kalau reasoning/skor berasal dari AI, false = fallback rule-based */
  aiGenerated: boolean
  /** Tier kecocokan sesuai aturan produk (dihitung backend — satu sumber) */
  relevanceTier: RelevanceTier
  /** Label tier untuk ditampilkan: "Kurang Cocok" | "Sedikit Relevan" | "Sangat Relevan & Cocok" */
  relevanceLabel: string
  /** Skor rule-based sebelum penyesuaian AI (auditable anchor) */
  ruleBasedScore: number
  /** Penyesuaian dari riwayat buka/simpan event serupa, 0..+10 (lihat behavior.service.js) */
  behaviorBoost: number
  breakdown: MatchBreakdown
}

export interface RecommendationsResponse {
  /** false kalau user belum mengisi minat+skill+availability — tampilkan CTA lengkapi profil */
  profileComplete: boolean
  /** true kalau hasil datang dari layer AI */
  aiEnabled: boolean
  /** Mesin AI yang dipakai request ini; null = fallback rule-based */
  aiProvider: 'claude' | 'openai' | 'gemini' | null
  /** Analisis profil (Card 1 layar hasil personalisasi) */
  analysis: ProfileAnalysis
  recommendations: RecommendedEvent[]
}

// ── Cache modul sederhana ─────────────────────────────────────────────────
// Panggilan AI di backend bisa makan beberapa detik, jadi hasilnya di-cache
// (TTL 5 menit) dan request paralel di-dedupe — modal hasil personalisasi
// dan dashboard memakai satu hasil yang sama, bukan dua panggilan AI.
// Panggil invalidateRecommendations() setiap profil user berubah
// (mis. selesai onboarding / update Pengaturan) supaya hasil dihitung ulang.

const CACHE_TTL_MS = 5 * 60 * 1000

let cache: { data: RecommendationsResponse; at: number } | null = null
let inFlight: Promise<RecommendationsResponse> | null = null
const listeners = new Set<() => void>()

export function invalidateRecommendations(): void {
  cache = null
  inFlight = null
  listeners.forEach((listener) => listener())
}

/** Dipanggil hook untuk ikut refetch saat cache di-invalidate. Return: unsubscribe. */
export function subscribeRecommendations(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

async function requestRecommendations(): Promise<RecommendationsResponse> {
  const res = await apiFetch(`${API_URL}/recommendations`, {
    credentials: 'include',
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Gagal memuat rekomendasi, coba lagi.')
  }
  return data as RecommendationsResponse
}

export async function fetchRecommendations(): Promise<RecommendationsResponse> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.data
  }
  if (inFlight) return inFlight

  inFlight = requestRecommendations()
    .then((data) => {
      cache = { data, at: Date.now() }
      return data
    })
    .finally(() => {
      inFlight = null
    })
  return inFlight
}
