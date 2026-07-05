import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  FiSearch, FiAward, FiFileText, FiClock, FiStar, FiMoreVertical, FiCheckCircle
} from 'react-icons/fi'
import '../EventsPage.css'

interface CompletedEvent {
  id: string
  title: string
  completionDate: string
  participants: number
  attendanceRate: number
  impactScore: number
  certificatesStatus: 'Generated' | 'Pending'
  feedbackScore: number
}

const DUMMY_COMPLETED: CompletedEvent[] = [
  {
    id: 'c1', title: 'Blood Donation Drive', completionDate: '2026-06-10', participants: 45, 
    attendanceRate: 90, impactScore: 850, certificatesStatus: 'Generated', feedbackScore: 4.8
  },
  {
    id: 'c2', title: 'Disaster Relief Fund', completionDate: '2026-05-22', participants: 120, 
    attendanceRate: 98, impactScore: 2400, certificatesStatus: 'Generated', feedbackScore: 4.9
  },
  {
    id: 'c3', title: 'Orphanage Visit & Teaching', completionDate: '2026-04-10', participants: 15, 
    attendanceRate: 100, impactScore: 300, certificatesStatus: 'Pending', feedbackScore: 4.5
  }
]

export default function CompletedEventsView() {
  const [events] = useState<CompletedEvent[]>(DUMMY_COMPLETED)

  return (
    <div className="events-hub" style={{ flexDirection: 'column' }}>
      {/* KPI Cards */}
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon"><FiCheckCircle /></div>
          <div className="stat-card__value">42</div>
          <div className="stat-card__label">Completed Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-soft)' }}><FiFileText /></div>
          <div className="stat-card__value">1,450</div>
          <div className="stat-card__label">Certificates Generated</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-success)', background: '#f0fdf4' }}><FiAward /></div>
          <div className="stat-card__value">100%</div>
          <div className="stat-card__label">Impact Submitted</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: '#f59e0b', background: '#fffbeb' }}><FiStar /></div>
          <div className="stat-card__value">4.8/5</div>
          <div className="stat-card__label">Average Rating</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon"><FiClock /></div>
          <div className="stat-card__value">8,450</div>
          <div className="stat-card__label">Volunteer Hours</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <section className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Finished Events History</h2>
            <div className="v-filter-input" style={{ width: '250px' }}>
              <FiSearch color="var(--color-text-muted)" />
              <input type="text" placeholder="Search past events..." style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }} />
            </div>
          </div>
          
          <div className="v-table-wrapper">
            <table className="v-table">
              <thead>
                <tr>
                  <th>Event Title</th>
                  <th>Completion Date</th>
                  <th>Participants (Att%)</th>
                  <th>Impact Score</th>
                  <th>Certificates</th>
                  <th>Avg Feedback</th>
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
                    <td>{ev.completionDate}</td>
                    <td>
                      <strong>{ev.participants}</strong> <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>({ev.attendanceRate}%)</span>
                    </td>
                    <td><span className="badge" style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>+{ev.impactScore}</span></td>
                    <td>
                      {ev.certificatesStatus === 'Generated' ? (
                        <span className="badge badge--success"><FiCheckCircle /> Ready</span>
                      ) : (
                        <span className="badge badge--warning">Pending</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiStar style={{ color: '#f59e0b', fill: '#f59e0b' }} /> <strong>{ev.feedbackScore}</strong>
                      </div>
                    </td>
                    <td>
                      <div className="v-table-actions">
                        <button className="btn btn--sm btn--outline"><FiFileText /> Report</button>
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
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Top Performing Events</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>Disaster Relief Fund</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}><FiStar style={{ fill: '#f59e0b' }} /> 4.9</div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>2,400 Impact Score • 120 Vols</div>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)' }} />
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>Blood Donation Drive</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}><FiStar style={{ fill: '#f59e0b' }} /> 4.8</div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>850 Impact Score • 45 Vols</div>
              </div>
            </div>
          </div>
          
          <div className="card" style={{ padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiFileText /> Final Reports
            </h3>
            <p style={{ fontSize: '13px', margin: '0 0 12px 0' }}>Generate comprehensive post-event reports for your stakeholders and sponsors.</p>
            <Link to="/organizer/reports?tab=event" className="btn btn--sm btn--primary" style={{ width: '100%', textDecoration: 'none' }}>Go to Reports Hub</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
