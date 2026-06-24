import { FiMapPin, FiCalendar, FiTag } from 'react-icons/fi'
import type { Event } from '../types/event'
import { getMatchTier } from '../utils/matchScore'
import { formatDateShort } from '../utils/formatDate'
import './EventCard.css'

interface EventCardProps {
  event: Event
  isSelected: boolean
  onSelect: (id: string) => void
}

export default function EventCard({ event, isSelected, onSelect }: EventCardProps) {
  const visibleSkills = event.skills.slice(0, 3)
  const extraSkillCount = event.skills.length - visibleSkills.length
  const slotsLeft = event.quota - event.filledSlots

  return (
    <button
      type="button"
      className={`event-card${isSelected ? ' event-card--selected' : ''}`}
      onClick={() => onSelect(event.id)}
    >
      <span className={`event-card__match-badge event-card__match-badge--${getMatchTier(event.matchScore)}`}>
        {event.matchScore}% Match
      </span>

      <h3 className="event-card__title">{event.title}</h3>

      <p className="event-card__location">
        <FiMapPin aria-hidden="true" /> {event.location}
      </p>

      <div className="event-card__meta">
        <span><FiTag aria-hidden="true" /> {event.category}</span>
        <span><FiCalendar aria-hidden="true" /> {formatDateShort(event.startDate)}</span>
      </div>

      <div className="event-card__skills">
        {visibleSkills.map((skill) => (
          <span key={skill} className="event-card__skill-tag">{skill}</span>
        ))}
        {extraSkillCount > 0 && (
          <span className="event-card__skill-tag event-card__skill-tag--more">+{extraSkillCount} more</span>
        )}
      </div>

      <span className="event-card__slots">{slotsLeft} dari {event.quota} slot tersisa</span>
    </button>
  )
}
