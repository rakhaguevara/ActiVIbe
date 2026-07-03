import { useMemo, useState } from 'react'
import { FiDownload } from 'react-icons/fi'
import { mockParticipationRecords } from '../../data/mockAdmin'
import Badge from '../../components/Badge'
import ScrollPane from '../../components/ScrollPane'
import { formatDateShort } from '../../utils/formatDate'
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
      <header className="admin-participation__header">
        <h1>Ekspor Data Partisipasi</h1>
        <p>Pilih rentang tanggal, lalu unduh data partisipasi volunteer sebagai CSV.</p>
      </header>

      <div className="admin-participation__toolbar">
        <label>
          Dari
          <input type="date" value={fromDate} max={toDate} onChange={(e) => setFromDate(e.target.value)} />
        </label>
        <label>
          Sampai
          <input type="date" value={toDate} min={fromDate} onChange={(e) => setToDate(e.target.value)} />
        </label>
        <button type="button" className="btn btn--primary btn--sm" onClick={handleExport} disabled={filteredRecords.length === 0}>
          <FiDownload /> Ekspor CSV
        </button>
      </div>

      <p className="admin-participation__count">{filteredRecords.length} baris dalam rentang ini</p>

      <ScrollPane>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Volunteer</th>
              <th>Kegiatan</th>
              <th>Tanggal</th>
              <th>Hadir</th>
              <th>Dampak</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((r) => (
              <tr key={r.id}>
                <td>{r.userName}</td>
                <td>{r.eventTitle}</td>
                <td>{formatDateShort(r.date)}</td>
                <td>
                  <Badge variant={r.attended ? 'success' : 'danger'}>{r.attended ? 'Hadir' : 'Tidak Hadir'}</Badge>
                </td>
                <td>
                  {r.impactValue > 0 ? `${r.impactValue} ${r.impactUnit}` : '—'}
                </td>
              </tr>
            ))}
            {filteredRecords.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-participation__empty">
                  Tidak ada data partisipasi pada rentang tanggal ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </ScrollPane>
    </div>
  )
}
