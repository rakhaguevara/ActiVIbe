import React from 'react'
import { 
  FiBell, FiSend, FiClock, FiCheckCircle
} from 'react-icons/fi'
import '../SettingsPage.css'

export default function NotificationSettingsView() {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          <section className="card" style={{ padding: '32px' }}>
            <h2 className="settings-section-title"><FiBell /> Notification Categories</h2>
            
            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <div className="settings-toggle-title">Event Updates</div>
                <div className="settings-toggle-desc">Receive alerts when events are approved, rejected, or modified.</div>
              </div>
              <div style={{ width: '40px', height: '24px', background: 'var(--color-primary)', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', right: '3px' }}></div>
              </div>
            </div>
            
            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <div className="settings-toggle-title">Volunteer Applications</div>
                <div className="settings-toggle-desc">Notify when a new volunteer applies to your events.</div>
              </div>
              <div style={{ width: '40px', height: '24px', background: 'var(--color-primary)', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', right: '3px' }}></div>
              </div>
            </div>
            
            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <div className="settings-toggle-title">Attendance & Certificates</div>
                <div className="settings-toggle-desc">Alerts regarding attendance logging and certificate generation jobs.</div>
              </div>
              <div style={{ width: '40px', height: '24px', background: 'var(--color-primary)', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', right: '3px' }}></div>
              </div>
            </div>
            
            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <div className="settings-toggle-title">Security Alerts</div>
                <div className="settings-toggle-desc">Important notifications about login attempts and password changes.</div>
              </div>
              <div style={{ width: '40px', height: '24px', background: 'var(--color-primary)', borderRadius: '12px', position: 'relative', opacity: 0.5 }}>
                <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', right: '3px' }}></div>
              </div>
            </div>
            
            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <div className="settings-toggle-title">Marketing & News</div>
                <div className="settings-toggle-desc">Updates about new ActiVibe features and NGO partner programs.</div>
              </div>
              <div style={{ width: '40px', height: '24px', background: '#e2e8f0', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: '3px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}></div>
              </div>
            </div>
          </section>

          <section className="card" style={{ padding: '32px' }}>
            <h2 className="settings-section-title"><FiSend /> Delivery Methods</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Email Notifications</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Push Notifications</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Browser Notifications</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.5 }}>
                <input type="checkbox" disabled style={{ width: '18px', height: '18px' }} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>SMS Alerts (Coming Soon)</span>
              </label>
            </div>
            
            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn--primary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiCheckCircle /> Save Preferences
              </button>
            </div>
          </section>
        </div>

        {/* Side Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <section className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiClock /> Notification Schedule
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                <input type="radio" name="schedule" defaultChecked style={{ marginTop: '4px', accentColor: 'var(--color-primary)' }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>Instant</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Send immediately as events occur.</div>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                <input type="radio" name="schedule" style={{ marginTop: '4px', accentColor: 'var(--color-primary)' }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>Daily Summary</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Roll up notifications into one daily email at 18:00.</div>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                <input type="radio" name="schedule" style={{ marginTop: '4px', accentColor: 'var(--color-primary)' }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>Weekly Summary</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Roll up notifications into one weekly email on Friday.</div>
                </div>
              </label>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
