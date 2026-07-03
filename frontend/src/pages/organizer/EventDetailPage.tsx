import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiPlus } from 'react-icons/fi'
import { useOrganizerData } from '../../contexts/OrganizerDataContext'
import Badge from '../../components/Badge'
import CloseEventWizard from '../../components/organizer/CloseEventWizard'
import type { EventRequirement } from '../../types/organizer'
import { formatDateShort } from '../../utils/formatDate'
import './EventDetailPage.css'

const TODAY = new Date().toISOString().slice(0, 10)
type Tab = 'overview' | 'roles' | 'requirements'

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const { events, applicants, addRole, addRequirement, closeEvent } = useOrganizerData()
  const [tab, setTab] = useState<Tab>('overview')
  const [showCloseWizard, setShowCloseWizard] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [newRequirementTitle, setNewRequirementTitle] = useState('')
  const [newRequirementType, setNewRequirementType] = useState<EventRequirement['type']>('read_acknowledge')

  const event = events.find((e) => e.id === eventId)

  if (!event) {
    return (
      <div className="event-detail__not-found">
        <p>Event tidak ditemukan.</p>
        <button type="button" className="btn btn--outline btn--sm" onClick={() => navigate('/organizer/events')}>
          Kembali ke Events
        </button>
      </div>
    )
  }

  const eventApplicants = applicants.filter((a) => a.eventId === event.id)
  const eventRequirements = event.requirements
  const canClose = (event.status === 'published' || event.status === 'ongoing') && event.endDate < TODAY

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
    <div className="event-detail">
      <header className="event-detail__header">
        <div>
          <h1>{event.title}</h1>
          <p>{event.location} &middot; {formatDateShort(event.startDate)}&ndash;{formatDateShort(event.endDate)}</p>
        </div>
        {canClose && (
          <button type="button" className="btn btn--primary btn--sm" onClick={() => setShowCloseWizard(true)}>
            Tutup Event
          </button>
        )}
      </header>

      <div className="event-detail__tabs">
        <button type="button" className={tab === 'overview' ? 'is-active' : ''} onClick={() => setTab('overview')}>Overview</button>
        <button type="button" className={tab === 'roles' ? 'is-active' : ''} onClick={() => setTab('roles')}>Roles &amp; Shifts</button>
        <button type="button" className={tab === 'requirements' ? 'is-active' : ''} onClick={() => setTab('requirements')}>Requirements</button>
      </div>

      {tab === 'overview' && (
        <div className="card event-detail__panel">
          <p>{event.description}</p>
          <div className="event-detail__kpi-row">
            <div><strong>{event.quota}</strong><span>Kuota</span></div>
            <div><strong>{eventApplicants.length}</strong><span>Total Pendaftar</span></div>
            <div><strong>{eventApplicants.filter((a) => a.status === 'accepted' || a.status === 'checked_in' || a.status === 'completed').length}</strong><span>Accepted</span></div>
            <div><strong>{event.impactMetricLabel}</strong><span>Metrik Dampak ({event.impactMetricUnit})</span></div>
          </div>
        </div>
      )}

      {tab === 'roles' && (
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
      )}

      {tab === 'requirements' && (
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
      )}

      {showCloseWizard && (
        <CloseEventWizard
          event={event}
          applicants={eventApplicants.filter((a) => a.assignedRoleId || a.status === 'accepted' || a.status === 'checked_in')}
          onClose={() => setShowCloseWizard(false)}
          onConfirm={(result) => closeEvent(event.id, result)}
        />
      )}
    </div>
  )
}
