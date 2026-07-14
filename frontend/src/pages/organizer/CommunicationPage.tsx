import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiMessageSquare } from 'react-icons/fi'

import BroadcastView from './communication-views/BroadcastView'
import ScheduledMessagesView from './communication-views/ScheduledMessagesView'
import TemplatesView from './communication-views/TemplatesView'
import CommunicationLogView, { exportBroadcastsCsv } from './communication-views/CommunicationLogView'
import { listBroadcasts } from '../../lib/communicationApi'

import './CommunicationPage.css'

export default function CommunicationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(location.search)
  const tabParam = searchParams.get('tab')
  const [exporting, setExporting] = useState(false)

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

  // "Create Template" — TemplatesView & header ini sibling di bawah parent yang
  // sama, jadi dibanding lift state, cukup navigasi dgn query param ?new=1
  // yang dibaca TemplatesView saat mount utk mereset Quick Editor ke mode baru.
  const handleCreateTemplate = () => {
    navigate('/organizer/communication?tab=templates&new=1')
  }

  // "Export Analytics" — sama persis data & builder CSV dgn tombol "Export Log"
  // di dalam CommunicationLogView (diekspor dari sana supaya tidak duplikasi
  // logic toCsvValue/Blob-download).
  const handleExportAnalytics = async () => {
    setExporting(true)
    try {
      const data = await listBroadcasts()
      exportBroadcastsCsv(data)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal mengekspor log komunikasi.')
    } finally {
      setExporting(false)
    }
  }

  // "New Broadcast" — BroadcastView di tab ini SUDAH punya composer kerja utuh
  // persis di bawah header yang sama, jadi tombol ini sengaja tidak membuka
  // composer baru (duplikasi) — cukup scroll & fokus ke input judulnya.
  const handleFocusComposer = () => {
    const input = document.getElementById('broadcast-composer-title')
    input?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    ;(input as HTMLInputElement | null)?.focus()
  }

  return (
    <div className="comm-hub">
      {/* Universal Page Header */}
      <header className="comm-header">
        <div className="comm-header__title">
          <h1>{getTitle()}</h1>
          <p className="comm-header__subtitle">{getSubtitle()}</p>
        </div>
        {/* "Save Draft" (mock lama, muncul di tab broadcast & scheduled) dihapus —
            draft pesan sekarang difasilitasi lewat Message Templates (simpan pesan
            reusable via TemplatesView), bukan mekanisme draft terpisah. */}
        <div className="comm-header__actions">
          {tabParam === 'templates' && (
            <button type="button" className="btn btn--primary btn--sm" onClick={handleCreateTemplate}>Create Template</button>
          )}
          {tabParam === 'log' && (
            <button type="button" className="btn btn--outline btn--sm" onClick={handleExportAnalytics} disabled={exporting}>
              {exporting ? 'Mengekspor...' : 'Export Analytics'}
            </button>
          )}
          {(tabParam === 'broadcast' || !tabParam) && (
            <button type="button" className="btn btn--primary btn--sm" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleFocusComposer}>
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
