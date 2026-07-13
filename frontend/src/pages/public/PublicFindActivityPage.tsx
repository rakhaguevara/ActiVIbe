import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/apiFetch'
import { resolveAssetUrl } from '../../lib/assetUrl'
import { FiMapPin, FiCalendar, FiUsers, FiStar, FiClock, FiZap, FiTrendingUp, FiAward } from 'react-icons/fi'
import Footer from '../../components/Footer'
import './PublicFindActivityPage.css'
import pic1 from '../../assets/png/pic1 1.png'
import pic2 from '../../assets/png/pic2 1.png'

const FALLBACK_IMAGES = [pic1, pic2]

interface PublicEvent {
  id: string
  title: string
  imageUrl: string
  category: string
  location: string
  organizerName: string
  startDate: string
  endDate: string
  quota: number
  filledSlots: number
  rating: number
  reviewCount: number
  createdAt: string
}

function EventCard({ event, onLoginClick }: { event: PublicEvent; onLoginClick?: () => void }) {
  const fillPct = event.quota > 0 ? Math.round((event.filledSlots / event.quota) * 100) : 0
  const daysUntil = Math.ceil((new Date(event.startDate).getTime() - Date.now()) / 86400000)
  const daysUntilEnd = Math.ceil((new Date(event.endDate).getTime() - Date.now()) / 86400000)
  const isAlmostFull = fillPct >= 75
  const isClosingSoon = daysUntilEnd <= 3 && daysUntilEnd >= 0

  return (
    <div className="pac-card">
      <div className="pac-card-img" style={{ backgroundImage: `url("${event.imageUrl}")` }}>
        {isAlmostFull && <span className="pac-badge pac-badge--hot">🔥 Hampir Penuh</span>}
        {isClosingSoon && !isAlmostFull && <span className="pac-badge pac-badge--closing">⏳ Segera Tutup</span>}
        <div className="pac-card-category">{event.category || 'Umum'}</div>
      </div>
      <div className="pac-card-body">
        <h3 className="pac-card-title">{event.title}</h3>
        <p className="pac-card-org">{event.organizerName}</p>
        <div className="pac-card-meta">
          <span><FiMapPin size={12} /> {event.location}</span>
          <span>
            <FiCalendar size={12} />
            {daysUntil > 0
              ? ` ${daysUntil} hari lagi`
              : new Date(event.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
          </span>
        </div>
        {event.quota > 0 && (
          <div className="pac-fill-bar">
            <div className="pac-fill-bar-track">
              <div className="pac-fill-bar-fill" style={{ width: `${Math.min(fillPct, 100)}%` }} />
            </div>
            <span className="pac-fill-label">{event.filledSlots}/{event.quota} peserta</span>
          </div>
        )}
        {event.rating > 0 && (
          <div className="pac-rating">
            <FiStar size={12} className="pac-star" />
            <span>{event.rating.toFixed(1)}</span>
            <span className="pac-review-count">({event.reviewCount})</span>
          </div>
        )}
        <button className="pac-btn" onClick={onLoginClick}>Daftar Sekarang</button>
      </div>
    </div>
  )
}

interface SectionProps {
  title: string
  subtitle: string
  icon: React.ReactNode
  events: PublicEvent[]
  onLoginClick?: () => void
  emptyText?: string
}

function Section({ title, subtitle, icon, events, onLoginClick, emptyText }: SectionProps) {
  if (events.length === 0) return null
  return (
    <section className="pac-section">
      <div className="pac-section-header">
        <div className="pac-section-icon">{icon}</div>
        <div>
          <h2 className="pac-section-title">{title}</h2>
          <p className="pac-section-sub">{subtitle}</p>
        </div>
      </div>
      <div className="pac-row-wrapper">
        <div className="pac-row">
          {events.map(ev => (
            <EventCard key={ev.id} event={ev} onLoginClick={onLoginClick} />
          ))}
          {events.length === 0 && (
            <p className="pac-empty">{emptyText ?? 'Belum ada kegiatan.'}</p>
          )}
        </div>
      </div>
    </section>
  )
}

export default function PublicFindActivityPage({ onLoginClick }: { onLoginClick?: () => void }) {
  const [events, setEvents] = useState<PublicEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch(`${import.meta.env.VITE_API_URL ?? ''}/events/public`)
        const data = await res.json()
        if (data.events) {
          const now = Date.now()
          const mapped: PublicEvent[] = data.events
            .filter((e: any) =>
              e.status !== 'COMPLETED' &&
              e.status !== 'ARCHIVED' &&
              e.status !== 'DRAFT' &&
              e.status !== 'REJECTED' &&
              e.status !== 'PENDING_APPROVAL'
            )
            .map((rec: any, i: number) => {
              const photos = rec.photos ? rec.photos.map(resolveAssetUrl) : []
              return {
                id: rec.id,
                title: rec.title,
                imageUrl: photos[0] ?? FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
                category: rec.category ?? '',
                location: rec.location ?? '',
                organizerName: rec.organizerName ?? '',
                startDate: rec.startDate,
                endDate: rec.endDate,
                quota: rec.quota ?? 0,
                filledSlots: rec.filledSlots ?? 0,
                rating: rec.rating ?? 0,
                reviewCount: rec.reviewCount ?? 0,
                createdAt: rec.createdAt ?? new Date().toISOString(),
              }
            })
          setEvents(mapped)
        }
      } catch (err) {
        console.error('Failed to load public events', err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // ── Derived sections ──────────────────────────────────
  const now = Date.now()

  /** 1. Segera Dimulai — paling dekat startDate dari sekarang */
  const soonest = [...events]
    .filter(e => new Date(e.startDate).getTime() > now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 10)

  /** 2. Terpopuler — rating tertinggi (min 1 review) */
  const topRated = [...events]
    .filter(e => e.reviewCount > 0)
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, 10)

  /** 3. Terbanyak Peserta Bulan Ini — filledSlots tertinggi */
  const mostJoined = [...events]
    .sort((a, b) => b.filledSlots - a.filledSlots)
    .slice(0, 10)

  /** 4. Baru Ditambahkan — createdAt terbaru */
  const newest = [...events]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  /** 5. Segera Ditutup — endDate paling dekat (dalam 7 hari) */
  const closingSoon = [...events]
    .filter(e => {
      const ms = new Date(e.endDate).getTime() - now
      return ms > 0 && ms < 7 * 86400000
    })
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 10)

  return (
    <div className="pac-page">
      {/* Hero header */}
      <div className="pac-hero">
        <div className="pac-hero-inner">
          <h1 className="pac-hero-title">Temukan Aktivitas Relawan</h1>
          <p className="pac-hero-sub">
            Jelajahi berbagai kegiatan kerelawanan yang sedang berlangsung dan mulai buat dampak positif.
          </p>
        </div>
      </div>

      <div className="pac-content">
        {isLoading ? (
          <div className="pac-loading">
            <div className="pac-spinner" />
            <p>Memuat kegiatan...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="pac-empty-state">Belum ada kegiatan yang tersedia saat ini.</div>
        ) : (
          <>
            <Section
              title="Segera Dimulai"
              subtitle="Kegiatan yang paling dekat waktunya — jangan sampai terlewat!"
              icon={<FiZap />}
              events={soonest}
              onLoginClick={onLoginClick}
            />
            <Section
              title="Terpopuler"
              subtitle="Kegiatan dengan rating terbaik dari para relawan"
              icon={<FiStar />}
              events={topRated}
              onLoginClick={onLoginClick}
            />
            <Section
              title="Terbanyak Diikuti Bulan Ini"
              subtitle="Kegiatan yang paling banyak diminati relawan saat ini"
              icon={<FiTrendingUp />}
              events={mostJoined}
              onLoginClick={onLoginClick}
            />
            <Section
              title="Baru Ditambahkan"
              subtitle="Kegiatan terbaru yang baru saja dibuka untuk pendaftaran"
              icon={<FiAward />}
              events={newest}
              onLoginClick={onLoginClick}
            />
            <Section
              title="Segera Ditutup"
              subtitle="Kurang dari 7 hari lagi — segera daftar sebelum terlambat!"
              icon={<FiClock />}
              events={closingSoon}
              onLoginClick={onLoginClick}
            />
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
