import React from 'react'
import { 
  FiGlobe, FiMail, FiPhone, FiMapPin, FiCalendar, FiCheckCircle, FiInstagram, FiFacebook, FiLinkedin, FiExternalLink, FiHeart, FiFileText
} from 'react-icons/fi'
import '../OrganizationPage.css'

export default function OrganizationProfileView() {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          <section className="card org-profile-card" style={{ padding: '32px' }}>
            <div className="org-profile-header">
              <div className="org-logo-lg">GE</div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Green Earth Foundation
                  <FiCheckCircle size={20} color="var(--color-primary)" title="Verified NGO" />
                </h2>
                <div style={{ fontSize: '15px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Environmental NGO</div>
              </div>
            </div>

            <div className="org-info-grid">
              <div className="org-info-item">
                <label>Founded</label>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiCalendar size={14} color="var(--color-text-muted)" /> 2018</span>
              </div>
              <div className="org-info-item">
                <label>Head Office</label>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiMapPin size={14} color="var(--color-text-muted)" /> Yogyakarta, Indonesia</span>
              </div>
              <div className="org-info-item">
                <label>Website</label>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)' }}><FiGlobe size={14} /> www.greenearth.org</span>
              </div>
              <div className="org-info-item">
                <label>Email</label>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiMail size={14} color="var(--color-text-muted)" /> info@greenearth.org</span>
              </div>
              <div className="org-info-item">
                <label>Phone</label>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiPhone size={14} color="var(--color-text-muted)" /> +62 812 3456 7890</span>
              </div>
            </div>

            <div>
              <div className="org-info-item">
                <label style={{ marginBottom: '8px' }}>Mission Statement</label>
                <span style={{ lineHeight: 1.6, color: 'var(--color-text)' }}>
                  To restore, protect, and sustain the natural environment through community empowerment, extensive reforestation efforts, and continuous educational programs across Indonesia.
                </span>
              </div>
            </div>

            <div>
              <div className="org-info-item">
                <label style={{ marginBottom: '8px' }}>Areas of Focus</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="badge badge--success">Environment</span>
                  <span className="badge badge--primary">Education</span>
                  <span className="badge badge--warning">Community Development</span>
                  <span className="badge" style={{ background: '#fce7f3', color: '#be185d' }}>Health</span>
                </div>
              </div>
            </div>
          </section>

          <section className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Organization Impact Statistics</h3>
            <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div className="stat-card" style={{ padding: '16px' }}>
                <div className="stat-card__icon" style={{ marginBottom: '8px' }}><FiCalendar /></div>
                <div className="stat-card__value" style={{ fontSize: '20px' }}>124</div>
                <div className="stat-card__label">Events Organized</div>
              </div>
              <div className="stat-card" style={{ padding: '16px' }}>
                <div className="stat-card__icon" style={{ marginBottom: '8px', color: 'var(--color-primary)', background: 'var(--color-primary-soft)' }}><FiHeart /></div>
                <div className="stat-card__value" style={{ fontSize: '20px' }}>1,284</div>
                <div className="stat-card__label">Volunteers Mobilized</div>
              </div>
              <div className="stat-card" style={{ padding: '16px' }}>
                <div className="stat-card__icon" style={{ marginBottom: '8px', color: 'var(--color-success)', background: '#f0fdf4' }}><FiFileText /></div>
                <div className="stat-card__value" style={{ fontSize: '20px' }}>4,520</div>
                <div className="stat-card__label">Certificates Issued</div>
              </div>
            </div>
          </section>
        </div>

        {/* Side Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Social Media Links</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--color-text)', textDecoration: 'none' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef2f2', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiInstagram size={16} /></div>
                <span>@greenearth.id</span>
              </a>
              <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--color-text)', textDecoration: 'none' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiFacebook size={16} /></div>
                <span>Green Earth Foundation</span>
              </a>
              <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--color-text)', textDecoration: 'none' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf4', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiLinkedin size={16} /></div>
                <span>green-earth-org</span>
              </a>
            </div>
          </div>
          
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Recent Activities</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              <div className="timeline-event" style={{ paddingBottom: '16px' }}>
                <div className="timeline-event__icon" style={{ width: '16px', height: '16px', background: 'var(--color-primary)' }}></div>
                <div style={{ paddingLeft: '8px', fontSize: '13px' }}>
                  <div>Published new event <strong>Beach Cleanup 2026</strong></div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Yesterday</div>
                </div>
              </div>
              <div className="timeline-event" style={{ paddingBottom: '16px' }}>
                <div className="timeline-event__icon" style={{ width: '16px', height: '16px', background: '#f59e0b' }}></div>
                <div style={{ paddingLeft: '8px', fontSize: '13px' }}>
                  <div>Awarded <strong>Best Environmental NGO 2025</strong></div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Last Month</div>
                </div>
              </div>
              <div className="timeline-event" style={{ paddingBottom: '0' }}>
                <div className="timeline-event__icon" style={{ width: '16px', height: '16px', background: 'var(--color-success)' }}></div>
                <div style={{ paddingLeft: '8px', fontSize: '13px' }}>
                  <div>Passed yearly verification audit</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>January 2026</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
