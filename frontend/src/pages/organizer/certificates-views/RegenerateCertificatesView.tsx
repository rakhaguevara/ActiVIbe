import { useEffect, useState } from 'react'
import { FiRefreshCcw, FiClock } from 'react-icons/fi'
import {
  listGeneratedCertificatesRequest,
  listCertificateVersionsRequest,
  regenerateCertificateRequest,
} from '../../../lib/organizerApi'
import type { Certificate, CertificateVersionEntry } from '../../../types/organizer'
import '../CertificatesPage.css'

interface RegenerateCertificatesViewProps {
  eventId?: string
}

export default function RegenerateCertificatesView({ eventId }: RegenerateCertificatesViewProps = {}) {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [versions, setVersions] = useState<CertificateVersionEntry[]>([])
  const [isLoadingVersions, setIsLoadingVersions] = useState(false)
  const [note, setNote] = useState('')
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    listGeneratedCertificatesRequest(eventId)
      .then(setCertificates)
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat sertifikat.'))
      .finally(() => setIsLoading(false))
  }, [eventId])

  const loadVersions = (certificateId: string) => {
    setSelectedId(certificateId)
    setIsLoadingVersions(true)
    listCertificateVersionsRequest(certificateId)
      .then(setVersions)
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat riwayat versi.'))
      .finally(() => setIsLoadingVersions(false))
  }

  const handleRegenerate = async () => {
    if (!selectedId) return
    setIsRegenerating(true)
    setError(null)
    try {
      await regenerateCertificateRequest(selectedId, note.trim() || undefined)
      setNote('')
      const [updatedCertificates, updatedVersions] = await Promise.all([
        listGeneratedCertificatesRequest(eventId),
        listCertificateVersionsRequest(selectedId),
      ])
      setCertificates(updatedCertificates)
      setVersions(updatedVersions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal regenerate sertifikat.')
    } finally {
      setIsRegenerating(false)
    }
  }

  const selected = certificates.find((c) => c.id === selectedId) ?? null

  return (
    <>
      <div className="events-stats-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="stat-card">
          <div className="stat-card__icon"><FiRefreshCcw /></div>
          <div className="stat-card__value">{certificates.length}</div>
          <div className="stat-card__label">Sertifikat Bisa Di-regenerate</div>
        </div>
      </div>

      {error && (
        <div className="card" style={{ padding: '12px 16px', margin: '16px 0', borderColor: 'var(--color-danger)', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 'var(--space-xl)', alignItems: 'start', marginTop: 'var(--space-md)' }}>
        <section className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Sertifikat Terbit</h2>
          {!isLoading && certificates.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>Belum ada sertifikat yang diterbitkan.</p>
          ) : (
            <div className="v-table-wrapper">
              <table className="v-table">
                <thead>
                  <tr>
                    <th>Volunteer</th>
                    <th>Event</th>
                    <th>Versi Saat Ini</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((c) => (
                    <tr key={c.id} style={{ background: selectedId === c.id ? 'var(--color-primary-soft)' : undefined }}>
                      <td style={{ fontWeight: 600 }}>{c.volunteerName}</td>
                      <td>{c.eventTitle}</td>
                      <td>v{c.currentVersion}</td>
                      <td>
                        <button type="button" className="btn btn--sm btn--outline" onClick={() => loadVersions(c.id)}>
                          Lihat Riwayat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
            {selected ? `Riwayat Versi — ${selected.volunteerName}` : 'Pilih sertifikat untuk lihat riwayat'}
          </h2>

          {selected && (
            <>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Catatan regenerate (opsional, mis. koreksi nama)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}
                />
                <button type="button" className="btn btn--primary btn--sm" disabled={isRegenerating} onClick={handleRegenerate}>
                  <FiRefreshCcw /> {isRegenerating ? 'Memproses...' : 'Regenerate'}
                </button>
              </div>

              {!isLoadingVersions && (
                <div className="version-timeline">
                  {versions.map((v, idx) => (
                    <div key={v.version} className={`version-item ${idx === 0 ? 'version-item--current' : ''}`}>
                      <div className="version-item__title">
                        v{v.version} {idx === 0 && '(Saat Ini)'} — {v.participantName}
                      </div>
                      <div className="version-item__meta">
                        <FiClock /> {new Date(v.issuedAt).toLocaleString('id-ID')} · Template: {v.templateName}
                        {v.note && <> · Catatan: {v.note}</>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </>
  )
}
