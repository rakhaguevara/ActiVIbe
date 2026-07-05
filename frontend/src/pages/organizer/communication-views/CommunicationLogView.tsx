import React from 'react'
import { 
  FiMessageSquare, FiCheckCircle, FiBookOpen, FiXCircle, FiSearch, FiMoreVertical, FiDownload
} from 'react-icons/fi'
import ReactECharts from 'echarts-for-react'
import '../CommunicationPage.css'

export default function CommunicationLogView() {
  const chartOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Delivery Rate', 'Open Rate'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], axisLine: { show: false }, axisTick: { show: false } },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } }, max: 100 },
    series: [
      {
        name: 'Delivery Rate', type: 'line', smooth: true,
        itemStyle: { color: 'var(--color-success)' },
        data: [98, 99, 97, 99, 100, 96, 98]
      },
      {
        name: 'Open Rate', type: 'line', smooth: true,
        itemStyle: { color: 'var(--color-primary)' },
        data: [82, 85, 88, 81, 91, 78, 87]
      }
    ]
  }

  return (
    <>
      {/* KPI Cards */}
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon"><FiMessageSquare /></div>
          <div className="stat-card__value">2,438</div>
          <div className="stat-card__label">Messages Sent</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-success)', background: '#f0fdf4' }}><FiCheckCircle /></div>
          <div className="stat-card__value">98%</div>
          <div className="stat-card__label">Delivered</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-soft)' }}><FiBookOpen /></div>
          <div className="stat-card__value">87%</div>
          <div className="stat-card__label">Opened</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-danger)', background: '#fef2f2' }}><FiXCircle /></div>
          <div className="stat-card__value">24</div>
          <div className="stat-card__label">Failed Deliveries</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Engagement Analytics</h2>
            <ReactECharts option={chartOption} style={{ height: 300 }} />
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Communication History</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="v-filter-input">
                  <FiSearch color="var(--color-text-muted)" />
                  <input type="text" placeholder="Search logs..." style={{ border: 'none', background: 'transparent', outline: 'none' }} />
                </div>
                <button className="btn btn--outline"><FiDownload /> Export Log</button>
              </div>
            </div>
            
            <div className="v-table-wrapper">
              <table className="v-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Message Title</th>
                    <th>Recipients</th>
                    <th>Delivery</th>
                    <th>Open Rate</th>
                    <th>Sent By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ color: 'var(--color-text-muted)' }}>July 7, 09:30</td>
                    <td style={{ fontWeight: 600 }}>Schedule Reminder</td>
                    <td>125</td>
                    <td><span className="badge badge--success">Delivered</span></td>
                    <td><strong>92%</strong></td>
                    <td>Emma</td>
                    <td><button className="btn btn--sm btn--outline" style={{ padding: '0 8px' }}><FiMoreVertical/></button></td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--color-text-muted)' }}>July 6, 14:00</td>
                    <td style={{ fontWeight: 600 }}>Equipment Reminder</td>
                    <td>82</td>
                    <td><span className="badge badge--success">Delivered</span></td>
                    <td><strong>87%</strong></td>
                    <td>Noah</td>
                    <td><button className="btn btn--sm btn--outline" style={{ padding: '0 8px' }}><FiMoreVertical/></button></td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--color-text-muted)' }}>July 5, 10:15</td>
                    <td style={{ fontWeight: 600 }}>Volunteer Confirmation</td>
                    <td>240</td>
                    <td><span className="badge badge--success">Delivered</span></td>
                    <td><strong>95%</strong></td>
                    <td>Sophia</td>
                    <td><button className="btn btn--sm btn--outline" style={{ padding: '0 8px' }}><FiMoreVertical/></button></td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--color-text-muted)' }}>July 3, 17:00</td>
                    <td style={{ fontWeight: 600 }}>Thank You</td>
                    <td>202</td>
                    <td><span className="badge badge--success">Delivered</span></td>
                    <td><strong>91%</strong></td>
                    <td>Emma</td>
                    <td><button className="btn btn--sm btn--outline" style={{ padding: '0 8px' }}><FiMoreVertical/></button></td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--color-text-muted)' }}>July 1, 08:00</td>
                    <td style={{ fontWeight: 600 }}>Registration Open</td>
                    <td>1,450</td>
                    <td><span className="badge badge--warning">98% Delivered</span></td>
                    <td><strong>74%</strong></td>
                    <td>System</td>
                    <td><button className="btn btn--sm btn--outline" style={{ padding: '0 8px' }}><FiMoreVertical/></button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Side Widgets */}
        <section className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Activity Stream</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div className="timeline-event">
              <div className="timeline-event__icon" style={{ background: '#f0fdf4', color: 'var(--color-success)' }}><FiCheckCircle size={12} /></div>
              <div className="timeline-event__content" style={{ padding: '12px' }}>
                <div style={{ fontSize: '12px' }}><strong>125 messages</strong> delivered for Schedule Reminder.</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Today, 09:32 AM</div>
              </div>
            </div>
            <div className="timeline-event">
              <div className="timeline-event__icon" style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}><FiMessageSquare size={12} /></div>
              <div className="timeline-event__content" style={{ padding: '12px' }}>
                <div style={{ fontSize: '12px' }}><strong>Emma</strong> sent Schedule Reminder broadcast.</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Today, 09:30 AM</div>
              </div>
            </div>
            <div className="timeline-event">
              <div className="timeline-event__icon" style={{ background: '#fef2f2', color: 'var(--color-danger)' }}><FiXCircle size={12} /></div>
              <div className="timeline-event__content" style={{ padding: '12px' }}>
                <div style={{ fontSize: '12px' }}><strong>3 bounces</strong> detected for Registration Open.</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>July 1, 08:05 AM</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
