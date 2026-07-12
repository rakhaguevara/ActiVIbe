import { useEffect, useState } from 'react'
import {
  FiSend, FiUsers, FiZap,
} from 'react-icons/fi'
import '../CommunicationPage.css'
import { useOrganizerData } from '../../../contexts/OrganizerDataContext'
import { listBroadcasts, sendBroadcast, getBroadcastQuota, type Broadcast, type BroadcastQuota } from '../../../lib/communicationApi'

export default function BroadcastView() {
  const { events } = useOrganizerData()
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [quota, setQuota] = useState<BroadcastQuota | null>(null)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [eventId, setEventId] = useState('')
  const [targetSegment, setTargetSegment] = useState('Semua Volunteer Diterima')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadData = async () => {
    const [broadcastList, broadcastQuota] = await Promise.all([listBroadcasts(), getBroadcastQuota()])
    setBroadcasts(broadcastList)
    setQuota(broadcastQuota)
  }

  useEffect(() => {
    loadData().catch(() => {})
  }, [])

  const quotaExceeded = quota && quota.limit !== null && quota.used >= quota.limit

  const handleSend = async () => {
    setError(null)
    setSuccessMessage(null)
    if (!eventId) {
      setError('Pilih event tujuan broadcast terlebih dahulu.')
      return
    }
    setSending(true)
    try {
      const result = await sendBroadcast({ eventId, title, message, targetSegment })
      setTitle('')
      setMessage('')
      setSuccessMessage(`Broadcast terkirim ke ${result.recipientCount} volunteer.`)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim broadcast.')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__value" style={{ fontSize: '20px' }}>{broadcasts.length}</div>
          <div className="stat-card__label">Total Broadcasts</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-soft)' }}><FiSend /></div>
          <div className="stat-card__value" style={{ fontSize: '20px' }}>{quota ? quota.used : '—'}</div>
          <div className="stat-card__label">Terkirim Bulan Ini</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-accent-yellow)', background: 'var(--color-accent-yellow-soft)' }}><FiZap /></div>
          <div className="stat-card__value" style={{ fontSize: '20px' }}>
            {quota ? `${quota.used}/${quota.limit === null ? '∞' : quota.limit}` : '—'}
          </div>
          <div className="stat-card__label">Kuota Broadcast Bulan Ini</div>
        </div>
      </div>

      {quotaExceeded && (
        <div className="card" style={{ padding: '16px 20px', borderColor: 'var(--color-warning)', background: 'var(--color-accent-yellow-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px' }}>
            Kuota broadcast paket {quota?.tier === 'FREE' ? 'Free' : 'ActiVibe Plus Starter'} bulan ini sudah habis — sisanya kirim manual lewat WhatsApp, atau upgrade ke ActiVibe Plus Pro untuk broadcast tanpa batas.
          </span>
          <a href="/activibe-plus" className="btn btn--sm btn--primary" style={{ whiteSpace: 'nowrap' }}>Upgrade</a>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        <section className="comm-composer">
          <div className="comm-composer__header">
            <span>Compose Broadcast</span>
          </div>
          <div className="comm-composer__body">
            <div className="v-filter-input" style={{ width: '100%' }}>
              <input
                type="text"
                placeholder="Judul Broadcast (mis. Update Jadwal)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontWeight: 600 }}
              />
            </div>

            <textarea
              className="comm-composer__textarea"
              placeholder="Tulis pesan broadcast Anda di sini..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Target Event</label>
                <select
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}
                >
                  <option value="">Pilih event...</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>{event.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Target Peserta</label>
                <select
                  value={targetSegment}
                  onChange={(e) => setTargetSegment(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}
                >
                  <option>Semua Volunteer Diterima</option>
                  <option>Semua Pendaftar</option>
                </select>
              </div>
            </div>

            {error && <div style={{ color: 'var(--color-danger)', fontSize: '13px' }}>{error}</div>}
            {successMessage && <div style={{ color: 'var(--color-success)', fontSize: '13px' }}>{successMessage}</div>}
          </div>
          <div className="comm-composer__footer">
            <button
              className="btn btn--primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={handleSend}
              disabled={sending || Boolean(quotaExceeded) || !title.trim() || !message.trim()}
            >
              <FiSend /> {sending ? 'Mengirim...' : 'Send Broadcast'}
            </button>
          </div>
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiUsers color="var(--color-primary)" /> Info Pengiriman
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
              <p>Broadcast dikirim via email ke volunteer sesuai target peserta yang dipilih.</p>
              <p>Paket Free/Starter dibatasi {quota?.limit ?? '—'}x broadcast per bulan — sisanya kirim manual lewat WhatsApp.</p>
            </div>
          </div>
        </div>
      </div>

      <section className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Riwayat Broadcast</h2>
        <div className="v-table-wrapper">
          <table className="v-table">
            <thead>
              <tr>
                <th>Judul</th>
                <th>Target Event</th>
                <th>Target Peserta</th>
                <th>Penerima</th>
                <th>Dikirim Oleh</th>
                <th>Waktu Kirim</th>
              </tr>
            </thead>
            <tbody>
              {broadcasts.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '24px' }}>Belum ada broadcast terkirim.</td></tr>
              )}
              {broadcasts.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>{b.title}</td>
                  <td>{b.eventTitle ?? '—'}</td>
                  <td>{b.targetSegment}</td>
                  <td>{b.recipientCount}</td>
                  <td>{b.sentByName ?? '—'}</td>
                  <td>{new Date(b.sentAt).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
