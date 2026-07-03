import { useState } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'
import { useOrganizerData } from '../../contexts/OrganizerDataContext'
import Badge from '../../components/Badge'
import './AssignmentsPage.css'

function timesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart < bEnd && bStart < aEnd
}

export default function AssignmentsPage() {
  const { isLoading, events, applicants, assignApplicant } = useOrganizerData()
  const [selectedEventId, setSelectedEventId] = useState('')

  const effectiveEventId = selectedEventId || events[0]?.id || ''
  const selectedEvent = events.find((e) => e.id === effectiveEventId)
  const eventApplicants = applicants.filter((a) => a.eventId === effectiveEventId)

  const unassignedAccepted = eventApplicants.filter((a) => a.status === 'accepted' && !a.assignedShiftId)

  const conflicts = (() => {
    const byVolunteer = new Map<string, { shiftDate: string; startTime: string; endTime: string }[]>()
    if (!selectedEvent) return new Set<string>()

    eventApplicants.forEach((a) => {
      if (!a.assignedRoleId || !a.assignedShiftId) return
      const role = selectedEvent.roles.find((r) => r.id === a.assignedRoleId)
      const shift = role?.shifts.find((s) => s.id === a.assignedShiftId)
      if (!shift) return
      const list = byVolunteer.get(a.volunteerName) ?? []
      list.push(shift)
      byVolunteer.set(a.volunteerName, list)
    })

    const conflicted = new Set<string>()
    byVolunteer.forEach((shifts, name) => {
      for (let i = 0; i < shifts.length; i += 1) {
        for (let j = i + 1; j < shifts.length; j += 1) {
          if (
            shifts[i].shiftDate === shifts[j].shiftDate &&
            timesOverlap(shifts[i].startTime, shifts[i].endTime, shifts[j].startTime, shifts[j].endTime)
          ) {
            conflicted.add(name)
          }
        }
      }
    })
    return conflicted
  })()

  if (isLoading) {
    return <p>Memuat data...</p>
  }

  if (!selectedEvent) {
    return <p>Belum ada event untuk dikelola.</p>
  }

  return (
    <div className="assignments-page">
      <header className="assignments-page__header">
        <h1>Assignments</h1>
        <p>Tempatkan volunteer yang sudah diterima ke role &amp; shift tertentu.</p>
      </header>

      <select value={effectiveEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
        {events.map((e) => (
          <option key={e.id} value={e.id}>{e.title}</option>
        ))}
      </select>

      {selectedEvent.roles.map((role) => (
        <div key={role.id} className="card assignments-page__role">
          <h2>{role.roleName}</h2>
          {role.shifts.map((shift) => {
            const assigned = eventApplicants.filter((a) => a.assignedShiftId === shift.id)
            return (
              <div key={shift.id} className="assignments-page__shift">
                <p className="assignments-page__shift-meta">
                  {shift.shiftDate}, {shift.startTime}&ndash;{shift.endTime} &middot; {shift.locationPoint} &middot; {assigned.length}/{shift.quota} terisi
                </p>
                <ul className="assignments-page__assigned-list">
                  {assigned.map((a) => (
                    <li key={a.id}>
                      {a.volunteerName}
                      {conflicts.has(a.volunteerName) && (
                        <span className="assignments-page__conflict">
                          <FiAlertTriangle /> Bentrok jadwal
                        </span>
                      )}
                    </li>
                  ))}
                  {assigned.length === 0 && <li className="assignments-page__muted">Belum ada volunteer di-assign.</li>}
                </ul>
                {unassignedAccepted.length > 0 && (
                  <div className="assignments-page__assign-form">
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) {
                          assignApplicant(e.target.value, role.id, shift.id)
                          e.target.value = ''
                        }
                      }}
                    >
                      <option value="" disabled>Assign volunteer...</option>
                      {unassignedAccepted.map((a) => (
                        <option key={a.id} value={a.id}>{a.volunteerName}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}

      {unassignedAccepted.length > 0 && (
        <div className="card assignments-page__pending">
          <h2>Belum Di-assign ({unassignedAccepted.length})</h2>
          <ul>
            {unassignedAccepted.map((a) => (
              <li key={a.id}>
                {a.volunteerName} <Badge variant="warning">Accepted</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
