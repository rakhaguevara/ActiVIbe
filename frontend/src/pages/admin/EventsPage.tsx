import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiX, FiTrash2, FiSearch,
  FiExternalLink, FiDownload, FiSliders, FiFilter,
  FiMapPin, FiCalendar, FiUsers, FiFileText
} from 'react-icons/fi'
import {
  listEvents,
  approveEvent as approveEventRequest,
  rejectEvent as rejectEventRequest,
  deleteEvent as deleteEventRequest,
} from '../../lib/adminApi'
import type { AdminEvent } from '../../types/admin'
import Badge from '../../components/Badge'
import ConfirmDialog from '../../components/ConfirmDialog'
import { formatDateShort } from '../../utils/formatDate'
import './EventsPage.css'

/* ── Status helpers ─────────────────────────────────── */
const STATUS_LABEL: Record<AdminEvent['status'], string> = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
}

const STATUS_VARIANT: Record<AdminEvent['status'], 'success' | 'warning' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}

type DialogState = 
  | { type: 'delete' | 'detail' | 'approve_confirm' | 'conditional_approve' | 'reject_reason'; event: AdminEvent } 
  | null
type StatusFilter = 'all' | AdminEvent['status']

/** Inisial 1-2 huruf dari nama organizer */
function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

/** Warna avatar organizer berputar dari palet brand */
const AVATAR_COLORS = [
  { bg: 'var(--color-primary-soft)', text: 'var(--color-primary)' },
  { bg: 'var(--color-secondary-soft)', text: 'var(--color-secondary-dark)' },
  { bg: 'var(--color-accent-orange-soft)', text: 'var(--color-accent-orange)' },
  { bg: 'var(--color-success-soft)', text: 'var(--color-success)' },
]

function avatarColor(name: string) {
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

/* ── Export CSV ─────────────────────────────────────── */
function exportCSV(events: AdminEvent[]) {
  const header = ['ID', 'Judul', 'Organizer', 'Lokasi', 'Tanggal', 'Kuota', 'Terisi', 'Status']
  const rows = events.map((e) => [
    e.id, e.title, e.organizerName, e.location,
    formatDateShort(e.startDate), e.quota, e.filledSlots, STATUS_LABEL[e.status],
  ])
  const csv = [header, ...rows].map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'kegiatan.csv'; a.click()
  URL.revokeObjectURL(url)
}

/* ════════════════════════════════════════════════════ */
export default function EventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [subFilter, setSubFilter] = useState<'all' | 'pending' | 'processed'>('all')
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState<DialogState>(null)

  useEffect(() => {
    let cancelled = false
    listEvents()
      .then((data) => { if (!cancelled) setEvents(data) })
      .catch((err) => window.alert(err instanceof Error ? err.message : 'Gagal memuat kegiatan.'))
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [])

  /* Counts for tab badges */
  const counts = useMemo(() => ({
    all: events.length,
    pending: events.filter((e) => e.status === 'pending').length,
    approved: events.filter((e) => e.status === 'approved').length,
    rejected: events.filter((e) => e.status === 'rejected').length,
  }), [events])

  /* Filtered list */
  const filtered = useMemo(() => {
    let list = events
    if (statusFilter !== 'all') list = list.filter((e) => e.status === statusFilter)
    if (subFilter === 'pending') list = list.filter((e) => e.status === 'pending')
    if (subFilter === 'processed') list = list.filter((e) => e.status !== 'pending')
    const q = search.trim().toLowerCase()
    if (q) list = list.filter((e) =>
      e.title.toLowerCase().includes(q) ||
      e.organizerName.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q) ||
      (e.category && e.category.toLowerCase().includes(q))
    )
    return list
  }, [events, statusFilter, subFilter, search])

  /* Actions — semuanya persist ke backend sekarang (lihat lib/adminApi.ts) */
  const approveEvent = async (id: string) => {
    try {
      const updated = await approveEventRequest(id)
      setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)))
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal menyetujui kegiatan.')
    }
  }
  const rejectEvent = async (id: string, reason: string) => {
    try {
      const updated = await rejectEventRequest(id, reason)
      setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)))
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal menolak kegiatan.')
    }
  }
  const deleteEvent = async (id: string) => {
    try {
      await deleteEventRequest(id)
      setEvents((prev) => prev.filter((e) => e.id !== id))
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal menghapus kegiatan.')
    }
  }
  const conditionalApproveEvent = async (id: string, conditions: string) => {
    try {
      const updated = await approveEventRequest(id, conditions)
      setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)))
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal menyetujui kegiatan.')
    }
  }

  // Helper form states for dialogs
  const [inputText, setInputText] = useState('') /* ── Status tab bar ── */
  const STATUS_TABS: Array<{ key: StatusFilter; label: string; count?: number }> = [
    { key: 'all', label: 'Semua' },
    { key: 'pending', label: 'Menunggu', count: counts.pending },
    { key: 'approved', label: 'Disetujui', count: counts.approved },
    { key: 'rejected', label: 'Ditolak', count: counts.rejected },
  ]

  /* ── Sub-filter chips ── */
  const SUB_FILTERS = [
    { key: 'all' as const, label: `Semua (${filtered.length})` },
    { key: 'pending' as const, label: `Perlu Ditinjau (${counts.pending})` },
    { key: 'processed' as const, label: `Sudah Diproses (${counts.approved + counts.rejected})` },
  ]

  return (
    <div className="events-page" style={{ padding: '24px', width: '100%', fontFamily: 'var(--font-body)' }}>

      {/* ── Top bar ── */}
      <div className="events-page__topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <header className="admin-global-header" style={{ marginBottom: 0 }}>
          <h1>Manajemen Kegiatan</h1>
          <div className="admin-breadcrumb">
            <span>Admin</span> <span className="sep">›</span> <span>Kegiatan</span> <span className="sep">›</span> <span className="current">
              {statusFilter === 'all' ? 'Semua Kegiatan'
                : statusFilter === 'pending' ? 'Menunggu'
                : statusFilter === 'approved' ? 'Disetujui'
                : 'Ditolak'}
            </span>
          </div>
        </header>
        <div className="events-page__topbar-actions">
          <Link to="/admin/organizers" className="events-page__view-organizer-btn">
            <FiExternalLink aria-hidden="true" />
            View Organizer
          </Link>
        </div>
      </div>

      {/* ── Status tab filters ── */}
      <div className="events-page__status-tabs" role="tablist">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={statusFilter === tab.key}
            className={`events-page__status-tab${statusFilter === tab.key ? ' is-active' : ''}`}
            onClick={() => setStatusFilter(tab.key)}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="events-page__status-tab-count">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Search + Export row ── */}
      <div className="events-page__search-row">
        <div className="events-page__search">
          <FiSearch aria-hidden="true" />
          <input
            type="text"
            placeholder="Cari judul, kategori, organizer, atau lokasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Cari kegiatan"
          />
        </div>
        <button
          type="button"
          className="events-page__export-btn"
          onClick={() => exportCSV(filtered)}
          disabled={filtered.length === 0}
        >
          <FiDownload aria-hidden="true" />
          Ekspor
        </button>
      </div>

      {/* ── Sub-filters + Sort row ── */}
      <div className="events-page__sub-row">
        <div className="events-page__sub-filters">
          {SUB_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`events-page__sub-chip${subFilter === f.key ? ' is-active' : ''}`}
              onClick={() => setSubFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="events-page__sub-actions">
          <button type="button" className="events-page__sort-btn">
            <FiSliders aria-hidden="true" /> Urutkan
          </button>
          <button type="button" className="events-page__filter-btn">
            <FiFilter aria-hidden="true" /> Tambah Filter
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="events-page__table-wrap">
        {/* Column headers */}
        <div className="events-page__col-header">
          <span className="events-page__col--event">Kegiatan</span>
          <span className="events-page__col--location">Lokasi</span>
          <span className="events-page__col--date">Tanggal</span>
          <span className="events-page__col--quota">Kuota</span>
          <span className="events-page__col--status">Status</span>
          <span className="events-page__col--action">Aksi</span>
        </div>

        {/* Rows — satu grup per event */}
        {isLoading ? (
          <div className="events-page__empty">Memuat kegiatan...</div>
        ) : filtered.length === 0 ? (
          <div className="events-page__empty">
            Tidak ada kegiatan yang cocok.
          </div>
        ) : (
          filtered.map((e) => {
            const initials = getInitials(e.organizerName)
            const color = avatarColor(e.organizerName)

            return (
              <div key={e.id} className="events-page__group">
                {/* Group header — organizer name + event ID */}
                <div className="events-page__group-header">
                  <div className="events-page__group-header-left">
                    <div
                      className="events-page__org-avatar"
                      style={{ background: color.bg, color: color.text }}
                      aria-hidden="true"
                    >
                      {initials}
                    </div>
                    <span className="events-page__org-name">{e.organizerName}</span>
                  </div>
                  <span className="events-page__event-id">No. Kegiatan {e.id.toUpperCase()}</span>
                </div>

                {/* Event row */}
                <div className="events-page__event-row">
                  {/* Event icon + title */}
                  <div className="events-page__col--event">
                    <div className="events-page__event-icon" aria-hidden="true">
                      🌿
                    </div>
                    <div className="events-page__event-info">
                      <p className="events-page__event-title">{e.title}</p>
                      <p className="events-page__event-meta">{e.impactMetricTemplate}</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="events-page__col--location">
                    <FiMapPin className="events-page__meta-icon" />
                    {e.location}
                  </div>

                  {/* Date */}
                  <div className="events-page__col--date">
                    <FiCalendar className="events-page__meta-icon" />
                    {formatDateShort(e.startDate)}
                  </div>

                  {/* Quota */}
                  <div className="events-page__col--quota">
                    <FiUsers className="events-page__meta-icon" />
                    <span>
                      {e.filledSlots}
                      <span className="events-page__quota-sep">/</span>
                      {e.quota}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="events-page__col--status">
                    <Badge variant={STATUS_VARIANT[e.status]}>
                      {STATUS_LABEL[e.status]}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="events-page__col--action">
                    <button
                      type="button"
                      className="events-page__btn-detail"
                      onClick={() => setDialog({ type: 'detail', event: e })}
                    >
                      Detail
                    </button>
                    <button
                      type="button"
                      className="events-page__btn-delete"
                      onClick={() => setDialog({ type: 'delete', event: e })}
                      title="Hapus kegiatan"
                      aria-label={`Hapus ${e.title}`}
                    >
                      <FiTrash2 aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── Dialogs ── */}
      {dialog?.type === 'detail' && (
        <div className="events-detail-modal__overlay" onClick={() => setDialog(null)}>
          <div className="events-detail-modal__content" onClick={(e) => e.stopPropagation()}>
            <div className="events-detail-modal__header">
              <h2>Detail Kegiatan</h2>
              <Badge variant={STATUS_VARIANT[dialog.event.status]}>{STATUS_LABEL[dialog.event.status]}</Badge>
              <button className="events-detail-modal__close" onClick={() => setDialog(null)}><FiX /></button>
            </div>
            
            <div className="events-detail-modal__body">
              <div className="events-detail-modal__grid">
                
                {/* Informasi Utama */}
                <div className="events-detail-modal__section">
                  <h3>Informasi Event</h3>
                  <p><strong>Judul:</strong> {dialog.event.title}</p>
                  <p>
                    <strong>Organizer:</strong>{' '}
                    <Link 
                      to={`/organization/${encodeURIComponent(dialog.event.organizerName)}`} 
                      style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}
                    >
                      {dialog.event.organizerName}
                    </Link>
                  </p>
                  <p><strong>Kategori:</strong> {dialog.event.category || 'Lainnya'}</p>
                  <p><strong>Lokasi:</strong> {dialog.event.location}</p>
                  <p><strong>Tanggal:</strong> {formatDateShort(dialog.event.startDate)} - {formatDateShort(dialog.event.endDate)}</p>
                  <p><strong>Kuota:</strong> {dialog.event.filledSlots} / {dialog.event.quota} Orang</p>
                  <p><strong>Target Metrik:</strong> {dialog.event.impactMetricTemplate}</p>
                </div>

                {/* Dokumentasi & Syarat */}
                <div className="events-detail-modal__section">
                  <h3>Dokumentasi & Syarat</h3>
                  <div className="events-detail-modal__doc-card">
                    <FiFileText /> Proposal_Kegiatan.pdf
                  </div>
                  <div className="events-detail-modal__doc-card">
                    <FiFileText /> Surat_Izin_Lokasi.pdf
                  </div>
                  <div className="events-detail-modal__doc-card">
                    <FiFileText /> Profil_Organizer.pdf
                  </div>
                </div>
              </div>

              {/* Lokasi & Kontak Organizer */}
              <div className="events-detail-modal__map-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Lokasi & Kontak Organizer</h3>
                  <a 
                    href={`https://wa.me/6281234567890?text=Halo%20${encodeURIComponent(dialog.event.organizerName)},%20terkait%20kegiatan%20${encodeURIComponent(dialog.event.title)}...`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="events-detail-modal__wa-btn"
                  >
                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    Hubungi via WhatsApp
                  </a>
                </div>
                <div className="events-detail-modal__map-container">
                  <iframe 
                    title="Map Lokasi"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(dialog.event.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    width="100%" 
                    height="200" 
                    style={{ border: 0, borderRadius: '8px' }} 
                    allowFullScreen 
                    loading="lazy"
                  ></iframe>
                </div>
              </div>

              {/* AI Assessment Box */}
              <div className="events-detail-modal__ai-box">
                <h4>✨ Analisis AI Assistant</h4>
                <p>
                  Berdasarkan pemindaian dokumen Proposal dan Profil Organizer, kegiatan ini <strong>memenuhi syarat dasar</strong>. 
                  Tidak ditemukan indikasi penipuan (fraud). Namun, Surat Izin Lokasi perlu dikonfirmasi ulang karena format tanggal sedikit buram.
                  <br/><br/>
                  <strong>Saran:</strong> Bisa disetujui (Approve) atau diberikan Persetujuan Bersyarat dengan melampirkan izin lokasi yang lebih jelas.
                </p>
              </div>
            </div>

            {dialog.event.status === 'pending' && (
              <div className="events-detail-modal__footer">
                <button 
                  className="btn-modal-action btn-modal-reject" 
                  onClick={() => { setInputText(''); setDialog({ type: 'reject_reason', event: dialog.event }) }}
                >
                  Tolak
                </button>
                <button 
                  className="btn-modal-action btn-modal-conditional" 
                  onClick={() => { setInputText(''); setDialog({ type: 'conditional_approve', event: dialog.event }) }}
                >
                  Setuju Bersyarat
                </button>
                <button 
                  className="btn-modal-action btn-modal-approve" 
                  onClick={() => setDialog({ type: 'approve_confirm', event: dialog.event })}
                >
                  Setujui
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {dialog?.type === 'approve_confirm' && (
        <ConfirmDialog
          title="Setujui Kegiatan"
          message={`Apakah kamu yakin ingin menyetujui kegiatan "${dialog.event.title}"?`}
          confirmLabel="Setujui"
          tone="default"
          onCancel={() => setDialog({ type: 'detail', event: dialog.event })}
          onConfirm={() => { approveEvent(dialog.event.id); setDialog(null) }}
        />
      )}

      {dialog?.type === 'reject_reason' && (
        <div className="events-detail-modal__overlay">
          <div className="events-prompt-modal__content">
            <h3>Alasan Penolakan</h3>
            <p>Berikan alasan penolakan untuk "{dialog.event.title}":</p>
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Contoh: Proposal kurang lengkap..." 
              rows={4}
            />
            <div className="events-prompt-modal__actions">
              <button onClick={() => setDialog({ type: 'detail', event: dialog.event })}>Batal</button>
              <button className="btn-modal-reject" onClick={() => { rejectEvent(dialog.event.id, inputText); setDialog(null) }}>Tolak Kegiatan</button>
            </div>
          </div>
        </div>
      )}

      {dialog?.type === 'conditional_approve' && (
        <div className="events-detail-modal__overlay">
          <div className="events-prompt-modal__content">
            <h3>Persetujuan Bersyarat</h3>
            <p>Masukkan syarat persetujuan untuk "{dialog.event.title}":</p>
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Contoh: Harap lampirkan surat izin lokasi asli paling lambat..." 
              rows={4}
            />
            <div className="events-prompt-modal__actions">
              <button onClick={() => setDialog({ type: 'detail', event: dialog.event })}>Batal</button>
              <button className="btn-modal-conditional" onClick={() => { conditionalApproveEvent(dialog.event.id, inputText); setDialog(null) }}>Simpan Syarat & Setujui</button>
            </div>
          </div>
        </div>
      )}

      {dialog?.type === 'delete' && (
        <ConfirmDialog
          title="Hapus Kegiatan"
          message={`Kegiatan "${dialog.event.title}" akan dihapus permanen. Lanjutkan?`}
          confirmLabel="Hapus"
          tone="danger"
          onCancel={() => setDialog(null)}
          onConfirm={() => { deleteEvent(dialog.event.id); setDialog(null) }}
        />
      )}
    </div>
  )
}
