import React from 'react'
import { 
  FiCalendar, FiUsers, FiCheckCircle, FiStar, FiActivity, FiSearch, FiMoreVertical
} from 'react-icons/fi'
import ReactECharts from 'echarts-for-react'
import '../ReportsPage.css'

export default function EventAnalyticsView() {
  const barOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['Environment', 'Education', 'Health', 'Social'], axisLine: { show: false }, axisTick: { show: false } },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } } },
    series: [
      { data: [120, 200, 150, 80], type: 'bar', itemStyle: { color: 'var(--color-primary-soft)', borderRadius: [4, 4, 0, 0] } }
    ]
  }

  const lineOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', boundaryGap: false, data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], axisLine: { show: false }, axisTick: { show: false } },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } } },
    series: [
      { name: 'Completion', type: 'line', smooth: true, itemStyle: { color: 'var(--color-success)' }, data: [82, 93, 90, 95, 99, 98] }
    ]
  }

  return (
    <>
      {/* KPI Cards */}
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon"><FiCalendar /></div>
          <div className="stat-card__value">24</div>
          <div className="stat-card__label">Total Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-soft)' }}><FiUsers /></div>
          <div className="stat-card__value">118</div>
          <div className="stat-card__label">Average Applicants</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-success)', background: '#f0fdf4' }}><FiCheckCircle /></div>
          <div className="stat-card__value">91%</div>
          <div className="stat-card__label">Attendance Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon"><FiActivity /></div>
          <div className="stat-card__value">95%</div>
          <div className="stat-card__label">Completion Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: '#f59e0b', background: '#fffbeb' }}><FiStar /></div>
          <div className="stat-card__value">4.8/5</div>
          <div className="stat-card__label">Volunteer Satisfaction</div>
        </div>
      </div>

      <div className="charts-grid-2">
        <section className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Popular Categories (Applicants)</h2>
          <ReactECharts option={barOption} style={{ height: 250 }} />
        </section>
        <section className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Event Completion Trend</h2>
          <ReactECharts option={lineOption} style={{ height: 250 }} />
        </section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <section className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Detailed Event Data</h2>
            <div className="v-filter-input">
              <FiSearch color="var(--color-text-muted)" />
              <input type="text" placeholder="Search events..." style={{ border: 'none', background: 'transparent', outline: 'none' }} />
            </div>
          </div>
          
          <div className="v-table-wrapper">
            <table className="v-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Applicants</th>
                  <th>Attendance</th>
                  <th>Vol Hours</th>
                  <th>Impact</th>
                  <th>Rating</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>Beach Cleanup</td>
                  <td>340</td>
                  <td>95%</td>
                  <td>1,240</td>
                  <td>12,500</td>
                  <td>4.9</td>
                  <td><span className="badge badge--success">Completed</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Education Camp</td>
                  <td>420</td>
                  <td>98%</td>
                  <td>3,400</td>
                  <td>8,200</td>
                  <td>4.8</td>
                  <td><span className="badge badge--success">Completed</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Digital Literacy</td>
                  <td>150</td>
                  <td>82%</td>
                  <td>600</td>
                  <td>3,100</td>
                  <td>4.5</td>
                  <td><span className="badge badge--success">Completed</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Side Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card" style={{ padding: '24px', background: 'linear-gradient(145deg, #eff6ff, #ffffff)', border: '1px solid #bfdbfe' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8' }}>
              🤖 Event Recommendations
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                <strong>Optimal Dates:</strong> Schedule environment events on Saturdays for a <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>+15%</span> registration boost.
              </div>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                <strong>Ideal Quota:</strong> Most of your events fill up perfectly at <strong>50-75 volunteers</strong>.
              </div>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                <strong>Prediction:</strong> Health-related events are projected to have a <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>surge in Q3</span>.
              </div>
            </div>
          </div>
          
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Event Leaderboard</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '8px', borderBottom: '1px solid var(--color-border-light)' }}>
                <span>🏆 Highest Attendance</span>
                <strong>Blood Donation</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '8px', borderBottom: '1px solid var(--color-border-light)' }}>
                <span>🔥 Most Applicants</span>
                <strong>Education Camp</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>⭐ Best Rated</span>
                <strong>Beach Cleanup</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
