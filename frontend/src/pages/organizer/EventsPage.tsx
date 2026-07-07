import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { FiUpload, FiDownload, FiPlus } from 'react-icons/fi'

import AllEventsView from './events-views/AllEventsView'
import DraftEventsView from './events-views/DraftEventsView'
import PublishedEventsView from './events-views/PublishedEventsView'
import OngoingEventsView from './events-views/OngoingEventsView'
import CompletedEventsView from './events-views/CompletedEventsView'
import ArchivedEventsView from './events-views/ArchivedEventsView'

import './EventsPage.css'
import '../admin/OverviewPage.css' // Import admin dashboard header styles

export default function EventsPage() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const statusParam = searchParams.get('status')

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
            <button type="button" className="admin-dashboard-btn"><FiUpload /> Import Event</button>
            <button type="button" className="admin-dashboard-btn"><FiDownload /> Export</button>
            <Link to="/organizer/events/new" className="admin-dashboard-btn admin-dashboard-btn--dark" style={{ textDecoration: 'none' }}><FiPlus /> Create Event</Link>
          </div>
        </div>
      </div>

      {/* Render the contextual content area below the header */}
      {renderView()}
    </div>
  )
}
