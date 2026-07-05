import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { FiCheck, FiUserX } from 'react-icons/fi'
import { useOrganizerData } from '../../contexts/OrganizerDataContext'
import Badge from '../../components/Badge'
import './AttendancePage.css'

export default function AttendancePage() {
  const { eventId } = useParams<{ eventId: string }>()
  const { isLoading, events, applicants, attendanceRecords, checkInAttendance, markNoShow } = useOrganizerData()
  const [selectedShiftId, setSelectedShiftId] = useState('')

  const effectiveEventId = eventId || ''
  const selectedEvent = events.find((e) => e.id === effectiveEventId)

  const currentShifts = selectedEvent?.roles.flatMap((r) => r.shifts.map((s) => ({ ...s, roleName: r.roleName }))) ?? []
  const activeShiftId = currentShifts.some((s) => s.id === selectedShiftId) ? selectedShiftId : currentShifts[0]?.id ?? ''

  const records = attendanceRecords.filter((r) => r.eventId === effectiveEventId && r.shiftId === activeShiftId)

  const withNames = records.map((r) => ({
    ...r,
    volunteerName: applicants.find((a) => a.id === r.applicantId)?.volunteerName ?? 'Volunteer',
  }))

  const expected = withNames.filter((r) => r.status === 'expected')
  const checkedIn = withNames.filter((r) => r.status === 'checked_in')
  const noShow = withNames.filter((r) => r.status === 'no_show')

  if (isLoading) {
    return <p className="attendance-page__empty">Memuat data...</p>
  }

  return (
    <div className="attendance-page">
      <header className="attendance-page__header">
        <h1>Attendance</h1>
        <p>Kelola check-in volunteer pada hari pelaksanaan event.</p>
      </header>

      <div className="attendance-page__toolbar">
        <select value={activeShiftId} onChange={(e) => setSelectedShiftId(e.target.value)}>
          {currentShifts.map((s) => (
            <option key={s.id} value={s.id}>{s.roleName} — {s.shiftDate} {s.startTime}</option>
          ))}
        </select>
        <button type="button" className="btn btn--outline btn--sm" disabled>
          Scan QR
        </button>
      </div>

      <div className="attendance-page__summary">
        <div className="card attendance-page__summary-item"><strong>{expected.length}</strong><span>Belum Hadir</span></div>
        <div className="card attendance-page__summary-item"><strong>{checkedIn.length}</strong><span>Sudah Hadir</span></div>
        <div className="card attendance-page__summary-item"><strong>{noShow.length}</strong><span>No-show</span></div>
      </div>

      <div className="card attendance-page__list">
        {withNames.length === 0 && <p className="attendance-page__empty">Tidak ada volunteer terdaftar untuk shift ini.</p>}
        {withNames.map((r) => (
          <div key={r.id} className="attendance-page__row">
            <span>{r.volunteerName}</span>
            <div className="attendance-page__row-right">
              {r.status === 'checked_in' && <Badge variant="success">Hadir {r.checkedInAt ? `(${r.method})` : ''}</Badge>}
              {r.status === 'no_show' && <Badge variant="danger">No-show</Badge>}
              {r.status === 'expected' && (
                <>
                  <button type="button" className="btn btn--primary btn--sm" onClick={() => checkInAttendance(r.id, 'manual')}>
                    <FiCheck /> Check-in
                  </button>
                  <button type="button" className="btn btn--danger btn--sm" onClick={() => markNoShow(r.id)}>
                    <FiUserX /> No-show
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
