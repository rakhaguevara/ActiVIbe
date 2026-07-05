import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  FiSearch, FiTrendingUp, FiUsers, FiTarget, FiActivity, FiArrowUpRight, FiMoreVertical
} from 'react-icons/fi'
import '../EventsPage.css'

interface PublishedEvent {
  id: string
  title: string
  registrationProgress: number
  applicants: number
  accepted: number
  remainingQuota: number
  deadline: string
  popularity: 'High' | 'Normal' | 'Low'
}

const DUMMY_PUBLISHED: PublishedEvent[] = [
  {
    id: 'p1', title: 'Urban Reforestation 2026', registrationProgress: 85, applicants: 120, accepted: 85,
    remainingQuota: 15, deadline: 'Tomorrow', popularity: 'High'
  },
  {
    id: 'p2', title: 'Free Medical Checkup', registrationProgress: 100, applicants: 250, accepted: 50,
    remainingQuota: 0, deadline: 'Closed', popularity: 'High'
  },
  {
    id: 'p3', title: 'Local Library Revamp', registrationProgress: 30, applicants: 15, accepted: 10,
    remainingQuota: 40, deadline: 'In 5 days', popularity: 'Normal'
  }
]

export default function PublishedEventsView() {
  const [events] = useState<PublishedEvent[]>(DUMMY_PUBLISHED)

  return (
    <div className="events-hub" style={{ flexDirection: 'column' }}>
      {/* KPI Cards */}
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon"><FiTarget /></div>
          <div className="stat-card__value">12</div>
          <div className="stat-card__label">Published Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-soft)' }}><FiUsers /></div>
          <div className="stat-card__value">385</div>
          <div className="stat-card__label">Total Applicants</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-success)', background: '#f0fdf4' }}><FiTrendingUp /></div>
          <div className="stat-card__value">+42</div>
          <div className="stat-card__label">Applications Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-warning)', background: '#fffbeb' }}><FiActivity /></div>
          <div className="stat-card__value">85%</div>
          <div className="stat-card__label">Average Match Score</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <section className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Registration Performance</h2>
            <div className="v-filter-input" style={{ width: '250px' }}>
              <FiSearch color="var(--color-text-muted)" />
              <input type="text" placeholder="Search events..." style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }} />
            </div>
          </div>
          
          <div className="v-table-wrapper">
            <table className="v-table">
              <thead>
                <tr>
                  <th>Event Title</th>
                  <th>Registration Progress</th>
                  <th>Applicants (Acc/Tot)</th>
                  <th>Remaining Quota</th>
                  <th>Deadline</th>
                  <th>Popularity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev.id}>
                    <td style={{ fontWeight: 600 }}>
                      <Link to={`/organizer/events/${ev.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {ev.title}
                      </Link>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', background: 'var(--color-border-light)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${ev.registrationProgress}%`, height: '100%', background: ev.registrationProgress >= 100 ? 'var(--color-danger)' : 'var(--color-primary)' }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{ev.registrationProgress}%</span>
                      </div>
                    </td>
                    <td>
                      <strong>{ev.accepted}</strong> / {ev.applicants}
                    </td>
                    <td>
                      <span className={`badge ${ev.remainingQuota === 0 ? 'badge--danger' : 'badge--success'}`}>
                        {ev.remainingQuota === 0 ? 'Full' : `${ev.remainingQuota} spots left`}
                      </span>
                    </td>
                    <td style={{ color: ev.deadline === 'Closed' ? 'var(--color-danger)' : 'inherit' }}>{ev.deadline}</td>
                    <td>
                      {ev.popularity === 'High' ? (
                        <span style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600 }}>
                          <FiTrendingUp /> Trending
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Normal</span>
                      )}
                    </td>
                    <td>
                      <div className="v-table-actions">
                        <Link to={`/organizer/events/${ev.id}/applicants`} className="btn btn--sm btn--outline">Review</Link>
                        <button className="btn btn--sm btn--outline" style={{ padding: '0 8px' }}><FiMoreVertical/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Side Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card" style={{ padding: '20px', background: 'linear-gradient(145deg, #f0fdf4, #ffffff)', border: '1px solid #bbf7d0' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)' }}>
              ✨ AI Registration Insights
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <strong>Urban Reforestation 2026</strong> is filling faster than expected. 
                Registration will likely reach capacity in <strong>2 days</strong>.
              </div>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <strong>Local Library Revamp</strong> is underperforming. Recommend sending a <a href="#" style={{ color: 'var(--color-primary)' }}>broadcast message</a> to matching volunteers.
              </div>
            </div>
          </div>
          
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Top Traffic Sources</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>ActiVibe Search</span>
                <strong>45%</strong>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'var(--color-border-light)', borderRadius: '2px' }}><div style={{ width: '45%', height: '100%', background: 'var(--color-primary)' }}/></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '8px' }}>
                <span>Direct Link (Social)</span>
                <strong>30%</strong>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'var(--color-border-light)', borderRadius: '2px' }}><div style={{ width: '30%', height: '100%', background: '#3b82f6' }}/></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '8px' }}>
                <span>AI Recommendations</span>
                <strong>25%</strong>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'var(--color-border-light)', borderRadius: '2px' }}><div style={{ width: '25%', height: '100%', background: 'var(--color-success)' }}/></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
