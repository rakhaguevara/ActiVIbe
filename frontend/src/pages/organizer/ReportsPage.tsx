import { useMemo, useState } from 'react'
import { FiDownload } from 'react-icons/fi'
import { useOrganizerData } from '../../contexts/OrganizerDataContext'
import './ReportsPage.css'

function toCsvValue(value: string | number) {
  const str = String(value)
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

function shiftHours(startTime: string, endTime: string) {
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  return Math.max(0, (eh * 60 + em - (sh * 60 + sm)) / 60)
}

export default function ReportsPage() {
  const { events, applicants } = useOrganizerData()
  const [eventFilter, setEventFilter] = useState('all')

  const filteredApplicants = useMemo(
    () => applicants.filter((a) => eventFilter === 'all' || a.eventId === eventFilter),
    [applicants, eventFilter],
  )

  const stats = useMemo(() => {
    const totalEventsPublished = events.filter((e) => e.status !== 'draft' && e.status !== 'pending_approval' && e.status !== 'rejected').length
    const totalApplicants = filteredApplicants.length
    const accepted = filteredApplicants.filter((a) => ['accepted', 'checked_in', 'completed', 'no_show'].includes(a.status))
    const acceptanceRate = totalApplicants ? Math.round((accepted.length / totalApplicants) * 100) : 0

    const attendanceEligible = filteredApplicants.filter((a) => ['checked_in', 'completed', 'no_show'].includes(a.status))
    const attended = filteredApplicants.filter((a) => a.status === 'checked_in' || a.status === 'completed')
    const attendanceRate = attendanceEligible.length ? Math.round((attended.length / attendanceEligible.length) * 100) : 0
    const noShowCount = filteredApplicants.filter((a) => a.status === 'no_show').length
    const noShowRate = attendanceEligible.length ? Math.round((noShowCount / attendanceEligible.length) * 100) : 0

    let totalHours = 0
    attended.forEach((a) => {
      const event = events.find((e) => e.id === a.eventId)
      const role = event?.roles.find((r) => r.id === a.assignedRoleId)
      const shift = role?.shifts.find((s) => s.id === a.assignedShiftId)
      if (shift) totalHours += shiftHours(shift.startTime, shift.endTime)
    })

    const totalCompleted = filteredApplicants.filter((a) => a.status === 'completed').length

    const impactByMetric = new Map<string, number>()
    events
      .filter((e) => (eventFilter === 'all' || e.id === eventFilter) && e.status === 'completed' && e.impactValue)
      .forEach((e) => {
        const key = `${e.impactMetricLabel} (${e.impactMetricUnit})`
        impactByMetric.set(key, (impactByMetric.get(key) ?? 0) + (e.impactValue ?? 0))
      })

    return {
      totalEventsPublished,
      totalApplicants,
      acceptanceRate,
      attendanceRate,
      noShowRate,
      totalHours: Math.round(totalHours),
      totalCompleted,
      impactByMetric: [...impactByMetric.entries()],
    }
  }, [events, filteredApplicants, eventFilter])

  const handleExport = () => {
    const header = ['Volunteer', 'Event', 'Role', 'Status', 'Requirement']
    const rows = filteredApplicants.map((a) => {
      const event = events.find((e) => e.id === a.eventId)
      const role = event?.roles.find((r) => r.id === a.assignedRoleId)
      return [a.volunteerName, event?.title ?? '', role?.roleName ?? '—', a.status, a.requirementStatus]
    })
    const csv = [header, ...rows].map((row) => row.map(toCsvValue).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `organizer-report-${eventFilter}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="reports-page">
      <header className="reports-page__header">
        <div>
          <h1>Reports &amp; Impact</h1>
          <p>Kinerja event dan volunteer operations secara agregat.</p>
        </div>
        <button type="button" className="btn btn--primary btn--sm" onClick={handleExport}>
          <FiDownload /> Ekspor CSV
        </button>
      </header>

      <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
        <option value="all">Semua Event</option>
        {events.map((e) => (
          <option key={e.id} value={e.id}>{e.title}</option>
        ))}
      </select>

      <div className="reports-page__grid">
        <div className="card reports-page__stat"><strong>{stats.totalEventsPublished}</strong><span>Total Events Published</span></div>
        <div className="card reports-page__stat"><strong>{stats.totalApplicants}</strong><span>Total Applicants</span></div>
        <div className="card reports-page__stat"><strong>{stats.acceptanceRate}%</strong><span>Acceptance Rate</span></div>
        <div className="card reports-page__stat"><strong>{stats.attendanceRate}%</strong><span>Attendance Rate</span></div>
        <div className="card reports-page__stat"><strong>{stats.noShowRate}%</strong><span>No-show Rate</span></div>
        <div className="card reports-page__stat"><strong>{stats.totalHours}</strong><span>Total Volunteer Hours</span></div>
        <div className="card reports-page__stat"><strong>{stats.totalCompleted}</strong><span>Total Volunteers Completed</span></div>
        <div className="card reports-page__stat">
          <strong>{stats.impactByMetric.length}</strong>
          <span>Total Impact Aggregate</span>
          {stats.impactByMetric.map(([label, value]) => (
            <p key={label} className="reports-page__stat-detail">{value} {label}</p>
          ))}
        </div>
      </div>
    </div>
  )
}
