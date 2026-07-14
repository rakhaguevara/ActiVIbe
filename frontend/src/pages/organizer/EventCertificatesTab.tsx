import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { EventDetailOutletContext } from './EventDetailPage'
import QueueCertificatesView from './certificates-views/QueueCertificatesView'
import GeneratedCertificatesView from './certificates-views/GeneratedCertificatesView'
import FailedCertificatesView from './certificates-views/FailedCertificatesView'
import RegenerateCertificatesView from './certificates-views/RegenerateCertificatesView'
import './CertificatesPage.css'

type CertTab = 'queue' | 'generated' | 'failed' | 'regenerate'

const TABS: { key: CertTab; label: string }[] = [
  { key: 'queue', label: 'Queue' },
  { key: 'generated', label: 'Generated' },
  { key: 'failed', label: 'Failed' },
  { key: 'regenerate', label: 'Regenerate' },
]

// Versi ter-scope-per-event dari CertificatesPage.tsx (hub lintas-event) —
// pakai view yang sama persis, cuma disuplai eventId supaya query-nya
// terfilter ke event ini saja (lihat GET /certificates/queue?eventId=...).
export default function EventCertificatesTab() {
  const { event } = useOutletContext<EventDetailOutletContext>()
  const [activeTab, setActiveTab] = useState<CertTab>('queue')

  const renderView = () => {
    switch (activeTab) {
      case 'generated':
        return <GeneratedCertificatesView eventId={event.id} />
      case 'failed':
        return <FailedCertificatesView eventId={event.id} />
      case 'regenerate':
        return <RegenerateCertificatesView eventId={event.id} />
      case 'queue':
      default:
        return <QueueCertificatesView eventId={event.id} />
    }
  }

  return (
    <div className="certs-hub" style={{ padding: 0 }}>
      <div className="event-detail__tabs" style={{ marginBottom: 'var(--space-md)' }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={activeTab === tab.key ? 'is-active' : ''}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderView()}
    </div>
  )
}
