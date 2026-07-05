import React from 'react'
import { 
  FiAlertTriangle, FiAlertCircle, FiXCircle, FiCpu, FiRefreshCw, FiExternalLink
} from 'react-icons/fi'
import '../CertificatesPage.css'

export default function FailedCertificatesView() {
  return (
    <>
      {/* KPI Cards */}
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-danger)', background: '#fef2f2' }}><FiXCircle /></div>
          <div className="stat-card__value">3</div>
          <div className="stat-card__label">Failed Jobs</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-warning)', background: '#fffbeb' }}><FiAlertTriangle /></div>
          <div className="stat-card__value">2</div>
          <div className="stat-card__label">Validation Errors</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-warning)', background: '#fffbeb' }}><FiAlertCircle /></div>
          <div className="stat-card__value">1</div>
          <div className="stat-card__label">Template Errors</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-success)', background: '#f0fdf4' }}><FiCpu /></div>
          <div className="stat-card__value">0</div>
          <div className="stat-card__label">System Errors</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          <section className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Failure Diagnostic Log</h2>
            
            <div className="v-table-wrapper">
              <table className="v-table">
                <thead>
                  <tr>
                    <th>Volunteer</th>
                    <th>Event</th>
                    <th>Failure Reason</th>
                    <th>Detected Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#c2410c' }}>MT</div>
                        <span style={{ fontWeight: 600 }}>Michael Tan</span>
                      </div>
                    </td>
                    <td>Beach Cleanup</td>
                    <td style={{ color: 'var(--color-danger)' }}>Missing Volunteer Hours</td>
                    <td>Today, 10:35</td>
                    <td><span className="badge badge--danger">Failed</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn--sm btn--primary"><FiRefreshCw style={{ marginRight: '6px' }} /> Retry</button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#be185d' }}>LA</div>
                        <span style={{ fontWeight: 600 }}>Lisa Amelia</span>
                      </div>
                    </td>
                    <td>Education Camp</td>
                    <td style={{ color: 'var(--color-danger)' }}>Certificate Template Missing</td>
                    <td>Yesterday, 14:20</td>
                    <td><span className="badge badge--danger">Failed</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn--sm btn--primary"><FiRefreshCw style={{ marginRight: '6px' }} /> Retry</button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#0369a1' }}>DP</div>
                        <span style={{ fontWeight: 600 }}>Daniel Pratama</span>
                      </div>
                    </td>
                    <td>Blood Donation</td>
                    <td style={{ color: 'var(--color-danger)' }}>Incomplete Attendance</td>
                    <td>Mon, 09:15</td>
                    <td><span className="badge badge--warning">Blocked</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn--sm btn--outline"><FiExternalLink style={{ marginRight: '6px' }} /> Resolve</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Side Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card" style={{ padding: '24px', background: 'linear-gradient(145deg, #fef2f2, #ffffff)', border: '1px solid #fecaca' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c' }}>
              🤖 Error Diagnostics
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                <strong>Action Required:</strong> Volunteer hours for Michael Tan must be filled in before generation can proceed.
              </div>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                <strong>Action Required:</strong> Attendance for Blood Donation has not been finalized by the coordinator.
              </div>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                <strong style={{ color: 'var(--color-warning)' }}>Notice:</strong> Template version mismatch detected for Education Camp. Please verify template mapping.
              </div>
            </div>
          </div>
          
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Error Categories</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '8px', borderBottom: '1px solid var(--color-border-light)' }}>
                <span>Missing Attendance</span>
                <strong>1</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '8px', borderBottom: '1px solid var(--color-border-light)' }}>
                <span>Missing Impact Data</span>
                <strong>1</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '8px', borderBottom: '1px solid var(--color-border-light)' }}>
                <span>Missing Template</span>
                <strong>1</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>System Timeout</span>
                <strong>0</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
