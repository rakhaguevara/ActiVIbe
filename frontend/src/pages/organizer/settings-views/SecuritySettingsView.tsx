import React from 'react'
import { 
  FiShield, FiKey, FiSmartphone, FiMonitor, FiAlertTriangle, FiTrash2, FiUserX
} from 'react-icons/fi'
import '../SettingsPage.css'

export default function SecuritySettingsView() {
  return (
    <>
      {/* KPI Cards */}
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-success)', background: '#f0fdf4' }}><FiShield /></div>
          <div className="stat-card__value">92%</div>
          <div className="stat-card__label">Security Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-soft)' }}><FiKey /></div>
          <div className="stat-card__value">Enabled</div>
          <div className="stat-card__label">Two-Factor Auth</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon"><FiSmartphone /></div>
          <div className="stat-card__value">12 / 12</div>
          <div className="stat-card__label">Team Protected</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon"><FiMonitor /></div>
          <div className="stat-card__value">2 Min Ago</div>
          <div className="stat-card__label">Recent Login</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          <section className="card" style={{ padding: '32px' }}>
            <h2 className="settings-section-title"><FiKey /> Security Settings</h2>
            
            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <div className="settings-toggle-title">Change Password</div>
                <div className="settings-toggle-desc">Regularly updating your password helps keep your account secure.</div>
              </div>
              <button className="btn btn--sm btn--outline">Update Password</button>
            </div>
            
            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <div className="settings-toggle-title">Two-Factor Authentication (2FA)</div>
                <div className="settings-toggle-desc">Require a security code from your mobile device when logging in.</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="badge badge--success">Enabled</span>
                <button className="btn btn--sm btn--outline">Configure</button>
              </div>
            </div>
            
            <div className="settings-toggle-row" style={{ borderBottom: 'none' }}>
              <div className="settings-toggle-info">
                <div className="settings-toggle-title">Active Login Sessions</div>
                <div className="settings-toggle-desc">Review and revoke active sessions on your devices.</div>
              </div>
              <button className="btn btn--sm btn--outline">Manage Sessions</button>
            </div>
          </section>

          <section className="card" style={{ padding: '32px' }}>
            <h2 className="settings-section-title"><FiMonitor /> Login History</h2>
            <div className="v-table-wrapper">
              <table className="v-table">
                <thead>
                  <tr>
                    <th>Device</th>
                    <th>Location</th>
                    <th>IP Address</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                        <FiMonitor /> Windows • Chrome
                      </div>
                    </td>
                    <td>Yogyakarta, ID</td>
                    <td style={{ fontFamily: 'monospace' }}>192.168.1.42</td>
                    <td>2 mins ago</td>
                    <td><span className="badge badge--success">Current</span></td>
                  </tr>
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                        <FiSmartphone /> iOS • Safari
                      </div>
                    </td>
                    <td>Yogyakarta, ID</td>
                    <td style={{ fontFamily: 'monospace' }}>114.120.45.12</td>
                    <td>Yesterday, 14:30</td>
                    <td><span className="badge">Success</span></td>
                  </tr>
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                        <FiMonitor /> Unknown • Firefox
                      </div>
                    </td>
                    <td>Jakarta, ID</td>
                    <td style={{ fontFamily: 'monospace' }}>103.45.67.89</td>
                    <td>Jul 01, 2026</td>
                    <td><span className="badge badge--danger">Failed (2FA)</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Side Form - Danger Zone */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="danger-zone-card">
            <div className="danger-zone-header">
              <FiAlertTriangle /> Danger Zone
            </div>
            <div className="danger-zone-body">
              <div className="danger-action">
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>Transfer Ownership</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Transfer this organization to another owner.</div>
                </div>
                <button className="btn btn--sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>Transfer</button>
              </div>
              <div className="danger-action">
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>Deactivate Organization</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Temporarily suspend all events.</div>
                </div>
                <button className="btn btn--sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>Deactivate</button>
              </div>
              <div className="danger-action" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#b91c1c' }}>Delete Organization</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Permanently remove this organization and all of its data. This action cannot be undone.</div>
                </div>
                <button className="btn btn--sm" style={{ background: '#b91c1c', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  <FiTrash2 /> Delete Organization
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
