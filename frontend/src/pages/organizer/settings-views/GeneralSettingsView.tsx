import React from 'react'
import { 
  FiGlobe, FiClock, FiMap, FiCheckCircle
} from 'react-icons/fi'
import '../SettingsPage.css'

export default function GeneralSettingsView() {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          <section className="card" style={{ padding: '32px' }}>
            <h2 className="settings-section-title"><FiGlobe /> Organization Preferences</h2>
            
            <div className="settings-form-row">
              <div className="settings-group">
                <label>Language</label>
                <select className="settings-select" defaultValue="en">
                  <option value="en">English (US)</option>
                  <option value="id">Bahasa Indonesia</option>
                  <option value="ms">Bahasa Melayu</option>
                </select>
              </div>
              <div className="settings-group">
                <label>Default Country</label>
                <select className="settings-select" defaultValue="ID">
                  <option value="ID">Indonesia</option>
                  <option value="MY">Malaysia</option>
                  <option value="SG">Singapore</option>
                </select>
              </div>
            </div>

            <div className="settings-form-row">
              <div className="settings-group">
                <label>Timezone</label>
                <select className="settings-select" defaultValue="asia-jakarta">
                  <option value="asia-jakarta">Asia/Jakarta (GMT+7)</option>
                  <option value="asia-makassar">Asia/Makassar (GMT+8)</option>
                  <option value="asia-jayapura">Asia/Jayapura (GMT+9)</option>
                </select>
              </div>
              <div className="settings-group">
                <label>Currency</label>
                <select className="settings-select" defaultValue="IDR">
                  <option value="IDR">Indonesian Rupiah (Rp)</option>
                  <option value="USD">US Dollar ($)</option>
                </select>
              </div>
            </div>

            <div className="settings-form-row">
              <div className="settings-group">
                <label>Date Format</label>
                <select className="settings-select" defaultValue="MMM DD, YYYY">
                  <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2026)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2026)</option>
                  <option value="MMM DD, YYYY">MMM DD, YYYY (Dec 31, 2026)</option>
                </select>
              </div>
              <div className="settings-group">
                <label>Time Format</label>
                <select className="settings-select" defaultValue="24h">
                  <option value="24h">24-hour (14:30)</option>
                  <option value="12h">12-hour (02:30 PM)</option>
                </select>
              </div>
            </div>
          </section>

          <section className="card" style={{ padding: '32px' }}>
            <h2 className="settings-section-title"><FiMap /> Regional Settings</h2>
            
            <div className="settings-form-row">
              <div className="settings-group">
                <label>Week Starts On</label>
                <select className="settings-select" defaultValue="monday">
                  <option value="sunday">Sunday</option>
                  <option value="monday">Monday</option>
                </select>
              </div>
              <div className="settings-group">
                <label>Measurement Units</label>
                <select className="settings-select" defaultValue="metric">
                  <option value="metric">Metric (km, kg, °C)</option>
                  <option value="imperial">Imperial (mi, lb, °F)</option>
                </select>
              </div>
            </div>

            <div className="settings-form-row">
              <div className="settings-group">
                <label>Default Event Duration</label>
                <select className="settings-select" defaultValue="4">
                  <option value="2">2 Hours</option>
                  <option value="4">4 Hours</option>
                  <option value="8">Full Day (8 Hours)</option>
                </select>
              </div>
            </div>
            
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn--primary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiCheckCircle /> Save Changes
              </button>
            </div>
          </section>
        </div>

        {/* Side Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <section className="card" style={{ padding: '24px', background: 'linear-gradient(145deg, #f8fafc, #ffffff)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
              <FiClock /> Timezone Notice
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
              Changing the global timezone will affect how event start times are displayed to volunteers across the platform. Current scheduled emails will also be adjusted automatically.
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
