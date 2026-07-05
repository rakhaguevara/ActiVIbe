import React, { useState, useEffect } from 'react'
import { 
  FiSearch, FiAlertTriangle, FiUserX, FiTrendingDown, FiActivity, FiMoreVertical, FiShieldOff, FiMessageSquare
} from 'react-icons/fi'
import ReactECharts from 'echarts-for-react'
import VolunteerProfileDrawer from '../../../components/organizer/VolunteerProfileDrawer'
import type { VolunteerProfile } from '../../../components/organizer/VolunteerProfileDrawer'
import '../VolunteersPage.css'

interface NoShowVolunteer extends VolunteerProfile {
  missedEvent: string
  reason: string
  attendanceHistory: string
  warningLevel: 'High' | 'Medium' | 'Low'
  nextEligibility: string
}

const DUMMY_NOSHOW: NoShowVolunteer[] = [
  {
    id: '7', name: 'Reza Pahlevi', avatarInitials: 'RP', skills: ['General'],
    eventsJoined: 2, hours: 8, attendance: '40%', status: 'Inactive', lastActivity: '1 Month Ago',
    rating: 2, email: 'reza@example.com', phone: '+62 812-0000-1111', location: 'Jakarta Utara',
    bio: 'Pernah hadir sekali, tapi sering absen.', impactTrees: 0,
    missedEvent: 'Mangrove Planting', reason: 'No explanation provided', attendanceHistory: 'Missed 3/5 events', warningLevel: 'High', nextEligibility: 'Restricted (Appeals Only)'
  },
  {
    id: '8', name: 'Siti Aminah', avatarInitials: 'SA', skills: ['Administration'],
    eventsJoined: 4, hours: 24, attendance: '80%', status: 'Active', lastActivity: 'Yesterday',
    rating: 4, email: 'siti@example.com', phone: '+62 813-0000-2222', location: 'Depok',
    bio: 'Sakit mendadak.', impactTrees: 10,
    missedEvent: 'Education Camp', reason: 'Medical emergency (Notified late)', attendanceHistory: 'Missed 1/5 events', warningLevel: 'Low', nextEligibility: 'Immediate'
  },
  {
    id: '9', name: 'Budi Santoso', avatarInitials: 'BS', skills: ['Logistics'],
    eventsJoined: 1, hours: 4, attendance: '50%', status: 'Active', lastActivity: '2 Weeks Ago',
    rating: 3, email: 'budi@example.com', phone: '+62 819-0000-3333', location: 'Bekasi',
    bio: 'Sering ada urusan keluarga mendadak.', impactTrees: 5,
    missedEvent: 'Blood Donation', reason: 'Family matters', attendanceHistory: 'Missed 2/3 events', warningLevel: 'Medium', nextEligibility: 'Next Month'
  }
]

export default function NoShowVolunteersView() {
  const [loading, setLoading] = useState(true)
  const [volunteers, setVolunteers] = useState<NoShowVolunteer[]>([])
  const [selectedProfile, setSelectedProfile] = useState<VolunteerProfile | null>(null)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVolunteers(DUMMY_NOSHOW)
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const noShowTrendOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], axisLine: { show: false }, axisTick: { show: false } },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } } },
    series: [
      {
        data: [12, 19, 15, 22, 18, 14],
        type: 'line',
        smooth: true,
        lineStyle: { color: 'var(--color-danger)', width: 3 },
        itemStyle: { color: 'var(--color-danger)' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(239, 68, 68, 0.3)' }, { offset: 1, color: 'rgba(239, 68, 68, 0)' }]
          }
        }
      }
    ]
  }

  if (loading) {
    return (
      <div className="volunteers-crm">
        <div className="v-kpi-grid">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton sk-card" />)}
        </div>
        <div className="skeleton sk-table" />
      </div>
    )
  }

  const getWarningBadge = (level: string) => {
    switch (level) {
      case 'High': return <span className="badge badge--danger"><FiShieldOff /> High Risk</span>
      case 'Medium': return <span className="badge badge--warning">Medium</span>
      case 'Low': return <span className="badge badge--info">Low</span>
    }
  }

  return (
    <div className="volunteers-crm">
      {/* KPI Cards */}
      <section className="v-kpi-grid">
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiUserX /> Total No-show</div>
          <span className="v-kpi-value">42</span>
          <span className="v-kpi-trend neutral">This year</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header" style={{ color: 'var(--color-danger)' }}><FiAlertTriangle /> Repeat No-show</div>
          <span className="v-kpi-value">14</span>
          <span className="v-kpi-trend" style={{ color: 'var(--color-danger)' }}>Requires attention</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header" style={{ color: 'var(--color-warning)' }}><FiMessageSquare /> Pending Follow-up</div>
          <span className="v-kpi-value">8</span>
          <span className="v-kpi-trend" style={{ color: 'var(--color-warning)' }}>Action needed</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiTrendingDown /> Overall Attendance Rate</div>
          <span className="v-kpi-value">91%</span>
          <span className="v-kpi-trend neutral">-1.2% from last month</span>
        </div>
      </section>

      {/* AI Insights & Trend Chart */}
      <div className="v-grid-main" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <section className="v-section card">
          <h2>AI Risk Insights</h2>
          <div>
            <div className="v-ai-card" style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
              <FiAlertTriangle style={{ color: 'var(--color-danger)', fontSize: 20, marginTop: 2 }} />
              <div>
                <p style={{ margin: 0, fontSize: '13px' }}><strong>Reza Pahlevi</strong> has missed 3 consecutive events. Consider restricting registration for future events.</p>
                <button className="btn btn--sm btn--outline" style={{ marginTop: 8, borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>Review Profile</button>
              </div>
            </div>
            <div className="v-ai-card" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
              <FiActivity style={{ color: 'var(--color-warning)', fontSize: 20, marginTop: 2 }} />
              <div>
                <p style={{ margin: 0, fontSize: '13px' }}><strong>Budi Santoso</strong> frequently cancels last minute. Recommend assigning backup logistics volunteers.</p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="v-section card">
          <h2>No-show Trend</h2>
          <ReactECharts option={noShowTrendOption} style={{ height: 200 }} />
        </section>
      </div>

      {/* Filter Bar */}
      <section className="v-filter-bar">
        <div className="v-filter-input" style={{ flex: 2 }}>
          <FiSearch color="var(--color-text-muted)" />
          <input type="text" placeholder="Search by name or reason..." />
        </div>
        <div className="v-filter-input">
          <select defaultValue=""><option value="" disabled>Warning Level</option></select>
        </div>
        <button className="btn btn--outline btn--sm" style={{ border: 'none' }}>Reset</button>
      </section>

      {/* Main Content */}
      <section className="v-section">
        <h2>Unreliable Volunteer Management</h2>
        <div className="v-table-wrapper">
          <table className="v-table">
            <thead>
              <tr>
                <th>Volunteer Name</th>
                <th>Missed Event</th>
                <th>Reason Provided</th>
                <th>Attendance History</th>
                <th>Warning Level</th>
                <th>Next Eligibility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map(vol => (
                <tr key={vol.id}>
                  <td>
                    <div className="v-volunteer-info">
                      <div className="v-avatar">{vol.avatarInitials}</div>
                      <div>
                        <span className="v-volunteer-name">{vol.name}</span>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{vol.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{vol.missedEvent}</td>
                  <td><span style={{ fontStyle: vol.reason.includes('No explanation') ? 'italic' : 'normal', color: vol.reason.includes('No explanation') ? 'var(--color-text-muted)' : 'inherit' }}>{vol.reason}</span></td>
                  <td>{vol.attendanceHistory}</td>
                  <td>{getWarningBadge(vol.warningLevel)}</td>
                  <td>
                    <span style={{ fontSize: '12px', fontWeight: vol.nextEligibility.includes('Restricted') ? 700 : 400, color: vol.nextEligibility.includes('Restricted') ? 'var(--color-danger)' : 'inherit' }}>
                      {vol.nextEligibility}
                    </span>
                  </td>
                  <td>
                    <div className="v-table-actions">
                      <button className="btn btn--sm btn--outline" onClick={() => setSelectedProfile(vol)}>Profile</button>
                      <button className="btn btn--sm btn--outline" style={{ padding: '0 8px' }}><FiMoreVertical/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <VolunteerProfileDrawer 
        volunteer={selectedProfile}
        isOpen={selectedProfile !== null}
        onClose={() => setSelectedProfile(null)}
      />
    </div>
  )
}
