import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiSearch, FiTrendingUp, FiUsers, FiTarget, FiActivity, FiMoreVertical,
} from 'react-icons/fi'
import { useOrganizerData } from '../../../contexts/OrganizerDataContext'
import '../EventsPage.css'

const SOURCE_LABEL: Record<string, string> = {
  recommendation: 'Rekomendasi AI',
  search: 'Pencarian',
  direct: 'Link Langsung',
}

export default function PublishedEventsView() {
  const { events, applicants, trafficSummary } = useOrganizerData()
  const [search, setSearch] = useState('')

  const published = useMemo(() => events.filter((e) => e.status === 'published'), [events])
  const filtered = published.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()))

  const rows = filtered.map((event) => {
    const eventApplicants = applicants.filter((a) => a.eventId === event.id)
    const accepted = eventApplicants.filter((a) => ['accepted', 'checked_in', 'completed'].includes(a.status)).length
    const remainingQuota = Math.max(event.quota - accepted, 0)
    const registrationProgress = event.quota > 0 ? Math.min(100, Math.round((accepted / event.quota) * 100)) : 0
    const trending = event.quota > 0 && accepted / event.quota >= 0.7
    return { event, applicants: eventApplicants.length, accepted, remainingQuota, registrationProgress, trending }
  })

  const totalApplicants = rows.reduce((sum, r) => sum + r.applicants, 0)
  const avgProgress = rows.length > 0 ? Math.round(rows.reduce((sum, r) => sum + r.registrationProgress, 0) / rows.length) : 0

  const trafficEntries = trafficSummary
    ? Object.entries(trafficSummary.bySource).sort((a, b) => b[1] - a[1])
    : []

  return (
    <div className="events-hub" style={{ flexDirection: 'column' }}>
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon"><FiTarget /></div>
          <div className="stat-card__value">{published.length}</div>
          <div className="stat-card__label">Published Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-soft)' }}><FiUsers /></div>
          <div className="stat-card__value">{totalApplicants}</div>
          <div className="stat-card__label">Total Applicants</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-warning)', background: '#fffbeb' }}><FiActivity /></div>
          <div className="stat-card__value">{avgProgress}%</div>
          <div className="stat-card__label">Rata-rata Progress Registrasi</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-xl)', alignItems: 'start' }}>
        <section className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Registration Performance</h2>
            <div className="v-filter-input" style={{ width: '250px' }}>
              <FiSearch color="var(--color-text-muted)" />
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
              />
            </div>
          </div>

          {rows.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>Belum ada kegiatan yang published.</p>
          ) : (
            <div className="v-table-wrapper">
              <table className="v-table">
                <thead>
                  <tr>
                    <th>Event Title</th>
                    <th>Registration Progress</th>
                    <th>Applicants (Acc/Tot)</th>
                    <th>Remaining Quota</th>
                    <th>Mulai</th>
                    <th>Popularitas</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ event, applicants: applicantCount, accepted, remainingQuota, registrationProgress, trending }) => (
                    <tr key={event.id}>
                      <td style={{ fontWeight: 600 }}>
                        <Link to={`/organizer/events/${event.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{event.title}</Link>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '6px', background: 'var(--color-border-light)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${registrationProgress}%`, height: '100%', background: registrationProgress >= 100 ? 'var(--color-danger)' : 'var(--color-primary)' }} />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 600 }}>{registrationProgress}%</span>
                        </div>
                      </td>
                      <td><strong>{accepted}</strong> / {applicantCount}</td>
                      <td>
                        <span className={`badge ${remainingQuota === 0 ? 'badge--danger' : 'badge--success'}`}>
                          {remainingQuota === 0 ? 'Penuh' : `${remainingQuota} sisa`}
                        </span>
                      </td>
                      <td>{event.startDate}</td>
                      <td>
                        {trending ? (
                          <span style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600 }}>
                            <FiTrendingUp /> Trending
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Normal</span>
                        )}
                      </td>
                      <td>
                        <div className="v-table-actions">
                          <Link to={`/organizer/events/${event.id}/applicants`} className="btn btn--sm btn--outline" style={{ textDecoration: 'none', borderRadius: '4px' }}>Review</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Traffic Sources</h3>
            {!trafficSummary || trafficSummary.total === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Belum ada data kunjungan.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {trafficEntries.map(([source, count]) => {
                  const pct = Math.round((count / trafficSummary.total) * 100)
                  return (
                    <div key={source}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                        <span>{SOURCE_LABEL[source] ?? source}</span>
                        <strong>{pct}%</strong>
                      </div>
                      <div style={{ width: '100%', height: '4px', background: 'var(--color-border-light)', borderRadius: '2px' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-primary)' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
