import { useEffect, useMemo, useState } from 'react'
import { FiDownload, FiSearch, FiFilter, FiMoreVertical } from 'react-icons/fi'
import { listParticipation, listParticipationCategories } from '../../lib/adminApi'
import type { ParticipationRecord, ParticipationCategoryStat } from '../../types/admin'
import './ParticipationExportPage.css'

function toCsvValue(value: string | number) {
  const str = String(value)
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

// Emoji + warna pastel per kategori event (sesuai CATEGORY_OPTIONS di
// CreateEventPage.tsx). Kategori di luar daftar ini (kalau ada data lama)
// jatuh ke fallback generik, bukan disembunyikan.
const CATEGORY_META: Record<string, { emoji: string; bg: string; color: string }> = {
  'Lingkungan': { emoji: '🌍', bg: '#e6f0ff', color: '#0066ff' },
  'Pendidikan': { emoji: '📚', bg: '#fff4e6', color: '#ff9900' },
  'Kesehatan': { emoji: '❤️', bg: '#e6ffe6', color: '#00cc00' },
  'Sosial': { emoji: '🤝', bg: '#f5e6ff', color: '#9900ff' },
  'Teknologi': { emoji: '💻', bg: '#fff0e6', color: '#cc6600' },
  'Seni & Budaya': { emoji: '🎨', bg: '#ffe6f0', color: '#cc0066' },
  'Umum': { emoji: '🌐', bg: '#ffe6e6', color: '#ff0000' },
}
const DEFAULT_CATEGORY_META = { emoji: '✨', bg: '#f0f0f0', color: '#666666' }

function getCategoryMeta(category: string) {
  return CATEGORY_META[category] ?? DEFAULT_CATEGORY_META
}

export default function ParticipationExportPage() {
  const [records, setRecords] = useState<ParticipationRecord[]>([])
  const [categoryStats, setCategoryStats] = useState<ParticipationCategoryStat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([listParticipation(), listParticipationCategories()])
      .then(([data, categories]) => {
        if (cancelled) return
        setRecords(data)
        setCategoryStats(categories)
        if (data.length > 0) {
          const dates = data.map((r) => r.date)
          setFromDate(dates.reduce((min, d) => (d < min ? d : min), dates[0]))
          setToDate(dates.reduce((max, d) => (d > max ? d : max), dates[0]))
        }
      })
      .catch((err) => window.alert(err instanceof Error ? err.message : 'Gagal memuat data partisipasi.'))
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [])

  const filteredRecords = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()
    return records.filter((r) => {
      const inDateRange = (!fromDate || r.date >= fromDate) && (!toDate || r.date <= toDate)
      const matchesKeyword = !keyword
        || r.userName.toLowerCase().includes(keyword)
        || r.eventTitle.toLowerCase().includes(keyword)
      return inDateRange && matchesKeyword
    })
  }, [records, fromDate, toDate, searchTerm])

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
          <input
            type="text"
            placeholder="Cari volunteer atau kegiatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* KPI Cards (Scrollable) */}
      <div className="admin-participation__kpi-scroll">
        <div className="admin-participation__kpi-track">
          {isLoading && (
            <span style={{ color: '#999', padding: '8px 0' }}>Memuat ringkasan kategori...</span>
          )}
          {!isLoading && categoryStats.length === 0 && (
            <span style={{ color: '#999', padding: '8px 0' }}>Belum ada data partisipasi per kategori.</span>
          )}
          {categoryStats.map((stat) => {
            const meta = getCategoryMeta(stat.category)
            const hasTrend = stat.growthPct !== null
            const isPositive = (stat.growthPct ?? 0) >= 0
            return (
              <div className="admin-participation__kpi-card" key={stat.category}>
                <div className="kpi-card__top">
                  <div className="kpi-card__icon" style={{ background: meta.bg, color: meta.color }}>{meta.emoji}</div>
                  <span className="kpi-card__title">{stat.category}</span>
                  <button className="kpi-card__more"><FiMoreVertical /></button>
                </div>
                <div className="kpi-card__bottom">
                  <h2>{stat.count.toLocaleString('id-ID')}</h2>
                  {hasTrend ? (
                    <span className={`kpi-card__trend ${isPositive ? 'positive' : 'negative'}`}>
                      {isPositive ? '📈' : '📉'} {isPositive ? '+' : ''}{stat.growthPct}% dari bulan lalu
                    </span>
                  ) : (
                    <span className="kpi-card__trend">Belum ada data bulan lalu</span>
                  )}
                </div>
              </div>
            )
          })}
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
                        <small>{r.userEmail}</small>
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
              {isLoading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    Memuat data partisipasi...
                  </td>
                </tr>
              )}
              {!isLoading && filteredRecords.length === 0 && (
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
