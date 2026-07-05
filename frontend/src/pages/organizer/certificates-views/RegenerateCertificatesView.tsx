import React from 'react'
import { 
  FiRefreshCcw, FiFileText, FiClock, FiCheckCircle, FiArrowRight, FiEye, FiMoreVertical
} from 'react-icons/fi'
import '../CertificatesPage.css'

export default function RegenerateCertificatesView() {
  return (
    <>
      {/* KPI Cards */}
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon"><FiRefreshCcw /></div>
          <div className="stat-card__value">12</div>
          <div className="stat-card__label">Eligible for Regeneration</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-warning)', background: '#fffbeb' }}><FiClock /></div>
          <div className="stat-card__value">4</div>
          <div className="stat-card__label">Queued</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-success)', background: '#f0fdf4' }}><FiCheckCircle /></div>
          <div className="stat-card__value">8</div>
          <div className="stat-card__label">Completed Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-soft)' }}><FiClock /></div>
          <div className="stat-card__value">10s</div>
          <div className="stat-card__label">Average Time</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          <section className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Re-generation Queue & History</h2>
            
            <div className="v-table-wrapper">
              <table className="v-table">
                <thead>
                  <tr>
                    <th>Volunteer</th>
                    <th>Reason</th>
                    <th>Version Update</th>
                    <th>Requested By</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)' }}>AF</div>
                        <span style={{ fontWeight: 600 }}>Ahmad Fauzan</span>
                      </div>
                    </td>
                    <td>Volunteer Hours Updated</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>v1</span>
                        <FiArrowRight size={12} color="var(--color-text-muted)" />
                        <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>v2</span>
                      </div>
                    </td>
                    <td>System</td>
                    <td><span className="badge badge--warning">Queued</span></td>
                    <td><button className="btn btn--sm btn--primary">Process</button></td>
                  </tr>
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#8b5cf6' }}>SW</div>
                        <span style={{ fontWeight: 600 }}>Sarah Wijaya</span>
                      </div>
                    </td>
                    <td>Certificate Template Updated</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>v2</span>
                        <FiArrowRight size={12} color="var(--color-text-muted)" />
                        <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>v3</span>
                      </div>
                    </td>
                    <td>Emma</td>
                    <td><span className="badge badge--success">Completed</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn--sm btn--outline" style={{ padding: '0 8px' }} title="Preview Comparison"><FiEye /></button>
                        <button className="btn btn--sm btn--outline" style={{ padding: '0 8px' }}><FiMoreVertical /></button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Preview Comparison (Sarah Wijaya)</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ border: '1px solid var(--color-danger)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: '#fef2f2', padding: '8px 12px', fontSize: '12px', fontWeight: 600, color: 'var(--color-danger)', borderBottom: '1px solid #fecaca' }}>Previous (v2)</div>
                <div style={{ height: '150px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
                  <FiFileText size={32} color="var(--color-text-muted)" opacity={0.5} />
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Old Signature</span>
                </div>
              </div>
              <div style={{ border: '1px solid var(--color-success)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: '#f0fdf4', padding: '8px 12px', fontSize: '12px', fontWeight: 600, color: 'var(--color-success)', borderBottom: '1px solid #bbf7d0' }}>New (v3)</div>
                <div style={{ height: '150px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
                  <FiFileText size={32} color="var(--color-primary)" />
                  <span style={{ fontSize: '11px', color: 'var(--color-primary)' }}>Updated Signature</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Side Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Version History (Sarah Wijaya)</h3>
            <div className="version-timeline">
              <div className="version-item version-item--current">
                <div className="version-item__title">Version 3 (Current)</div>
                <div className="version-item__meta">Generated: Today, 11:30 AM</div>
                <div style={{ fontSize: '13px', marginTop: '4px', background: '#f0fdf4', color: 'var(--color-success)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>Updated Signature</div>
              </div>
              
              <div className="version-item">
                <div className="version-item__title">Version 2</div>
                <div className="version-item__meta">Generated: Yesterday, 14:20 PM</div>
                <div style={{ fontSize: '13px', marginTop: '4px', background: '#eff6ff', color: 'var(--color-primary)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>Updated Volunteer Hours</div>
              </div>
              
              <div className="version-item">
                <div className="version-item__title">Version 1</div>
                <div className="version-item__meta">Generated: Monday, 09:00 AM</div>
                <div style={{ fontSize: '13px', marginTop: '4px', color: 'var(--color-text-muted)' }}>Initial Generation</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
