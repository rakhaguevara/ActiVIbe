import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useOrganizerData } from '../../../contexts/OrganizerDataContext'
import { formatDateShort } from '../../../utils/formatDate'
import '../EventsPage.css'
import './EventsOverviewView.css'

// Dashboard agregat lintas-event — SENGAJA beda bentuk dari AllEventsView
// (table/list per-event dengan filter) karena tujuannya "overview semua
// acara" (ringkasan + tren), bukan operasional cari/kelola satu event.
export default function EventsOverviewView() {
  const { events, applicants, feedbackSummaries } = useOrganizerData()

  const today = new Date().toISOString().slice(0, 10)

  const totals = useMemo(() => {
    const accepted = applicants.filter((a) => ['accepted', 'checked_in', 'completed'].includes(a.status)).length
    const attended = applicants.filter((a) => ['checked_in', 'completed'].includes(a.status)).length
    const ratings = Object.values(feedbackSummaries).filter((s) => s.average !== null)
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, s) => sum + (s.average ?? 0), 0) / ratings.length
      : null
    return { accepted, attended, avgRating }
  }, [applicants, feedbackSummaries])

  const categoryBreakdown = useMemo(() => {
    const counts = new Map<string, number>()
    events.forEach((e) => {
      const key = e.category ?? 'Umum'
      counts.set(key, (counts.get(key) ?? 0) + 1)
    })
    const maxCount = Math.max(1, ...counts.values())
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count, pct: Math.round((count / maxCount) * 100) }))
  }, [events])

  const upcomingCount = events.filter((e) => e.startDate >= today).length
  const pastCount = events.length - upcomingCount

  const soonestUpcoming = useMemo(
    () =>
      events
        .filter((e) => e.startDate >= today)
        .sort((a, b) => a.startDate.localeCompare(b.startDate))
        .slice(0, 3),
    [events, today],
  )

  const recentlyCompleted = useMemo(
    () =>
      events
        .filter((e) => e.status === 'completed')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 3),
    [events],
  )

  return (
    <div className="events-hub">
      <div className="events-stats-grid">
        <div className="event-stat-card">
          <span className="event-stat-card__label">Total Events</span>
          <span className="event-stat-card__value">{events.length}</span>
        </div>
        <div className="event-stat-card">
          <span className="event-stat-card__label">Volunteer Accepted</span>
          <span className="event-stat-card__value">{totals.accepted}</span>
        </div>
        <div className="event-stat-card">
          <span className="event-stat-card__label">Volunteer Hadir</span>
          <span className="event-stat-card__value">{totals.attended}</span>
        </div>
        <div className="event-stat-card">
          <span className="event-stat-card__label">Rata-rata Rating</span>
          <span className="event-stat-card__value">{totals.avgRating !== null ? totals.avgRating.toFixed(1) : '-'}</span>
        </div>
        <div className="event-stat-card">
          <span className="event-stat-card__label">Akan Datang</span>
          <span className="event-stat-card__value">{upcomingCount}</span>
        </div>
        <div className="event-stat-card">
          <span className="event-stat-card__label">Sudah Lewat</span>
          <span className="event-stat-card__value">{pastCount}</span>
        </div>
      </div>

      <div className="events-overview__grid">
        <div className="card events-overview__panel">
          <h2>Sebaran Kategori Event</h2>
          {categoryBreakdown.length === 0 ? (
            <p className="events-overview__empty">Belum ada kegiatan.</p>
          ) : (
            <div className="events-overview__bar-list" role="table" aria-label="Jumlah event per kategori">
              {categoryBreakdown.map((row) => (
                <div key={row.category} className="events-overview__bar-row" role="row">
                  <span className="events-overview__bar-label" role="cell">{row.category}</span>
                  <div className="events-overview__bar-track" role="cell">
                    <div className="events-overview__bar-fill" style={{ width: `${row.pct}%` }} />
                  </div>
                  <span className="events-overview__bar-value" role="cell">{row.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card events-overview__panel">
          <h2>Akan Datang</h2>
          {soonestUpcoming.length === 0 ? (
            <p className="events-overview__empty">Tidak ada kegiatan mendatang.</p>
          ) : (
            <ul className="events-overview__drilldown-list">
              {soonestUpcoming.map((event) => (
                <li key={event.id}>
                  <Link to={`/organizer/events/${event.id}`}>
                    <strong>{event.title}</strong>
                    <span>{formatDateShort(event.startDate)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card events-overview__panel">
          <h2>Baru Selesai</h2>
          {recentlyCompleted.length === 0 ? (
            <p className="events-overview__empty">Belum ada kegiatan yang selesai.</p>
          ) : (
            <ul className="events-overview__drilldown-list">
              {recentlyCompleted.map((event) => (
                <li key={event.id}>
                  <Link to={`/organizer/events/${event.id}`}>
                    <strong>{event.title}</strong>
                    <span>{formatDateShort(event.endDate)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
