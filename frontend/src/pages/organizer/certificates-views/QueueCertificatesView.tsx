import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiClock, FiCheckCircle, FiRefreshCw, FiPlay } from 'react-icons/fi'
import {
  getCertificateQueueRequest,
  generateCertificateRequest,
  generateCertificatesBulkRequest,
} from '../../../lib/organizerApi'
import { getMySubscription } from '../../../lib/subscriptionApi'
import type { CertificateQueueItem } from '../../../types/organizer'
import '../CertificatesPage.css'

const STATUS_LABEL: Record<CertificateQueueItem['status'], string> = {
  CHECKED_IN: 'Sudah Check-in',
  COMPLETED: 'Selesai',
}

export default function QueueCertificatesView() {
  const [queue, setQueue] = useState<CertificateQueueItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [isBulkGenerating, setIsBulkGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quota, setQuota] = useState<{ used: number; limit: number | null } | null>(null)

  const loadData = async () => {
    const [items, subscription] = await Promise.all([getCertificateQueueRequest(), getMySubscription()])
    setQueue(items)
    setSelected(new Set())
    if (subscription.usage) {
      setQuota({ used: subscription.usage.certificateEventsThisMonth, limit: subscription.plan.limits.certificateEventsPerMonth })
    }
  }

  useEffect(() => {
    setIsLoading(true)
    loadData()
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat antrean sertifikat.'))
      .finally(() => setIsLoading(false))
  }, [])

  const toggleSelected = (applicationId: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(applicationId)) next.delete(applicationId)
      else next.add(applicationId)
      return next
    })
  }

  const handleGenerateOne = async (applicationId: string) => {
    setGeneratingId(applicationId)
    setError(null)
    try {
      await generateCertificateRequest(applicationId)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menerbitkan sertifikat.')
    } finally {
      setGeneratingId(null)
    }
  }

  const handleGenerateSelected = async () => {
    if (selected.size === 0) return
    setIsBulkGenerating(true)
    setError(null)
    try {
      const result = await generateCertificatesBulkRequest([...selected])
      if (result.failed.length > 0) {
        setError(result.failed[0].reason)
      }
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menerbitkan sertifikat.')
    } finally {
      setIsBulkGenerating(false)
    }
  }

  return (
    <>
      <div className="certs-header__actions" style={{ marginBottom: 'var(--space-md)' }}>
        <button type="button" className="btn btn--outline btn--sm" disabled={isLoading} onClick={() => loadData()}>
          <FiRefreshCw /> Refresh Queue
        </button>
        <button
          type="button"
          className="btn btn--primary btn--sm"
          disabled={selected.size === 0 || isBulkGenerating}
          onClick={handleGenerateSelected}
        >
          <FiPlay /> {isBulkGenerating ? 'Menerbitkan...' : `Generate Selected (${selected.size})`}
        </button>
      </div>

      <div className="events-stats-grid" style={{ gridTemplateColumns: quota ? 'repeat(2, 1fr)' : '1fr' }}>
        <div className="stat-card">
          <div className="stat-card__icon"><FiClock /></div>
          <div className="stat-card__value">{queue.length}</div>
          <div className="stat-card__label">Menunggu Diterbitkan</div>
        </div>
        {quota && (
          <div className="stat-card">
            <div className="stat-card__icon" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-soft)' }}><FiCheckCircle /></div>
            <div className="stat-card__value">{quota.limit === null ? `${quota.used}` : `${quota.used}/${quota.limit}`}</div>
            <div className="stat-card__label">Event Bersertifikat Bulan Ini</div>
          </div>
        )}
      </div>

      {error && (
        <div className="card" style={{ padding: '12px 16px', margin: '16px 0', borderColor: 'var(--color-warning)', background: 'var(--color-accent-yellow-soft)', fontSize: '13px' }}>
          {error} <Link to="/organizer/organization?tab=subscription" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Upgrade ActiVibe Plus</Link>
        </div>
      )}

      <section className="card" style={{ padding: '24px', marginTop: 'var(--space-md)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Generation Queue</h2>

        {!isLoading && queue.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>Belum ada volunteer yang eligible (checked-in/selesai) menunggu sertifikat.</p>
        ) : (
          <div className="v-table-wrapper">
            <table className="v-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Volunteer</th>
                  <th>Event</th>
                  <th>Status Kehadiran</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((item) => (
                  <tr key={item.applicationId}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(item.applicationId)}
                        onChange={() => toggleSelected(item.applicationId)}
                      />
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.volunteerName}</td>
                    <td>{item.eventTitle}</td>
                    <td><span className="badge badge--success">{STATUS_LABEL[item.status]}</span></td>
                    <td>
                      <button
                        type="button"
                        className="btn btn--sm btn--primary"
                        disabled={generatingId === item.applicationId}
                        onClick={() => handleGenerateOne(item.applicationId)}
                      >
                        {generatingId === item.applicationId ? 'Menerbitkan...' : 'Generate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}
