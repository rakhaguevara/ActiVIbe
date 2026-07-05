import React from 'react'
import { 
  FiFileText, FiDownloadCloud, FiShare2, FiCheckCircle, FiSearch, FiMoreVertical, FiEye, FiLink
} from 'react-icons/fi'
import ReactECharts from 'echarts-for-react'
import '../CertificatesPage.css'

export default function GeneratedCertificatesView() {
  const barOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], axisLine: { show: false }, axisTick: { show: false } },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } } },
    series: [
      { name: 'Downloads', type: 'bar', itemStyle: { color: 'var(--color-primary-soft)', borderRadius: [4, 4, 0, 0] }, data: [120, 150, 320, 240, 381, 190] }
    ]
  }

  return (
    <>
      {/* KPI Cards */}
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon"><FiFileText /></div>
          <div className="stat-card__value">438</div>
          <div className="stat-card__label">Certificates Generated</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-soft)' }}><FiDownloadCloud /></div>
          <div className="stat-card__value">381</div>
          <div className="stat-card__label">Downloaded</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-warning)', background: '#fffbeb' }}><FiShare2 /></div>
          <div className="stat-card__value">92</div>
          <div className="stat-card__label">Shared</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-success)', background: '#f0fdf4' }}><FiCheckCircle /></div>
          <div className="stat-card__value">438</div>
          <div className="stat-card__label">Verified</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          <section className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Generated Certificates</h2>
              <div className="v-filter-input">
                <FiSearch color="var(--color-text-muted)" />
                <input type="text" placeholder="Search certificates..." style={{ border: 'none', background: 'transparent', outline: 'none' }} />
              </div>
            </div>
            
            <div className="v-table-wrapper">
              <table className="v-table">
                <thead>
                  <tr>
                    <th>Volunteer</th>
                    <th>Event</th>
                    <th>Certificate Number</th>
                    <th>Generated Date</th>
                    <th>Downloads</th>
                    <th>Verification</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)' }}>AF</div>
                        <span style={{ fontWeight: 600 }}>Ahmad Fauzan</span>
                      </div>
                    </td>
                    <td>Beach Cleanup</td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>ACT-24-00128</td>
                    <td>Today, 10:30</td>
                    <td>2</td>
                    <td><span className="badge badge--success">Verified</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn--sm btn--outline" style={{ padding: '0 8px' }} title="Preview"><FiEye /></button>
                        <button className="btn btn--sm btn--outline" style={{ padding: '0 8px' }} title="Download"><FiDownloadCloud /></button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#8b5cf6' }}>SW</div>
                        <span style={{ fontWeight: 600 }}>Sarah Wijaya</span>
                      </div>
                    </td>
                    <td>Education Camp</td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>ACT-24-00127</td>
                    <td>Yesterday</td>
                    <td>1</td>
                    <td><span className="badge badge--success">Verified</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn--sm btn--outline" style={{ padding: '0 8px' }} title="Preview"><FiEye /></button>
                        <button className="btn btn--sm btn--outline" style={{ padding: '0 8px' }} title="Download"><FiDownloadCloud /></button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#0369a1' }}>DP</div>
                        <span style={{ fontWeight: 600 }}>Daniel Pratama</span>
                      </div>
                    </td>
                    <td>Blood Donation</td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>ACT-24-00126</td>
                    <td>Mon, 14:00</td>
                    <td>0</td>
                    <td><span className="badge badge--success">Verified</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn--sm btn--outline" style={{ padding: '0 8px' }} title="Preview"><FiEye /></button>
                        <button className="btn btn--sm btn--outline" style={{ padding: '0 8px' }} title="Download"><FiDownloadCloud /></button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Download Analytics</h2>
            <ReactECharts option={barOption} style={{ height: 250 }} />
          </section>
        </div>

        {/* Side Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="cert-preview-card">
            <div className="cert-preview-card__image">
              <FiFileText size={48} />
              <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: '#fff', padding: '4px', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-text)' }}>QR CODE</span>
              </div>
            </div>
            <div className="cert-preview-card__content">
              <h3 style={{ fontSize: '16px', fontWeight: 600, textAlign: 'center', marginBottom: '8px' }}>Certificate of Appreciation</h3>
              <div className="cert-preview-card__row">
                <span>Volunteer</span>
                <strong>Ahmad Fauzan</strong>
              </div>
              <div className="cert-preview-card__row">
                <span>Event</span>
                <strong>Beach Cleanup</strong>
              </div>
              <div className="cert-preview-card__row">
                <span>Issue Date</span>
                <strong>July 5, 2026</strong>
              </div>
              <div className="cert-preview-card__row">
                <span>ID</span>
                <strong style={{ fontFamily: 'monospace' }}>ACT-24-00128</strong>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                <button className="btn btn--primary btn--sm" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}><FiShare2 /> Share</button>
                <button className="btn btn--outline btn--sm" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}><FiLink /> Copy Link</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
