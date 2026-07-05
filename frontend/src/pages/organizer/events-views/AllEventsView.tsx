import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  FiPlus, FiUpload, FiDownload, FiSearch, FiFilter, 
  FiList, FiGrid, FiMapPin, FiCalendar, FiMoreVertical, FiClock, FiUsers
} from 'react-icons/fi'
import '../EventsPage.css'

type EventStatus = 'Draft' | 'Published' | 'Ongoing' | 'Completed' | 'Archived' | 'Cancelled'

interface DummyEvent {
  id: string
  name: string
  category: string
  location: string
  status: EventStatus
  applicants: number
  accepted: number
  attendance: number
  impact: string
  startDate: string
  endDate: string
  lastUpdated: string
  bannerColor: string
}

const DUMMY_EVENTS: DummyEvent[] = [
  {
    id: '1',
    name: 'Beach Cleanup 2026',
    category: 'Environment',
    location: 'Pantai Kuta, Bali',
    status: 'Published',
    applicants: 125,
    accepted: 82,
    attendance: 76,
    impact: '520 Kg Trash',
    startDate: '2026-07-08',
    endDate: '2026-07-08',
    lastUpdated: '2 hours ago',
    bannerColor: 'linear-gradient(135deg, #3b82f6, #2563eb)'
  },
  {
    id: '2',
    name: 'Education Camp',
    category: 'Education',
    location: 'Desa Sukamaju, Bandung',
    status: 'Draft',
    applicants: 0,
    accepted: 0,
    attendance: 0,
    impact: '-',
    startDate: '2026-08-15',
    endDate: '2026-08-17',
    lastUpdated: '1 day ago',
    bannerColor: 'linear-gradient(135deg, #e5e7eb, #9ca3af)'
  },
  {
    id: '3',
    name: 'Blood Donation',
    category: 'Health',
    location: 'PMI Jakarta Pusat',
    status: 'Completed',
    applicants: 240,
    accepted: 210,
    attendance: 202,
    impact: '202 Bags',
    startDate: '2026-06-10',
    endDate: '2026-06-10',
    lastUpdated: '3 weeks ago',
    bannerColor: 'linear-gradient(135deg, #10b981, #059669)'
  },
  {
    id: '4',
    name: 'Mangrove Planting',
    category: 'Environment',
    location: 'Teluk Naga, Tangerang',
    status: 'Ongoing',
    applicants: 310,
    accepted: 280,
    attendance: 242,
    impact: '2300 Trees',
    startDate: '2026-07-01',
    endDate: '2026-07-30',
    lastUpdated: '12 mins ago',
    bannerColor: 'linear-gradient(135deg, #f59e0b, #d97706)'
  },
  {
    id: '5',
    name: 'Community Teaching',
    category: 'Education',
    location: 'Panti Asuhan Kasih',
    status: 'Completed',
    applicants: 95,
    accepted: 82,
    attendance: 79,
    impact: '480 Hours',
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    lastUpdated: '1 month ago',
    bannerColor: 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
  }
]

export default function AllEventsView() {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [events, setEvents] = useState<DummyEvent[]>(DUMMY_EVENTS)

  const toggleSelectAll = () => {
    if (selectedIds.size === events.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(events.map(e => e.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleBulkDelete = () => {
    setEvents(events.filter(e => !selectedIds.has(e.id)))
    setSelectedIds(new Set())
  }

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case 'Published': return <span className="badge badge--primary">Published</span>
      case 'Draft': return <span className="badge badge--info" style={{ background: '#e5e7eb', color: '#374151' }}>Draft</span>
      case 'Ongoing': return <span className="badge badge--warning">Ongoing</span>
      case 'Completed': return <span className="badge badge--success">Completed</span>
      case 'Archived': return <span className="badge" style={{ background: '#374151', color: '#fff' }}>Archived</span>
      case 'Cancelled': return <span className="badge badge--danger">Cancelled</span>
      default: return <span className="badge">{status}</span>
    }
  }

  return (
    <div className="events-hub">

      {/* 3. Quick Stats */}
      <div className="events-stats-grid">
        <div className="event-stat-card">
          <span className="event-stat-card__label">Total Events</span>
          <span className="event-stat-card__value">24</span>
        </div>
        <div className="event-stat-card">
          <span className="event-stat-card__label">Published</span>
          <span className="event-stat-card__value">8</span>
        </div>
        <div className="event-stat-card">
          <span className="event-stat-card__label">Draft</span>
          <span className="event-stat-card__value">4</span>
        </div>
        <div className="event-stat-card">
          <span className="event-stat-card__label">Ongoing</span>
          <span className="event-stat-card__value">6</span>
        </div>
        <div className="event-stat-card">
          <span className="event-stat-card__label">Completed</span>
          <span className="event-stat-card__value">5</span>
        </div>
        <div className="event-stat-card">
          <span className="event-stat-card__label">Archived</span>
          <span className="event-stat-card__value">1</span>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="filter-bar">
        <div className="filter-input" style={{ flex: 2 }}>
          <FiSearch color="var(--color-text-muted)" />
          <input type="text" placeholder="Search events..." />
        </div>
        <div className="filter-input">
          <FiFilter color="var(--color-text-muted)" />
          <select defaultValue="">
            <option value="" disabled>Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="ongoing">Ongoing</option>
          </select>
        </div>
        <div className="filter-input">
          <select defaultValue="">
            <option value="" disabled>Category</option>
            <option value="environment">Environment</option>
            <option value="education">Education</option>
            <option value="health">Health</option>
          </select>
        </div>
        <div className="filter-input">
          <select defaultValue="">
            <option value="" disabled>Date Range</option>
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
          </select>
        </div>
        <button type="button" className="btn btn--outline btn--sm" style={{ border: 'none' }}>Reset Filters</button>
      </div>

      <div className="events-toolbar">
        {/* View Toggle */}
        <div className="view-toggle">
          <button 
            className={viewMode === 'table' ? 'active' : ''} 
            onClick={() => setViewMode('table')}
            aria-label="Table View"
          >
            <FiList />
          </button>
          <button 
            className={viewMode === 'card' ? 'active' : ''} 
            onClick={() => setViewMode('card')}
            aria-label="Card View"
          >
            <FiGrid />
          </button>
        </div>

        {/* 7. Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="bulk-actions-bar">
            <span>{selectedIds.size} Selected</span>
            <button className="btn btn--sm" style={{ background: '#fff', color: '#111', border: 'none' }}>Bulk Publish</button>
            <button className="btn btn--sm" style={{ background: '#fff', color: '#111', border: 'none' }}>Archive</button>
            <button className="btn btn--sm" style={{ background: '#fee2e2', color: '#ef4444', border: 'none' }} onClick={handleBulkDelete}>Delete</button>
            <button className="btn btn--sm" style={{ background: 'transparent', color: 'var(--color-primary)', border: 'none' }}>More <FiMoreVertical/></button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        
        {/* Main Content Area */}
        <div style={{ minWidth: 0 }}>
          {viewMode === 'table' ? (
            /* 4. Event Table */
            <div className="events-table-wrapper">
              <table className="events-table">
                <thead>
                  <tr>
                    <th className="checkbox-cell">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.size === events.length && events.length > 0} 
                        onChange={toggleSelectAll} 
                      />
                    </th>
                    <th>Banner</th>
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
                  {events.map(event => (
                    <tr key={event.id}>
                      <td className="checkbox-cell">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.has(event.id)} 
                          onChange={() => toggleSelect(event.id)} 
                        />
                      </td>
                      <td>
                        <div className="events-table__banner" style={{ background: event.bannerColor }}></div>
                      </td>
                      <td>
                        <Link to={`/organizer/events/${event.id}`} className="events-table__name">{event.name}</Link>
                        <span className="events-table__subtext">{event.category}</span>
                      </td>
                      <td>{getStatusBadge(event.status)}</td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)' }}>
                          <FiMapPin /> {event.location}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                          <span title="Applicants"><FiUsers/> {event.applicants}</span>
                          <span title="Accepted" style={{ color: 'var(--color-success)' }}>{event.accepted}</span>
                          <span title="Attendance" style={{ color: 'var(--color-primary)' }}>{event.attendance}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{event.impact}</td>
                      <td>{event.startDate}</td>
                      <td>
                        <button className="btn btn--sm" style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)' }}>
                          <FiMoreVertical />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* 5. Event Card View */
            <div className="events-card-grid">
              {events.map(event => (
                <div key={event.id} className="event-card">
                  <div className="event-card__banner" style={{ background: event.bannerColor }}>
                    <input 
                      type="checkbox" 
                      className="event-card__checkbox"
                      checked={selectedIds.has(event.id)} 
                      onChange={() => toggleSelect(event.id)} 
                    />
                    <div className="event-card__badge">{getStatusBadge(event.status)}</div>
                  </div>
                  <div className="event-card__content">
                    <span className="event-card__category">{event.category}</span>
                    <h3>{event.name}</h3>
                    <div className="event-card__meta">
                      <FiMapPin /> {event.location} &middot; <FiCalendar /> {event.startDate}
                    </div>
                    
                    <div style={{ marginTop: '8px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', color: 'var(--color-text-muted)' }}>
                        <span>Capacity</span>
                        <span>{event.applicants} Applied</span>
                      </div>
                      <div style={{ width: '100%', height: '4px', background: 'var(--color-border-light)', borderRadius: '2px' }}>
                        <div style={{ width: Math.min(100, (event.attendance / Math.max(event.applicants, 1)) * 100) + '%', height: '100%', background: 'var(--color-primary)', borderRadius: '2px' }}></div>
                      </div>
                    </div>

                    <div className="event-card__stats">
                      <div className="event-card__stat">
                        <span className="event-card__stat-val">{event.accepted}</span>
                        <span className="event-card__stat-label">Accepted</span>
                      </div>
                      <div className="event-card__stat">
                        <span className="event-card__stat-val">{event.attendance}</span>
                        <span className="event-card__stat-label">Attended</span>
                      </div>
                      <div className="event-card__stat">
                        <span className="event-card__stat-val">{event.impact !== '-' ? event.impact : 'N/A'}</span>
                        <span className="event-card__stat-label">Impact</span>
                      </div>
                    </div>
                  </div>
                  <div className="event-card__actions">
                    <Link to={`/organizer/events/${event.id}`} className="btn btn--outline btn--sm" style={{ flex: 1, textAlign: 'center' }}>Manage</Link>
                    <button className="btn btn--outline btn--sm" style={{ width: '36px', padding: 0 }}><FiMoreVertical /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 9. Pagination */}
          <div className="pagination">
            <div>
              Rows per page: <strong>10</strong>
            </div>
            <div className="pagination__controls">
              <button className="pagination__btn">Prev</button>
              <button className="pagination__btn active">1</button>
              <button className="pagination__btn">2</button>
              <button className="pagination__btn">3</button>
              <button className="pagination__btn">Next</button>
            </div>
          </div>
        </div>

        {/* 8. Recently Updated (Side panel) */}
        <aside className="recent-updates">
          <h2>Recently Updated</h2>
          <div className="recent-updates-list">
            <div className="recent-update-item">
              <div>
                <strong style={{ display: 'block', color: 'var(--color-text-heading)' }}>Mangrove Planting</strong>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}><FiClock/> 12 mins ago by Admin</span>
              </div>
              {getStatusBadge('Ongoing')}
            </div>
            <div className="recent-update-item">
              <div>
                <strong style={{ display: 'block', color: 'var(--color-text-heading)' }}>Beach Cleanup 2026</strong>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}><FiClock/> 2 hours ago by Sarah</span>
              </div>
              {getStatusBadge('Published')}
            </div>
            <div className="recent-update-item">
              <div>
                <strong style={{ display: 'block', color: 'var(--color-text-heading)' }}>Education Camp</strong>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}><FiClock/> 1 day ago by Admin</span>
              </div>
              {getStatusBadge('Draft')}
            </div>
          </div>
        </aside>

      </div>
    </div>
  )
}
