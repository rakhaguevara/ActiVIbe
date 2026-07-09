import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import { useOrganizerData } from '../../contexts/OrganizerDataContext'
import { formatDateShort } from '../../utils/formatDate'
import CloseEventWizard from '../../components/organizer/CloseEventWizard'
import { canCloseEvent, canCloseRegistration } from '../../lib/eventLifecycle'
import type { Applicant, OrganizerEvent } from '../../types/organizer'
import './EventDetailPage.css'

export interface EventDetailOutletContext {
  event: OrganizerEvent
  eventApplicants: Applicant[]
  openCloseWizard: () => void
}

const EVENT_TABS = [
  { to: '', label: 'Overview', end: true },
  { to: 'applicants', label: 'Applicants' },
  { to: 'roles', label: 'Roles & Shifts' },
  { to: 'assignments', label: 'Assignments' },
  { to: 'requirements', label: 'Requirements' },
  { to: 'attendance', label: 'Attendance' },
  { to: 'communication', label: 'Communication' },
  { to: 'impact', label: 'Impact & Close Event' },
  { to: 'certificates', label: 'Certificates' },
]

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const { events, applicants, closeEvent, closeRegistration } = useOrganizerData()
  const [showCloseWizard, setShowCloseWizard] = useState(false)

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
  // Volunteer yang eligible dimasukkan ke close-event wizard — hanya yang
  // sudah di-assign role/shift ATAU sudah accepted/checked_in (sama dgn
  // filter yang sebelumnya cuma ada di ImpactTab.tsx).
  const closableApplicants = eventApplicants.filter(
    (a) => a.assignedRoleId || a.status === 'accepted' || a.status === 'checked_in',
  )

  const eventIsCompleted = event.status === 'completed'
  const registrationClosable = canCloseRegistration(event)
  const eventClosable = canCloseEvent(event)

  const handleCloseRegistration = () => {
    if (!registrationClosable) return
    if (window.confirm('Tutup pendaftaran untuk event ini? Volunteer baru tidak akan bisa mendaftar lagi.')) {
      closeRegistration(event.id)
    }
  }

  const handleCloseEventClick = () => {
    if (eventClosable) {
      setShowCloseWizard(true)
    } else {
      window.alert('Event belum bisa ditutup. Pastikan event sudah melewati tanggal selesai (' + event.endDate + ').')
    }
  }

  const outletContext: EventDetailOutletContext = {
    event,
    eventApplicants,
    openCloseWizard: () => setShowCloseWizard(true),
  }

  return (
    <div className="event-detail">
      <header className="event-detail__header">
        <div>
          <h1>{event.title}</h1>
          <p>{event.location} &middot; {formatDateShort(event.startDate)}&ndash;{formatDateShort(event.endDate)}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
            disabled={!registrationClosable}
            onClick={handleCloseRegistration}
          >
            {event.registrationClosedAt ? 'Pendaftaran Ditutup' : 'Close Pendaftaran'}
          </button>
          <button
            type="button"
            className="btn btn--danger btn--sm"
            disabled={eventIsCompleted}
            onClick={handleCloseEventClick}
          >
            Close Event
          </button>
        </div>
      </header>

      <div className="event-detail__tabs">
        {EVENT_TABS.map((tab) => (
          <NavLink
            key={tab.label}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => (isActive ? 'is-active' : '')}
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <Outlet context={outletContext} />

      {showCloseWizard && (
        <CloseEventWizard
          event={event}
          applicants={closableApplicants}
          onClose={() => setShowCloseWizard(false)}
          onConfirm={(result) => closeEvent(event.id, result)}
        />
      )}
    </div>
  )
}
