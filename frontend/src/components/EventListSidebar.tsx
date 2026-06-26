import { useState } from 'react'
import { FiBookmark, FiShare2 } from 'react-icons/fi'
import { getCategoryStyle } from '../utils/categoryStyle'
import { formatDateShort } from '../utils/formatDate'
import { useBookmarkedEvents } from '../hooks/useBookmarkedEvents'
import type { Event } from '../types/event'
import './EventListSidebar.css'

interface EventListSidebarProps {
  events: Event[]
  selectedEventId: string | null
  onSelect: (id: string) => void
}

export default function EventListSidebar({ events, selectedEventId, onSelect }: EventListSidebarProps) {
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

  return (
    <div className="event-list-sidebar">
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
              <span className="event-list-sidebar__badge">{event.matchScore}%</span>
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

              <div className="event-list-sidebar__actions">
                <button
                  type="button"
                  className="event-list-sidebar__detail-button"
                  aria-label="Lihat detail kegiatan"
                  onClick={() => onSelect(event.id)}
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
