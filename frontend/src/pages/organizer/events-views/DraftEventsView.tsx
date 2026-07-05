import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  FiSearch, FiEdit2, FiCheckCircle, FiFileText, FiAlertCircle, FiMessageSquare, FiChevronRight
} from 'react-icons/fi'
import '../EventsPage.css'

interface DraftEvent {
  id: string
  title: string
  progress: number
  missingSections: string[]
  createdAt: string
  lastEdited: string
  owner: string
}

const DUMMY_DRAFTS: DraftEvent[] = [
  {
    id: 'd1', title: 'Beach Cleanup 2026', progress: 72, missingSections: ['Volunteer Requirements', 'Banner Image'],
    createdAt: '2026-06-25', lastEdited: '2 days ago', owner: 'Ahmad Fauzan'
  },
  {
    id: 'd2', title: 'Education Camp Batch 4', progress: 95, missingSections: ['Final Review'],
    createdAt: '2026-07-01', lastEdited: 'Today', owner: 'Sarah Wijaya'
  },
  {
    id: 'd3', title: 'Digital Literacy for Kids', progress: 48, missingSections: ['Schedule', 'Roles', 'Location Details'],
    createdAt: '2026-07-03', lastEdited: 'Yesterday', owner: 'Michael Tan'
  }
]

export default function DraftEventsView() {
  const [drafts] = useState<DraftEvent[]>(DUMMY_DRAFTS)

  return (
    <div className="events-hub" style={{ flexDirection: 'column' }}>
      {/* KPI Cards */}
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon"><FiFileText /></div>
          <div className="stat-card__value">14</div>
          <div className="stat-card__label">Draft Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-danger)', background: '#fef2f2' }}><FiAlertCircle /></div>
          <div className="stat-card__value">8</div>
          <div className="stat-card__label">Missing Information</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-warning)', background: '#fffbeb' }}><FiMessageSquare /></div>
          <div className="stat-card__value">3</div>
          <div className="stat-card__label">Pending Review</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-success)', background: '#f0fdf4' }}><FiCheckCircle /></div>
          <div className="stat-card__value">3</div>
          <div className="stat-card__label">Ready to Publish</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <section className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Draft Completion Status</h2>
            <div className="v-filter-input" style={{ width: '250px' }}>
              <FiSearch color="var(--color-text-muted)" />
              <input type="text" placeholder="Search drafts..." style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }} />
            </div>
          </div>
          
          <div className="v-table-wrapper">
            <table className="v-table">
              <thead>
                <tr>
                  <th>Event Title</th>
                  <th>Completion Progress</th>
                  <th>Missing Sections</th>
                  <th>Last Edited</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {drafts.map(draft => (
                  <tr key={draft.id}>
                    <td style={{ fontWeight: 600 }}>
                      <Link to={`/organizer/events/${draft.id}/edit`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {draft.title}
                      </Link>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 400 }}>Owner: {draft.owner}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1, height: '8px', background: 'var(--color-border-light)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${draft.progress}%`, height: '100%', background: draft.progress > 90 ? 'var(--color-success)' : draft.progress > 60 ? 'var(--color-warning)' : 'var(--color-danger)' }} />
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{draft.progress}%</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {draft.missingSections.map((sec, i) => (
                          <span key={i} className="badge badge--warning" style={{ fontSize: '11px' }}>{sec}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{draft.lastEdited}</td>
                    <td>
                      <Link to={`/organizer/events/${draft.id}/edit`} className="btn btn--sm btn--outline"><FiEdit2 /> Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Side Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiCheckCircle color="var(--color-primary)" /> Pre-publish Checklist
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                <input type="checkbox" checked readOnly style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }} />
                <span>Basic Details (Title, Desc)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                <input type="checkbox" checked readOnly style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }} />
                <span>Event Location</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--color-danger)' }}>
                <input type="checkbox" readOnly style={{ width: '16px', height: '16px' }} />
                <span>Banner Image Upload <span className="badge badge--danger" style={{ padding: '2px 6px', fontSize: '10px' }}>Required</span></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--color-danger)' }}>
                <input type="checkbox" readOnly style={{ width: '16px', height: '16px' }} />
                <span>Volunteer Roles & Quota <span className="badge badge--danger" style={{ padding: '2px 6px', fontSize: '10px' }}>Required</span></span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ✨ AI Suggestions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                <strong style={{ color: 'var(--color-success)' }}>Education Camp Batch 4</strong> is ready for publishing.
                <button className="btn btn--sm" style={{ padding: 0, marginTop: '8px', color: 'var(--color-primary)', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>Review now <FiChevronRight/></button>
              </div>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                <strong style={{ color: 'var(--color-warning)' }}>Beach Cleanup 2026</strong> still requires volunteer requirements. Missing this reduces applicant quality.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
