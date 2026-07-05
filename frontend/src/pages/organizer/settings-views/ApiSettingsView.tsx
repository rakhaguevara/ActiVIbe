import React from 'react'
import { 
  FiTerminal, FiCode, FiLayers, FiLink, FiCopy, FiBookOpen
} from 'react-icons/fi'
import '../SettingsPage.css'

export default function ApiSettingsView() {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          <section className="card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="settings-section-title" style={{ margin: 0 }}><FiLayers /> Future Integrations</h2>
              <span className="badge" style={{ background: '#f3e8ff', color: '#7c3aed', padding: '6px 12px', fontSize: '13px' }}>Coming Q4 2026</span>
            </div>
            
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>
              We are building a powerful ecosystem to let you connect ActiVibe directly to your existing tools. Prepare your organization for our upcoming webhook and REST API release.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ border: '1px solid var(--color-border-light)', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', opacity: 0.7 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>⚡</div>
                <div style={{ fontWeight: 600 }}>Zapier</div>
              </div>
              <div style={{ border: '1px solid var(--color-border-light)', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', opacity: 0.7 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>💬</div>
                <div style={{ fontWeight: 600 }}>Slack</div>
              </div>
              <div style={{ border: '1px solid var(--color-border-light)', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', opacity: 0.7 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📅</div>
                <div style={{ fontWeight: 600 }}>Google Calendar</div>
              </div>
              <div style={{ border: '1px solid var(--color-border-light)', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', opacity: 0.7 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📧</div>
                <div style={{ fontWeight: 600 }}>Outlook</div>
              </div>
              <div style={{ border: '1px solid var(--color-border-light)', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', opacity: 0.7 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🤖</div>
                <div style={{ fontWeight: 600 }}>n8n</div>
              </div>
              <div style={{ border: '2px dashed var(--color-border-light)', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-primary-soft)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}><FiLink /></div>
                <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Request App</div>
              </div>
            </div>
          </section>

          <section className="card" style={{ padding: '32px' }}>
            <h2 className="settings-section-title"><FiTerminal /> Developer API Preview</h2>
            
            <div className="settings-group" style={{ marginBottom: '24px' }}>
              <label>Sandbox API Key (Read-Only)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="password" value="act_test_9238472938472983472934" className="settings-input" style={{ flex: 1, background: '#f8fafc', color: 'var(--color-text-muted)' }} readOnly />
                <button className="btn btn--outline"><FiCopy /></button>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px' }}>Do not share this key. It grants read-only access to your sandbox events.</div>
            </div>

            <div className="settings-group" style={{ marginBottom: '24px' }}>
              <label>Event Webhook Target URL</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" placeholder="https://api.yourdomain.com/webhooks/activibe" className="settings-input" style={{ flex: 1 }} />
                <button className="btn btn--primary">Save</button>
              </div>
            </div>

            <div className="settings-group">
              <label>Example Webhook Payload (event.published)</label>
              <div className="api-code-block">
<pre style={{ margin: 0 }}>
{`{
  "event_id": "evt_98328",
  "type": "event.published",
  "created_at": "2026-07-05T14:30:00Z",
  "data": {
    "title": "Beach Cleanup 2026",
    "location": "Parangtritis, ID",
    "required_volunteers": 50
  }
}`}
</pre>
              </div>
            </div>
          </section>
        </div>

        {/* Side Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <section className="card" style={{ padding: '24px', background: 'linear-gradient(145deg, #f8fafc, #ffffff)', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-primary-soft)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '16px' }}>
              <FiCode />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
              API Documentation
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
              Read our comprehensive guides to learn how to authenticate, paginate, and consume our REST endpoints.
            </p>
            <button className="btn btn--outline" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              <FiBookOpen /> Read Docs
            </button>
          </section>
        </div>
      </div>
    </>
  )
}
