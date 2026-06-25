import { getCategoryStyle } from '../utils/categoryStyle'
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
        return (
          <button
            key={event.id}
            type="button"
            className={`event-list-sidebar__item${isSelected ? ' event-list-sidebar__item--selected' : ''}`}
            onClick={() => onSelect(event.id)}
          >
            <Icon className="event-list-sidebar__icon" aria-hidden="true" />
            <span className="event-list-sidebar__title">{event.title}</span>
            <span className="event-list-sidebar__score">{event.matchScore}%</span>
          </button>
        )
      })}
    </div>
  )
}
