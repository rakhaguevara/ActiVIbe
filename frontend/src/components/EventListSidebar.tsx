import { useState } from 'react'
import { FiBookmark, FiShare2 } from 'react-icons/fi'
import { getCategoryStyle } from '../utils/categoryStyle'
import { formatDateShort } from '../utils/formatDate'
import { useBookmarkedEvents } from '../hooks/useBookmarkedEvents'
import { trackEventView } from '../lib/eventApi'
import type { Gender } from '../lib/profileApi'
import type { Event } from '../types/event'
import CertificateBadge from './CertificateBadge'
import PersonalizationInsightCard from './PersonalizationInsightCard'
import './EventListSidebar.css'

interface EventListSidebarProps {
  events: Event[]
  selectedEventId: string | null
  onSelect: (id: string) => void
  /** Fitur "women respect" — badge jumlah peserta perempuan cuma tampil kalau FEMALE */
  currentUserGender?: Gender | null
  /** ActiVibe Plus — house ad utk volunteer tier FREE (hilang setelah upgrade) */
  showAd?: boolean
  /** Props untuk PersonalizationInsightCard */
  aiEnabled?: boolean
  profileComplete?: boolean
}

export default function EventListSidebar({ events, selectedEventId, onSelect, currentUserGender, showAd, aiEnabled = false, profileComplete = true }: EventListSidebarProps) {
  const { isBookmarked, toggle } = useBookmarkedEvents()
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null)

  const handleShare = async (eventId: string) => {
    const link = `${window.location.origin}/dashboard?event=${eventId}`
    await navigator.clipboard.writeText(link)
    setCopiedEventId(eventId)
    setTimeout(() => {
      setCopiedEventId((current) => (current === eventId ? null : current))
    }, 1500)
  }

  // Sinyal "buka event" (FR-005 behavioral boost) — fire-and-forget, gagal
  // tracking tidak boleh mengganggu navigasi ke detail. TIDAK invalidate cache
  // rekomendasi di sini (beda dgn bookmark) — view terjadi tiap klik "Detail",
  // kalau tiap klik memicu refetch (termasuk panggilan AI ulang) jadi boros;
  // efeknya cukup terlihat lewat TTL cache 5 menit yang sudah ada.
  const handleSelect = (eventId: string) => {
    onSelect(eventId)
    // Satu-satunya sumber list di sini adalah useRecommendations() (AI
    // personalized, lihat FindActivityPage.tsx) — belum ada endpoint search
    // terpisah, jadi traffic dari komponen ini selalu berasal dari rekomendasi.
    trackEventView(eventId, 'recommendation').catch(() => {})
  }

  return (
    <div className="event-list-sidebar">
      {/* Personalization insight card — always shown when events loaded */}
      <PersonalizationInsightCard
        events={events}
        aiEnabled={aiEnabled}
        profileComplete={profileComplete}
        variant="compact"
      />
      {showAd && (
        <a href="/activibe-plus" className="event-list-sidebar__ad">
          <span className="event-list-sidebar__ad-label">Sponsor</span>
          <p><strong>Hilangkan iklan &amp; buka semua fitur</strong> — Upgrade ke ActiVibe Plus.</p>
        </a>
      )}
      {events.map((event) => {
        const { icon: Icon } = getCategoryStyle(event.category)
        const isSelected = event.id === selectedEventId
        const visibleSkills = event.skills.slice(0, 2)
        const extraSkillCount = event.skills.length - visibleSkills.length
        const bookmarked = isBookmarked(event.id)

        return (
          <div
            key={event.id}
            className={`event-list-sidebar__item${isSelected ? ' event-list-sidebar__item--selected' : ''}`}
          >
            <div className="event-list-sidebar__image-wrap">
              <img src={event.imageUrl} alt="" className="event-list-sidebar__image" />
              <span className="event-list-sidebar__badge">
                {event.symbol ? `${event.symbol} ` : ''}{event.matchScore}%
              </span>
            </div>

            <div className="event-list-sidebar__content">
              <span className="event-list-sidebar__title">{event.title}</span>

              <div className="event-list-sidebar__tags-row">
                <Icon className="event-list-sidebar__icon" aria-hidden="true" />
                {visibleSkills.map((skill) => (
                  <span key={skill} className="event-list-sidebar__skill-chip">{skill}</span>
                ))}
                {extraSkillCount > 0 && (
                  <span className="event-list-sidebar__skill-chip">+{extraSkillCount}</span>
                )}
              </div>

              <p className="event-list-sidebar__desc">{event.description}</p>

              <div className="event-list-sidebar__footer">
                <span className="event-list-sidebar__quota">{event.filledSlots}/{event.quota} slot</span>
                <span className="event-list-sidebar__date">
                  {formatDateShort(event.startDate)} – {formatDateShort(event.endDate)}
                </span>
              </div>

              {currentUserGender === 'FEMALE' && event.femaleAcceptedCount !== undefined && (
                <span className="event-list-sidebar__women-badge">
                  👩 {event.femaleAcceptedCount} perempuan terdaftar
                </span>
              )}
              <CertificateBadge certificateProvider={event.certificateProvider} />

              <div className="event-list-sidebar__actions">
                <button
                  type="button"
                  className="event-list-sidebar__detail-button"
                  aria-label="Lihat detail kegiatan"
                  onClick={() => handleSelect(event.id)}
                >
                  Detail
                </button>
                <button
                  type="button"
                  className={`event-list-sidebar__icon-button${bookmarked ? ' event-list-sidebar__icon-button--active' : ''}`}
                  aria-label={bookmarked ? 'Hapus dari simpanan' : 'Simpan kegiatan'}
                  onClick={() => toggle(event.id)}
                >
                  <FiBookmark fill={bookmarked ? 'currentColor' : 'none'} />
                </button>
                <button
                  type="button"
                  className="event-list-sidebar__icon-button"
                  aria-label="Bagikan kegiatan"
                  onClick={() => handleShare(event.id)}
                >
                  <FiShare2 />
                </button>
                {copiedEventId === event.id && (
                  <span className="event-list-sidebar__copied-label">Disalin!</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
