import { useMemo, useState } from 'react'
import {
  FiSearch, FiArchive, FiFileText, FiTrendingUp, FiRefreshCcw,
} from 'react-icons/fi'
import ReactECharts from 'echarts-for-react'
import { useOrganizerData } from '../../../contexts/OrganizerDataContext'
import '../EventsPage.css'

export default function ArchivedEventsView() {
  const { events, certificates, restoreEvent } = useOrganizerData()
  const [search, setSearch] = useState('')
  const [restoringId, setRestoringId] = useState<string | null>(null)

  const archived = useMemo(() => events.filter((e) => e.status === 'archived'), [events])
  const filtered = archived.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()))

  const totalCertificates = archived.reduce(
    (sum, e) => sum + certificates.filter((c) => c.eventId === e.id).length,
    0,
  )
  const totalImpact = archived.reduce((sum, e) => sum + (e.impactValue ?? 0), 0)

  const yearlyStats = useMemo(() => {
    const counts = new Map<string, number>()
    for (const event of archived) {
      if (!event.archivedAt) continue
      const year = new Date(event.archivedAt).getFullYear().toString()
      counts.set(year, (counts.get(year) ?? 0) + 1)
    }
    const years = Array.from(counts.keys()).sort()
    return { years, values: years.map((y) => counts.get(y) ?? 0) }
  }, [archived])

  const yearlyStatsOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: yearlyStats.years, axisLine: { show: false }, axisTick: { show: false } },
    yAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } } },
    series: [
      {
        data: yearlyStats.values,
        type: 'bar',
        itemStyle: { color: 'var(--color-primary-soft)', borderRadius: [4, 4, 0, 0] },
        emphasis: { itemStyle: { color: 'var(--color-primary)' } },
      },
    ],
  }

  const handleRestore = async (eventId: string) => {
    setRestoringId(eventId)
    try {
      await restoreEvent(eventId)
    } finally {
      setRestoringId(null)
    }
  }

  return (
    <div className="events-hub" style={{ flexDirection: 'column' }}>
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-text-muted)', background: '#f1f5f9' }}><FiArchive /></div>
          <div className="stat-card__value">{archived.length}</div>
          <div className="stat-card__label">Archived Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon"><FiFileText /></div>
          <div className="stat-card__value">{totalCertificates}</div>
          <div className="stat-card__label">Total Sertifikat Terbit</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-soft)' }}><FiTrendingUp /></div>
          <div className="stat-card__value">{totalImpact}</div>
          <div className="stat-card__label">Total Impact Score</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-xl)', alignItems: 'start' }}>
        <section className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Historical Events (Read-Only)</h2>
            <div className="v-filter-input" style={{ width: '250px' }}>
              <FiSearch color="var(--color-text-muted)" />
              <input
                type="text"
                placeholder="Search archive..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>Belum ada kegiatan yang diarsipkan.</p>
          ) : (
            <div className="v-table-wrapper">
              <table className="v-table">
                <thead>
                  <tr>
                    <th>Event Title</th>
                    <th>Category</th>
                    <th>Archive Date</th>
                    <th>Final Impact</th>
                    <th>Certificates</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((event) => (
                    <tr key={event.id}>
                      <td style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>{event.title}</td>
                      <td><span className="badge" style={{ background: '#f1f5f9' }}>{event.category ?? 'Umum'}</span></td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{event.archivedAt ? new Date(event.archivedAt).toLocaleDateString('id-ID') : '-'}</td>
                      <td><strong>{event.impactValue !== undefined ? `${event.impactValue} ${event.impactMetricUnit}` : '-'}</strong></td>
                      <td>{certificates.filter((c) => c.eventId === event.id).length} Diterbitkan</td>
                      <td>
                        <div className="v-table-actions">
                          <button
                            type="button"
                            className="btn btn--sm btn--outline"
                            title="Restore Event"
                            disabled={restoringId === event.id}
                            onClick={() => handleRestore(event.id)}
                          >
                            <FiRefreshCcw /> {restoringId === event.id ? 'Memulihkan...' : 'Restore'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Yearly Archive Stats</h3>
            {yearlyStats.years.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Belum ada data.</p>
            ) : (
              <ReactECharts option={yearlyStatsOption} style={{ height: 200 }} />
            )}
          </div>

          <div className="card" style={{ padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiArchive /> Archive Policy
            </h3>
            <p style={{ fontSize: '13px', margin: '0 0 12px 0', color: 'var(--color-text-muted)' }}>
              Kegiatan yang sudah selesai (Completed) bisa diarsipkan manual oleh organizer dari halaman detail kegiatan. Kegiatan yang diarsipkan bersifat read-only dan bisa dipulihkan kapan saja lewat tombol Restore.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
