import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiSearch, FiFileText, FiClock, FiStar, FiCheckCircle, FiArchive,
} from 'react-icons/fi'
import { useOrganizerData } from '../../../contexts/OrganizerDataContext'
import '../EventsPage.css'

export default function CompletedEventsView() {
  const { events, applicants, certificates, feedbackSummaries, generateCertificates, archiveEvent } = useOrganizerData()
  const [search, setSearch] = useState('')
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [archivingId, setArchivingId] = useState<string | null>(null)

  const completed = useMemo(() => events.filter((e) => e.status === 'completed'), [events])
  const filtered = completed.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()))

  const rows = filtered.map((event) => {
    const eventApplicants = applicants.filter((a) => a.eventId === event.id)
    const attended = eventApplicants.filter((a) => a.status === 'completed' || a.status === 'checked_in').length
    const attendanceRate = eventApplicants.length > 0 ? Math.round((attended / eventApplicants.length) * 100) : 0
    const certificatesCount = certificates.filter((c) => c.eventId === event.id).length
    return {
      event,
      participants: eventApplicants.length,
      attendanceRate,
      certificatesCount,
      feedback: feedbackSummaries[event.id],
    }
  })

  const totalCertificates = certificates.length
  const feedbackValues = Object.values(feedbackSummaries).filter((f) => f.average !== null) as { average: number; count: number }[]
  const avgFeedback = feedbackValues.length > 0
    ? (feedbackValues.reduce((sum, f) => sum + (f.average ?? 0), 0) / feedbackValues.length).toFixed(1)
    : null

  const handleGenerate = async (eventId: string) => {
    setGeneratingId(eventId)
    try {
      await generateCertificates(eventId)
    } finally {
      setGeneratingId(null)
    }
  }

  const handleArchive = async (eventId: string) => {
    setArchivingId(eventId)
    try {
      await archiveEvent(eventId)
    } finally {
      setArchivingId(null)
    }
  }

  return (
    <div className="events-hub" style={{ flexDirection: 'column' }}>
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon"><FiCheckCircle /></div>
          <div className="stat-card__value">{completed.length}</div>
          <div className="stat-card__label">Completed Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-soft)' }}><FiFileText /></div>
          <div className="stat-card__value">{totalCertificates}</div>
          <div className="stat-card__label">Certificates Generated</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: '#f59e0b', background: '#fffbeb' }}><FiStar /></div>
          <div className="stat-card__value">{avgFeedback ?? '-'}</div>
          <div className="stat-card__label">Average Rating</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon"><FiClock /></div>
          <div className="stat-card__value">{rows.reduce((sum, r) => sum + r.participants, 0)}</div>
          <div className="stat-card__label">Total Peserta</div>
        </div>
      </div>

      <section className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Finished Events History</h2>
          <div className="v-filter-input" style={{ width: '250px' }}>
            <FiSearch color="var(--color-text-muted)" />
            <input
              type="text"
              placeholder="Search past events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
            />
          </div>
        </div>

        {rows.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>Belum ada kegiatan yang selesai.</p>
        ) : (
          <div className="v-table-wrapper">
            <table className="v-table">
              <thead>
                <tr>
                  <th>Event Title</th>
                  <th>Selesai</th>
                  <th>Peserta (Hadir%)</th>
                  <th>Impact</th>
                  <th>Sertifikat</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ event, participants, attendanceRate, certificatesCount, feedback }) => (
                  <tr key={event.id}>
                    <td style={{ fontWeight: 600 }}>
                      <Link to={`/organizer/events/${event.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{event.title}</Link>
                    </td>
                    <td>{event.endDate}</td>
                    <td>
                      <strong>{participants}</strong> <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>({attendanceRate}%)</span>
                    </td>
                    <td>
                      {event.impactValue !== undefined
                        ? <span className="badge" style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>+{event.impactValue} {event.impactMetricUnit}</span>
                        : <span style={{ color: 'var(--color-text-muted)' }}>-</span>}
                    </td>
                    <td>
                      {certificatesCount > 0 ? (
                        <span className="badge badge--success"><FiCheckCircle /> {certificatesCount} Diterbitkan</span>
                      ) : (
                        <button
                          type="button"
                          className="btn btn--sm btn--outline"
                          disabled={generatingId === event.id}
                          onClick={() => handleGenerate(event.id)}
                        >
                          {generatingId === event.id ? 'Menerbitkan...' : 'Generate'}
                        </button>
                      )}
                    </td>
                    <td>
                      {feedback && feedback.average !== null ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FiStar style={{ color: '#f59e0b', fill: '#f59e0b' }} /> <strong>{feedback.average.toFixed(1)}</strong>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>({feedback.count})</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div className="v-table-actions">
                        <Link to={`/organizer/events/${event.id}`} className="btn btn--sm btn--outline"><FiFileText /> Detail</Link>
                        <button
                          type="button"
                          className="btn btn--sm btn--outline"
                          disabled={archivingId === event.id}
                          onClick={() => handleArchive(event.id)}
                        >
                          <FiArchive /> {archivingId === event.id ? 'Mengarsipkan...' : 'Arsipkan'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
