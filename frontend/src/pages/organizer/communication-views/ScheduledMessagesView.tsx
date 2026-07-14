import { useEffect, useMemo, useState } from 'react'
import {
  FiClock, FiCalendar, FiAlertCircle, FiSend, FiXSquare, FiPlus,
} from 'react-icons/fi'
import '../CommunicationPage.css'
import ConfirmDialog from '../../../components/ConfirmDialog'
import DropdownMenu from '../../../components/DropdownMenu'
import { useOrganizerData } from '../../../contexts/OrganizerDataContext'
import {
  listScheduledMessages,
  createScheduledMessage,
  cancelScheduledMessage,
  sendScheduledMessageNow,
  type ScheduledMessage,
} from '../../../lib/communicationApi'

const EMPTY_FORM = { eventId: '', title: '', message: '', targetSegment: 'Semua Volunteer Diterima', sendAt: '' }

const STATUS_BADGE: Record<ScheduledMessage['status'], { label: string; className: string }> = {
  SCHEDULED: { label: 'Scheduled', className: 'badge badge--warning' },
  SENT: { label: 'Terkirim', className: 'badge badge--success' },
  CANCELLED: { label: 'Dibatalkan', className: 'badge' },
  FAILED: { label: 'Gagal', className: 'badge badge--danger' },
}

function formatCountdown(sendAt: string) {
  const diffMs = new Date(sendAt).getTime() - Date.now()
  if (diffMs <= 0) return 'Sekarang'
  const totalMinutes = Math.floor(diffMs / 60000)
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60
  if (days > 0) return `${days}h ${hours}j`
  if (hours > 0) return `${hours}j ${minutes}m`
  return `${minutes}m`
}

export default function ScheduledMessagesView() {
  const { events } = useOrganizerData()
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [, setTick] = useState(0)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [cancelTarget, setCancelTarget] = useState<ScheduledMessage | null>(null)
  const [sendingNowId, setSendingNowId] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setError(null)
      const data = await listScheduledMessages()
      setScheduledMessages(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat pesan terjadwal.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Refresh tampilan countdown tiap 30 detik — cukup utk kolom "Countdown",
  // tidak perlu re-fetch dari server (data pesan terjadwalnya tidak berubah).
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30_000)
    return () => clearInterval(interval)
  }, [])

  const scheduledOnly = useMemo(() => scheduledMessages.filter((m) => m.status === 'SCHEDULED'), [scheduledMessages])
  const sendingToday = useMemo(() => {
    const now = new Date()
    return scheduledOnly.filter((m) => {
      const d = new Date(m.sendAt)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
    }).length
  }, [scheduledOnly])
  const sendingThisWeek = useMemo(() => {
    const weekMs = 7 * 24 * 60 * 60 * 1000
    return scheduledOnly.filter((m) => new Date(m.sendAt).getTime() - Date.now() <= weekMs).length
  }, [scheduledOnly])
  const failedCount = useMemo(() => scheduledMessages.filter((m) => m.status === 'FAILED').length, [scheduledMessages])
  const upcoming = useMemo(
    () => [...scheduledOnly].sort((a, b) => new Date(a.sendAt).getTime() - new Date(b.sendAt).getTime()).slice(0, 3),
    [scheduledOnly],
  )

  const handleCreate = async () => {
    setCreateError(null)
    if (!form.eventId) {
      setCreateError('Pilih event tujuan terlebih dahulu.')
      return
    }
    if (!form.title.trim() || !form.message.trim()) {
      setCreateError('Judul dan isi pesan wajib diisi.')
      return
    }
    if (!form.sendAt) {
      setCreateError('Pilih waktu pengiriman.')
      return
    }
    setCreating(true)
    try {
      await createScheduledMessage({
        eventId: form.eventId,
        title: form.title.trim(),
        message: form.message.trim(),
        targetSegment: form.targetSegment,
        sendAt: new Date(form.sendAt).toISOString(),
      })
      setForm(EMPTY_FORM)
      setShowForm(false)
      await loadData()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Gagal menjadwalkan pesan.')
    } finally {
      setCreating(false)
    }
  }

  const handleCancelConfirmed = async () => {
    if (!cancelTarget) return
    try {
      await cancelScheduledMessage(cancelTarget.id)
      setCancelTarget(null)
      await loadData()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal membatalkan pesan.')
      setCancelTarget(null)
    }
  }

  const handleSendNow = async (row: ScheduledMessage) => {
    setSendingNowId(row.id)
    try {
      await sendScheduledMessageNow(row.id)
      await loadData()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal mengirim pesan sekarang.')
    } finally {
      setSendingNowId(null)
    }
  }

  return (
    <>
      {/* KPI Cards */}
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon"><FiClock /></div>
          <div className="stat-card__value">{scheduledOnly.length}</div>
          <div className="stat-card__label">Scheduled Messages</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-soft)' }}><FiCalendar /></div>
          <div className="stat-card__value">{sendingToday}</div>
          <div className="stat-card__label">Sending Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-success)', background: '#f0fdf4' }}><FiCalendar /></div>
          <div className="stat-card__value">{sendingThisWeek}</div>
          <div className="stat-card__label">This Week</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-danger)', background: '#fef2f2' }}><FiAlertCircle /></div>
          <div className="stat-card__value">{failedCount}</div>
          <div className="stat-card__label">Failed Schedule</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <section className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Upcoming Messages Queue</h2>
            <button type="button" className="btn btn--primary btn--sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setShowForm((s) => !s)}>
              <FiPlus /> Jadwalkan Pesan
            </button>
          </div>

          {showForm && (
            <div className="card" style={{ padding: '16px', marginBottom: '20px', background: 'var(--color-bg-subtle)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Target Event</label>
                  <select
                    value={form.eventId}
                    onChange={(e) => setForm((f) => ({ ...f, eventId: e.target.value }))}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}
                  >
                    <option value="">Pilih event...</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>{event.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Target Peserta</label>
                  <select
                    value={form.targetSegment}
                    onChange={(e) => setForm((f) => ({ ...f, targetSegment: e.target.value }))}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}
                  >
                    <option>Semua Volunteer Diterima</option>
                    <option>Semua Pendaftar</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Judul Pesan</label>
                <input
                  type="text"
                  placeholder="mis. Reminder H-1"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Isi Pesan</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  style={{ width: '100%', minHeight: '100px', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border-light)', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Waktu Pengiriman</label>
                <input
                  type="datetime-local"
                  value={form.sendAt}
                  onChange={(e) => setForm((f) => ({ ...f, sendAt: e.target.value }))}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}
                />
              </div>

              {createError && <div style={{ color: 'var(--color-danger)', fontSize: '13px', marginBottom: '12px' }}>{createError}</div>}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn--outline btn--sm" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setCreateError(null) }}>Batal</button>
                <button type="button" className="btn btn--primary btn--sm" onClick={handleCreate} disabled={creating}>
                  {creating ? 'Menjadwalkan...' : 'Jadwalkan'}
                </button>
              </div>
            </div>
          )}

          {loading && <p style={{ color: 'var(--color-text-muted)' }}>Memuat pesan terjadwal...</p>}
          {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}

          {!loading && !error && (
            <div className="v-table-wrapper">
              <table className="v-table">
                <thead>
                  <tr>
                    <th>Message Title</th>
                    <th>Target Event</th>
                    <th>Scheduled Time</th>
                    <th>Countdown</th>
                    <th>Status</th>
                    <th>Created By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduledMessages.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '24px' }}>Belum ada pesan terjadwal.</td></tr>
                  )}
                  {scheduledMessages.map((m) => {
                    const badge = STATUS_BADGE[m.status]
                    return (
                      <tr key={m.id}>
                        <td style={{ fontWeight: 600 }}>{m.title}</td>
                        <td>{m.eventTitle ?? '—'}</td>
                        <td>{new Date(m.sendAt).toLocaleString('id-ID')}</td>
                        <td>
                          {m.status === 'SCHEDULED' ? (
                            <span style={{ fontFamily: 'monospace', color: 'var(--color-primary)', fontWeight: 600 }}>{formatCountdown(m.sendAt)}</span>
                          ) : (
                            <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                          )}
                        </td>
                        <td><span className={badge.className}>{badge.label}</span></td>
                        <td>{m.createdByName ?? '—'}</td>
                        <td>
                          {m.status === 'SCHEDULED' ? (
                            <DropdownMenu
                              items={[
                                {
                                  label: sendingNowId === m.id ? 'Mengirim...' : 'Send Now',
                                  icon: <FiSend />,
                                  onClick: () => handleSendNow(m),
                                  disabled: sendingNowId === m.id,
                                },
                                {
                                  label: 'Cancel',
                                  icon: <FiXSquare />,
                                  onClick: () => setCancelTarget(m),
                                  destructive: true,
                                },
                              ]}
                            />
                          ) : (
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Side Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiCalendar /> Antrean Terdekat
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {upcoming.length === 0 && (
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Tidak ada pesan terjadwal mendatang.</p>
              )}
              {upcoming.map((m) => (
                <div className="timeline-event" key={m.id}>
                  <div className="timeline-event__icon"><FiClock size={12} /></div>
                  <div className="timeline-event__content">
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{m.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>{m.eventTitle ?? '—'}</div>
                    <span className="badge badge--warning" style={{ fontSize: '10px', padding: '2px 6px' }}>{new Date(m.sendAt).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {cancelTarget && (
        <ConfirmDialog
          title="Batalkan Pesan Terjadwal?"
          message={`Pesan "${cancelTarget.title}" tidak akan dikirim sesuai jadwal.`}
          confirmLabel="Batalkan Pesan"
          tone="danger"
          onConfirm={handleCancelConfirmed}
          onCancel={() => setCancelTarget(null)}
        />
      )}
    </>
  )
}
