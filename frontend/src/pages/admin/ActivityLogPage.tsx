import { useMemo, useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import { mockActivityLog } from '../../data/mockAdmin'
import Badge from '../../components/Badge'
import ScrollPane from '../../components/ScrollPane'
import './ActivityLogPage.css'

const ROLE_VARIANT = {
  ADMIN: 'info',
  ORGANIZER: 'warning',
  VOLUNTEER: 'success',
} as const

const timeFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export default function ActivityLogPage() {
  const [keyword, setKeyword] = useState('')

  const entries = useMemo(() => {
    const query = keyword.trim().toLowerCase()
    return [...mockActivityLog]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .filter((entry) => {
        if (!query) return true
        return (
          entry.actorName.toLowerCase().includes(query) ||
          entry.action.toLowerCase().includes(query) ||
          entry.targetLabel.toLowerCase().includes(query)
        )
      })
  }, [keyword])

  return (
    <div className="admin-log">
      <header className="admin-log__header">
        <h1>Log Aktivitas</h1>
        <p>Riwayat aksi penting admin dan organizer untuk keperluan audit.</p>
      </header>

      <div className="admin-log__search">
        <FiSearch />
        <input
          type="text"
          placeholder="Cari aktor, aksi, atau target..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      <ScrollPane>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Aktor</th>
              <th>Aksi</th>
              <th>Target</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td>{timeFormatter.format(new Date(entry.timestamp))}</td>
                <td>
                  {entry.actorName} <Badge variant={ROLE_VARIANT[entry.actorRole]}>{entry.actorRole}</Badge>
                </td>
                <td>{entry.action}</td>
                <td>{entry.targetLabel}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={4} className="admin-log__empty">
                  Tidak ada aktivitas yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </ScrollPane>
    </div>
  )
}
