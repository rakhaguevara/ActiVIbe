import { useState } from 'react'
import { FiSend } from 'react-icons/fi'
import { useOrganizerData } from '../../contexts/OrganizerDataContext'
import ScrollPane from '../../components/ScrollPane'
import './CommunicationPage.css'

const SEGMENTS = [
  'Semua pendaftar event',
  'Volunteer accepted',
  'Volunteer dengan role tertentu',
  'Volunteer dengan shift tertentu',
  'Volunteer belum selesai requirement',
]

let idCounter = 0
function nextId() {
  idCounter += 1
  return `comm-${Date.now()}-${idCounter}`
}

export default function CommunicationPage() {
  const { isLoading, events, communicationLogs, addCommunicationLog } = useOrganizerData()
  const [selectedEventId, setSelectedEventId] = useState('')
  const [segment, setSegment] = useState(SEGMENTS[0])
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')

  const effectiveEventId = selectedEventId || events[0]?.id || ''
  const eventLogs = communicationLogs.filter((c) => c.eventId === effectiveEventId)

  if (isLoading) {
    return <p className="communication-page__empty">Memuat data...</p>
  }

  const handleSend = () => {
    if (!title.trim() || !message.trim()) return
    addCommunicationLog({
      id: nextId(),
      eventId: effectiveEventId,
      title: title.trim(),
      message: message.trim(),
      targetSegment: segment,
      sentAt: new Date().toISOString(),
    })
    setTitle('')
    setMessage('')
  }

  return (
    <div className="communication-page">
      <header className="communication-page__header">
        <h1>Communication</h1>
        <p>Kirim broadcast &amp; reminder ke volunteer, dan pantau riwayat pengiriman.</p>
      </header>

      <select value={effectiveEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
        {events.map((e) => (
          <option key={e.id} value={e.id}>{e.title}</option>
        ))}
      </select>

      <div className="card communication-page__composer">
        <h2>Buat Broadcast</h2>
        <label className="communication-page__field">
          <span>Target Segment</span>
          <select value={segment} onChange={(e) => setSegment(e.target.value)}>
            {SEGMENTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="communication-page__field">
          <span>Judul Pesan</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="mis. Reminder H-1 Kegiatan" />
        </label>
        <label className="communication-page__field">
          <span>Isi Pesan</span>
          <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
        </label>
        <button type="button" className="btn btn--primary btn--sm" onClick={handleSend}>
          <FiSend /> Kirim Broadcast
        </button>
      </div>

      <section className="communication-page__log">
        <h2>Communication Log</h2>
        <ScrollPane>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Judul</th>
                <th>Target</th>
                <th>Waktu Kirim</th>
              </tr>
            </thead>
            <tbody>
              {eventLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.title}</td>
                  <td>{log.targetSegment}</td>
                  <td>{new Date(log.sentAt).toLocaleString('id-ID')}</td>
                </tr>
              ))}
              {eventLogs.length === 0 && (
                <tr>
                  <td colSpan={3} className="communication-page__empty">Belum ada broadcast untuk event ini.</td>
                </tr>
              )}
            </tbody>
          </table>
        </ScrollPane>
      </section>
    </div>
  )
}
