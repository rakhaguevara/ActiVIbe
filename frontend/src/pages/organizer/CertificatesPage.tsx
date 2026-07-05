import React from 'react'
import { useLocation } from 'react-router-dom'
import { FiRefreshCw, FiPlay } from 'react-icons/fi'

import QueueCertificatesView from './certificates-views/QueueCertificatesView'
import GeneratedCertificatesView from './certificates-views/GeneratedCertificatesView'
import FailedCertificatesView from './certificates-views/FailedCertificatesView'
import RegenerateCertificatesView from './certificates-views/RegenerateCertificatesView'

import './CertificatesPage.css'

export default function CertificatesPage() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const tabParam = searchParams.get('tab')

  const renderView = () => {
    switch (tabParam) {
      case 'generated':
        return <GeneratedCertificatesView />
      case 'failed':
        return <FailedCertificatesView />
      case 'regenerate':
        return <RegenerateCertificatesView />
      case 'queue':
      default:
        return <QueueCertificatesView />
    }
  }

  const getTitle = () => {
    switch (tabParam) {
      case 'generated': return 'Generated Certificates'
      case 'failed': return 'Failed Generation Jobs'
      case 'regenerate': return 'Re-generate Certificates'
      case 'queue': 
      default: return 'Certificate Generation Queue'
    }
  }

  const getSubtitle = () => {
    switch (tabParam) {
      case 'generated': return 'Manage and share successfully generated volunteer certificates.'
      case 'failed': return 'Handle certificate generation failures and resolve missing requirements.'
      case 'regenerate': return 'Regenerate certificates after corrections or data updates.'
      case 'queue': 
      default: return 'Generate certificates for volunteers who successfully completed events.'
    }
  }

  return (
    <div className="certs-hub">
      {/* Universal Page Header */}
      <header className="certs-header">
        <div className="certs-header__title">
          <h1>{getTitle()}</h1>
          <p className="certs-header__subtitle">{getSubtitle()}</p>
        </div>
        <div className="certs-header__actions">
          {(tabParam === 'queue' || !tabParam) && (
            <>
              <button type="button" className="btn btn--outline btn--sm"><FiRefreshCw /> Refresh Queue</button>
              <button type="button" className="btn btn--primary btn--sm"><FiPlay /> Generate Selected</button>
            </>
          )}
        </div>
      </header>

      {/* Render the contextual content area below the header */}
      {renderView()}
    </div>
  )
}
