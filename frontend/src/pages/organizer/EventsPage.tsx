import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiPlus } from 'react-icons/fi'
import { useOrganizerData } from '../../contexts/OrganizerDataContext'
import Badge from '../../components/Badge'
import ScrollPane from '../../components/ScrollPane'
import CloseEventWizard from '../../components/organizer/CloseEventWizard'
import type { OrganizerEvent, OrganizerEventStatus } from '../../types/organizer'
import { formatDateShort } from '../../utils/formatDate'
import './EventsPage.css'

const TODAY = new Date().toISOString().slice(0, 10)

const STATUS_LABEL: Record<OrganizerEventStatus, string> = {
  draft: 'Draft',
  pending_approval: 'Menunggu Persetujuan',
  published: 'Published',
  ongoing: 'Ongoing',
  completed: 'Completed',
  rejected: 'Ditolak',
}

const STATUS_VARIANT: Record<OrganizerEventStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  draft: 'info',
  pending_approval: 'warning',
  published: 'success',
  ongoing: 'success',
  completed: 'info',
  rejected: 'danger',
}

export default function EventsPage() {
  const { events, applicants, closeEvent } = useOrganizerData()
  const navigate = useNavigate()
  const [closingEvent, setClosingEvent] = useState<OrganizerEvent | null>(null)

  const needsClosing = (event: OrganizerEvent) =>
    (event.status === 'published' || event.status === 'ongoing') && event.endDate < TODAY

  return (
    <div className="organizer-events">
      <header className="organizer-events__header">
        <div>
          <h1>Events</h1>
          <p>Kelola seluruh kegiatan volunteer yang kamu selenggarakan.</p>
        </div>
        <Link to="/organizer/events/new" className="btn btn--primary btn--sm">
          <FiPlus /> Buat Event Baru
        </Link>
      </header>

      <ScrollPane>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Kegiatan</th>
              <th>Lokasi</th>
              <th>Tanggal</th>
              <th>Kuota</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td className="organizer-events__title" onClick={() => navigate(`/organizer/events/${event.id}`)}>
                  {event.title}
                </td>
                <td>{event.location}</td>
                <td>{formatDateShort(event.startDate)}</td>
                <td>{event.quota}</td>
                <td>
                  <Badge variant={STATUS_VARIANT[event.status]}>{STATUS_LABEL[event.status]}</Badge>
                </td>
                <td>
                  <div className="organizer-events__actions">
                    <Link to={`/organizer/events/${event.id}`} className="btn btn--outline btn--sm">
                      Detail
                    </Link>
                    {needsClosing(event) && (
                      <button type="button" className="btn btn--primary btn--sm" onClick={() => setClosingEvent(event)}>
                        Tutup Event
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollPane>

      {closingEvent && (
        <CloseEventWizard
          event={closingEvent}
          applicants={applicants.filter(
            (a) => a.eventId === closingEvent.id && (a.assignedRoleId || a.status === 'accepted' || a.status === 'checked_in'),
          )}
          onClose={() => setClosingEvent(null)}
          onConfirm={(result) => closeEvent(closingEvent.id, result)}
        />
      )}
    </div>
  )
}
