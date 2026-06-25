import type { Event } from '../types/event'
import './OrganizerProfileCard.css'

interface OrganizerProfileCardProps {
  event: Event
}

export default function OrganizerProfileCard({ event }: OrganizerProfileCardProps) {
  const initial = event.organizerName.charAt(0).toUpperCase()

  return (
    <div className="organizer-profile-card">
      <h3>Tentang Penyelenggara</h3>
      <div className="organizer-profile-card__header">
        <span className="organizer-profile-card__avatar" aria-hidden="true">{initial}</span>
        <div>
          <p className="organizer-profile-card__name">{event.organizerName}</p>
          <span className="organizer-profile-card__badge">Penyelenggara Terverifikasi</span>
        </div>
      </div>
      <p className="organizer-profile-card__stats">
        {event.organizerEventsCount} kegiatan · ★ {event.organizerRating.toFixed(1)} · {event.organizerYearsActive} tahun aktif
      </p>
      <p className="organizer-profile-card__bio">{event.organizerBio}</p>
      <button type="button" className="organizer-profile-card__contact-button">
        Hubungi Penyelenggara
      </button>
    </div>
  )
}
