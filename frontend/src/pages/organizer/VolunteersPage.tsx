import React from 'react'
import { useLocation } from 'react-router-dom'
import { FiDownload, FiUserPlus } from 'react-icons/fi'
import AllVolunteersView from './volunteers-views/AllVolunteersView'
import AcceptedVolunteersView from './volunteers-views/AcceptedVolunteersView'
import ActiveVolunteersView from './volunteers-views/ActiveVolunteersView'
import CompletedVolunteersView from './volunteers-views/CompletedVolunteersView'
import NoShowVolunteersView from './volunteers-views/NoShowVolunteersView'
import './VolunteersPage.css'

export default function VolunteersPage() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const statusParam = searchParams.get('status')

  const renderView = () => {
    switch (statusParam) {
      case 'accepted':
        return <AcceptedVolunteersView />
      case 'active':
        return <ActiveVolunteersView />
      case 'completed':
        return <CompletedVolunteersView />
      case 'no_show':
        return <NoShowVolunteersView />
      default:
        return <AllVolunteersView />
    }
  }

  const getTitle = () => {
    switch (statusParam) {
      case 'accepted': return 'Accepted Volunteers'
      case 'active': return 'Active Volunteers'
      case 'completed': return 'Completed Volunteers'
      case 'no_show': return 'No-show Volunteers'
      default: return 'All Volunteers'
    }
  }

  const getSubtitle = () => {
    switch (statusParam) {
      case 'accepted': return 'Manage operational preparations and pending requirements for upcoming events.'
      case 'active': return 'Monitor live attendance and current status of volunteers on duty.'
      case 'completed': return 'Review post-event history, certificates, and impact scores.'
      case 'no_show': return 'Track unreliable volunteers, warnings, and attendance history.'
      default: return 'Manage and monitor all volunteers across your organization.'
    }
  }

  return (
    <div className="volunteers-crm" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      {/* Universal Page Header that updates based on context */}
      <header className="v-header">
        <div className="v-header__title">
          <h1>{getTitle()}</h1>
          <p className="v-header__subtitle">{getSubtitle()}</p>
        </div>
        <div className="v-header__actions">
          <button type="button" className="btn btn--outline btn--sm"><FiDownload /> Download Report</button>
          <button type="button" className="btn btn--outline btn--sm"><FiDownload /> Export Data</button>
          <button type="button" className="btn btn--primary btn--sm"><FiUserPlus /> Invite Volunteer</button>
        </div>
      </header>

      {/* Render the contextual content area below the header */}
      {renderView()}
    </div>
  )
}
