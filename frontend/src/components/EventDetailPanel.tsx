import type { Event } from '../types/event'
import { getMatchTier } from '../utils/matchScore'
import { formatDateShort } from '../utils/formatDate'
import './EventDetailPanel.css'

interface EventDetailPanelProps {
  event: Event
}

export default function EventDetailPanel({ event }: EventDetailPanelProps) {
  const slotsLeft = event.quota - event.filledSlots

  return (
    <div className="event-detail-panel">
      <div className="event-detail-panel__badges">
        <span className={`event-detail-panel__match-badge event-detail-panel__match-badge--${getMatchTier(event.matchScore)}`}>
          {event.matchScore}% Match Score
        </span>
        <span className="event-detail-panel__fit-badge">✨ {event.fitBadgeLabel}</span>
      </div>

      <h2 className="event-detail-panel__title">{event.title}</h2>
      <p className="event-detail-panel__category">{event.category}</p>
      <p className="event-detail-panel__desc">{event.description}</p>

      <dl className="event-detail-panel__facts">
        <div className="event-detail-panel__fact">
          <dt>Lokasi</dt>
          <dd>{event.location}</dd>
        </div>
        <div className="event-detail-panel__fact">
          <dt>Jadwal</dt>
          <dd>{formatDateShort(event.startDate)} – {formatDateShort(event.endDate)}</dd>
        </div>
        <div className="event-detail-panel__fact">
          <dt>Diselenggarakan oleh</dt>
          <dd>{event.organizerName}</dd>
        </div>
        <div className="event-detail-panel__fact">
          <dt>Slot tersisa</dt>
          <dd>{slotsLeft} dari {event.quota}</dd>
        </div>
      </dl>

      <div className="event-detail-panel__skills">
        <h3>Skill yang Dibutuhkan</h3>
        <div className="event-detail-panel__skill-list">
          {event.skills.map((skill) => (
            <span key={skill} className="event-detail-panel__skill-tag">{skill}</span>
          ))}
        </div>
      </div>

      <div className="event-detail-panel__breakdown">
        <h3>Kenapa Kegiatan Ini Cocok Buatmu</h3>
        <p>{event.matchReasoning}</p>
      </div>
    </div>
  )
}
