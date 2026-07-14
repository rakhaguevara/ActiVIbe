import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiDownload, FiUserPlus } from 'react-icons/fi'
import AllVolunteersView from './volunteers-views/AllVolunteersView'
import AcceptedVolunteersView from './volunteers-views/AcceptedVolunteersView'
import ActiveVolunteersView from './volunteers-views/ActiveVolunteersView'
import CompletedVolunteersView from './volunteers-views/CompletedVolunteersView'
import NoShowVolunteersView from './volunteers-views/NoShowVolunteersView'
import SectionState from '../../components/SectionState'
import { getOrganizerVolunteersRequest } from '../../lib/organizerApi'
import { getMyOrganization } from '../../lib/organizationApi'
import { buildVolunteersCsv, buildVolunteersListPdf, downloadCsv, downloadPdf } from '../../utils/reportExport'
import type { OrganizerVolunteersResponse } from '../../types/organizer'
import './VolunteersPage.css'
import '../admin/OverviewPage.css'

export default function VolunteersPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(location.search)
  const statusParam = searchParams.get('status')

  const [data, setData] = useState<OrganizerVolunteersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState<'report' | 'data' | null>(null)

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

  // "Download Report" (PDF) & "Export Data" (CSV) — dua format berbeda utk
  // daftar volunteer yang sama (OrganizerVolunteer[] yang sudah di-load di
  // atas), bukan dua fitur beda. "Invite Volunteer" belum punya sistem
  // undangan volunteer tersendiri — deep-link ke composer broadcast yang
  // sudah nyata, pola sama dgn kebab menu "Kirim Pesan" di volunteers-views/*.
  const handleDownloadReport = async () => {
    if (!data || isExporting) return
    setIsExporting('report')
    try {
      const organization = await getMyOrganization().catch(() => null)
      const bytes = await buildVolunteersListPdf(data.volunteers, organization?.name ?? 'Organisasi')
      downloadPdf(bytes, `laporan-volunteer-${Date.now()}.pdf`)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal membuat laporan volunteer.')
    } finally {
      setIsExporting(null)
    }
  }

  const handleExportData = () => {
    if (!data || isExporting) return
    setIsExporting('data')
    try {
      downloadCsv(buildVolunteersCsv(data.volunteers), `daftar-volunteer-${Date.now()}.csv`)
    } finally {
      setIsExporting(null)
    }
  }

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
            <button type="button" className="admin-dashboard-btn" onClick={handleDownloadReport} disabled={!data || isExporting !== null}>
              <FiDownload /> {isExporting === 'report' ? 'Membuat laporan...' : 'Download Report'}
            </button>
            <button type="button" className="admin-dashboard-btn" onClick={handleExportData} disabled={!data || isExporting !== null}>
              <FiDownload /> Export Data
            </button>
            <button type="button" className="admin-dashboard-btn admin-dashboard-btn--dark" onClick={() => navigate('/organizer/communication?tab=broadcast')}>
              <FiUserPlus /> Invite Volunteer
            </button>
          </div>
        </div>
      </div>

      {/* Render the contextual content area below the header */}
      {renderView()}
    </div>
  )
}
