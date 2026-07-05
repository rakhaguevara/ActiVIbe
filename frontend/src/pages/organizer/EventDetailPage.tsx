import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import { useOrganizerData } from '../../contexts/OrganizerDataContext'
import { formatDateShort } from '../../utils/formatDate'
import './EventDetailPage.css'

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
  const { events, applicants } = useOrganizerData()

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

  return (
    <div className="event-detail">
      <header className="event-detail__header">
        <div>
          <h1>{event.title}</h1>
          <p>{event.location} &middot; {formatDateShort(event.startDate)}&ndash;{formatDateShort(event.endDate)}</p>
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

      <Outlet context={{ event, eventApplicants }} />
    </div>
  )
}
