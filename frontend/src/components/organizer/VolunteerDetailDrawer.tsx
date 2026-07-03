import { useState } from 'react'
import { FiX, FiCheck, FiUserX, FiClock } from 'react-icons/fi'
import type { Applicant, ApplicantStatus, OrganizerEvent } from '../../types/organizer'
import Badge from '../Badge'
import './VolunteerDetailDrawer.css'

const STATUS_LABEL: Record<ApplicantStatus, string> = {
  applied: 'Applied',
  under_review: 'Under Review',
  accepted: 'Accepted',
  rejected: 'Rejected',
  waitlisted: 'Waitlisted',
  checked_in: 'Checked-in',
  completed: 'Completed',
  no_show: 'No-show',
  cancelled_by_organizer: 'Dibatalkan Organizer',
  cancelled_by_volunteer: 'Dibatalkan Volunteer',
}

const STATUS_VARIANT: Record<ApplicantStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  applied: 'info',
  under_review: 'warning',
  accepted: 'success',
  rejected: 'danger',
  waitlisted: 'warning',
  checked_in: 'success',
  completed: 'success',
  no_show: 'danger',
  cancelled_by_organizer: 'danger',
  cancelled_by_volunteer: 'danger',
}

const REQUIREMENT_LABEL = {
  not_started: 'Belum Dimulai',
  in_progress: 'Sedang Berjalan',
  completed: 'Selesai',
}

interface VolunteerDetailDrawerProps {
  applicant: Applicant
  event: OrganizerEvent
  onClose: () => void
  onStatusChange: (status: ApplicantStatus) => void
  onAddNote: (note: string) => void
}

export default function VolunteerDetailDrawer({
  applicant,
  event,
  onClose,
  onStatusChange,
  onAddNote,
}: VolunteerDetailDrawerProps) {
  const [noteDraft, setNoteDraft] = useState('')

  const assignedRole = event.roles.find((r) => r.id === applicant.assignedRoleId)
  const assignedShift = assignedRole?.shifts.find((s) => s.id === applicant.assignedShiftId)

  const handleAddNote = () => {
    if (!noteDraft.trim()) return
    onAddNote(noteDraft.trim())
    setNoteDraft('')
  }

  return (
    <div className="volunteer-drawer__backdrop" onClick={onClose}>
      <aside className="volunteer-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="volunteer-drawer__header">
          <div>
            <h2>{applicant.volunteerName}</h2>
            <p>{applicant.email}</p>
          </div>
          <button type="button" className="volunteer-drawer__close" onClick={onClose} aria-label="Tutup">
            <FiX />
          </button>
        </div>

        <section className="volunteer-drawer__section">
          <h3>Identitas &amp; Kecocokan</h3>
          {applicant.matchScore !== undefined ? (
            <>
              <p className="volunteer-drawer__match">
                <strong>{applicant.matchScore}%</strong> match score
              </p>
              <p className="volunteer-drawer__reasoning">{applicant.matchReasoning}</p>
            </>
          ) : (
            <p className="volunteer-drawer__muted">Belum ada Match Score AI untuk pendaftar ini.</p>
          )}
        </section>

        <section className="volunteer-drawer__section">
          <h3>Profil &amp; Kemampuan</h3>
          <div className="volunteer-drawer__chips">
            {applicant.skills.length === 0 && <span className="volunteer-drawer__muted">Belum ada skill tercatat</span>}
            {applicant.skills.map((s) => (
              <span key={s} className="volunteer-drawer__chip">{s}</span>
            ))}
          </div>
          <p className="volunteer-drawer__meta">Minat: {applicant.interests.join(', ') || '—'}</p>
          <p className="volunteer-drawer__meta">Ketersediaan: {applicant.availability.join(', ') || '—'}</p>
          <p className="volunteer-drawer__meta">Kegiatan selesai sebelumnya: {applicant.previousEventsCompleted}</p>
        </section>

        <section className="volunteer-drawer__section">
          <h3>Data Operasional</h3>
          <div className="volunteer-drawer__row">
            <span className="volunteer-drawer__meta">Status pipeline</span>
            <Badge variant={STATUS_VARIANT[applicant.status]}>{STATUS_LABEL[applicant.status]}</Badge>
          </div>
          <div className="volunteer-drawer__row">
            <span className="volunteer-drawer__meta">Requirement</span>
            <span>{REQUIREMENT_LABEL[applicant.requirementStatus]}</span>
          </div>
          <div className="volunteer-drawer__row">
            <span className="volunteer-drawer__meta">Assignment</span>
            <span>
              {assignedRole ? `${assignedRole.roleName}${assignedShift ? ` — ${assignedShift.shiftDate} ${assignedShift.startTime}` : ''}` : 'Belum di-assign'}
            </span>
          </div>
        </section>

        <section className="volunteer-drawer__section">
          <h3>Catatan Internal</h3>
          <ul className="volunteer-drawer__notes">
            {applicant.notes.length === 0 && <li className="volunteer-drawer__muted">Belum ada catatan.</li>}
            {applicant.notes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
          <div className="volunteer-drawer__note-form">
            <textarea
              placeholder="Tambah catatan internal..."
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              rows={2}
            />
            <button type="button" className="btn btn--outline btn--sm" onClick={handleAddNote}>
              Tambah Catatan
            </button>
          </div>
        </section>

        {(applicant.status === 'applied' || applicant.status === 'under_review') && (
          <div className="volunteer-drawer__actions">
            <button type="button" className="btn btn--primary btn--sm" onClick={() => onStatusChange('accepted')}>
              <FiCheck /> Accept
            </button>
            <button type="button" className="btn btn--outline btn--sm" onClick={() => onStatusChange('waitlisted')}>
              <FiClock /> Waitlist
            </button>
            <button type="button" className="btn btn--danger btn--sm" onClick={() => onStatusChange('rejected')}>
              <FiUserX /> Reject
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}
