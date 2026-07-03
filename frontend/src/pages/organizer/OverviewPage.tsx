import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FiCalendar, FiUsers, FiUserCheck, FiAlertTriangle, FiCheckSquare, FiAward } from 'react-icons/fi'
import { useOrganizerData } from '../../contexts/OrganizerDataContext'
import './OverviewPage.css'

const TODAY = new Date().toISOString().slice(0, 10)

export default function OverviewPage() {
  const { isLoading, events, applicants, attendanceRecords, communicationLogs } = useOrganizerData()

  const stats = useMemo(() => {
    const activeEvents = events.filter((e) => e.status === 'published' || e.status === 'ongoing')
    const pendingApplicants = applicants.filter((a) => a.status === 'applied' || a.status === 'under_review')
    const acceptedApplicants = applicants.filter((a) => a.status === 'accepted')
    const needsClosing = events.filter(
      (e) => (e.status === 'published' || e.status === 'ongoing') && e.endDate < TODAY,
    )

    const todaysAttendance = attendanceRecords.filter((r) => {
      const event = events.find((e) => e.id === r.eventId)
      const shift = event?.roles.flatMap((role) => role.shifts).find((s) => s.id === r.shiftId)
      return shift?.shiftDate === TODAY
    })
    const checkedInToday = todaysAttendance.filter((r) => r.status === 'checked_in').length

    const impactByMetric = new Map<string, number>()
    events
      .filter((e) => e.status === 'completed' && e.impactValue)
      .forEach((e) => {
        const key = `${e.impactMetricLabel} (${e.impactMetricUnit})`
        impactByMetric.set(key, (impactByMetric.get(key) ?? 0) + (e.impactValue ?? 0))
      })

    return {
      activeEventsCount: activeEvents.length,
      pendingCount: pendingApplicants.length,
      acceptedCount: acceptedApplicants.length,
      needsClosingCount: needsClosing.length,
      todaysExpected: todaysAttendance.length,
      checkedInToday,
      impactByMetric: [...impactByMetric.entries()],
    }
  }, [events, applicants, attendanceRecords])

  const recentActivity = useMemo(() => {
    const fromComms = communicationLogs.map((c) => ({
      id: c.id,
      text: `Mengirim broadcast "${c.title}"`,
      at: c.sentAt,
    }))
    const fromApplicants = [...applicants]
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
      .slice(0, 3)
      .map((a) => {
        const event = events.find((e) => e.id === a.eventId)
        return { id: a.id, text: `${a.volunteerName} melamar ke "${event?.title}"`, at: a.appliedAt }
      })

    return [...fromComms, ...fromApplicants]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 5)
  }, [communicationLogs, applicants, events])

  if (isLoading) {
    return <p className="organizer-overview__loading">Memuat data...</p>
  }

  return (
    <div className="organizer-overview">
      <header className="organizer-overview__header">
        <h1>Overview</h1>
        <p>Ringkasan operasional kegiatan volunteer yang kamu kelola.</p>
      </header>

      <div className="organizer-overview__stats">
        <div className="card organizer-overview__stat">
          <FiCalendar className="organizer-overview__stat-icon" />
          <p className="organizer-overview__stat-value">{stats.activeEventsCount}</p>
          <p className="organizer-overview__stat-label">Event Aktif</p>
        </div>
        <div className="card organizer-overview__stat">
          <FiUsers className="organizer-overview__stat-icon" />
          <p className="organizer-overview__stat-value">{stats.pendingCount}</p>
          <p className="organizer-overview__stat-label">Pendaftar Pending Review</p>
        </div>
        <div className="card organizer-overview__stat">
          <FiUserCheck className="organizer-overview__stat-icon" />
          <p className="organizer-overview__stat-value">{stats.acceptedCount}</p>
          <p className="organizer-overview__stat-label">Volunteer Accepted</p>
        </div>
        <div className="card organizer-overview__stat organizer-overview__stat--warning">
          <FiAlertTriangle className="organizer-overview__stat-icon" />
          <p className="organizer-overview__stat-value">{stats.needsClosingCount}</p>
          <p className="organizer-overview__stat-label">Perlu Ditutup</p>
        </div>
        <div className="card organizer-overview__stat">
          <FiCheckSquare className="organizer-overview__stat-icon" />
          <p className="organizer-overview__stat-value">{stats.checkedInToday}/{stats.todaysExpected}</p>
          <p className="organizer-overview__stat-label">Attendance Hari Ini</p>
        </div>
        <div className="card organizer-overview__stat">
          <FiAward className="organizer-overview__stat-icon" />
          <p className="organizer-overview__stat-value">{stats.impactByMetric.length}</p>
          <p className="organizer-overview__stat-label">Metrik Dampak Tercatat</p>
          {stats.impactByMetric.map(([label, value]) => (
            <p key={label} className="organizer-overview__stat-detail">{value} {label}</p>
          ))}
        </div>
      </div>

      <div className="organizer-overview__quick-actions">
        <Link to="/organizer/events/new" className="btn btn--primary btn--sm">Buat Event Baru</Link>
        <Link to="/organizer/applicants" className="btn btn--outline btn--sm">Lihat Pendaftar Pending</Link>
        <Link to="/organizer/attendance" className="btn btn--outline btn--sm">Kelola Attendance Hari Ini</Link>
        <Link to="/organizer/events" className="btn btn--outline btn--sm">Tutup Event</Link>
        <Link to="/organizer/communication" className="btn btn--outline btn--sm">Kirim Broadcast</Link>
      </div>

      <section className="organizer-overview__activity card">
        <h2>Aktivitas Terbaru</h2>
        <ul className="organizer-overview__activity-list">
          {recentActivity.length === 0 && <li className="organizer-overview__muted">Belum ada aktivitas.</li>}
          {recentActivity.map((entry) => (
            <li key={entry.id}>{entry.text}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
