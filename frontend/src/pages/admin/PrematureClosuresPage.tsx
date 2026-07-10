import { useEffect, useState } from 'react'
import { FiAlertTriangle, FiSend } from 'react-icons/fi'
import { listPrematureClosures, sendOrganizerWarning } from '../../lib/adminApi'
import type { PrematureClosure } from '../../types/admin'
import './PrematureClosuresPage.css'

const dateFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

export default function PrematureClosuresPage() {
  const [events, setEvents] = useState<PrematureClosure[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [draftMessage, setDraftMessage] = useState<Record<string, string>>({})
  const [sendingId, setSendingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listPrematureClosures()
      .then((data) => { if (!cancelled) setEvents(data) })
      .catch((err) => window.alert(err instanceof Error ? err.message : 'Gagal memuat daftar penutupan dini.'))
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [])

  const handleSend = async (eventId: string) => {
    const message = (draftMessage[eventId] ?? '').trim()
    if (!message) {
      window.alert('Pesan peringatan wajib diisi.')
      return
    }
    setSendingId(eventId)
    try {
      const updated = await sendOrganizerWarning(eventId, message)
      setEvents((prev) => prev.map((e) => (e.id === eventId ? updated : e)))
      setDraftMessage((prev) => ({ ...prev, [eventId]: '' }))
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal mengirim peringatan.')
    } finally {
      setSendingId(null)
    }
  }

  return (
    <div className="admin-page-container">
      <header className="admin-global-header">
        <h1>Penutupan Dini</h1>
        <div className="admin-breadcrumb">
          <span>Admin</span> <span className="sep">›</span> <span className="current">Penutupan Dini</span>
        </div>
      </header>

      <div className="admin-section-card">
        <h2 className="admin-section-card__title">Event Ditutup Sebelum Jadwal</h2>
        <p style={{ marginTop: '-12px', marginBottom: '20px', color: 'var(--color-text-muted)' }}>
          Organizer menutup event ini sebelum tanggal selesainya karena partisipasi belum mencapai target kuota.
          Kirim peringatan tercatat kalau perlu — ini bukan aksi suspend/strike otomatis.
        </p>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Organizer</th>
              <th>Ditutup Pada</th>
              <th>Partisipasi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td style={{ fontWeight: 600 }}>{event.title}</td>
                <td>{event.organizerName}</td>
                <td>{event.closedAt ? dateFormatter.format(new Date(event.closedAt)) : '-'}</td>
                <td>
                  <span className="badge badge--danger">
                    <FiAlertTriangle /> {event.participationRatePercentAtClose}% dari kuota
                  </span>
                </td>
                <td>
                  {event.hasWarning ? (
                    <div className="premature-closures__sent-warning">
                      <span className="badge badge--success">Peringatan Terkirim</span>
                      <p>{event.lastWarningMessage}</p>
                    </div>
                  ) : (
                    <div className="premature-closures__warning-form">
                      <textarea
                        placeholder="Tulis pesan peringatan untuk organizer..."
                        value={draftMessage[event.id] ?? ''}
                        onChange={(e) => setDraftMessage((prev) => ({ ...prev, [event.id]: e.target.value }))}
                        rows={2}
                      />
                      <button
                        type="button"
                        className="btn btn--danger btn--sm"
                        disabled={sendingId === event.id}
                        onClick={() => handleSend(event.id)}
                      >
                        <FiSend /> Kirim Peringatan
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {isLoading && (
              <tr>
                <td colSpan={5} className="admin-empty">Memuat data...</td>
              </tr>
            )}
            {!isLoading && events.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-empty">Belum ada event yang ditutup sebelum jadwal.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
