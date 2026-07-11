// Hook rekomendasi personal FR-005 — mengambil hasil algoritma matching dari
// backend (GET /recommendations, lihat services/recommendation.service.ts) dan
// memetakannya ke tipe `Event` yang dipakai card/panel dashboard.
//
// Backend mengembalikan data inti + hasil personalisasi (matchScore,
// matchReasoning, fitBadgeLabel, symbol). Field presentasi lain (foto, rating,
// ulasan, profil organizer, kebijakan) belum ada di API — diisi default netral
// generik (BUKAN di-merge dari mockEvents by title-match lagi, supaya event
// asli tidak diam-diam mewarisi foto/ulasan event mock yang tidak terkait).

import { useCallback, useEffect, useState } from 'react'
import type { Event } from '../types/event'
import {
  fetchRecommendations,
  subscribeRecommendations,
  type RecommendedEvent,
} from '../services/recommendation.service'
import { resolveAssetUrl } from '../lib/assetUrl'
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
  // Foto galeri asli (EventGalleryImage) kalau organizer sudah upload —
  // fallback ke gambar statis cuma kalau event belum ada galerinya sama
  // sekali, bukan selalu dipaksa pakai gambar generik seperti sebelumnya.
  // resolveAssetUrl krn backend mengembalikan path relatif ("/uploads/...").
  const photos = rec.photos.map(resolveAssetUrl)

  return {
    ...DEFAULT_PRESENTATION,
    id: rec.id,
    title: rec.title,
    imageUrl: photos[0] ?? FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
    photos,
    description: rec.description,
    category: rec.category,
    location: rec.location,
    organizerName: rec.organizerName,
    organizerGender: rec.organizerGender,
    femaleAcceptedCount: rec.femaleAcceptedCount,
    certificateProvider: rec.certificateProvider,
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
  /** Pesan error kalau fetch gagal — null berarti tidak ada error */
  error: string | null
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
    error: null,
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
          error: null,
          aiEnabled: data.aiEnabled,
          aiProvider: data.aiProvider,
          profileComplete: data.profileComplete,
        })
      })
      .catch((err) => {
        if (cancelledRef.current) return
        // Gagal fetch ditampilkan apa adanya sbg error section-scoped (lihat
        // SectionState di FindActivityPage) — tidak lagi diam-diam diganti
        // mockEvents seolah-olah berhasil.
        setResult({
          events: [],
          isLoading: false,
          error: err instanceof Error ? err.message : 'Gagal memuat rekomendasi, coba lagi.',
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
