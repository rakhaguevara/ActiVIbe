import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiSearch, FiUsers, FiCheckCircle,
  FiClock, FiAlertCircle, FiFileText, FiMapPin, FiUser, FiMessageSquare
} from 'react-icons/fi'
import VolunteerProfileDrawer from '../../../components/organizer/VolunteerProfileDrawer'
import DropdownMenu from '../../../components/DropdownMenu'
import type { OrganizerVolunteer, OrganizerVolunteerApplication, OrganizerVolunteersResponse } from '../../../types/organizer'
import '../VolunteersPage.css'

interface AcceptedRow {
  volunteer: OrganizerVolunteer
  application: OrganizerVolunteerApplication
}

export default function AcceptedVolunteersView({ data }: { data: OrganizerVolunteersResponse }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [eventFilter, setEventFilter] = useState('')
  const [selectedProfile, setSelectedProfile] = useState<OrganizerVolunteer | null>(null)

  const rows: AcceptedRow[] = useMemo(() => {
    const result: AcceptedRow[] = []
    for (const volunteer of data.volunteers) {
      for (const application of volunteer.applications) {
        if (application.status === 'accepted') result.push({ volunteer, application })
      }
    }
    return result
  }, [data.volunteers])

  const eventOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.application.eventTitle))).sort(),
    [rows],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (eventFilter && r.application.eventTitle !== eventFilter) return false
      if (!query) return true
      return r.volunteer.name.toLowerCase().includes(query) || r.volunteer.email.toLowerCase().includes(query)
    })
  }, [rows, search, eventFilter])

  const upcomingEventCount = eventOptions.length
  const pendingRequirements = rows.filter((r) => r.application.requirementsTotal > r.application.requirementsCompleted).length
  const readyForCheckIn = rows.filter((r) => r.application.requirementsCompleted >= r.application.requirementsTotal).length

  return (
    <div className="volunteers-crm">
      {/* Alerts */}
      {pendingRequirements > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: '8px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}>
            <FiAlertCircle size={18} /> {pendingRequirements} volunteer{pendingRequirements > 1 ? 's' : ''} have not completed required documents for upcoming events.
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <section className="v-kpi-grid">
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiUsers /> Accepted Volunteers</div>
          <span className="v-kpi-value">{rows.length}</span>
          <span className="v-kpi-trend neutral">Across {upcomingEventCount} event{upcomingEventCount === 1 ? '' : 's'}</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiMapPin /> Upcoming Assignments</div>
          <span className="v-kpi-value">{upcomingEventCount}</span>
          <span className="v-kpi-trend neutral">Events</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header" style={{ color: 'var(--color-danger)' }}><FiFileText /> Pending Requirements</div>
          <span className="v-kpi-value">{pendingRequirements}</span>
          <span className="v-kpi-trend" style={{ color: 'var(--color-danger)' }}>{pendingRequirements > 0 ? 'Action needed' : 'All clear'}</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header" style={{ color: 'var(--color-success)' }}><FiCheckCircle /> Ready for Check-in</div>
          <span className="v-kpi-value">{readyForCheckIn}</span>
          <span className="v-kpi-trend">Fully confirmed</span>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="v-filter-bar">
        <div className="v-filter-input" style={{ flex: 2 }}>
          <FiSearch color="var(--color-text-muted)" />
          <input type="text" placeholder="Search accepted volunteers..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="v-filter-input">
          <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
            <option value="">Assigned Event</option>
            {eventOptions.map((title) => <option key={title} value={title}>{title}</option>)}
          </select>
        </div>
        <div className="v-filter-input">
          <select defaultValue=""><option value="" disabled>Confirmation Status</option></select>
        </div>
        <button className="btn btn--outline btn--sm" style={{ border: 'none' }} onClick={() => { setSearch(''); setEventFilter('') }}>Reset</button>
      </section>

      {/* Main Content */}
      <section className="v-section">
        <h2>Operational Preparation</h2>
        <div className="v-table-wrapper">
          <table className="v-table">
            <thead>
              <tr>
                <th>Volunteer Name</th>
                <th>Assigned Event</th>
                <th>Assigned Role</th>
                <th>Shift</th>
                <th>Requirements</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ volunteer: vol, application: app }) => {
                const ready = app.requirementsCompleted >= app.requirementsTotal
                return (
                  <tr key={app.applicationId}>
                    <td>
                      <div className="v-volunteer-info">
                        <div className="v-avatar">{vol.avatarInitials}</div>
                        <div>
                          <span className="v-volunteer-name">{vol.name}</span>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{vol.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{app.eventTitle}</td>
                    <td>{app.assignedRoleName ?? '—'}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}><FiClock /> {app.assignedShiftLabel ?? 'Belum dijadwalkan'}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Completed</span>
                          <strong>{app.requirementsCompleted}/{app.requirementsTotal}</strong>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'var(--color-border-light)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${app.requirementsTotal > 0 ? (app.requirementsCompleted / app.requirementsTotal) * 100 : 100}%`, height: '100%', background: ready ? 'var(--color-success)' : 'var(--color-warning)' }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      {ready ? (
                        <span className="badge badge--success">Confirmed</span>
                      ) : (
                        <span className="badge badge--warning">Pending</span>
                      )}
                    </td>
                    <td>
                      <div className="v-table-actions">
                        <button className="btn btn--sm btn--outline" onClick={() => setSelectedProfile(vol)}>Profile</button>
                        <DropdownMenu
                          items={[
                            { label: 'Lihat Profil Lengkap', icon: <FiUser />, onClick: () => setSelectedProfile(vol) },
                            { label: 'Kirim Pesan', icon: <FiMessageSquare />, onClick: () => navigate('/organizer/communication?tab=broadcast') },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <p style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No accepted volunteers yet.</p>
        )}
      </section>

      <VolunteerProfileDrawer
        volunteer={selectedProfile}
        isOpen={selectedProfile !== null}
        onClose={() => setSelectedProfile(null)}
      />
    </div>
  )
}
