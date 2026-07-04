import { useMemo, useState } from 'react'
import { FiSearch, FiPrinter, FiColumns, FiFileText } from 'react-icons/fi'
import { mockActivityLog } from '../../data/mockAdmin'
import './ActivityLogPage.css'



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
    <div className="admin-log" style={{ padding: '24px', width: '100%', fontFamily: 'var(--font-body)' }}>
      <header className="admin-global-header">
        <h1>Log Aktivitas</h1>
        <div className="admin-breadcrumb">
          <span>Admin</span> <span className="sep">›</span> <span className="current">Log Aktivitas</span>
        </div>
      </header>
      
      <div className="admin-log__history-section">
        <div className="admin-log__history-header">
          <div>
            <h1 className="admin-log__history-title">Aktivitas Keseluruhan App</h1>
            <p className="admin-log__history-subtitle">Pantau seluruh riwayat aktivitas terbaru pengguna</p>
          </div>
          
          <div className="admin-log__history-actions">
            <div className="admin-log__search">
              <FiSearch />
              <input
                type="text"
                placeholder="Cari aktor, aksi..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <div className="admin-log__history-filter">
              Status: <strong>Semua</strong> <small>▼</small>
            </div>
            <div className="admin-log__history-filter">
              Waktu: <strong>Semua</strong> <small>▼</small>
            </div>
            <div className="admin-log__history-icons">
              <FiPrinter />
              <FiColumns />
              <FiFileText />
            </div>
          </div>
        </div>

        <div className="admin-log__table-container">
          <table className="admin-log__table">
            <thead>
              <tr>
                <th style={{width: '40px'}}><input type="checkbox"/></th>
                <th>ID Aktivitas <small>↕</small></th>
                <th>Nama Pelaku <small>↕</small></th>
                <th>Tipe Aktivitas <small>↕</small></th>
                <th>Tanggal & Waktu <small>↕</small></th>
                <th>Detail <small>↕</small></th>
                <th>Status <small>↕</small></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td><input type="checkbox"/></td>
                  <td style={{ fontWeight: 600 }}>#{entry.id.toUpperCase().replace('-', '')}</td>
                  <td style={{ fontWeight: 600, color: '#222' }}>{entry.actorName}</td>
                  <td>{entry.action}</td>
                  <td>{timeFormatter.format(new Date(entry.timestamp)).replace(' pukul', ' at')}</td>
                  <td>{entry.targetLabel}</td>
                  <td>
                    <span style={{ 
                      color: entry.action.includes('Tolak') || entry.action.includes('Nonaktif') || entry.action.includes('Tangguh') ? '#f75555' : 
                             entry.action.includes('Mengajukan') ? '#ff9d00' : '#00b06b',
                      fontWeight: 500
                    }}>
                      {entry.action.includes('Tolak') || entry.action.includes('Nonaktif') || entry.action.includes('Tangguh') ? 'Rejected' : 
                       entry.action.includes('Mengajukan') ? 'Pending' : 'Delivered'}
                    </span>
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={7} className="admin-log__empty">
                    Tidak ada aktivitas yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
