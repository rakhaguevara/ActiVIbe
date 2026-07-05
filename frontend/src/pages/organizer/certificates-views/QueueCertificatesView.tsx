import React from 'react'
import { 
  FiClock, FiCheckCircle, FiCpu, FiActivity, FiSearch, FiSettings
} from 'react-icons/fi'
import ReactECharts from 'echarts-for-react'
import '../CertificatesPage.css'

export default function QueueCertificatesView() {
  const lineOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', boundaryGap: false, data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], axisLine: { show: false }, axisTick: { show: false } },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } } },
    series: [
      { name: 'Generation Success Rate', type: 'line', smooth: true, itemStyle: { color: 'var(--color-success)' }, data: [98, 99, 99.5, 97, 100, 99.2, 99.8] }
    ]
  }

  return (
    <>
      {/* KPI Cards */}
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon"><FiClock /></div>
          <div className="stat-card__value">38</div>
          <div className="stat-card__label">Pending Generation</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-soft)' }}><FiCheckCircle /></div>
          <div className="stat-card__value">24</div>
          <div className="stat-card__label">Ready to Generate</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-warning)', background: '#fffbeb' }}><FiCpu /></div>
          <div className="stat-card__value">9</div>
          <div className="stat-card__label">Processing</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-success)', background: '#f0fdf4' }}><FiCheckCircle /></div>
          <div className="stat-card__value">182</div>
          <div className="stat-card__label">Completed Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon"><FiActivity /></div>
          <div className="stat-card__value">12s</div>
          <div className="stat-card__label">Avg Processing Time</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-success)', background: '#f0fdf4' }}><FiCheckCircle /></div>
          <div className="stat-card__value">99.2%</div>
          <div className="stat-card__label">Success Rate</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          <section className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Generation Queue</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="v-filter-input">
                  <FiSearch color="var(--color-text-muted)" />
                  <input type="text" placeholder="Search queue..." style={{ border: 'none', background: 'transparent', outline: 'none' }} />
                </div>
                <button className="btn btn--outline btn--sm"><FiSettings /> Filter</button>
              </div>
            </div>
            
            <div className="v-table-wrapper">
              <table className="v-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}><input type="checkbox" /></th>
                    <th>Volunteer</th>
                    <th>Event</th>
                    <th>Completion Status</th>
                    <th>Certificate Status</th>
                    <th>Progress</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><input type="checkbox" /></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)' }}>AF</div>
                        <span style={{ fontWeight: 600 }}>Ahmad Fauzan</span>
                      </div>
                    </td>
                    <td>Beach Cleanup</td>
                    <td><span className="badge badge--success">Completed</span></td>
                    <td><span className="badge badge--warning">Waiting</span></td>
                    <td><div style={{ width: '100px', height: '6px', background: 'var(--color-border-light)', borderRadius: '3px' }}></div></td>
                    <td><button className="btn btn--sm btn--primary">Generate</button></td>
                  </tr>
                  <tr>
                    <td><input type="checkbox" /></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#8b5cf6' }}>SW</div>
                        <span style={{ fontWeight: 600 }}>Sarah Wijaya</span>
                      </div>
                    </td>
                    <td>Education Camp</td>
                    <td><span className="badge badge--success">Completed</span></td>
                    <td><span className="badge badge--warning">Waiting</span></td>
                    <td><div style={{ width: '100px', height: '6px', background: 'var(--color-border-light)', borderRadius: '3px' }}></div></td>
                    <td><button className="btn btn--sm btn--primary">Generate</button></td>
                  </tr>
                  <tr>
                    <td><input type="checkbox" disabled /></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#0369a1' }}>DP</div>
                        <span style={{ fontWeight: 600 }}>Daniel Pratama</span>
                      </div>
                    </td>
                    <td>Blood Donation</td>
                    <td><span className="badge badge--success">Completed</span></td>
                    <td><span className="badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>Processing</span></td>
                    <td>
                      <div style={{ width: '100px', height: '6px', background: 'var(--color-border-light)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: '45%', height: '100%', background: 'var(--color-primary)' }}></div>
                      </div>
                    </td>
                    <td><button className="btn btn--sm btn--outline" disabled>Processing...</button></td>
                  </tr>
                  <tr>
                    <td><input type="checkbox" disabled /></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#be185d' }}>LA</div>
                        <span style={{ fontWeight: 600 }}>Lisa Amelia</span>
                      </div>
                    </td>
                    <td>Mangrove Planting</td>
                    <td><span className="badge badge--success">Completed</span></td>
                    <td><span className="badge badge--success">Ready</span></td>
                    <td>
                      <div style={{ width: '100px', height: '6px', background: 'var(--color-border-light)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: '100%', height: '100%', background: 'var(--color-success)' }}></div>
                      </div>
                    </td>
                    <td><button className="btn btn--sm btn--outline" disabled>Completed</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Generation Success Rate</h2>
            <ReactECharts option={lineOption} style={{ height: 250 }} />
          </section>
        </div>

        {/* Side Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card" style={{ padding: '24px', background: 'linear-gradient(145deg, #eff6ff, #ffffff)', border: '1px solid #bfdbfe' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8' }}>
              🤖 AI Recommendation
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                The <strong>Beach Cleanup</strong> event is ready for batch certificate generation.
              </div>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                <strong>24 volunteers</strong> have met all completion requirements and are queued.
              </div>
            </div>
          </div>
          
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Queue Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '8px', borderBottom: '1px solid var(--color-border-light)' }}>
                <span>Pending Jobs</span>
                <strong>38</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '8px', borderBottom: '1px solid var(--color-border-light)' }}>
                <span>Processing Jobs</span>
                <strong>9</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '8px', borderBottom: '1px solid var(--color-border-light)' }}>
                <span>Completed Jobs</span>
                <strong>182</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-primary)' }}>
                <span>Est. Finish Time</span>
                <strong>~4 mins</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
