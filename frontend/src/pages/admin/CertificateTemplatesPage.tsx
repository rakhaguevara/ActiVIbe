import { useEffect, useRef, useState } from 'react'
import { FiFileText, FiCheckCircle, FiUpload, FiEye, FiTrash2 } from 'react-icons/fi'
import {
  listCertificateTemplates,
  createCertificateTemplate,
  setActiveCertificateTemplate,
  deleteCertificateTemplate,
} from '../../lib/adminApi'
import type { CertificateTemplate } from '../../types/admin'
import { resolveAssetUrl } from '../../lib/assetUrl'
import './OverviewPage.css'

export default function CertificateTemplatesPage() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadData = async () => {
    const data = await listCertificateTemplates()
    setTemplates(data)
  }

  useEffect(() => {
    setIsLoading(true)
    loadData()
      .catch((err) => window.alert(err instanceof Error ? err.message : 'Gagal memuat template sertifikat.'))
      .finally(() => setIsLoading(false))
  }, [])

  const handleUpload = async () => {
    if (!name.trim() || !file) {
      window.alert('Isi nama template dan pilih file PDF terlebih dahulu.')
      return
    }
    setIsUploading(true)
    try {
      await createCertificateTemplate(name.trim(), file)
      setName('')
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      await loadData()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal mengunggah template.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSetActive = async (id: string) => {
    setBusyId(id)
    try {
      await setActiveCertificateTemplate(id)
      await loadData()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal mengaktifkan template.')
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus template ini?')) return
    setBusyId(id)
    try {
      await deleteCertificateTemplate(id)
      await loadData()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal menghapus template.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div style={{ padding: '24px', width: '100%', fontFamily: 'var(--font-body)' }}>
      <header className="admin-global-header">
        <h1>Certificate Templates</h1>
        <div className="admin-breadcrumb">
          <span>Admin</span> <span className="sep">›</span> <span className="current">Certificate Templates</span>
        </div>
      </header>

      <section className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>Tambah Template Baru</h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
          Template PDF satu halaman (A4 landscape) — nama peserta, judul kegiatan, dan logo organizer akan ditimpa
          otomatis saat sertifikat diterbitkan. Cuma satu template yang bisa aktif di satu waktu.
        </p>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Nama template (mis. Sertifikat Volunteer 2026)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border-light)', minWidth: '280px' }}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <button type="button" className="btn btn--primary btn--sm" disabled={isUploading} onClick={handleUpload}>
            <FiUpload /> {isUploading ? 'Mengunggah...' : 'Unggah Template'}
          </button>
        </div>
      </section>

      <section className="card" style={{ padding: '20px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>Daftar Template</h2>
        <div className="v-table-wrapper">
          <table className="v-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Status</th>
                <th>Dipakai</th>
                <th>Diunggah Oleh</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && templates.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '24px' }}>Belum ada template sertifikat.</td></tr>
              )}
              {templates.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}><FiFileText /> {t.name}</td>
                  <td>
                    {t.isActive ? (
                      <span className="badge badge--success"><FiCheckCircle /> Aktif</span>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)' }}>Nonaktif</span>
                    )}
                  </td>
                  <td>{t.usageCount} sertifikat</td>
                  <td>{t.uploadedByName}</td>
                  <td>{new Date(t.createdAt).toLocaleDateString('id-ID')}</td>
                  <td>
                    <div className="v-table-actions">
                      <a
                        href={resolveAssetUrl(t.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn--sm btn--outline"
                      >
                        <FiEye /> Preview
                      </a>
                      {!t.isActive && (
                        <button
                          type="button"
                          className="btn btn--sm btn--outline"
                          disabled={busyId === t.id}
                          onClick={() => handleSetActive(t.id)}
                        >
                          Jadikan Aktif
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn--sm btn--outline"
                        disabled={busyId === t.id || t.usageCount > 0}
                        title={t.usageCount > 0 ? 'Sudah pernah dipakai, tidak bisa dihapus' : undefined}
                        onClick={() => handleDelete(t.id)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
