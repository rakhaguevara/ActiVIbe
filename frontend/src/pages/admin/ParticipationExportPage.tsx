import { useMemo, useState } from 'react'
import { FiDownload, FiSearch, FiFilter, FiMoreVertical } from 'react-icons/fi'
import { mockParticipationRecords } from '../../data/mockAdmin'
import './ParticipationExportPage.css'

const EARLIEST_DATE = mockParticipationRecords.reduce(
  (min, r) => (r.date < min ? r.date : min),
  mockParticipationRecords[0]?.date ?? '',
)
const LATEST_DATE = mockParticipationRecords.reduce(
  (max, r) => (r.date > max ? r.date : max),
  mockParticipationRecords[0]?.date ?? '',
)

function toCsvValue(value: string | number) {
  const str = String(value)
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

export default function ParticipationExportPage() {
  const [fromDate, setFromDate] = useState(EARLIEST_DATE)
  const [toDate, setToDate] = useState(LATEST_DATE)

  const filteredRecords = useMemo(
    () => mockParticipationRecords.filter((r) => r.date >= fromDate && r.date <= toDate),
    [fromDate, toDate],
  )

  const handleExport = () => {
    const header = ['Nama Volunteer', 'Kegiatan', 'Tanggal', 'Hadir', 'Metrik Dampak', 'Nilai', 'Satuan']
    const rows = filteredRecords.map((r) => [
      r.userName,
      r.eventTitle,
      r.date,
      r.attended ? 'Ya' : 'Tidak',
      r.impactMetricLabel,
      r.impactValue,
      r.impactUnit,
    ])
    const csv = [header, ...rows].map((row) => row.map(toCsvValue).join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `partisipasi-${fromDate}-${toDate}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="admin-participation">
      
      {/* Top Header */}
      <header className="admin-global-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Partisipasi</h1>
          <div className="admin-breadcrumb">
            <span>Admin</span> <span className="sep">›</span> <span className="current">Partisipasi</span>
          </div>
        </div>
        <div className="admin-participation__header-search">
          <FiSearch />
          <input type="text" placeholder="Cari volunteer atau kegiatan..." />
        </div>
      </header>

      {/* KPI Cards (Scrollable) */}
      <div className="admin-participation__kpi-scroll">
        <div className="admin-participation__kpi-track">
          
          <div className="admin-participation__kpi-card">
            <div className="kpi-card__top">
              <div className="kpi-card__icon" style={{ background: '#e6f0ff', color: '#0066ff' }}>🌍</div>
              <span className="kpi-card__title">Lingkungan</span>
              <button className="kpi-card__more"><FiMoreVertical /></button>
            </div>
            <div className="kpi-card__bottom">
              <h2>5,420</h2>
              <span className="kpi-card__trend positive">📈 +12.5% dari bulan lalu</span>
            </div>
          </div>

          <div className="admin-participation__kpi-card">
            <div className="kpi-card__top">
              <div className="kpi-card__icon" style={{ background: '#fff4e6', color: '#ff9900' }}>📚</div>
              <span className="kpi-card__title">Pendidikan</span>
              <button className="kpi-card__more"><FiMoreVertical /></button>
            </div>
            <div className="kpi-card__bottom">
              <h2>3,150</h2>
              <span className="kpi-card__trend negative">📉 -2.1% dari bulan lalu</span>
            </div>
          </div>

          <div className="admin-participation__kpi-card">
            <div className="kpi-card__top">
              <div className="kpi-card__icon" style={{ background: '#e6ffe6', color: '#00cc00' }}>🏥</div>
              <span className="kpi-card__title">Kesehatan</span>
              <button className="kpi-card__more"><FiMoreVertical /></button>
            </div>
            <div className="kpi-card__bottom">
              <h2>1,200</h2>
              <span className="kpi-card__trend positive">📈 +5.4% dari bulan lalu</span>
            </div>
          </div>

          <div className="admin-participation__kpi-card">
            <div className="kpi-card__top">
              <div className="kpi-card__icon" style={{ background: '#f5e6ff', color: '#9900ff' }}>🤝</div>
              <span className="kpi-card__title">Sosial</span>
              <button className="kpi-card__more"><FiMoreVertical /></button>
            </div>
            <div className="kpi-card__bottom">
              <h2>850</h2>
              <span className="kpi-card__trend negative">📉 -1.2% dari bulan lalu</span>
            </div>
          </div>

          <div className="admin-participation__kpi-card">
            <div className="kpi-card__top">
              <div className="kpi-card__icon" style={{ background: '#ffe6e6', color: '#ff0000' }}>🌋</div>
              <span className="kpi-card__title">Bencana</span>
              <button className="kpi-card__more"><FiMoreVertical /></button>
            </div>
            <div className="kpi-card__bottom">
              <h2>420</h2>
              <span className="kpi-card__trend positive">📈 +2.4% dari bulan lalu</span>
            </div>
          </div>

          <div className="admin-participation__kpi-card">
            <div className="kpi-card__top">
              <div className="kpi-card__icon" style={{ background: '#fff0e6', color: '#cc6600' }}>🐾</div>
              <span className="kpi-card__title">Hewan</span>
              <button className="kpi-card__more"><FiMoreVertical /></button>
            </div>
            <div className="kpi-card__bottom">
              <h2>315</h2>
              <span className="kpi-card__trend positive">📈 +4.1% dari bulan lalu</span>
            </div>
          </div>

          <div className="admin-participation__kpi-card">
            <div className="kpi-card__top">
              <div className="kpi-card__icon" style={{ background: '#ffe6f0', color: '#cc0066' }}>🎨</div>
              <span className="kpi-card__title">Kesenian</span>
              <button className="kpi-card__more"><FiMoreVertical /></button>
            </div>
            <div className="kpi-card__bottom">
              <h2>150</h2>
              <span className="kpi-card__trend negative">📉 -0.5% dari bulan lalu</span>
            </div>
          </div>

        </div>
      </div>

      {/* Table Section */}
      <div className="admin-participation__table-wrap">
        
        {/* Table Toolbar */}
        <div className="admin-participation__table-toolbar">
          <div>
            <h2 className="table-toolbar__title">Partisipasi List</h2>
            <span className="table-toolbar__subtitle">Total {filteredRecords.length} records</span>
          </div>
          
          <div className="table-toolbar__actions">
            <div className="admin-participation__date-filter">
              <input type="date" value={fromDate} max={toDate} onChange={(e) => setFromDate(e.target.value)} />
              <span>-</span>
              <input type="date" value={toDate} min={fromDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
            <button className="btn-table-filter"><FiFilter /> Filter</button>
            <button className="btn-table-export" onClick={handleExport} disabled={filteredRecords.length === 0}><FiDownload /> Export CSV</button>
          </div>
        </div>

        {/* Table Content */}
        <div className="admin-participation__table-container">
          <table className="admin-participation__table-new">
            <thead>
              <tr>
                <th style={{ width: '40px' }}><input type="checkbox" /></th>
                <th>Volunteer Name <small>↕</small></th>
                <th>Kegiatan <small>↕</small></th>
                <th>Tanggal <small>↕</small></th>
                <th>Hadir <small>↕</small></th>
                <th>Metrik Dampak <small>↕</small></th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r) => (
                <tr key={r.id}>
                  <td><input type="checkbox" /></td>
                  <td>
                    <div className="user-cell">
                      <img src={`https://ui-avatars.com/api/?name=${r.userName}&background=random&color=fff`} alt={r.userName} className="user-avatar" />
                      <div className="user-info">
                        <strong>{r.userName}</strong>
                        <small>{r.userName.replace(/\s+/g, '').toLowerCase()}@mail.com</small>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{r.eventTitle}</td>
                  <td>{new Date(r.date).toLocaleDateString('en-GB').replace(/\//g, '-')}</td>
                  <td>
                    <span className={`status-badge ${r.attended ? 'badge-present' : 'badge-absent'}`}>
                      {r.attended ? 'Hadir' : 'Tidak Hadir'}
                    </span>
                  </td>
                  <td style={{ color: '#444' }}>
                    {r.impactValue > 0 ? <strong>{r.impactValue} <span style={{fontWeight: 400}}>{r.impactUnit}</span></strong> : '—'}
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    Tidak ada data partisipasi pada rentang tanggal ini.
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
