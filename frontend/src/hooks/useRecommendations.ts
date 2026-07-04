// Hook rekomendasi personal FR-005 — mengambil hasil algoritma matching dari
// backend (GET /recommendations, lihat services/recommendation.service.ts) dan
// memetakannya ke tipe `Event` yang dipakai card/panel dashboard.
//
// Backend baru mengembalikan data inti + hasil personalisasi (matchScore,
// matchReasoning, fitBadgeLabel, symbol). Field presentasi lain (foto, rating,
// ulasan, profil organizer, kebijakan) belum ada di API — diisi dari template:
// kalau judul event sama dengan entri mockEvents, field kaya itu di-merge dari
// sana; kalau tidak, pakai default generik. Saat API-nya lengkap nanti,
// hapus lapisan merge ini.

import { useCallback, useEffect, useState } from 'react'
import type { Event } from '../types/event'
import { mockEvents } from '../data/mockEvents'
import {
  fetchRecommendations,
  subscribeRecommendations,
  type RecommendedEvent,
} from '../services/recommendation.service'
import pic1 from '../assets/png/pic1 1.png'
import pic2 from '../assets/png/pic2 1.png'

const FALLBACK_IMAGES = [pic1, pic2]

const DEFAULT_PRESENTATION = {
  rating: 4.8,
  reviewCount: 0,
  ratingBreakdown: [
    { label: 'Koordinasi Panitia', score: 4.8 },
    { label: 'Kejelasan Informasi', score: 4.8 },
    { label: 'Dampak yang Dirasakan', score: 4.9 },
    { label: 'Lokasi & Logistik', score: 4.6 },
  ],
  reviews: [],
  provisions: ['Konsumsi', 'Sertifikat digital'],
  organizerBio: 'Profil organizer akan tampil di sini setelah data organizer terhubung.',
  organizerEventsCount: 0,
  organizerRating: 4.8,
  organizerYearsActive: 1,
  cancellationPolicy: 'Bisa membatalkan pendaftaran gratis sampai 24 jam sebelum kegiatan dimulai.',
  eventRules: 'Datang tepat waktu dan ikuti arahan panitia di lokasi.',
  safetyInfo: 'P3K dan kontak darurat tersedia selama kegiatan berlangsung.',
}

function toEvent(rec: RecommendedEvent, index: number): Event {
  const template = mockEvents.find(
    (mock) => mock.title.trim().toLowerCase() === rec.title.trim().toLowerCase(),
  )

  return {
    ...DEFAULT_PRESENTATION,
    ...(template ?? {}),
    // Data inti + hasil personalisasi dari backend SELALU menang atas template
    id: rec.id,
    title: rec.title,
    imageUrl: template?.imageUrl ?? FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
    description: rec.description,
    category: rec.category,
    location: rec.location,
    organizerName: rec.organizerName,
    quota: rec.quota,
    filledSlots: rec.filledSlots,
    startDate: rec.startDate,
    endDate: rec.endDate,
    skills: rec.skills,
    matchScore: rec.matchScore,
    matchReasoning: rec.matchReasoning,
    fitBadgeLabel: rec.fitBadgeLabel,
    symbol: rec.symbol,
    aiGenerated: rec.aiGenerated,
    relevanceLabel: rec.relevanceLabel,
  }
}

export interface UseRecommendationsResult {
  events: Event[]
  isLoading: boolean
  /** true kalau fetch gagal dan events berisi fallback mockEvents */
  isFallback: boolean
  /** true kalau skor/reasoning datang dari mesin AI */
  aiEnabled: boolean
  aiProvider: 'claude' | 'openai' | 'gemini' | null
  /** false = user belum melengkapi minat+skill+availability */
  profileComplete: boolean
}

export function useRecommendations(): UseRecommendationsResult {
  const [result, setResult] = useState<UseRecommendationsResult>({
    events: [],
    isLoading: true,
    isFallback: false,
    aiEnabled: false,
    aiProvider: null,
    profileComplete: true,
  })

  const load = useCallback((cancelledRef: { current: boolean }) => {
    setResult((prev) => ({ ...prev, isLoading: true }))
    fetchRecommendations()
      .then((data) => {
        if (cancelledRef.current) return
        setResult({
          events: data.recommendations.map(toEvent),
          isLoading: false,
          isFallback: false,
          aiEnabled: data.aiEnabled,
          aiProvider: data.aiProvider,
          profileComplete: data.profileComplete,
        })
      })
      .catch(() => {
        if (cancelledRef.current) return
        // Backend mati / belum login penuh — jangan biarkan dashboard kosong,
        // tampilkan mockEvents sebagai fallback terakhir.
        setResult({
          events: mockEvents,
          isLoading: false,
          isFallback: true,
          aiEnabled: false,
          aiProvider: null,
          profileComplete: true,
        })
      })
  }, [])

  useEffect(() => {
    const cancelledRef = { current: false }
    load(cancelledRef)

    // Ikut refetch begitu cache di-invalidate (mis. profil berubah
    // setelah onboarding selesai — lihat DashboardLayout).
    const unsubscribe = subscribeRecommendations(() => load(cancelledRef))

    return () => {
      cancelledRef.current = true
      unsubscribe()
    }
  }, [load])

  return result
}
