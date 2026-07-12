import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/apiFetch'
import { resolveAssetUrl } from '../../lib/assetUrl'
import type { Event } from '../../types/event'
import { FiMapPin, FiCalendar } from 'react-icons/fi'
import './PublicFindActivityPage.css'
import pic1 from '../../assets/png/pic1 1.png'
import pic2 from '../../assets/png/pic2 1.png'

const FALLBACK_IMAGES = [pic1, pic2]

export default function PublicFindActivityPage({ onLoginClick }: { onLoginClick?: () => void }) {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await apiFetch(`${import.meta.env.VITE_API_URL ?? ''}/events/public`)
        const data = await res.json()
        if (data.events) {
          const mappedEvents = data.events
            .filter((e: any) => e.status !== 'COMPLETED' && e.status !== 'ARCHIVED' && e.status !== 'DRAFT' && e.status !== 'REJECTED' && e.status !== 'PENDING_APPROVAL')
            .map((rec: any, index: number) => {
              const photos = rec.photos ? rec.photos.map(resolveAssetUrl) : []
              return {
                id: rec.id,
                title: rec.title,
                imageUrl: photos[0] ?? FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
                description: rec.description,
                category: rec.category,
                location: rec.location,
                organizerName: rec.organizerName,
                startDate: rec.startDate,
                endDate: rec.endDate,
              }
            })
          setEvents(mappedEvents)
        }
      } catch (err) {
        console.error('Failed to load public events', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadEvents()
  }, [])

  return (
    <div className="public-activity-page">
      <div className="public-activity-container">
        <h1>Temukan Aktivitas Relawan</h1>
        <p className="public-activity-subtitle">Jelajahi berbagai kegiatan kerelawanan yang sedang berlangsung dan mulai buat dampak positif.</p>
        
        {isLoading ? (
          <div className="public-loading">Memuat kegiatan...</div>
        ) : events.length === 0 ? (
          <div className="public-empty">Belum ada kegiatan yang tersedia saat ini.</div>
        ) : (
          <div className="public-grid">
            {events.map(event => (
              <div key={event.id} className="public-card">
                <div className="public-card-image" style={{ backgroundImage: `url("${event.imageUrl}")` }} />
                <div className="public-card-content">
                  <h3 className="public-card-title">{event.title}</h3>
                  <p className="public-card-org">{event.organizerName}</p>
                  
                  <div className="public-card-meta">
                    <span><FiMapPin /> {event.location}</span>
                    <span>
                      <FiCalendar />{' '}
                      {new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  
                  <button className="btn btn--primary public-card-btn" onClick={onLoginClick}>
                    Daftar Sekarang
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
