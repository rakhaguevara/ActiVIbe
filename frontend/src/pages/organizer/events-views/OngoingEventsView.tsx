import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  FiActivity, FiUsers, FiClock, FiAlertTriangle, FiMapPin, FiPlayCircle, FiMessageSquare,
} from 'react-icons/fi'
import { useOrganizerData } from '../../../contexts/OrganizerDataContext'
import '../EventsPage.css'

export default function OngoingEventsView() {
  const { events, applicants, attendanceRecords } = useOrganizerData()

  const ongoing = useMemo(() => events.filter((e) => e.status === 'ongoing'), [events])

  const roleNameByShiftId = useMemo(() => {
    const map = new Map<string, string>()
    for (const event of events) {
      for (const role of event.roles) {
        for (const shift of role.shifts) {
          map.set(shift.id, role.roleName)
        }
      }
    }
    return map
  }, [events])

  const cards = ongoing.map((event) => {
    const records = attendanceRecords.filter((r) => r.eventId === event.id)
    const checkedIn = records.filter((r) => r.status === 'checked_in').length
    const noShow = records.filter((r) => r.status === 'no_show').length
    return { event, total: records.length, checkedIn, noShow }
  })

  const totalCheckedIn = cards.reduce((sum, c) => sum + c.checkedIn, 0)
  const totalExpected = cards.reduce((sum, c) => sum + c.total, 0)
  const attendanceRate = totalExpected > 0 ? Math.round((totalCheckedIn / totalExpected) * 100) : 0
  const totalIssues = cards.reduce((sum, c) => sum + c.noShow, 0)

  const recentCheckIns = attendanceRecords
    .filter((r) => r.status === 'checked_in' && r.checkedInAt && ongoing.some((e) => e.id === r.eventId))
    .sort((a, b) => new Date(b.checkedInAt!).getTime() - new Date(a.checkedInAt!).getTime())
    .slice(0, 5)

  return (
    <div className="events-hub" style={{ flexDirection: 'column' }}>
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-success)', background: '#f0fdf4' }}><FiPlayCircle /></div>
          <div className="stat-card__value">{ongoing.length}</div>
          <div className="stat-card__label">Ongoing Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon"><FiUsers /></div>
          <div className="stat-card__value">{totalCheckedIn}</div>
          <div className="stat-card__label">Checked-in Volunteers</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon"><FiActivity /></div>
          <div className="stat-card__value">{attendanceRate}%</div>
          <div className="stat-card__label">Attendance Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-warning)', background: '#fffbeb' }}><FiAlertTriangle /></div>
          <div className="stat-card__value">{totalIssues}</div>
          <div className="stat-card__label">No-show</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          {cards.length === 0 && (
            <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Tidak ada kegiatan yang sedang berlangsung.
            </div>
          )}
          {cards.map(({ event, total, checkedIn, noShow }) => (
            <div key={event.id} className="card" style={{ padding: '24px', borderLeft: '4px solid var(--color-success)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span className="badge badge--success" style={{ padding: '4px 8px' }}><FiPlayCircle /> LIVE NOW</span>
                  </div>
                  <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 8px 0' }}>{event.title}</h2>
                  <div style={{ display: 'flex', gap: '16px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiMapPin /> {event.location}</span>
                  </div>
                </div>
                <Link to={`/organizer/events/${event.id}/attendance`} className="btn btn--outline">Manage Operation</Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Attendance Progress</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, height: '8px', background: 'var(--color-border-light)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${total > 0 ? (checkedIn / total) * 100 : 0}%`, height: '100%', background: 'var(--color-success)' }} />
                    </div>
                    <strong style={{ fontSize: '14px' }}>{checkedIn}/{total}</strong>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Open Issues</div>
                  {noShow > 0 ? (
                    <strong style={{ fontSize: '14px', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiAlertTriangle /> {noShow} volunteer no-show
                    </strong>
                  ) : (
                    <strong style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Tidak ada masalah</strong>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Volunteer Check-ins</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentCheckIns.length === 0 && <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Belum ada check-in.</p>}
              {recentCheckIns.map((record) => {
                const applicant = applicants.find((a) => a.id === record.applicantId)
                const event = events.find((e) => e.id === record.eventId)
                const roleName = roleNameByShiftId.get(record.shiftId)
                return (
                  <div key={record.id} style={{ position: 'relative', paddingLeft: '16px', borderLeft: '2px solid var(--color-success)' }}>
                    <div style={{ fontSize: '13px' }}>
                      <strong>{applicant?.volunteerName ?? 'Volunteer'}</strong> {roleName ? `(${roleName})` : ''}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      {new Date(record.checkedInAt!).toLocaleTimeString('id-ID')} &middot; {event?.title}
                    </div>
                  </div>
                )
              })}
              <Link to="/organizer/volunteers?status=active" style={{ fontSize: '13px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500, marginTop: '8px' }}>View all active volunteers →</Link>
            </div>
          </div>

          <div className="card" style={{ padding: '20px', background: '#fef2f2', border: '1px solid #fecaca' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-danger)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiMessageSquare /> Live Announcements
            </h3>
            <p style={{ fontSize: '13px', margin: '0 0 12px 0' }}>Perlu broadcast pesan mendadak ke volunteer yang sedang bertugas?</p>
            <Link to="/organizer/communication" className="btn btn--sm" style={{ background: '#dc2626', color: '#fff', width: '100%', border: 'none', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
              Ke Communication Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
