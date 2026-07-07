import { FiMapPin } from 'react-icons/fi'
import { resolveMapsEmbed } from '../lib/mapsEmbed'
import './EventLocationMap.css'

interface EventLocationMapProps {
  location: string
  mapLink?: string
  eventMode?: 'ONLINE' | 'OFFLINE'
}

export default function EventLocationMap({ location, mapLink, eventMode }: EventLocationMapProps) {
  const isOnline = eventMode === 'ONLINE'
  // mapLink diprioritaskan; kalau organizer tidak mengisinya, fallback ke teks
  // location yang sudah ada — tetap dapat embed peta (bukan cuma placeholder
  // statis seperti sebelumnya), tanpa API key/billing (lihat lib/mapsEmbed.ts).
  const preview = !isOnline ? resolveMapsEmbed(mapLink || location) : null

  return (
    <div className="event-location-map">
      <h3>Di Mana Kegiatan Berlangsung</h3>
      <p className="event-location-map__address">
        <FiMapPin aria-hidden="true" /> {location}
      </p>
      {isOnline ? (
        <div className="event-location-map__placeholder">Kegiatan online — tidak ada lokasi fisik</div>
      ) : preview?.embedSrc ? (
        <iframe
          className="event-location-map__embed"
          src={preview.embedSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Peta lokasi kegiatan"
        />
      ) : preview?.externalUrl ? (
        <a href={preview.externalUrl} target="_blank" rel="noreferrer" className="btn btn--outline btn--sm">
          Buka di Google Maps
        </a>
      ) : (
        <div className="event-location-map__placeholder">Peta interaktif segera hadir</div>
      )}
    </div>
  )
}
