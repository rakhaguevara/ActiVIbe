import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiSearch, FiEdit2, FiCheckCircle, FiFileText, FiAlertCircle,
} from 'react-icons/fi'
import { useOrganizerData } from '../../../contexts/OrganizerDataContext'
import type { OrganizerEvent } from '../../../types/organizer'
import '../EventsPage.css'

interface ChecklistItem {
  label: string
  done: boolean
}

function checklistFor(event: OrganizerEvent): ChecklistItem[] {
  return [
    { label: 'Detail Dasar (Judul, Deskripsi, Lokasi)', done: true },
    { label: 'Kategori Kegiatan', done: !!event.category },
    { label: 'Volunteer Roles & Kuota', done: event.roles.length > 0 },
    { label: 'Volunteer Requirements', done: event.requirements.length > 0 },
    { label: 'Satuan Metrik Dampak', done: !!event.impactMetricUnit },
  ]
}

function progressFor(checklist: ChecklistItem[]) {
  return Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100)
}

export default function DraftEventsView() {
  const { events } = useOrganizerData()
  const [search, setSearch] = useState('')

  const drafts = useMemo(() => events.filter((e) => e.status === 'draft'), [events])
  const filtered = drafts.filter((d) => d.title.toLowerCase().includes(search.toLowerCase()))

  const withChecklist = filtered.map((d) => {
    const checklist = checklistFor(d)
    return { event: d, checklist, progress: progressFor(checklist), missing: checklist.filter((c) => !c.done) }
  })

  const missingInfoCount = withChecklist.filter((d) => d.missing.length > 0).length
  const readyToPublishCount = withChecklist.filter((d) => d.progress === 100).length

  const mostReady = [...withChecklist].sort((a, b) => b.progress - a.progress)[0]
  const leastReady = [...withChecklist].sort((a, b) => a.progress - b.progress)[0]

  return (
    <div className="events-hub" style={{ flexDirection: 'column' }}>
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon"><FiFileText /></div>
          <div className="stat-card__value">{drafts.length}</div>
          <div className="stat-card__label">Draft Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-danger)', background: '#fef2f2' }}><FiAlertCircle /></div>
          <div className="stat-card__value">{missingInfoCount}</div>
          <div className="stat-card__label">Missing Information</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-success)', background: '#f0fdf4' }}><FiCheckCircle /></div>
          <div className="stat-card__value">{readyToPublishCount}</div>
          <div className="stat-card__label">Ready to Publish</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-xl)', alignItems: 'start' }}>
        <section className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Draft Completion Status</h2>
            <div className="v-filter-input" style={{ width: '250px' }}>
              <FiSearch color="var(--color-text-muted)" />
              <input
                type="text"
                placeholder="Search drafts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
              />
            </div>
          </div>

          {withChecklist.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>Belum ada draft kegiatan.</p>
          ) : (
            <div className="v-table-wrapper">
              <table className="v-table">
                <thead>
                  <tr>
                    <th>Event Title</th>
                    <th>Completion Progress</th>
                    <th>Missing Sections</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withChecklist.map(({ event, progress, missing }) => (
                    <tr key={event.id}>
                      <td style={{ fontWeight: 600 }}>
                        <Link to={`/organizer/events/${event.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {event.title}
                        </Link>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ flex: 1, height: '8px', background: 'var(--color-border-light)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${progress}%`, height: '100%', background: progress > 90 ? 'var(--color-success)' : progress > 60 ? 'var(--color-warning)' : 'var(--color-danger)' }} />
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 600 }}>{progress}%</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {missing.length === 0
                            ? <span className="badge badge--success" style={{ fontSize: '11px' }}>Lengkap</span>
                            : missing.map((m) => <span key={m.label} className="badge badge--warning" style={{ fontSize: '11px' }}>{m.label}</span>)}
                        </div>
                      </td>
                      <td>
                        <Link to={`/organizer/events/${event.id}`} className="btn btn--sm btn--outline"><FiEdit2 /> Kelola</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiCheckCircle color="var(--color-primary)" /> Pre-publish Checklist
            </h3>
            {mostReady ? (
              <>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>{mostReady.event.title}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {mostReady.checklist.map((item) => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: item.done ? 'inherit' : 'var(--color-danger)' }}>
                      <input type="checkbox" checked={item.done} readOnly style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Belum ada draft.</p>
            )}
          </div>

          {leastReady && leastReady.event.id !== mostReady?.event.id && (
            <div className="card" style={{ padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Butuh Perhatian</h3>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                <strong style={{ color: 'var(--color-warning)' }}>{leastReady.event.title}</strong> baru {leastReady.progress}% lengkap — masih perlu {leastReady.missing.length} bagian sebelum siap dipublikasikan.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
