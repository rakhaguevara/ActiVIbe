import React from 'react'
import { 
  FiUsers, FiUserCheck, FiHeart, FiClock, FiStar, FiTrendingUp
} from 'react-icons/fi'
import ReactECharts from 'echarts-for-react'
import '../ReportsPage.css'

export default function VolunteerAnalyticsView() {
  const pieOption = {
    tooltip: { trigger: 'item' },
    legend: { top: 'bottom' },
    series: [
      {
        name: 'Age Groups',
        type: 'pie',
        radius: ['40%', '70%'],
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        data: [
          { value: 450, name: '18-24' },
          { value: 520, name: '25-34' },
          { value: 210, name: '35-44' },
          { value: 104, name: '45+' }
        ]
      }
    ]
  }

  const skillOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } } },
    yAxis: { type: 'category', data: ['Medical', 'Teaching', 'Logistics', 'Photography', 'Coordination'], axisLine: { show: false }, axisTick: { show: false } },
    series: [
      { type: 'bar', itemStyle: { color: 'var(--color-primary-soft)', borderRadius: [0, 4, 4, 0] }, data: [120, 340, 520, 95, 180] }
    ]
  }

  return (
    <>
      {/* KPI Cards */}
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon"><FiUsers /></div>
          <div className="stat-card__value">1,284</div>
          <div className="stat-card__label">Active Volunteers</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-soft)' }}><FiUserCheck /></div>
          <div className="stat-card__value">842</div>
          <div className="stat-card__label">Returning Vols</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-success)', background: '#f0fdf4' }}><FiHeart /></div>
          <div className="stat-card__value">65%</div>
          <div className="stat-card__label">Retention Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon"><FiClock /></div>
          <div className="stat-card__value">24h</div>
          <div className="stat-card__label">Avg Vol Hours</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon"><FiTrendingUp /></div>
          <div className="stat-card__value">91%</div>
          <div className="stat-card__label">Avg Attendance</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: '#f59e0b', background: '#fffbeb' }}><FiStar /></div>
          <div className="stat-card__value">4.9/5</div>
          <div className="stat-card__label">Vol Satisfaction</div>
        </div>
      </div>

      <div className="charts-grid-2">
        <section className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Volunteer Age Demographics</h2>
          <ReactECharts option={pieOption} style={{ height: 250 }} />
        </section>
        <section className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Top Skills Distribution</h2>
          <ReactECharts option={skillOption} style={{ height: 250 }} />
        </section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <section className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Top Contributors Leaderboard</h2>
          </div>
          
          <div className="v-table-wrapper">
            <table className="v-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Volunteer Name</th>
                  <th>Events Joined</th>
                  <th>Total Hours</th>
                  <th>Attendance</th>
                  <th>Impact Score</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span style={{ fontSize: '20px' }}>🥇</span></td>
                  <td style={{ fontWeight: 600 }}>Michael Tan</td>
                  <td>14</td>
                  <td><strong>120h</strong></td>
                  <td>100%</td>
                  <td><span className="badge badge--success">+1,200</span></td>
                </tr>
                <tr>
                  <td><span style={{ fontSize: '20px' }}>🥈</span></td>
                  <td style={{ fontWeight: 600 }}>Sarah Wijaya</td>
                  <td>12</td>
                  <td><strong>105h</strong></td>
                  <td>98%</td>
                  <td><span className="badge badge--success">+950</span></td>
                </tr>
                <tr>
                  <td><span style={{ fontSize: '20px' }}>🥉</span></td>
                  <td style={{ fontWeight: 600 }}>Ahmad Fauzan</td>
                  <td>10</td>
                  <td><strong>85h</strong></td>
                  <td>95%</td>
                  <td><span className="badge badge--success">+820</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Side Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card" style={{ padding: '24px', background: 'linear-gradient(145deg, #fffbeb, #ffffff)', border: '1px solid #fde68a' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#d97706' }}>
              🤖 Behavioral AI Insights
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                Most of your volunteers prefer <strong>weekend morning events</strong> (75% higher turnout).
              </div>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                <strong style={{ color: 'var(--color-danger)' }}>Warning:</strong> Supply of <strong>Medical volunteers</strong> is critically low compared to demand.
              </div>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                Volunteers who join <strong>Education programs</strong> are 2x more likely to return.
              </div>
            </div>
          </div>
          
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Status Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>Active</span>
                <strong>65%</strong>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--color-border-light)', borderRadius: '3px' }}><div style={{ width: '65%', height: '100%', background: 'var(--color-success)', borderRadius: '3px' }}/></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '8px' }}>
                <span>Inactive (3+ months)</span>
                <strong>25%</strong>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--color-border-light)', borderRadius: '3px' }}><div style={{ width: '25%', height: '100%', background: 'var(--color-warning)', borderRadius: '3px' }}/></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '8px' }}>
                <span>High No-show Risk</span>
                <strong>10%</strong>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--color-border-light)', borderRadius: '3px' }}><div style={{ width: '10%', height: '100%', background: 'var(--color-danger)', borderRadius: '3px' }}/></div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
