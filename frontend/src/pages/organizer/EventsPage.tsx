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
      <header className="events-header">
        <div className="events-header__title">
          <h1>{getTitle()}</h1>
          <p className="events-header__subtitle">{getSubtitle()}</p>
        </div>
        <div className="events-header__actions">
          <button type="button" className="btn btn--outline btn--sm"><FiUpload /> Import Event</button>
          <button type="button" className="btn btn--outline btn--sm"><FiDownload /> Export</button>
          <Link to="/organizer/events/new" className="btn btn--primary btn--sm"><FiPlus /> Create Event</Link>
        </div>
      </header>

      {/* Render the contextual content area below the header */}
      {renderView()}
    </div>
  )
}
