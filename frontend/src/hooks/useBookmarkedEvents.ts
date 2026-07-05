import { useCallback, useEffect, useState } from 'react'
import { bookmarkEventRequest, getMyBookmarkedEventIds, unbookmarkEventRequest } from '../lib/eventApi'
import { invalidateRecommendations } from '../services/recommendation.service'

// Sebelumnya murni localStorage (tidak pernah tersinkron ke backend, tidak
// bisa jadi sinyal personalisasi). Sekarang backend-backed lewat EventBookmark
// (lihat eventApi.ts) — state lokal dipakai cuma utk UX toggle yang instan
// (optimistic update), sumber kebenarannya tetap backend.
export function useBookmarkedEvents() {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([])

  useEffect(() => {
    getMyBookmarkedEventIds()
      .then(setBookmarkedIds)
      .catch(() => {
        // Gagal hydrate tidak boleh blokir halaman — mulai dari kosong,
        // toggle berikutnya tetap akan disinkron ke backend.
      })
  }, [])

  const toggle = useCallback((id: string) => {
    setBookmarkedIds((prev) => {
      const isCurrentlyBookmarked = prev.includes(id)
      const next = isCurrentlyBookmarked ? prev.filter((existing) => existing !== id) : [...prev, id]

      const request = isCurrentlyBookmarked ? unbookmarkEventRequest(id) : bookmarkEventRequest(id)
      request
        .then(() => {
          // Bookmark = sinyal "suka" eksplisit (bobot lebih tinggi dari view di
          // behavioral boost) — invalidate cache supaya efeknya langsung
          // terlihat, tidak perlu nunggu TTL 5 menit. Aksi ini jarang terjadi
          // (beda dengan view per klik "Detail"), jadi aman di-refetch tiap kali.
          invalidateRecommendations()
        })
        .catch(() => {
          // Gagal sinkron ke backend — kembalikan state lokal seperti semula.
          setBookmarkedIds((current) =>
            isCurrentlyBookmarked ? [...current, id] : current.filter((existing) => existing !== id),
          )
        })

      return next
    })
  }, [])

  const isBookmarked = useCallback((id: string) => bookmarkedIds.includes(id), [bookmarkedIds])

  return { bookmarkedIds, isBookmarked, toggle }
}
