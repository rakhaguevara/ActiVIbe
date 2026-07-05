import React from 'react'
import { 
  FiFileText, FiStar, FiRefreshCw, FiFolder, FiEdit2, FiCopy, FiTrash2
} from 'react-icons/fi'
import '../CommunicationPage.css'

export default function TemplatesView() {
  const templates = [
    { name: 'Reminder', category: 'General', timesUsed: 142, updated: '2 days ago' },
    { name: 'Registration Closed', category: 'Status Update', timesUsed: 85, updated: '1 week ago' },
    { name: 'Equipment Reminder', category: 'Preparation', timesUsed: 64, updated: '3 weeks ago' },
    { name: 'Attendance Reminder', category: 'Preparation', timesUsed: 112, updated: '1 month ago' },
    { name: 'Thank You', category: 'Post-Event', timesUsed: 230, updated: '2 months ago' },
    { name: 'Certificate Ready', category: 'Post-Event', timesUsed: 198, updated: '2 months ago' },
    { name: 'Volunteer Appreciation', category: 'Recognition', timesUsed: 45, updated: '3 months ago' },
  ]

  return (
    <>
      {/* KPI Cards */}
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon"><FiFileText /></div>
          <div className="stat-card__value">18</div>
          <div className="stat-card__label">Total Templates</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: '#f59e0b', background: '#fffbeb' }}><FiStar /></div>
          <div className="stat-card__value" style={{ fontSize: '18px' }}>Reminder</div>
          <div className="stat-card__label">Most Used</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-success)', background: '#f0fdf4' }}><FiRefreshCw /></div>
          <div className="stat-card__value">5</div>
          <div className="stat-card__label">Recently Updated</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-soft)' }}><FiFolder /></div>
          <div className="stat-card__value">6</div>
          <div className="stat-card__label">Categories</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Template Library */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Template Library</h2>
            <button className="btn btn--outline btn--sm">Filter by Category</button>
          </div>
          
          <div className="template-grid">
            {templates.map((tpl, i) => (
              <div key={i} className="template-card">
                <div style={{ marginBottom: '8px' }}>
                  <span className="badge" style={{ background: '#f1f5f9', fontSize: '11px', marginBottom: '8px', display: 'inline-block' }}>{tpl.category}</span>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>{tpl.name}</h3>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span>Used <strong>{tpl.timesUsed}</strong> times</span>
                  <span>Last updated {tpl.updated}</span>
                </div>
                
                <div className="template-card__actions">
                  <div style={{ display: 'flex', gap: '4px', background: '#fff', padding: '4px', borderRadius: '8px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-light)' }}>
                    <button className="btn btn--sm" style={{ padding: '6px', background: 'transparent', border: 'none' }} title="Edit"><FiEdit2 /></button>
                    <button className="btn btn--sm" style={{ padding: '6px', background: 'transparent', border: 'none' }} title="Duplicate"><FiCopy /></button>
                    <button className="btn btn--sm" style={{ padding: '6px', background: 'transparent', border: 'none', color: 'var(--color-danger)' }} title="Delete"><FiTrash2 /></button>
                  </div>
                </div>
                
                <button className="btn btn--outline btn--sm" style={{ width: '100%', marginTop: 'auto' }}>Preview Template</button>
              </div>
            ))}
          </div>
        </section>

        {/* Template Editor Simulator */}
        <section className="card" style={{ padding: '24px', position: 'sticky', top: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Quick Editor</span>
            <span className="badge badge--success" style={{ fontSize: '10px' }}>Editing: Reminder</span>
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Subject</label>
              <input type="text" defaultValue="Reminder: {{EventName}} is Tomorrow!" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border-light)' }} />
            </div>
            
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Body</span>
                <span style={{ color: 'var(--color-primary)', cursor: 'pointer' }}>+ Insert Variable</span>
              </label>
              <textarea 
                style={{ width: '100%', minHeight: '150px', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border-light)', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
                defaultValue={`Hi {{VolunteerName}},\n\nJust a quick reminder that {{EventName}} is happening tomorrow at {{Location}}.\n\nPlease don't forget to bring your equipment.\n\nSee you there!`}
              />
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span className="badge" style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>{`{{VolunteerName}}`}</span>
              <span className="badge" style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>{`{{EventName}}`}</span>
              <span className="badge" style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>{`{{Date}}`}</span>
              <span className="badge" style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>{`{{Location}}`}</span>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button className="btn btn--outline" style={{ flex: 1 }}>Preview</button>
              <button className="btn btn--primary" style={{ flex: 1 }}>Save Changes</button>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
