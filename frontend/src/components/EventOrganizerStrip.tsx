import type { Event } from '../types/event'
import './EventOrganizerStrip.css'

interface EventOrganizerStripProps {
  event: Event
}

export default function EventOrganizerStrip({ event }: EventOrganizerStripProps) {
  const initial = event.organizerName.charAt(0).toUpperCase()

  return (
    <div className="event-organizer-strip">
      <span className="event-organizer-strip__avatar" aria-hidden="true">{initial}</span>
      <div className="event-organizer-strip__info">
        <p className="event-organizer-strip__name">Diselenggarakan oleh {event.organizerName}</p>
        <p className="event-organizer-strip__meta">
          {event.organizerEventsCount} kegiatan diselenggarakan · ★ {event.organizerRating.toFixed(1)}
        </p>
      </div>
    </div>
  )
}
