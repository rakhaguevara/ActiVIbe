import React from 'react'
import { useLocation } from 'react-router-dom'
import { FiMessageSquare } from 'react-icons/fi'

import BroadcastView from './communication-views/BroadcastView'
import ScheduledMessagesView from './communication-views/ScheduledMessagesView'
import TemplatesView from './communication-views/TemplatesView'
import CommunicationLogView from './communication-views/CommunicationLogView'

import './CommunicationPage.css'

export default function CommunicationPage() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const tabParam = searchParams.get('tab')

  const renderView = () => {
    switch (tabParam) {
      case 'scheduled':
        return <ScheduledMessagesView />
      case 'templates':
        return <TemplatesView />
      case 'log':
        return <CommunicationLogView />
      case 'broadcast':
      default:
        return <BroadcastView />
    }
  }

  const getTitle = () => {
    switch (tabParam) {
      case 'scheduled': return 'Scheduled Messages'
      case 'templates': return 'Message Templates'
      case 'log': return 'Communication Log'
      case 'broadcast': 
      default: return 'Communication Broadcast'
    }
  }

  const getSubtitle = () => {
    switch (tabParam) {
      case 'scheduled': return 'Manage automated messages that will be sent in the future.'
      case 'templates': return 'Create and manage reusable communication templates.'
      case 'log': return 'Audit all communication history and analyze engagement metrics.'
      case 'broadcast': 
      default: return 'Create announcements and communicate directly with volunteers.'
    }
  }

  return (
    <div className="comm-hub">
      {/* Universal Page Header */}
      <header className="comm-header">
        <div className="comm-header__title">
          <h1>{getTitle()}</h1>
          <p className="comm-header__subtitle">{getSubtitle()}</p>
        </div>
        <div className="comm-header__actions">
          {tabParam !== 'templates' && tabParam !== 'log' && (
            <button type="button" className="btn btn--outline btn--sm">Save Draft</button>
          )}
          {tabParam === 'templates' && (
            <button type="button" className="btn btn--primary btn--sm">Create Template</button>
          )}
          {tabParam === 'log' && (
            <button type="button" className="btn btn--outline btn--sm">Export Analytics</button>
          )}
          {(tabParam === 'broadcast' || !tabParam) && (
            <button type="button" className="btn btn--primary btn--sm" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiMessageSquare /> New Broadcast
            </button>
          )}
        </div>
      </header>

      {/* Render the contextual content area below the header */}
      {renderView()}
    </div>
  )
}
