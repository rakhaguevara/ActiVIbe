// Layar hasil sesi Mode Swipe (mobile) — muncul begitu SwipeDeck selesai
// (5 kegiatan disimpan atau 10 kartu habis). Bahasa visual mengikuti
// PersonalizationResultModal (backdrop blur, card radius 20px, token design.md),
// tapi satu tahap saja (bukan 2 card) & sumbernya kartu hasil swipe, bukan
// wizard onboarding.

import { useNavigate } from 'react-router-dom'
import { useBookmarkedEvents } from '../hooks/useBookmarkedEvents'
import { unbookmarkEventRequest } from '../lib/eventApi'
import { invalidateRecommendations } from '../services/recommendation.service'
import { formatDateShort } from '../utils/formatDate'
import { getMatchTier } from '../utils/matchScore'
import type { Event } from '../types/event'
import './SwipeResultModal.css'

const TOP_COUNT = 3

interface SwipeResultModalProps {
  savedEvents: Event[]
  onClose: () => void
}

export default function SwipeResultModal({ savedEvents, onClose }: SwipeResultModalProps) {
  const navigate = useNavigate()
  const { isBookmarked } = useBookmarkedEvents()
  const topPicks = [...savedEvents].sort((a, b) => b.matchScore - a.matchScore).slice(0, TOP_COUNT)

  const handleRegister = (eventId: string) => {
    // Sesuai keputusan produk: begitu user memilih 1 dari shortlist, sisa
    // anggota shortlist yang tidak dipilih dibuang (di-unbookmark). Event yang
    // ke-swipe-kanan tapi tidak masuk shortlist tetap tersimpan sbg bookmark biasa.
    topPicks
      .filter((event) => event.id !== eventId)
      .forEach((event) => {
        if (isBookmarked(event.id)) {
          unbookmarkEventRequest(event.id)
            .then(() => invalidateRecommendations())
            .catch(() => {})
        }
      })

    navigate(`/dashboard/activity/${eventId}`)
    onClose()
  }

  return (
    <div className="swipe-result__backdrop">
      <div className="swipe-result" role="dialog" aria-modal="true" aria-label="Hasil Mode Swipe">
        {topPicks.length === 0 ? (
          <div className="swipe-result__empty">
            <span className="swipe-result__empty-emoji" aria-hidden="true">🔍</span>
            <h2 className="swipe-result__title">Belum ada kegiatan yang cocok</h2>
            <p className="swipe-result__subtitle">
              Kamu melewati semua kartu tanpa menyimpan satu pun. Coba lagi dengan kartu berikutnya?
            </p>
            <button type="button" className="swipe-result__cta" onClick={onClose}>
              Ulangi
            </button>
          </div>
        ) : (
          <>
            <div className="swipe-result__header">
              <h2 className="swipe-result__title">✨ Kegiatan Paling Cocok Untukmu</h2>
              <p className="swipe-result__subtitle">
                Dari kegiatan yang kamu simpan, ini yang paling cocok — pilih dan langsung daftar:
              </p>
            </div>

            <div className="swipe-result__cards">
              {topPicks.map((event) => (
                <article key={event.id} className="swipe-result__card">
                  <div className="swipe-result__card-head">
                    <span className="swipe-result__symbol" aria-hidden="true">{event.symbol}</span>
                    <span
                      className={`swipe-result__score swipe-result__score--${getMatchTier(event.matchScore)}`}
                    >
                      {event.matchScore}%
                    </span>
                  </div>

                  {event.relevanceLabel && (
                    <span
                      className={`swipe-result__relevance swipe-result__relevance--${getMatchTier(event.matchScore)}`}
                    >
                      {event.relevanceLabel}
                    </span>
                  )}

                  <h3 className="swipe-result__card-title">{event.title}</h3>
                  <p className="swipe-result__card-meta">
                    {event.category} · {event.location} · {formatDateShort(event.startDate)}
                  </p>

                  <button
                    type="button"
                    className="swipe-result__cta"
                    onClick={() => handleRegister(event.id)}
                  >
                    Daftar Sekarang
                  </button>
                </article>
              ))}
            </div>

            <button type="button" className="swipe-result__secondary" onClick={onClose}>
              Tutup
            </button>
          </>
        )}
      </div>
    </div>
  )
}
