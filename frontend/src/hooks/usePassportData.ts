// Hook Impact Passport — mengambil data real (backend GET /passport/me,
// lihat services/passport.service.ts) dan memetakannya ke bentuk yang dipakai
// PassportBook. Tidak ada fallback ke data dummy kalau fetch gagal/kosong —
// halaman pemanggil (PassportPage.tsx) yang merender SectionState error/empty
// apa adanya, pola sama dgn useRecommendations.ts.

import { useEffect, useState } from 'react'
import type { PassportBookChapter, PassportStats, PassportSkill } from '../components/passport-book/passportBook.types'
import { fetchMyPassport } from '../services/passport.service'
import { resolveAssetUrl } from '../lib/assetUrl'

export interface UsePassportDataResult {
  chapters: PassportBookChapter[]
  stats: PassportStats
  skills: PassportSkill[]
  isLoading: boolean
  /** Pesan error kalau fetch gagal — null berarti tidak ada error */
  error: string | null
}

const EMPTY_STATS: PassportStats = { totalHours: 0, eventsCompleted: 0, ngoCount: 0, points: 0 }

export function usePassportData(): UsePassportDataResult {
  const [result, setResult] = useState<UsePassportDataResult>({
    chapters: [],
    stats: EMPTY_STATS,
    skills: [],
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    fetchMyPassport()
      .then((data) => {
        if (cancelled) return
        const chapters: PassportBookChapter[] = data.chapters.map((chapter) => ({
          ...chapter,
          heroPhotoUrl: chapter.heroPhotoUrl ? resolveAssetUrl(chapter.heroPhotoUrl) : undefined,
          galleryPhotos: chapter.galleryPhotos.map(resolveAssetUrl),
          // Belum ada halaman detail event publik yang bisa dibagikan berdiri
          // sendiri — arahkan ke dashboard dgn query event, pola sama yang
          // dipakai PersonalizationResultModal (lihat CLAUDE.md).
          shareUrl: `${window.location.origin}/dashboard?event=${chapter.eventId}`,
        }))
        setResult({ chapters, stats: data.stats, skills: data.skills, isLoading: false, error: null })
      })
      .catch((err) => {
        if (cancelled) return
        setResult({
          chapters: [],
          stats: EMPTY_STATS,
          skills: [],
          isLoading: false,
          error: err instanceof Error ? err.message : 'Gagal memuat Impact Passport, coba lagi.',
        })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return result
}
