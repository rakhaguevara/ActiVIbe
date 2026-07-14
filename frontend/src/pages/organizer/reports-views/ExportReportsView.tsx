import { useState } from 'react'
import {
  FiDownloadCloud, FiFileText, FiActivity, FiSettings, FiCheckCircle,
} from 'react-icons/fi'
import { getMyOrganization } from '../../../lib/organizationApi'
import { getReportsOverview, getEventBreakdown } from '../../../lib/reportsApi'
import {
  buildOverviewCsv, buildEventBreakdownCsv, buildOverviewReportPdf, buildEventBreakdownPdf, downloadCsv, downloadPdf,
} from '../../../utils/reportExport'
import '../ReportsPage.css'

// Kategori kegiatan bebas teks (lihat CATEGORY_OPTIONS di CreateEventPage.tsx)
// — daftar ini cuma preset umum utk filter, bukan taksonomi tetap.
const CATEGORY_FILTER_OPTIONS = ['Lingkungan', 'Pendidikan', 'Kesehatan', 'Sosial', 'Teknologi', 'Seni & Budaya', 'Umum']

type ReportType = 'overview' | 'event-breakdown'
type ExportFormat = 'csv' | 'pdf'

interface SessionExport {
  id: string
  label: string
  format: ExportFormat
  generatedAt: string
}

interface ExportReportsViewProps {
  // Date range dikontrol dari header ReportsPage ("Select Date Range") supaya
  // satu rentang tanggal yang sama dipakai baik lewat header maupun form di
  // sini — lihat ReportsPage.tsx.
  dateFrom: string
  dateTo: string
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
}

export default function ExportReportsView({ dateFrom, dateTo, onDateFromChange, onDateToChange }: ExportReportsViewProps) {
  const [reportType, setReportType] = useState<ReportType>('overview')
  const [format, setFormat] = useState<ExportFormat>('pdf')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  // "Recent Exports" tidak punya sumber data histori nyata (AuditLog dibaca
  // organizer-side belum ada endpoint-nya) — daripada memalsukan tabel,
  // ini murni daftar sesi berjalan (hilang saat refresh), jujur soal
  // keterbatasannya lewat teks di bawah tabel.
  const [sessionExports, setSessionExports] = useState<SessionExport[]>([])

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const filter = { from: dateFrom || undefined, to: dateTo || undefined }

      if (reportType === 'overview') {
        const overview = await getReportsOverview(filter)
        const label = 'Laporan Ringkasan (Overview)'
        if (format === 'csv') {
          downloadCsv(buildOverviewCsv(overview), `laporan-overview-${Date.now()}.csv`)
        } else {
          const organization = await getMyOrganization().catch(() => null)
          const bytes = await buildOverviewReportPdf(overview, organization?.name ?? 'Organisasi')
          downloadPdf(bytes, `laporan-overview-${Date.now()}.pdf`)
        }
        setSessionExports((prev) => [{ id: crypto.randomUUID(), label, format, generatedAt: new Date().toISOString() }, ...prev])
      } else {
        let rows = await getEventBreakdown(filter)
        if (categoryFilter) {
          rows = rows.filter((r) => (r.category ?? 'Umum') === categoryFilter)
        }
        const label = 'Laporan Rincian per Event (Event Breakdown)'
        if (format === 'csv') {
          downloadCsv(buildEventBreakdownCsv(rows), `laporan-event-breakdown-${Date.now()}.csv`)
        } else {
          const organization = await getMyOrganization().catch(() => null)
          const bytes = await buildEventBreakdownPdf(rows, organization?.name ?? 'Organisasi')
          downloadPdf(bytes, `laporan-event-breakdown-${Date.now()}.pdf`)
        }
        setSessionExports((prev) => [{ id: crypto.randomUUID(), label, format, generatedAt: new Date().toISOString() }, ...prev])
      }
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal membuat laporan, coba lagi.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          <section className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Select Report Type</h2>

            {/* Cuma 2 tipe laporan yang punya sumber data nyata (buildOrganizerSummary
                utk Overview, Application+EventCloseReport per event utk Event
                Breakdown) — "Volunteer Report"/"Certificates Log" sengaja tidak
                dibangun, tidak ada agregat backend khusus utk itu di luar yang
                sudah ada di halaman Volunteers/Certificates sendiri. */}
            <div className="export-options-grid">
              <div
                className={reportType === 'overview' ? 'export-card active' : 'export-card'}
                onClick={() => setReportType('overview')}
                role="button"
                tabIndex={0}
              >
                <FiFileText className="export-card__icon" />
                <div className="export-card__title">Overview Report</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>KPI dashboard & aktivitas terbaru</div>
              </div>
              <div
                className={reportType === 'event-breakdown' ? 'export-card active' : 'export-card'}
                onClick={() => setReportType('event-breakdown')}
                role="button"
                tabIndex={0}
              >
                <FiActivity className="export-card__icon" style={{ color: 'var(--color-success)' }} />
                <div className="export-card__title">Event Breakdown</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Pendaftar, diterima, hadir, jam per event</div>
              </div>
            </div>
          </section>

          <section className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Recent Exports (Sesi Ini)</h2>
            {sessionExports.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                Belum ada laporan yang dibuat pada sesi ini. Daftar ini hanya menampilkan unduhan sesi berjalan
                (bukan riwayat permanen) — belum ada endpoint utk membaca riwayat ekspor tersimpan.
              </p>
            ) : (
              <div className="v-table-wrapper">
                <table className="v-table">
                  <thead>
                    <tr>
                      <th>Laporan</th>
                      <th>Format</th>
                      <th>Waktu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionExports.map((exp) => (
                      <tr key={exp.id}>
                        <td style={{ fontWeight: 600 }}><FiCheckCircle style={{ marginRight: '8px', color: 'var(--color-success)' }} /> {exp.label}</td>
                        <td>{exp.format.toUpperCase()}</td>
                        <td>{new Date(exp.generatedAt).toLocaleTimeString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* Side Form */}
        <section className="card" style={{ padding: '24px', position: 'sticky', top: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiSettings /> Report Settings
          </h2>

          <div className="export-settings-group">
            <label>Date Range</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="date" value={dateFrom} max={dateTo || undefined} onChange={(e) => onDateFromChange(e.target.value)} />
              <input type="date" value={dateTo} min={dateFrom || undefined} onChange={(e) => onDateToChange(e.target.value)} />
            </div>
          </div>

          {reportType === 'event-breakdown' && (
            <div className="export-settings-group">
              <label>Event Category Filter</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="">Semua Kategori</option>
                {CATEGORY_FILTER_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          <div className="export-settings-group">
            <label>Format</label>
            {/* Excel dihapus — tidak ada library Excel di codebase ini
                (backend murni JSON, semua export client-side pdf-lib/CSV
                polos), lihat CLAUDE.md & plan Phase 6. */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 400 }}>
                <input type="radio" name="fmt" checked={format === 'pdf'} onChange={() => setFormat('pdf')} /> PDF
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 400 }}>
                <input type="radio" name="fmt" checked={format === 'csv'} onChange={() => setFormat('csv')} /> CSV
              </label>
            </div>
          </div>

          <button
            className="btn btn--primary"
            style={{ width: '100%', marginTop: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            <FiDownloadCloud /> {isGenerating ? 'Membuat laporan...' : 'Generate Report'}
          </button>
        </section>
      </div>
    </>
  )
}
