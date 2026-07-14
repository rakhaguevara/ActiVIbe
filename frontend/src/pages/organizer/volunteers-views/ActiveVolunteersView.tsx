import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiUsers, FiActivity, FiClock, FiCoffee, FiMapPin, FiPlayCircle, FiUser, FiMessageSquare
} from 'react-icons/fi'
import VolunteerProfileDrawer from '../../../components/organizer/VolunteerProfileDrawer'
import DropdownMenu from '../../../components/DropdownMenu'
import { formatRelativeTime } from './volunteerFormat'
import type { OrganizerVolunteer, OrganizerVolunteerApplication, OrganizerVolunteersResponse } from '../../../types/organizer'
import '../VolunteersPage.css'

type LiveStatus = 'On Duty' | 'Late Arrival' | 'Break'

interface ActiveRow {
  volunteer: OrganizerVolunteer
  application: OrganizerVolunteerApplication
  liveStatus: LiveStatus
}

function formatTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })
}

// assignedShiftStart disimpan pakai trik "Z" wall-clock (lihat combineDateTime
// di event.service.js) — angka jam di dalamnya SUDAH jam dinding WIB, bukan
// UTC asli, jadi dibaca lewat slice ISO yang sama (pola sama toTimeOnly),
// BUKAN dikonversi timezone lagi. checkedInAt sebaliknya instant UTC asli
// (AttendanceLog @default(now())), jadi harus diubah dulu ke jam dinding WIB
// sebelum dibandingkan — membandingkan keduanya apa adanya (instant vs
// wall-clock berlabel "Z") akan salah ~7 jam.
function isLateArrival(checkedInAtIso: string | null, shiftStartIso: string | null): boolean {
  if (!checkedInAtIso || !shiftStartIso) return false
  const checkedIn = new Date(checkedInAtIso)
  const checkedInWibMinutes = (checkedIn.getUTCHours() * 60 + checkedIn.getUTCMinutes() + 7 * 60) % (24 * 60)
  const shiftStartWallTime = new Date(shiftStartIso).toISOString().slice(11, 16)
  const [shiftHour, shiftMinute] = shiftStartWallTime.split(':').map(Number)
  return checkedInWibMinutes > shiftHour * 60 + shiftMinute
}

function formatElapsed(iso: string | null): string {
  if (!iso) return '—'
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 0) return '0h 0m'
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
}

export default function ActiveVolunteersView({ data }: { data: OrganizerVolunteersResponse }) {
  const navigate = useNavigate()
  const [selectedProfile, setSelectedProfile] = useState<OrganizerVolunteer | null>(null)

  const expectedRows: { volunteer: OrganizerVolunteer; application: OrganizerVolunteerApplication }[] = []
  const activeRows: ActiveRow[] = []
  for (const volunteer of data.volunteers) {
    for (const application of volunteer.applications) {
      if (application.eventStatus !== 'ongoing') continue
      if (['accepted', 'checked_in'].includes(application.status)) {
        expectedRows.push({ volunteer, application })
      }
      if (application.status === 'checked_in') {
        // "Break" tidak pernah muncul — tidak ada sinyal untuk itu di backend
        // (hanya AttendanceLog.checkedInAt), cuma On Duty/Late Arrival yg real.
        const isLate = isLateArrival(application.checkedInAt, application.assignedShiftStart)
        activeRows.push({ volunteer, application, liveStatus: isLate ? 'Late Arrival' : 'On Duty' })
      }
    }
  }

  const activeEvents = useMemo(() => {
    const map = new Map<string, { title: string; location: string }>()
    for (const row of activeRows) {
      map.set(row.application.eventId, { title: row.application.eventTitle, location: row.application.eventLocation })
    }
    return Array.from(map.values())
  }, [activeRows])

  const recentCheckIns = useMemo(
    () => [...activeRows].sort((a, b) => (b.application.checkedInAt ?? '').localeCompare(a.application.checkedInAt ?? '')).slice(0, 5),
    [activeRows],
  )

  if (activeRows.length === 0) {
    return (
      <div className="volunteers-crm">
        <div className="v-empty-state">
          <FiActivity size={64} color="var(--color-text-muted)" style={{ marginBottom: '16px' }} />
          <h2 style={{ marginBottom: '8px' }}>No volunteers currently on duty.</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Volunteers checked in to an ongoing event will appear here.</p>
        </div>
      </div>
    )
  }

  const checkedInCount = activeRows.length
  const expectedCount = expectedRows.length
  const lateCount = activeRows.filter((r) => r.liveStatus === 'Late Arrival').length
  const onDutyCount = activeRows.filter((r) => r.liveStatus === 'On Duty').length
  const currentAttendance = expectedCount > 0 ? Math.round((checkedInCount / expectedCount) * 100) : null

  const getStatusBadge = (status: LiveStatus) => {
    switch (status) {
      case 'On Duty': return <span className="badge badge--success"><FiPlayCircle /> On Duty</span>
      case 'Break': return <span className="badge badge--info"><FiCoffee /> Break</span>
      case 'Late Arrival': return <span className="badge badge--warning"><FiClock /> Late</span>
    }
  }

  return (
    <div className="volunteers-crm">
      {/* KPI Cards */}
      <section className="v-kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiUsers /> Checked In</div>
          <span className="v-kpi-value">{checkedInCount}</span>
          <span className="v-kpi-trend neutral">of {expectedCount} expected</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiActivity /> On Duty</div>
          <span className="v-kpi-value">{onDutyCount}</span>
          <span className="v-kpi-trend neutral">Actively volunteering</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header" style={{ color: 'var(--color-warning)' }}><FiClock /> Late Arrival</div>
          <span className="v-kpi-value">{lateCount}</span>
          <span className="v-kpi-trend" style={{ color: 'var(--color-warning)' }}>Past shift start</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiCoffee /> On Break</div>
          <span className="v-kpi-value">0</span>
          <span className="v-kpi-trend neutral">Not tracked</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiActivity /> Current Attendance</div>
          <span className="v-kpi-value">{currentAttendance === null ? '—' : `${currentAttendance}%`}</span>
          <span className="v-kpi-trend neutral">Checked in vs expected</span>
        </div>
      </section>

      <div className="v-grid-main" style={{ gridTemplateColumns: '3fr 1fr' }}>
        <div className="v-section-col">
          {/* Main Content */}
          <section className="v-section">
            <h2>Live Attendance & Status</h2>
            <div className="v-table-wrapper">
              <table className="v-table">
                <thead>
                  <tr>
                    <th>Volunteer Name</th>
                    <th>Assigned Event</th>
                    <th>Role</th>
                    <th>Check-in Time</th>
                    <th>Active Hours</th>
                    <th>Live Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRows.map(({ volunteer: vol, application: app, liveStatus }) => (
                    <tr key={app.applicationId}>
                      <td>
                        <div className="v-volunteer-info">
                          <div className="v-avatar">{vol.avatarInitials}</div>
                          <span className="v-volunteer-name">{vol.name}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{app.eventTitle}</td>
                      <td>{app.assignedRoleName ?? '—'}</td>
                      <td>{formatTime(app.checkedInAt)}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 600 }}>{formatElapsed(app.checkedInAt)}</td>
                      <td>{getStatusBadge(liveStatus)}</td>
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
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="v-section-col">
          {/* Side Widgets */}
          <section className="v-section card">
            <h2>Active Events</h2>
            {activeEvents.map((ev) => (
              <div key={ev.title} style={{ background: 'var(--color-bg-subtle)', padding: '12px', borderRadius: '8px', borderLeft: '4px solid var(--color-success)', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)' }} />
                  {ev.title}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}><FiMapPin /> {ev.location}</div>
              </div>
            ))}
          </section>

          <section className="v-section card">
            <h2>Recent Check-ins</h2>
            <div className="v-timeline">
              {recentCheckIns.map(({ volunteer: vol, application: app }) => (
                <div className="v-timeline-item" key={app.applicationId}>
                  <div className="v-timeline-dot" style={{ background: 'var(--color-success)' }} />
                  <div style={{ fontSize: '13px' }}><strong>{vol.name}</strong> checked in{app.assignedRoleName ? ` at ${app.assignedRoleName}` : ''}.</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{formatRelativeTime(app.checkedInAt)}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <VolunteerProfileDrawer
        volunteer={selectedProfile}
        isOpen={selectedProfile !== null}
        onClose={() => setSelectedProfile(null)}
      />
    </div>
  )
}
