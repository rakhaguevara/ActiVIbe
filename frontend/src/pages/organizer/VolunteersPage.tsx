import React, { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { FiDownload, FiUserPlus } from 'react-icons/fi'
import AllVolunteersView from './volunteers-views/AllVolunteersView'
import AcceptedVolunteersView from './volunteers-views/AcceptedVolunteersView'
import ActiveVolunteersView from './volunteers-views/ActiveVolunteersView'
import CompletedVolunteersView from './volunteers-views/CompletedVolunteersView'
import NoShowVolunteersView from './volunteers-views/NoShowVolunteersView'
import SectionState from '../../components/SectionState'
import { getOrganizerVolunteersRequest } from '../../lib/organizerApi'
import type { OrganizerVolunteersResponse } from '../../types/organizer'
import './VolunteersPage.css'
import '../admin/OverviewPage.css'

export default function VolunteersPage() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const statusParam = searchParams.get('status')

  const [data, setData] = useState<OrganizerVolunteersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getOrganizerVolunteersRequest()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data volunteer.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const renderView = () => {
    if (loading) {
      return (
        <div className="volunteers-crm">
          <div className="v-kpi-grid">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton sk-card" />)}
          </div>
          <div className="skeleton sk-table" />
        </div>
      )
    }

    if (error || !data) {
      return (
        <SectionState
          variant="error"
          title="Gagal memuat data volunteer"
          description={error ?? undefined}
          onRetry={load}
        />
      )
    }

    switch (statusParam) {
      case 'accepted':
        return <AcceptedVolunteersView data={data} />
      case 'active':
        return <ActiveVolunteersView data={data} />
      case 'completed':
        return <CompletedVolunteersView data={data} />
      case 'no_show':
        return <NoShowVolunteersView data={data} />
      default:
        return <AllVolunteersView data={data} />
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
      <div className="admin-dashboard-header">
        <div className="admin-dashboard-header__top">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h1 className="admin-dashboard-header__title">{getTitle()}</h1>
            <p className="events-header__subtitle" style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-body)' }}>{getSubtitle()}</p>
          </div>
          <div className="admin-dashboard-header__top-actions">
          </div>
        </div>
        
        <div className="admin-dashboard-header__bottom">
          <div className="admin-dashboard-header__updated">
          </div>
          <div className="admin-dashboard-header__bottom-right">
            <button type="button" className="admin-dashboard-btn"><FiDownload /> Download Report</button>
            <button type="button" className="admin-dashboard-btn"><FiDownload /> Export Data</button>
            <button type="button" className="admin-dashboard-btn admin-dashboard-btn--dark"><FiUserPlus /> Invite Volunteer</button>
          </div>
        </div>
      </div>

      {/* Render the contextual content area below the header */}
      {renderView()}
    </div>
  )
}
