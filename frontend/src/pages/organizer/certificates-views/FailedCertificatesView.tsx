import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi'
import { listFailedCertificatesRequest, generateCertificateRequest } from '../../../lib/organizerApi'
import type { FailedCertificateCandidate } from '../../../types/organizer'
import '../CertificatesPage.css'

const REASON_LABEL: Record<FailedCertificateCandidate['reason'], string> = {
  no_active_template: 'Belum ada template sertifikat aktif',
  quota_exceeded: 'Kuota sertifikat ActiVibe Plus bulan ini sudah habis',
}

export default function FailedCertificatesView() {
  const [candidates, setCandidates] = useState<FailedCertificateCandidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [retryingId, setRetryingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadData = () => {
    setIsLoading(true)
    return listFailedCertificatesRequest()
      .then(setCandidates)
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat daftar sertifikat gagal.'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRetry = async (item: FailedCertificateCandidate) => {
    setRetryingId(item.applicationId)
    setError(null)
    try {
      await generateCertificateRequest(item.applicationId)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Masih gagal, coba lagi nanti.')
    } finally {
      setRetryingId(null)
    }
  }

  const hasQuotaIssue = candidates.some((c) => c.reason === 'quota_exceeded')

  return (
    <>
      <div className="events-stats-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-danger)', background: 'var(--color-danger-soft)' }}><FiAlertTriangle /></div>
          <div className="stat-card__value">{candidates.length}</div>
          <div className="stat-card__label">Volunteer Tertahan (Belum Bisa Diterbitkan)</div>
        </div>
      </div>

      {error && (
        <div className="card" style={{ padding: '12px 16px', margin: '16px 0', borderColor: 'var(--color-danger)', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <section className="card" style={{ padding: '24px', marginTop: 'var(--space-md)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Tertahan</h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
          Daftar ini dihitung langsung dari kondisi terkini (bukan riwayat log) — begitu penyebabnya teratasi, baris ini
          otomatis hilang tanpa perlu ditandai selesai manual.
          {hasQuotaIssue && (
            <> <Link to="/organizer/organization?tab=subscription" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Upgrade ActiVibe Plus</Link> untuk menambah kuota.</>
          )}
        </p>

        {!isLoading && candidates.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>Tidak ada yang tertahan saat ini.</p>
        ) : (
          <div className="v-table-wrapper">
            <table className="v-table">
              <thead>
                <tr>
                  <th>Volunteer</th>
                  <th>Event</th>
                  <th>Alasan</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((item) => (
                  <tr key={item.applicationId}>
                    <td style={{ fontWeight: 600 }}>{item.volunteerName}</td>
                    <td>{item.eventTitle}</td>
                    <td><span className="badge badge--danger">{REASON_LABEL[item.reason]}</span></td>
                    <td>
                      <button
                        type="button"
                        className="btn btn--sm btn--outline"
                        disabled={retryingId === item.applicationId}
                        onClick={() => handleRetry(item)}
                      >
                        <FiRefreshCw /> {retryingId === item.applicationId ? 'Mencoba...' : 'Retry'}
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
