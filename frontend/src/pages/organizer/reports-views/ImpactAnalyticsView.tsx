import React from 'react'
import { 
  FiGlobe, FiHeart, FiDroplet, FiBookOpen, FiSun, FiMapPin
} from 'react-icons/fi'
import ReactECharts from 'echarts-for-react'
import '../ReportsPage.css'

export default function ImpactAnalyticsView() {
  const geoOption = {
    tooltip: { trigger: 'item' },
    legend: { top: 'bottom' },
    series: [
      {
        name: 'Impact Category',
        type: 'pie',
        radius: '60%',
        data: [
          { value: 45, name: 'Environment' },
          { value: 25, name: 'Education' },
          { value: 20, name: 'Health' },
          { value: 10, name: 'Disaster Relief' }
        ],
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
      }
    ]
  }

  const lineOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', boundaryGap: false, data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], axisLine: { show: false }, axisTick: { show: false } },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } } },
    series: [
      { name: 'Impact Score', type: 'line', smooth: true, areaStyle: { color: '#dcfce7', opacity: 0.5 }, itemStyle: { color: 'var(--color-success)' }, data: [4000, 4200, 6500, 8000, 12000, 15000] }
    ]
  }

  return (
    <>
      {/* KPI Cards */}
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-success)', background: '#f0fdf4' }}><FiGlobe /></div>
          <div className="stat-card__value">18,420</div>
          <div className="stat-card__label">Trees Planted</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-soft)' }}><FiDroplet /></div>
          <div className="stat-card__value">8,540<span style={{ fontSize: '14px' }}>Kg</span></div>
          <div className="stat-card__label">Trash Collected</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: '#f59e0b', background: '#fffbeb' }}><FiBookOpen /></div>
          <div className="stat-card__value">1,820</div>
          <div className="stat-card__label">Teaching Hours</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-danger)', background: '#fef2f2' }}><FiHeart /></div>
          <div className="stat-card__value">202</div>
          <div className="stat-card__label">Blood Donations</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: '#8b5cf6', background: '#f3e8ff' }}><FiSun /></div>
          <div className="stat-card__value">12,940</div>
          <div className="stat-card__label">Volunteer Hours</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-success)', background: '#f0fdf4' }}><FiUsers /></div>
          <div className="stat-card__value">4,280</div>
          <div className="stat-card__label">Beneficiaries</div>
        </div>
      </div>

      <div className="charts-grid-2">
        <section className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Impact Growth (Score)</h2>
          <ReactECharts option={lineOption} style={{ height: 250 }} />
        </section>
        <section className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Impact by Category</h2>
          <ReactECharts option={geoOption} style={{ height: 250 }} />
        </section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <section className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Impact Timeline & Milestones</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div className="timeline-event" style={{ paddingBottom: '24px' }}>
              <div className="timeline-event__icon" style={{ width: '24px', height: '24px', background: 'var(--color-success)', color: '#fff' }}><FiGlobe size={12} /></div>
              <div className="timeline-event__content">
                <div style={{ fontSize: '14px', fontWeight: 600 }}>10,000 Trees Planted Milestone!</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Reached during the Mangrove Planting event.</div>
                <span className="badge badge--success" style={{ fontSize: '10px' }}>Yesterday</span>
              </div>
            </div>
            
            <div className="timeline-event" style={{ paddingBottom: '24px' }}>
              <div className="timeline-event__icon" style={{ width: '24px', height: '24px', background: 'var(--color-danger)', color: '#fff' }}><FiHeart size={12} /></div>
              <div className="timeline-event__content">
                <div style={{ fontSize: '14px', fontWeight: 600 }}>200+ Blood Bags Collected</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Surpassed our quarterly health target in just one month.</div>
                <span className="badge" style={{ background: '#fef2f2', color: 'var(--color-danger)', fontSize: '10px' }}>Last Week</span>
              </div>
            </div>
            
            <div className="timeline-event" style={{ paddingBottom: '0' }}>
              <div className="timeline-event__icon" style={{ width: '24px', height: '24px', background: '#f59e0b', color: '#fff' }}><FiBookOpen size={12} /></div>
              <div className="timeline-event__content">
                <div style={{ fontSize: '14px', fontWeight: 600 }}>2,000 Children Taught</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Community teaching program successfully concluded phase 1.</div>
                <span className="badge" style={{ background: '#fffbeb', color: '#f59e0b', fontSize: '10px' }}>Last Month</span>
              </div>
            </div>
          </div>
        </section>

        {/* Side Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card" style={{ padding: '24px', background: 'linear-gradient(145deg, #f0fdf4, #ffffff)', border: '1px solid #bbf7d0' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)' }}>
              ✨ AI Impact Insights
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                <strong>Mangrove Planting</strong> generated the highest environmental impact score this year (+12,500).
              </div>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                Community Teaching successfully reached over <strong>2,000 beneficiaries</strong>, outperforming last year by 45%.
              </div>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                Focusing on <strong>Environmental programs</strong> increased your total organization impact score by 18%.
              </div>
            </div>
          </div>
          
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiMapPin /> Geographic Impact
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '8px', borderBottom: '1px solid var(--color-border-light)' }}>
                <span>Tangerang Regency</span>
                <strong>42%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '8px', borderBottom: '1px solid var(--color-border-light)' }}>
                <span>South Jakarta</span>
                <strong>35%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>Bandung Area</span>
                <strong>23%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
// Forgot to import FiUsers
import { FiUsers } from 'react-icons/fi'
