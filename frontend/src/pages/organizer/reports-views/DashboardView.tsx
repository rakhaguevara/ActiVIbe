import React from 'react'
import { Link } from 'react-router-dom'
import { 
  FiCalendar, FiUsers, FiFileText, FiCheckCircle, FiClock, FiGlobe, FiTrendingUp, FiActivity
} from 'react-icons/fi'
import ReactECharts from 'echarts-for-react'
import '../ReportsPage.css'

export default function DashboardView() {
  const chartOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Events', 'Applications'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], axisLine: { show: false }, axisTick: { show: false } },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } } },
    series: [
      { name: 'Events', type: 'bar', itemStyle: { color: 'var(--color-primary-soft)', borderRadius: [4, 4, 0, 0] }, data: [2, 3, 5, 4, 6, 2, 2] },
      { name: 'Applications', type: 'line', smooth: true, itemStyle: { color: 'var(--color-primary)' }, data: [120, 320, 850, 640, 1100, 420, 540] }
    ]
  }

  const impactChartOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['Q1', 'Q2', 'Q3', 'Q4'], axisLine: { show: false }, axisTick: { show: false } },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } } },
    series: [
      { type: 'line', smooth: true, areaStyle: { color: '#dcfce7', opacity: 0.5 }, itemStyle: { color: 'var(--color-success)' }, data: [12000, 35000, 24000, 27540] }
    ]
  }

  return (
    <>
      {/* KPI Cards */}
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-soft)' }}><FiCalendar /></div>
          <div className="stat-card__value" style={{ fontSize: '20px' }}>24</div>
          <div className="stat-card__label">Total Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon"><FiUsers /></div>
          <div className="stat-card__value" style={{ fontSize: '20px' }}>1,284</div>
          <div className="stat-card__label">Total Volunteers</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon"><FiFileText /></div>
          <div className="stat-card__value" style={{ fontSize: '20px' }}>2,845</div>
          <div className="stat-card__label">Applications</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-success)', background: '#f0fdf4' }}><FiCheckCircle /></div>
          <div className="stat-card__value" style={{ fontSize: '20px' }}>91%</div>
          <div className="stat-card__label">Attendance Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon"><FiClock /></div>
          <div className="stat-card__value" style={{ fontSize: '20px' }}>12,940</div>
          <div className="stat-card__label">Volunteer Hours</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: '#f59e0b', background: '#fffbeb' }}><FiGlobe /></div>
          <div className="stat-card__value" style={{ fontSize: '20px' }}>98,540</div>
          <div className="stat-card__label">Total Impact Score</div>
        </div>
      </div>

      <div className="charts-grid-2">
        <section className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Event & Application Trends</h2>
          <ReactECharts option={chartOption} style={{ height: 300 }} />
        </section>
        <section className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Impact Growth (Quarterly)</h2>
          <ReactECharts option={impactChartOption} style={{ height: 300 }} />
        </section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <section className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Top Performing Events</h2>
            <Link to="/organizer/reports?tab=event" className="btn btn--sm btn--outline">View All</Link>
          </div>
          
          <div className="v-table-wrapper">
            <table className="v-table">
              <thead>
                <tr>
                  <th>Event Title</th>
                  <th>Applicants</th>
                  <th>Attendance</th>
                  <th>Volunteer Hours</th>
                  <th>Impact Score</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>Beach Cleanup</td>
                  <td>340</td>
                  <td><strong>95%</strong></td>
                  <td>1,240</td>
                  <td><span className="badge badge--success">+12,500</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Education Camp</td>
                  <td>420</td>
                  <td><strong>98%</strong></td>
                  <td>3,400</td>
                  <td><span className="badge badge--success">+8,200</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Blood Donation</td>
                  <td>120</td>
                  <td><strong>100%</strong></td>
                  <td>480</td>
                  <td><span className="badge badge--success">+15,000</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Mangrove Planting</td>
                  <td>210</td>
                  <td><strong>92%</strong></td>
                  <td>840</td>
                  <td><span className="badge badge--success">+9,400</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Side Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card" style={{ padding: '24px', background: 'linear-gradient(145deg, #f0fdf4, #ffffff)', border: '1px solid #bbf7d0' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)' }}>
              ✨ Executive AI Insights
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                Attendance <strong style={{ color: 'var(--color-success)' }}>increased by 12%</strong> compared to last month.
              </div>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                <strong>Environment events</strong> generate the highest overall volunteer engagement.
              </div>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                Saturday events achieve the <strong>highest attendance rate</strong> (96%).
              </div>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                Education programs have the <strong>highest volunteer retention</strong>.
              </div>
            </div>
          </div>
          
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Recent Org Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              <div className="timeline-event" style={{ paddingBottom: '16px' }}>
                <div className="timeline-event__icon" style={{ width: '16px', height: '16px', background: 'var(--color-primary)' }}></div>
                <div style={{ paddingLeft: '8px', fontSize: '13px' }}>
                  <div><strong>125 Certificates</strong> Generated</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>2 hours ago</div>
                </div>
              </div>
              <div className="timeline-event" style={{ paddingBottom: '16px' }}>
                <div className="timeline-event__icon" style={{ width: '16px', height: '16px', background: 'var(--color-success)' }}></div>
                <div style={{ paddingLeft: '8px', fontSize: '13px' }}>
                  <div><strong>Impact Score</strong> Updated</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Yesterday</div>
                </div>
              </div>
              <div className="timeline-event" style={{ paddingBottom: '0' }}>
                <div className="timeline-event__icon" style={{ width: '16px', height: '16px', background: 'var(--color-warning)' }}></div>
                <div style={{ paddingLeft: '8px', fontSize: '13px' }}>
                  <div><strong>Annual Report</strong> Exported</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>2 days ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
