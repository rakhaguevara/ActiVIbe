import { getCategoryStyle } from '../utils/categoryStyle'
import { formatDateShort } from '../utils/formatDate'
import type { Event } from '../types/event'
import './EventListSidebar.css'

interface EventListSidebarProps {
  events: Event[]
  selectedEventId: string | null
  onSelect: (id: string) => void
}

export default function EventListSidebar({ events, selectedEventId, onSelect }: EventListSidebarProps) {
  return (
    <div className="event-list-sidebar">
      {events.map((event) => {
        const { icon: Icon } = getCategoryStyle(event.category)
        const isSelected = event.id === selectedEventId
        const visibleSkills = event.skills.slice(0, 2)
        const extraSkillCount = event.skills.length - visibleSkills.length

        return (
          <button
            key={event.id}
            type="button"
            className={`event-list-sidebar__item${isSelected ? ' event-list-sidebar__item--selected' : ''}`}
            onClick={() => onSelect(event.id)}
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
            </div>
          </button>
        )
      })}
    </div>
  )
}
