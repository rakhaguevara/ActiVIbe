import { FiMapPin } from 'react-icons/fi'
import './EventLocationMap.css'

interface EventLocationMapProps {
  location: string
}

export default function EventLocationMap({ location }: EventLocationMapProps) {
  return (
    <div className="event-location-map">
      <h3>Di Mana Kegiatan Berlangsung</h3>
      <p className="event-location-map__address">
        <FiMapPin aria-hidden="true" /> {location}
      </p>
      <div className="event-location-map__placeholder">Peta interaktif segera hadir</div>
    </div>
  )
}
