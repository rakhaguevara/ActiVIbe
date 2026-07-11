import { useEffect, useState } from 'react'
import { FiFileText, FiEye, FiDownload } from 'react-icons/fi'
import { listGeneratedCertificatesRequest } from '../../../lib/organizerApi'
import { generateCertificatePdf, downloadCertificatePdf } from '../../../utils/certificateGenerator'
import type { Certificate } from '../../../types/organizer'
import '../CertificatesPage.css'

export default function GeneratedCertificatesView() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    listGeneratedCertificatesRequest()
      .then(setCertificates)
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat sertifikat.'))
      .finally(() => setIsLoading(false))
  }, [])

  const renderPdf = async (certificate: Certificate) => {
    if (!certificate.templateUrl) {
      throw new Error('Template sertifikat untuk versi ini sudah tidak ada')
    }
    return generateCertificatePdf({
      participantName: certificate.participantName,
      eventTitle: certificate.eventTitle,
      templateUrl: certificate.templateUrl,
      organizationLogoUrl: certificate.organizationLogoUrl,
    })
  }

  const handlePreview = async (certificate: Certificate) => {
    setBusyId(certificate.id)
    setError(null)
    try {
      const bytes = await renderPdf(certificate)
      const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })
      window.open(URL.createObjectURL(blob), '_blank')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuka preview sertifikat.')
    } finally {
      setBusyId(null)
    }
  }

  const handleDownload = async (certificate: Certificate) => {
    setBusyId(certificate.id)
    setError(null)
    try {
      const bytes = await renderPdf(certificate)
      downloadCertificatePdf(bytes, `Sertifikat - ${certificate.volunteerName} - ${certificate.eventTitle}.pdf`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunduh sertifikat.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <div className="events-stats-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="stat-card">
          <div className="stat-card__icon"><FiFileText /></div>
          <div className="stat-card__value">{certificates.length}</div>
          <div className="stat-card__label">Total Sertifikat Diterbitkan</div>
        </div>
      </div>

      {error && (
        <div className="card" style={{ padding: '12px 16px', margin: '16px 0', borderColor: 'var(--color-danger)', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <section className="card" style={{ padding: '24px', marginTop: 'var(--space-md)' }}>
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
                  <th>Template</th>
                  <th>Versi</th>
                  <th>Diterbitkan</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.volunteerName}</td>
                    <td>{c.eventTitle}</td>
                    <td>{c.templateName ?? '—'}</td>
                    <td>v{c.currentVersion}</td>
                    <td>{new Date(c.issuedAt).toLocaleDateString('id-ID')}</td>
                    <td>
                      <div className="v-table-actions">
                        <button
                          type="button"
                          className="btn btn--sm btn--outline"
                          disabled={busyId === c.id}
                          onClick={() => handlePreview(c)}
                        >
                          <FiEye /> Preview
                        </button>
                        <button
                          type="button"
                          className="btn btn--sm btn--outline"
                          disabled={busyId === c.id}
                          onClick={() => handleDownload(c)}
                        >
                          <FiDownload /> Download
                        </button>
                      </div>
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
