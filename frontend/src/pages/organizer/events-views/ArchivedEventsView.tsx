import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  FiSearch, FiArchive, FiDatabase, FiFileText, FiTrendingUp, FiDownload, FiRefreshCcw, FiMoreVertical
} from 'react-icons/fi'
import ReactECharts from 'echarts-for-react'
import '../EventsPage.css'

interface ArchivedEvent {
  id: string
  title: string
  category: string
  archiveDate: string
  finalImpact: number
  certificatesCount: number
}

const DUMMY_ARCHIVED: ArchivedEvent[] = [
  { id: 'a1', title: 'Tree Planting 2024', category: 'Environment', archiveDate: '2024-12-01', finalImpact: 1200, certificatesCount: 85 },
  { id: 'a2', title: 'Food Bank Distribution (Covid)', category: 'Social', archiveDate: '2022-08-15', finalImpact: 5000, certificatesCount: 210 },
  { id: 'a3', title: 'Annual Teaching Summit 2023', category: 'Education', archiveDate: '2023-11-20', finalImpact: 800, certificatesCount: 45 }
]

export default function ArchivedEventsView() {
  const [events] = useState<ArchivedEvent[]>(DUMMY_ARCHIVED)

  const yearlyStatsOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['2022', '2023', '2024', '2025'], axisLine: { show: false }, axisTick: { show: false } },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } } },
    series: [
      {
        data: [12, 18, 24, 8],
        type: 'bar',
        itemStyle: { color: 'var(--color-primary-soft)', borderRadius: [4, 4, 0, 0] },
        emphasis: { itemStyle: { color: 'var(--color-primary)' } }
      }
    ]
  }

  return (
    <div className="events-hub" style={{ flexDirection: 'column' }}>
      {/* KPI Cards */}
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-text-muted)', background: '#f1f5f9' }}><FiArchive /></div>
          <div className="stat-card__value">142</div>
          <div className="stat-card__label">Archived Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon"><FiDatabase /></div>
          <div className="stat-card__value">2.4 GB</div>
          <div className="stat-card__label">Storage Size</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon"><FiFileText /></div>
          <div className="stat-card__value">142</div>
          <div className="stat-card__label">Archived Reports</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-soft)' }}><FiTrendingUp /></div>
          <div className="stat-card__value">45,000+</div>
          <div className="stat-card__label">Historical Impact Score</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <section className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Historical Events (Read-Only)</h2>
            <div className="v-filter-input" style={{ width: '250px' }}>
              <FiSearch color="var(--color-text-muted)" />
              <input type="text" placeholder="Search archive..." style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }} />
            </div>
          </div>
          
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
                {events.map(ev => (
                  <tr key={ev.id}>
                    <td style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>
                      {ev.title}
                    </td>
                    <td><span className="badge" style={{ background: '#f1f5f9' }}>{ev.category}</span></td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{ev.archiveDate}</td>
                    <td><strong>{ev.finalImpact}</strong></td>
                    <td>{ev.certificatesCount} Generated</td>
                    <td>
                      <div className="v-table-actions">
                        <button className="btn btn--sm btn--outline" title="Export Data"><FiDownload /></button>
                        <button className="btn btn--sm btn--outline" title="Restore Event"><FiRefreshCcw /></button>
                        <button className="btn btn--sm btn--outline" style={{ padding: '0 8px' }}><FiMoreVertical/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Side Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Yearly Archive Stats</h3>
            <ReactECharts option={yearlyStatsOption} style={{ height: 200 }} />
          </div>
          
          <div className="card" style={{ padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiArchive /> Archive Policy
            </h3>
            <p style={{ fontSize: '13px', margin: '0 0 12px 0', color: 'var(--color-text-muted)' }}>
              Completed events are automatically archived after <strong>1 year</strong> to save workspace storage. Archived events are strictly read-only unless restored.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
