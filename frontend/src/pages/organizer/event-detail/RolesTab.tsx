import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { FiPlus } from 'react-icons/fi'
import Badge from '../../../components/Badge'
import { formatDateShort } from '../../../utils/formatDate'
import { useOrganizerData } from '../../../contexts/OrganizerDataContext'
import type { OrganizerEvent, Applicant } from '../../../types/organizer'

export default function RolesTab() {
  const { event } = useOutletContext<{ event: OrganizerEvent }>()
  const { addRole } = useOrganizerData()
  const [newRoleName, setNewRoleName] = useState('')

  const handleAddRole = async () => {
    if (!newRoleName.trim()) return
    await addRole(event.id, {
      roleName: newRoleName.trim(),
      roleDescription: '',
      maxVolunteers: 5,
      shifts: [],
    })
    setNewRoleName('')
  }

  return (
    <div className="card event-detail__panel">
      {event.roles.map((role) => (
        <div key={role.id} className="event-detail__role">
          <div className="event-detail__role-header">
            <h3>{role.roleName}</h3>
            <Badge variant="info">Maks {role.maxVolunteers} volunteer</Badge>
          </div>
          {role.roleDescription && <p>{role.roleDescription}</p>}
          <ul className="event-detail__shift-list">
            {role.shifts.map((shift) => (
              <li key={shift.id}>
                {formatDateShort(shift.shiftDate)}, {shift.startTime}&ndash;{shift.endTime} &middot; kuota {shift.quota} &middot; {shift.locationPoint}
              </li>
            ))}
            {role.shifts.length === 0 && <li className="event-detail__muted">Belum ada shift.</li>}
          </ul>
        </div>
      ))}
      <div className="event-detail__add-row">
        <input placeholder="Nama role baru" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} />
        <button type="button" className="btn btn--outline btn--sm" onClick={handleAddRole}>
          <FiPlus /> Tambah Role
        </button>
      </div>
    </div>
  )
}
