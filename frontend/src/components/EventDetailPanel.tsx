import { useState } from 'react'
import { FiShare2, FiBookmark } from 'react-icons/fi'
import type { Event } from '../types/event'
import { getMatchTier } from '../utils/matchScore'
import EventGalleryHero from './EventGalleryHero'
import EventOrganizerStrip from './EventOrganizerStrip'
import EventHighlights from './EventHighlights'
import EventAmenities from './EventAmenities'
import EventScheduleCalendar from './EventScheduleCalendar'
import EventRatingSummary from './EventRatingSummary'
import EventReviewList from './EventReviewList'
import EventLocationMap from './EventLocationMap'
import OrganizerProfileCard from './OrganizerProfileCard'
import EventPolicies from './EventPolicies'
import './EventDetailPanel.css'

interface EventDetailPanelProps {
  event: Event
}

export default function EventDetailPanel({ event }: EventDetailPanelProps) {
  const [showFullDescription, setShowFullDescription] = useState(false)
  const slotsLeft = event.quota - event.filledSlots

  return (
    <div className="event-detail-panel">
      <EventGalleryHero category={event.category} />

      <div className="event-detail-panel__title-row">
        <h2 className="event-detail-panel__title">{event.title}</h2>
        <div className="event-detail-panel__title-actions">
          <button type="button" className="event-detail-panel__icon-button" aria-label="Bagikan kegiatan">
            <FiShare2 />
          </button>
          <button type="button" className="event-detail-panel__icon-button" aria-label="Simpan kegiatan">
            <FiBookmark />
          </button>
        </div>
      </div>

      <p className="event-detail-panel__subtitle">
        {event.category} · {event.location} · {slotsLeft} dari {event.quota} slot · ★ {event.rating.toFixed(1)} ·{' '}
        <a href="#reviews">{event.reviewCount} ulasan</a>
      </p>

      <EventOrganizerStrip event={event} />

      <div className="event-detail-panel__badges">
        <span className={`event-detail-panel__match-badge event-detail-panel__match-badge--${getMatchTier(event.matchScore)}`}>
          {event.matchScore}% Match Score
        </span>
        <span className="event-detail-panel__fit-badge">✨ {event.fitBadgeLabel}</span>
      </div>
      <p className="event-detail-panel__match-reasoning">{event.matchReasoning}</p>

      <EventHighlights />

      <div className="event-detail-panel__description-block">
        <p className={`event-detail-panel__desc${showFullDescription ? '' : ' event-detail-panel__desc--clamped'}`}>
          {event.description}
        </p>
        <button
          type="button"
          className="event-detail-panel__desc-toggle"
          onClick={() => setShowFullDescription((prev) => !prev)}
        >
          {showFullDescription ? 'Tampilkan lebih sedikit' : 'Tampilkan lebih banyak'}
        </button>
      </div>

      <EventAmenities provisions={event.provisions} />

      <div className="event-detail-panel__skills">
        <h3>Skill yang Dibutuhkan</h3>
        <div className="event-detail-panel__skill-list">
          {event.skills.map((skill) => (
            <span key={skill} className="event-detail-panel__skill-tag">{skill}</span>
          ))}
        </div>
      </div>

      <EventScheduleCalendar startDate={event.startDate} endDate={event.endDate} />

      <EventRatingSummary
        rating={event.rating}
        reviewCount={event.reviewCount}
        ratingBreakdown={event.ratingBreakdown}
      />

      <EventReviewList reviews={event.reviews} />

      <EventLocationMap location={event.location} />

      <OrganizerProfileCard event={event} />

      <EventPolicies event={event} />
    </div>
  )
}
