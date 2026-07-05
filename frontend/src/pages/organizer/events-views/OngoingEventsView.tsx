import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  FiSearch, FiActivity, FiUsers, FiClock, FiAlertTriangle, FiMapPin, FiPlayCircle, FiMessageSquare
} from 'react-icons/fi'
import '../EventsPage.css'

export default function OngoingEventsView() {
  return (
    <div className="events-hub" style={{ flexDirection: 'column' }}>
      {/* KPI Cards */}
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-success)', background: '#f0fdf4' }}><FiPlayCircle /></div>
          <div className="stat-card__value">2</div>
          <div className="stat-card__label">Ongoing Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon"><FiUsers /></div>
          <div className="stat-card__value">245</div>
          <div className="stat-card__label">Checked-in Volunteers</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon"><FiActivity /></div>
          <div className="stat-card__value">93%</div>
          <div className="stat-card__label">Attendance Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon"><FiClock /></div>
          <div className="stat-card__value">12</div>
          <div className="stat-card__label">Late Volunteers</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-warning)', background: '#fffbeb' }}><FiAlertTriangle /></div>
          <div className="stat-card__value">3</div>
          <div className="stat-card__label">Open Issues</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          {/* Live Event Card 1 */}
          <div className="card" style={{ padding: '24px', borderLeft: '4px solid var(--color-success)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className="badge badge--success" style={{ padding: '4px 8px' }}><FiPlayCircle /> LIVE NOW</span>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Started 3 hours ago</span>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 8px 0' }}>Mangrove Planting & Coastal Cleanup</h2>
                <div style={{ display: 'flex', gap: '16px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiMapPin /> Teluk Naga, Tangerang</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiUsers /> Coordinator: Michael Tan</span>
                </div>
              </div>
              <Link to="/organizer/events/e1" className="btn btn--outline">Manage Operation</Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Attendance Progress</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, height: '8px', background: 'var(--color-border-light)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '95%', height: '100%', background: 'var(--color-success)' }} />
                  </div>
                  <strong style={{ fontSize: '14px' }}>190/200</strong>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Current Phase</div>
                <strong style={{ fontSize: '14px' }}>Tree Planting (Zone B)</strong>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Open Issues</div>
                <strong style={{ fontSize: '14px', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '4px' }}><FiAlertTriangle /> 2 Logistics issues</strong>
              </div>
            </div>
          </div>

          {/* Live Event Card 2 */}
          <div className="card" style={{ padding: '24px', borderLeft: '4px solid var(--color-success)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className="badge badge--success" style={{ padding: '4px 8px' }}><FiPlayCircle /> LIVE NOW</span>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Started 1 hour ago</span>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 8px 0' }}>Weekend Free Medical Clinic</h2>
                <div style={{ display: 'flex', gap: '16px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiMapPin /> Balai Desa Sukamaju</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiUsers /> Coordinator: Dr. Haryo</span>
                </div>
              </div>
              <Link to="/organizer/events/e2" className="btn btn--outline">Manage Operation</Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Attendance Progress</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, height: '8px', background: 'var(--color-border-light)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '85%', height: '100%', background: 'var(--color-primary)' }} />
                  </div>
                  <strong style={{ fontSize: '14px' }}>42/50</strong>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Current Phase</div>
                <strong style={{ fontSize: '14px' }}>Patient Registration</strong>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Open Issues</div>
                <strong style={{ fontSize: '14px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><FiCheckCircle /> All clear</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Side Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Volunteer Check-ins</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative', paddingLeft: '16px', borderLeft: '2px solid var(--color-success)' }}>
                <div style={{ fontSize: '13px' }}><strong>Ahmad Fauzan</strong> (Teaching)</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Just now • Free Medical Clinic</div>
              </div>
              <div style={{ position: 'relative', paddingLeft: '16px', borderLeft: '2px solid var(--color-success)' }}>
                <div style={{ fontSize: '13px' }}><strong>Sarah Wijaya</strong> (Photography)</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>5 mins ago • Mangrove Planting</div>
              </div>
              <div style={{ position: 'relative', paddingLeft: '16px', borderLeft: '2px solid var(--color-warning)' }}>
                <div style={{ fontSize: '13px' }}><strong>Reza Pahlevi</strong> <span className="badge badge--warning" style={{ fontSize: '10px' }}>Late</span></div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>15 mins ago • Mangrove Planting</div>
              </div>
              <Link to="/organizer/volunteers?status=active" style={{ fontSize: '13px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500, marginTop: '8px' }}>View all active volunteers →</Link>
            </div>
          </div>
          
          <div className="card" style={{ padding: '20px', background: '#fef2f2', border: '1px solid #fecaca' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-danger)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiMessageSquare /> Live Announcements
            </h3>
            <p style={{ fontSize: '13px', margin: '0 0 12px 0' }}>Need to broadcast an urgent message to volunteers currently on duty?</p>
            <button className="btn btn--sm" style={{ background: '#dc2626', color: '#fff', width: '100%', border: 'none' }}>Broadcast Message</button>
          </div>
        </div>
      </div>
    </div>
  )
}
// Adding missing FiCheckCircle since it was used in code but not imported
import { FiCheckCircle } from 'react-icons/fi'
