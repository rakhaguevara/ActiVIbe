// Layar hasil personalisasi — muncul TEPAT setelah wizard onboarding selesai
// (lihat DashboardLayout), sebelum user berinteraksi dengan dashboard.
// Dua tahap (dua card):
//   1. Hasil Analisis AI — narasi profil (hobi/jurusan/minat → peran volunteer
//      paling cocok + lokasi) dan grafik afinitas kategori.
//   2. Rekomendasi kegiatan paling cocok, dengan label tier kecocokan
//      (0–49 Kurang Cocok · 50–79 Sedikit Relevan · 80–100 Sangat Relevan &
//      Cocok) dan CTA daftar langsung.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchRecommendations } from '../services/recommendation.service'
import type { ProfileAnalysis, RecommendedEvent } from '../services/recommendation.service'
import { formatDateShort } from '../utils/formatDate'
import { getMatchTier } from '../utils/matchScore'
import './PersonalizationResultModal.css'

const TOP_COUNT = 3

interface PersonalizationResultModalProps {
  onClose: () => void
}

export default function PersonalizationResultModal({ onClose }: PersonalizationResultModalProps) {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null)
  const [topEvents, setTopEvents] = useState<RecommendedEvent[] | null>(null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchRecommendations()
      .then((data) => {
        if (cancelled) return
        setAnalysis(data.analysis)
        setTopEvents(data.recommendations.slice(0, TOP_COUNT))
      })
      .catch(() => {
        if (cancelled) return
        setHasError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleRegister = (eventId: string) => {
    // ?event=... membuat FindActivityPage langsung memilih event ini,
    // sehingga form pendaftaran di panel kanan langsung terisi.
    navigate(`/dashboard?event=${eventId}`)
    onClose()
  }

  const isLoading = analysis === null && !hasError

  return (
    <div className="personalization-result__backdrop">
      <div
        className="personalization-result"
        role="dialog"
        aria-modal="true"
        aria-label="Hasil personalisasi kegiatan volunteer"
      >
        {isLoading ? (
          <div className="personalization-result__loading">
            <span className="personalization-result__loading-emoji" aria-hidden="true">✨</span>
            <h2 className="personalization-result__title">Menganalisis profilmu…</h2>
            <p className="personalization-result__subtitle">
              AI sedang mencocokkan hobi, jurusan, minat, dan ketersediaanmu dengan kegiatan volunteer yang ada.
            </p>
          </div>
        ) : hasError || !analysis ? (
          <div className="personalization-result__loading">
            <h2 className="personalization-result__title">Profilmu sudah tersimpan!</h2>
            <p className="personalization-result__subtitle">
              Hasil analisis belum bisa dimuat sekarang — kamu tetap bisa menjelajah semua kegiatan di dashboard.
            </p>
            <button type="button" className="personalization-result__cta" onClick={onClose}>
              Buka Dashboard
            </button>
          </div>
        ) : step === 1 ? (
          /* ── Card 1: Hasil Analisis AI ── */
          <>
            <div className="personalization-result__header">
              <h2 className="personalization-result__title">🔮 This is Your Vibe! — Hasil Analisis Profilmu</h2>
              <p className="personalization-result__subtitle">
                {analysis.aiGenerated
                  ? 'AI kami menganalisis hobi, jurusan, dan minatmu:'
                  : 'Berdasarkan data profil yang kamu isi:'}
              </p>
            </div>

            <p className="personalization-result__analysis-summary">{analysis.summary}</p>

            <div className="personalization-result__role-row">
              <span className="personalization-result__role-label">Peran paling cocok untukmu</span>
              <span className="personalization-result__role-chip">{analysis.recommendedRole}</span>
              {analysis.location && (
                <span className="personalization-result__role-location">📍 di sekitar {analysis.location}</span>
              )}
            </div>

            <div className="personalization-result__chart" role="img" aria-label="Grafik kecocokanmu per kategori kegiatan">
              <h3 className="personalization-result__chart-title">Kecocokanmu per kategori kegiatan</h3>
              {analysis.chart.map((item) => (
                <div key={item.label} className="personalization-result__chart-row">
                  <div className="personalization-result__chart-labels">
                    <span className="personalization-result__chart-name">{item.label}</span>
                    <span className="personalization-result__chart-value">{item.score}%</span>
                  </div>
                  <div className="personalization-result__chart-track">
                    <div
                      className="personalization-result__chart-bar"
                      style={{ width: `${Math.min(100, Math.max(0, item.score))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button type="button" className="personalization-result__cta" onClick={() => setStep(2)}>
              Lihat Rekomendasi Kegiatan →
            </button>
          </>
        ) : (
          /* ── Card 2: Rekomendasi kegiatan + tier kecocokan ── */
          <>
            <div className="personalization-result__header">
              <h2 className="personalization-result__title">✨ Kegiatan Paling Cocok Untukmu</h2>
              <p className="personalization-result__subtitle">
                Diurutkan dari kecocokan tertinggi — pilih dan langsung daftar:
              </p>
            </div>

            <div className="personalization-result__cards">
              {topEvents!.map((event) => (
                <article key={event.id} className="personalization-result__card">
                  <div className="personalization-result__card-head">
                    <span className="personalization-result__symbol" aria-hidden="true">{event.symbol}</span>
                    <span
                      className={`personalization-result__score personalization-result__score--${getMatchTier(event.matchScore)}`}
                    >
                      {event.matchScore}%
                    </span>
                  </div>

                  <span
                    className={`personalization-result__relevance personalization-result__relevance--${getMatchTier(event.matchScore)}`}
                  >
                    {event.relevanceLabel}
                  </span>

                  <h3 className="personalization-result__card-title">{event.title}</h3>
                  <p className="personalization-result__card-meta">
                    {event.category} · {event.location} · {formatDateShort(event.startDate)}
                  </p>
                  <p className="personalization-result__card-reasoning">{event.matchReasoning}</p>

                  <button
                    type="button"
                    className="personalization-result__cta"
                    onClick={() => handleRegister(event.id)}
                  >
                    Daftar Sekarang
                  </button>
                </article>
              ))}
            </div>

            <div className="personalization-result__footer-row">
              <button type="button" className="personalization-result__secondary" onClick={() => setStep(1)}>
                ← Kembali ke analisis
              </button>
              <button type="button" className="personalization-result__secondary" onClick={onClose}>
                Lihat semua rekomendasi di dashboard →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
