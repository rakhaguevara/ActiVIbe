import React from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { FiUpload, FiDownload, FiPlus } from 'react-icons/fi'

import AllEventsView from './events-views/AllEventsView'
import DraftEventsView from './events-views/DraftEventsView'
import PublishedEventsView from './events-views/PublishedEventsView'
import OngoingEventsView from './events-views/OngoingEventsView'
import CompletedEventsView from './events-views/CompletedEventsView'
import ArchivedEventsView from './events-views/ArchivedEventsView'
import EventsOverviewView from './events-views/EventsOverviewView'
import SubOrganizerView from './events-views/SubOrganizerView'
import { useOrganizerData } from '../../contexts/OrganizerDataContext'
import { downloadCsv, toCsvValue } from '../../utils/reportExport'

import './EventsPage.css'
import '../admin/OverviewPage.css' // Import admin dashboard header styles

export default function EventsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(location.search)
  const statusParam = searchParams.get('status')
  const { events, applicants } = useOrganizerData()

  const handleExportEvents = () => {
    const header = ['Judul', 'Status', 'Kategori', 'Lokasi', 'Tanggal Mulai', 'Tanggal Selesai', 'Kuota', 'Jumlah Pendaftar']
    const rows = events.map((e) => [
      e.title,
      e.status,
      e.category ?? '—',
      e.location,
      e.startDate,
      e.endDate,
      e.quota,
      applicants.filter((a) => a.eventId === e.id).length,
    ])
    const csv = [header, ...rows].map((row) => row.map(toCsvValue).join(',')).join('\n')
    downloadCsv(csv, `daftar-event-${Date.now()}.csv`)
  }

  const renderView = () => {
    switch (statusParam) {
      case 'draft':
        return <DraftEventsView />
      case 'published':
        return <PublishedEventsView />
      case 'ongoing':
        return <OngoingEventsView />
      case 'completed':
        return <CompletedEventsView />
      case 'archived':
        return <ArchivedEventsView />
      case 'overview':
        return <EventsOverviewView />
      case 'sub-organizer':
        return <SubOrganizerView />
      default:
        return <AllEventsView />
    }
  }

  const getTitle = () => {
    switch (statusParam) {
      case 'draft': return 'Draft Events'
      case 'published': return 'Published Events'
      case 'ongoing': return 'Ongoing Events'
      case 'completed': return 'Completed Events'
      case 'archived': return 'Archived Events'
      case 'overview': return 'Events Overview'
      case 'sub-organizer': return 'Sub Organizer'
      default: return 'All Events'
    }
  }

  const getSubtitle = () => {
    switch (statusParam) {
      case 'draft': return 'Finish setting up these events before making them public.'
      case 'published': return 'Monitor registration performance and applicant statistics.'
      case 'ongoing': return 'Support live event operations and track real-time attendance.'
      case 'completed': return 'Review finished events, feedback, and generate reports.'
      case 'archived': return 'Access read-only historical events and their impact data.'
      case 'overview': return 'Aggregate performance and impact across every event you organize.'
      case 'sub-organizer': return 'Kelola kontak koordinator/PIC yang bisa dipakai ulang di event mana pun.'
      default: return 'Provide a complete overview of every event in your organization.'
    }
  }

  return (
    <div className="events-hub" style={{ flexDirection: 'column', gap: 'var(--space-md)' }}>
      {/* 1. Universal Page Header */}
      <div className="admin-dashboard-header">
        <div className="admin-dashboard-header__top">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h1 className="admin-dashboard-header__title">{getTitle()}</h1>
            <p className="events-header__subtitle" style={{ margin: 0, fontSize: '0.9rem' }}>{getSubtitle()}</p>
          </div>
          <div className="admin-dashboard-header__top-actions">
            {/* No extra buttons here as requested */}
          </div>
        </div>
        
        <div className="admin-dashboard-header__bottom">
          <div className="admin-dashboard-header__updated">
            {/* Empty space to push actions to the right */}
          </div>
          <div className="admin-dashboard-header__bottom-right">
            {statusParam !== 'sub-organizer' && (
              <>
                {/* Bulk CSV import adalah fitur besar tersendiri (parsing,
                    validasi baris, error report per baris) — di luar scope
                    Phase 6 (dikonfirmasi deliberate descope di plan). Tombol
                    ini diarahkan ke alur Create Event yang sudah ada,
                    bukan dibiarkan mati. */}
                <button type="button" className="admin-dashboard-btn" onClick={() => navigate('/organizer/events/new')}>
                  <FiUpload /> Import Event
                </button>
                <button type="button" className="admin-dashboard-btn" onClick={handleExportEvents} disabled={events.length === 0}>
                  <FiDownload /> Export
                </button>
                <Link to="/organizer/events/new" className="admin-dashboard-btn admin-dashboard-btn--dark" style={{ textDecoration: 'none' }}><FiPlus /> Create Event</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Render the contextual content area below the header */}
      {renderView()}
    </div>
  )
}
