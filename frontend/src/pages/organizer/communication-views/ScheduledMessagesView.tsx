import React from 'react'
import { 
  FiClock, FiCalendar, FiAlertCircle, FiMoreVertical, FiEdit2, FiCopy, FiXSquare
} from 'react-icons/fi'
import '../CommunicationPage.css'

export default function ScheduledMessagesView() {
  return (
    <>
      {/* KPI Cards */}
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon"><FiClock /></div>
          <div className="stat-card__value">24</div>
          <div className="stat-card__label">Scheduled Messages</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-soft)' }}><FiCalendar /></div>
          <div className="stat-card__value">8</div>
          <div className="stat-card__label">Sending Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-success)', background: '#f0fdf4' }}><FiCalendar /></div>
          <div className="stat-card__value">16</div>
          <div className="stat-card__label">This Week</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-danger)', background: '#fef2f2' }}><FiAlertCircle /></div>
          <div className="stat-card__value">1</div>
          <div className="stat-card__label">Failed Schedule</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <section className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Upcoming Messages Queue</h2>
          
          <div className="v-table-wrapper">
            <table className="v-table">
              <thead>
                <tr>
                  <th>Message Title</th>
                  <th>Target Event</th>
                  <th>Scheduled Time</th>
                  <th>Countdown</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>Reminder</td>
                  <td>Beach Cleanup</td>
                  <td>Tomorrow 08:00</td>
                  <td><span style={{ fontFamily: 'monospace', color: 'var(--color-primary)', fontWeight: 600 }}>14:22:05</span></td>
                  <td><span className="badge badge--warning">Scheduled</span></td>
                  <td>Emma</td>
                  <td>
                    <div className="v-table-actions">
                      <button className="btn btn--sm btn--outline" title="Edit"><FiEdit2/></button>
                      <button className="btn btn--sm btn--outline" title="Duplicate"><FiCopy/></button>
                      <button className="btn btn--sm btn--outline" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} title="Cancel"><FiXSquare/></button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Volunteer Briefing</td>
                  <td>Education Camp</td>
                  <td>Friday 09:00</td>
                  <td><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>3d 15h</span></td>
                  <td><span className="badge badge--warning">Scheduled</span></td>
                  <td>Noah</td>
                  <td>
                    <div className="v-table-actions">
                      <button className="btn btn--sm btn--outline" title="Edit"><FiEdit2/></button>
                      <button className="btn btn--sm btn--outline" title="Duplicate"><FiCopy/></button>
                      <button className="btn btn--sm btn--outline" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} title="Cancel"><FiXSquare/></button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Thank You</td>
                  <td>Blood Donation</td>
                  <td>Next Monday 17:00</td>
                  <td><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>6d 2h</span></td>
                  <td><span className="badge" style={{ background: '#f1f5f9' }}>Waiting</span></td>
                  <td>Sophia</td>
                  <td>
                    <div className="v-table-actions">
                      <button className="btn btn--sm btn--outline" title="Edit"><FiEdit2/></button>
                      <button className="btn btn--sm btn--outline" title="Duplicate"><FiCopy/></button>
                      <button className="btn btn--sm btn--outline" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} title="Cancel"><FiXSquare/></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Side Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiCalendar /> Calendar Timeline
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              <div className="timeline-event">
                <div className="timeline-event__icon"><FiClock size={12} /></div>
                <div className="timeline-event__content">
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Reminder</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Beach Cleanup</div>
                  <span className="badge badge--warning" style={{ fontSize: '10px', padding: '2px 6px' }}>Tomorrow 08:00</span>
                </div>
              </div>
              <div className="timeline-event">
                <div className="timeline-event__icon" style={{ background: '#f1f5f9', color: 'var(--color-text-muted)' }}><FiClock size={12} /></div>
                <div className="timeline-event__content">
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Volunteer Briefing</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Education Camp</div>
                  <span className="badge" style={{ background: '#f1f5f9', fontSize: '10px', padding: '2px 6px' }}>Friday 09:00</span>
                </div>
              </div>
              <div className="timeline-event">
                <div className="timeline-event__icon" style={{ background: '#f1f5f9', color: 'var(--color-text-muted)' }}><FiClock size={12} /></div>
                <div className="timeline-event__content">
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Thank You</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Blood Donation</div>
                  <span className="badge" style={{ background: '#f1f5f9', fontSize: '10px', padding: '2px 6px' }}>Next Monday 17:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
