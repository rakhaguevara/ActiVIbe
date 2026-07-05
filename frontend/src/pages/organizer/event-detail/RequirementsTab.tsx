import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { FiPlus } from 'react-icons/fi'
import Badge from '../../../components/Badge'
import { useOrganizerData } from '../../../contexts/OrganizerDataContext'
import type { OrganizerEvent, EventRequirement } from '../../../types/organizer'

export default function RequirementsTab() {
  const { event } = useOutletContext<{ event: OrganizerEvent }>()
  const { addRequirement } = useOrganizerData()
  const [newRequirementTitle, setNewRequirementTitle] = useState('')
  const [newRequirementType, setNewRequirementType] = useState<EventRequirement['type']>('read_acknowledge')

  const eventRequirements = event.requirements

  const handleAddRequirement = async () => {
    if (!newRequirementTitle.trim()) return
    await addRequirement(event.id, {
      title: newRequirementTitle.trim(),
      type: newRequirementType,
      isMandatory: true,
    })
    setNewRequirementTitle('')
  }

  return (
    <div className="card event-detail__panel">
      <ul className="event-detail__requirement-list">
        {eventRequirements.length === 0 && <li className="event-detail__muted">Belum ada requirement.</li>}
        {eventRequirements.map((req) => (
          <li key={req.id}>
            <span>{req.title}</span>
            <Badge variant={req.isMandatory ? 'warning' : 'info'}>{req.isMandatory ? 'Wajib' : 'Opsional'}</Badge>
          </li>
        ))}
      </ul>
      <div className="event-detail__add-row">
        <input
          placeholder="Judul requirement baru"
          value={newRequirementTitle}
          onChange={(e) => setNewRequirementTitle(e.target.value)}
        />
        <select value={newRequirementType} onChange={(e) => setNewRequirementType(e.target.value as EventRequirement['type'])}>
          <option value="read_acknowledge">Read &amp; Acknowledge</option>
          <option value="checklist">Checklist</option>
          <option value="upload_proof">Upload Proof</option>
        </select>
        <button type="button" className="btn btn--outline btn--sm" onClick={handleAddRequirement}>
          <FiPlus /> Tambah Requirement
        </button>
      </div>
    </div>
  )
}
