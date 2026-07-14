import { useEffect, useMemo, useState } from 'react'
import {
  FiMessageSquare, FiUsers, FiCalendar, FiSearch, FiDownload,
} from 'react-icons/fi'
import '../CommunicationPage.css'
import '../../../components/ConfirmDialog.css'
import DropdownMenu from '../../../components/DropdownMenu'
import { useOrganizerData } from '../../../contexts/OrganizerDataContext'
import { listBroadcasts, type Broadcast } from '../../../lib/communicationApi'

function toCsvValue(value: string | number) {
  const str = String(value)
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

export function exportBroadcastsCsv(broadcasts: Broadcast[]) {
  const header = ['Tanggal', 'Judul', 'Target Event', 'Target Peserta', 'Penerima', 'Dikirim Oleh']
  const rows = broadcasts.map((b) => [
    new Date(b.sentAt).toLocaleString('id-ID'),
    b.title,
    b.eventTitle ?? '—',
    b.targetSegment,
    b.recipientCount,
    b.sentByName ?? '—',
  ])
  const csv = [header, ...rows].map((row) => row.map(toCsvValue).join(',')).join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `communication-log-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function CommunicationLogView() {
  const { events } = useOrganizerData()
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [eventFilter, setEventFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [detailTarget, setDetailTarget] = useState<Broadcast | null>(null)

  const loadData = async () => {
    try {
      setError(null)
      const data = await listBroadcasts({ eventId: eventFilter || undefined, from: fromDate || undefined, to: toDate || undefined })
      setBroadcasts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat log komunikasi.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventFilter, fromDate, toDate])

  const filteredBroadcasts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()
    if (!keyword) return broadcasts
    return broadcasts.filter((b) => b.title.toLowerCase().includes(keyword) || (b.eventTitle ?? '').toLowerCase().includes(keyword))
  }, [broadcasts, searchTerm])

  const totalRecipients = useMemo(() => broadcasts.reduce((sum, b) => sum + b.recipientCount, 0), [broadcasts])
  const uniqueEventsReached = useMemo(() => new Set(broadcasts.map((b) => b.eventId)).size, [broadcasts])

  return (
    <>
      {/* KPI Cards — angka real dari CommunicationLog, chart engagement lama
          (delivery/open rate) dihapus krn tidak ada data open/delivery-tracking
          sama sekali di backend (prinsip repo: jangan mengarang angka). */}
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon"><FiMessageSquare /></div>
          <div className="stat-card__value">{broadcasts.length}</div>
          <div className="stat-card__label">Broadcast Terkirim</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-soft)' }}><FiUsers /></div>
          <div className="stat-card__value">{totalRecipients.toLocaleString('id-ID')}</div>
          <div className="stat-card__label">Total Penerima</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-success)', background: '#f0fdf4' }}><FiCalendar /></div>
          <div className="stat-card__value">{uniqueEventsReached}</div>
          <div className="stat-card__label">Event Terjangkau</div>
        </div>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Communication History</h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div className="v-filter-input">
              <FiSearch color="var(--color-text-muted)" />
              <input type="text" placeholder="Cari log..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none' }} />
            </div>
            <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}>
              <option value="">Semua Event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>{event.title}</option>
              ))}
            </select>
            <input type="date" value={fromDate} max={toDate || undefined} onChange={(e) => setFromDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border-light)' }} />
            <input type="date" value={toDate} min={fromDate || undefined} onChange={(e) => setToDate(e.target.value)} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border-light)' }} />
            <button className="btn btn--outline" onClick={() => exportBroadcastsCsv(filteredBroadcasts)} disabled={filteredBroadcasts.length === 0}><FiDownload /> Export Log</button>
          </div>
        </div>

        {loading && <p style={{ color: 'var(--color-text-muted)' }}>Memuat log komunikasi...</p>}
        {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}

        {!loading && !error && (
          <div className="v-table-wrapper">
            <table className="v-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Judul Pesan</th>
                  <th>Target Event</th>
                  <th>Penerima</th>
                  <th>Dikirim Oleh</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBroadcasts.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '24px' }}>Belum ada riwayat komunikasi.</td></tr>
                )}
                {filteredBroadcasts.map((b) => (
                  <tr key={b.id}>
                    <td style={{ color: 'var(--color-text-muted)' }}>{new Date(b.sentAt).toLocaleString('id-ID')}</td>
                    <td style={{ fontWeight: 600 }}>{b.title}</td>
                    <td>{b.eventTitle ?? '—'}</td>
                    <td>{b.recipientCount}</td>
                    <td>{b.sentByName ?? '—'}</td>
                    <td>
                      <DropdownMenu
                        items={[
                          { label: 'Lihat Detail', onClick: () => setDetailTarget(b) },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detailTarget && (
        <div className="confirm-dialog__backdrop" onClick={() => setDetailTarget(null)}>
          <div className="confirm-dialog" role="dialog" aria-modal="true" style={{ maxWidth: '480px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="confirm-dialog__title">{detailTarget.title}</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
              Dikirim ke {detailTarget.recipientCount} penerima ({detailTarget.targetSegment}) untuk event {detailTarget.eventTitle ?? '—'} pada {new Date(detailTarget.sentAt).toLocaleString('id-ID')} oleh {detailTarget.sentByName ?? '—'}.
            </p>
            <p className="confirm-dialog__message" style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>{detailTarget.message}</p>
            <div className="confirm-dialog__actions">
              <button type="button" className="btn btn--primary btn--sm" onClick={() => setDetailTarget(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
