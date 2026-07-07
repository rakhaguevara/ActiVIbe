import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiUpload, FiDownload, FiSearch, FiFilter,
  FiList, FiGrid, FiMapPin, FiCalendar, FiMoreVertical, FiClock, FiUsers
} from 'react-icons/fi'
import { useOrganizerData } from '../../../contexts/OrganizerDataContext'
import type { OrganizerEvent, OrganizerEventStatus } from '../../../types/organizer'
import '../EventsPage.css'

const STATUS_LABEL: Record<OrganizerEventStatus, string> = {
  draft: 'Draft',
  pending_approval: 'Menunggu Approval',
  published: 'Published',
  ongoing: 'Ongoing',
  completed: 'Completed',
  rejected: 'Ditolak',
  archived: 'Archived',
}

function getStatusBadge(status: OrganizerEventStatus) {
  switch (status) {
    case 'published': return <span className="badge badge--primary">{STATUS_LABEL[status]}</span>
    case 'draft': return <span className="badge badge--info" style={{ background: '#e5e7eb', color: '#374151' }}>{STATUS_LABEL[status]}</span>
    case 'pending_approval': return <span className="badge badge--warning">{STATUS_LABEL[status]}</span>
    case 'ongoing': return <span className="badge badge--warning">{STATUS_LABEL[status]}</span>
    case 'completed': return <span className="badge badge--success">{STATUS_LABEL[status]}</span>
    case 'archived': return <span className="badge" style={{ background: '#374151', color: '#fff' }}>{STATUS_LABEL[status]}</span>
    case 'rejected': return <span className="badge badge--danger">{STATUS_LABEL[status]}</span>
    default: return <span className="badge">{status}</span>
  }
}

export default function AllEventsView() {
  const { events, applicants } = useOrganizerData()
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const categories = useMemo(
    () => Array.from(new Set(events.map((e) => e.category).filter((c): c is string => !!c))),
    [events],
  )

  const filteredEvents = events.filter((e) => {
    if (statusFilter && e.status !== statusFilter) return false
    if (categoryFilter && e.category !== categoryFilter) return false
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const countsByStatus = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] ?? 0) + 1
    return acc
  }, {})

  const performanceFor = (event: OrganizerEvent) => {
    const eventApplicants = applicants.filter((a) => a.eventId === event.id)
    const accepted = eventApplicants.filter((a) => ['accepted', 'checked_in', 'completed'].includes(a.status)).length
    const attendance = eventApplicants.filter((a) => ['checked_in', 'completed'].includes(a.status)).length
    return { applicants: eventApplicants.length, accepted, attendance }
  }

  const impactFor = (event: OrganizerEvent) =>
    event.impactValue !== undefined ? `${event.impactValue} ${event.impactMetricUnit || ''}`.trim() : '-'

  const recentlyUpdated = useMemo(
    () => [...events].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 3),
    [events],
  )

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredEvents.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredEvents.map((e) => e.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  return (
    <div className="events-hub">

      {/* Quick Stats */}
      <div className="events-stats-grid">
        <div className="event-stat-card">
          <span className="event-stat-card__label">Total Events</span>
          <span className="event-stat-card__value">{events.length}</span>
        </div>
        <div className="event-stat-card">
          <span className="event-stat-card__label">Published</span>
          <span className="event-stat-card__value">{countsByStatus.published ?? 0}</span>
        </div>
        <div className="event-stat-card">
          <span className="event-stat-card__label">Draft</span>
          <span className="event-stat-card__value">{countsByStatus.draft ?? 0}</span>
        </div>
        <div className="event-stat-card">
          <span className="event-stat-card__label">Ongoing</span>
          <span className="event-stat-card__value">{countsByStatus.ongoing ?? 0}</span>
        </div>
        <div className="event-stat-card">
          <span className="event-stat-card__label">Completed</span>
          <span className="event-stat-card__value">{countsByStatus.completed ?? 0}</span>
        </div>
        <div className="event-stat-card">
          <span className="event-stat-card__label">Archived</span>
          <span className="event-stat-card__value">{countsByStatus.archived ?? 0}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-input" style={{ flex: 2 }}>
          <FiSearch color="var(--color-text-muted)" />
          <input type="text" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="filter-input">
          <FiFilter color="var(--color-text-muted)" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Status</option>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="filter-input">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">Category</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="btn btn--outline btn--sm"
          style={{ border: 'none' }}
          onClick={() => { setSearch(''); setStatusFilter(''); setCategoryFilter('') }}
        >
          Reset Filters
        </button>
      </div>

      <div className="events-toolbar">
        <div className="view-toggle">
          <button className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')} aria-label="Table View">
            <FiList />
          </button>
          <button className={viewMode === 'card' ? 'active' : ''} onClick={() => setViewMode('card')} aria-label="Card View">
            <FiGrid />
          </button>
        </div>

        {selectedIds.size > 0 && (
          <div className="bulk-actions-bar">
            <span>{selectedIds.size} Selected</span>
            <button className="btn btn--sm" style={{ background: 'transparent', color: 'var(--color-primary)', border: 'none' }} onClick={() => setSelectedIds(new Set())}>
              Batal <FiMoreVertical />
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>

        <div style={{ minWidth: 0 }}>
          {filteredEvents.length === 0 ? (
            <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Belum ada kegiatan yang cocok dengan filter ini.
            </div>
          ) : viewMode === 'table' ? (
            <div className="events-table-wrapper">
              <table className="events-table">
                <thead>
                  <tr>
                    <th className="checkbox-cell">
                      <input type="checkbox" checked={selectedIds.size === filteredEvents.length && filteredEvents.length > 0} onChange={toggleSelectAll} />
                    </th>
                    <th>Event Name</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Performance</th>
                    <th>Impact</th>
                    <th>Start Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => {
                    const perf = performanceFor(event)
                    return (
                      <tr key={event.id}>
                        <td className="checkbox-cell">
                          <input type="checkbox" checked={selectedIds.has(event.id)} onChange={() => toggleSelect(event.id)} />
                        </td>
                        <td>
                          <Link to={`/organizer/events/${event.id}`} className="events-table__name">{event.title}</Link>
                          <span className="events-table__subtext">{event.category ?? 'Umum'}</span>
                        </td>
                        <td>{getStatusBadge(event.status)}</td>
                        <td>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)' }}>
                            <FiMapPin /> {event.location}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                            <span title="Applicants"><FiUsers /> {perf.applicants}</span>
                            <span title="Accepted" style={{ color: 'var(--color-success)' }}>{perf.accepted}</span>
                            <span title="Attendance" style={{ color: 'var(--color-primary)' }}>{perf.attendance}</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{impactFor(event)}</td>
                        <td>{event.startDate}</td>
                        <td>
                          <Link to={`/organizer/events/${event.id}`} className="btn btn--sm" style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)' }}>
                            <FiMoreVertical />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="events-card-grid">
              {filteredEvents.map((event) => {
                const perf = performanceFor(event)
                return (
                  <div key={event.id} className="event-card">
                    <div className="event-card__banner">
                      <input type="checkbox" className="event-card__checkbox" checked={selectedIds.has(event.id)} onChange={() => toggleSelect(event.id)} />
                      <div className="event-card__badge">{getStatusBadge(event.status)}</div>
                    </div>
                    <div className="event-card__content">
                      <span className="event-card__category">{event.category ?? 'Umum'}</span>
                      <h3>{event.title}</h3>
                      <div className="event-card__meta">
                        <FiMapPin /> {event.location} &middot; <FiCalendar /> {event.startDate}
                      </div>

                      <div style={{ marginTop: '8px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', color: 'var(--color-text-muted)' }}>
                          <span>Capacity</span>
                          <span>{perf.applicants} Applied</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: 'var(--color-border-light)', borderRadius: '2px' }}>
                          <div style={{ width: Math.min(100, (perf.attendance / Math.max(perf.applicants, 1)) * 100) + '%', height: '100%', background: 'var(--color-primary)', borderRadius: '2px' }} />
                        </div>
                      </div>

                      <div className="event-card__stats">
                        <div className="event-card__stat">
                          <span className="event-card__stat-val">{perf.accepted}</span>
                          <span className="event-card__stat-label">Accepted</span>
                        </div>
                        <div className="event-card__stat">
                          <span className="event-card__stat-val">{perf.attendance}</span>
                          <span className="event-card__stat-label">Attended</span>
                        </div>
                        <div className="event-card__stat">
                          <span className="event-card__stat-val">{impactFor(event)}</span>
                          <span className="event-card__stat-label">Impact</span>
                        </div>
                      </div>
                    </div>
                    <div className="event-card__actions">
                      <Link to={`/organizer/events/${event.id}`} className="btn btn--outline btn--sm" style={{ flex: 1, textAlign: 'center' }}>Manage</Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recently Updated (data asli, diurutkan dari Event.updatedAt) */}
        <aside className="recent-updates">
          <h2>Recently Updated</h2>
          <div className="recent-updates-list">
            {recentlyUpdated.length === 0 && <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Belum ada kegiatan.</p>}
            {recentlyUpdated.map((event) => (
              <div key={event.id} className="recent-update-item">
                <div>
                  <strong style={{ display: 'block', color: 'var(--color-text-heading)' }}>{event.title}</strong>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}><FiClock /> {new Date(event.updatedAt).toLocaleString('id-ID')}</span>
                </div>
                {getStatusBadge(event.status)}
              </div>
            ))}
          </div>
        </aside>

      </div>
    </div>
  )
}
