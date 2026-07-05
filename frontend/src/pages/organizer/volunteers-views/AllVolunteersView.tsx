import React, { useState, useEffect } from 'react'
import { 
  FiSearch, FiFilter, FiDownload, FiUserPlus, FiUsers, FiCheckCircle, 
  FiAward, FiStar, FiActivity, FiMapPin, FiMail, FiMoreVertical, FiClock
} from 'react-icons/fi'
import ReactECharts from 'echarts-for-react'
import VolunteerProfileDrawer from '../../../components/organizer/VolunteerProfileDrawer'
import type { VolunteerProfile } from '../../../components/organizer/VolunteerProfileDrawer'
import '../VolunteersPage.css'

const DUMMY_VOLUNTEERS: VolunteerProfile[] = [
  {
    id: '1', name: 'Ahmad Fauzan', avatarInitials: 'AF', skills: ['Teaching', 'Public Speaking'],
    eventsJoined: 12, hours: 124, attendance: '98%', status: 'Active', lastActivity: 'Yesterday',
    rating: 5, email: 'ahmad.fauzan@example.com', phone: '+62 812-3456-7890', location: 'Jakarta Selatan',
    bio: 'Guru honorer yang sangat peduli dengan pendidikan anak-anak di daerah terpencil.', impactTrees: 150
  },
  {
    id: '2', name: 'Sarah Wijaya', avatarInitials: 'SW', skills: ['Photography', 'Content Creator'],
    eventsJoined: 8, hours: 72, attendance: '95%', status: 'Active', lastActivity: '2 Days Ago',
    rating: 5, email: 'sarah.w@example.com', phone: '+62 813-9876-5432', location: 'Bandung',
    bio: 'Fotografer lepas yang ingin memberikan dampak positif melalui visual.', impactTrees: 80
  },
  {
    id: '3', name: 'Daniel Pratama', avatarInitials: 'DP', skills: ['First Aid'],
    eventsJoined: 15, hours: 201, attendance: '100%', status: 'Completed', lastActivity: 'Last Week',
    rating: 5, email: 'daniel.p@example.com', phone: '+62 821-1122-3344', location: 'Surabaya',
    bio: 'Tenaga medis yang siap siaga untuk acara-acara yang membutuhkan pertolongan pertama.', impactTrees: 400
  },
  {
    id: '4', name: 'Lisa Amelia', avatarInitials: 'LA', skills: ['Graphic Design'],
    eventsJoined: 6, hours: 54, attendance: '92%', status: 'Active', lastActivity: 'Yesterday',
    rating: 4, email: 'lisa.design@example.com', phone: '+62 815-5566-7788', location: 'Yogyakarta',
    bio: 'Desainer grafis yang suka menyumbangkan karya untuk NGO.', impactTrees: 20
  },
  {
    id: '5', name: 'Michael Tan', avatarInitials: 'MT', skills: ['Logistics'],
    eventsJoined: 18, hours: 312, attendance: '96%', status: 'Volunteer Leader', lastActivity: 'Today',
    rating: 5, email: 'michael.t@example.com', phone: '+62 811-9988-7766', location: 'Jakarta Pusat',
    bio: 'Ahli logistik dengan pengalaman mengorganisir barang bantuan untuk bencana.', impactTrees: 2450
  },
  {
    id: '6', name: 'Nabila Putri', avatarInitials: 'NP', skills: ['Administration'],
    eventsJoined: 5, hours: 42, attendance: '89%', status: 'Inactive', lastActivity: '2 Months Ago',
    rating: 4, email: 'nabila.p@example.com', phone: '+62 819-2233-4455', location: 'Tangerang',
    bio: 'Mahasiswi yang senang membantu pendataan dan administrasi pendaftaran relawan.', impactTrees: 15
  }
]

export default function AllVolunteersView() {
  const [loading, setLoading] = useState(true)
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<VolunteerProfile | null>(null)
  
  // Simulated loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setVolunteers(DUMMY_VOLUNTEERS)
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const skillChartOption = {
    tooltip: { trigger: 'item' },
    series: [
      {
        name: 'Skills', type: 'pie', radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold' } },
        labelLine: { show: false },
        data: [
          { value: 25, name: 'Teaching' },
          { value: 15, name: 'Photography' },
          { value: 20, name: 'Medical' },
          { value: 10, name: 'Environment' },
          { value: 15, name: 'Logistics' },
          { value: 15, name: 'Design' }
        ]
      }
    ]
  }

  if (loading) {
    return (
      <div className="volunteers-crm">
        <div className="skeleton sk-card" style={{ height: 60 }} />
        <div className="v-kpi-grid">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton sk-card" />)}
        </div>
        <div className="skeleton sk-table" />
      </div>
    )
  }

  // 14. Empty State Example (simulated if state is empty)
  if (volunteers.length === 0) {
    return (
      <div className="volunteers-crm">
        <div className="v-empty-state">
          <FiUsers size={64} color="var(--color-text-muted)" style={{ marginBottom: '16px' }} />
          <h2 style={{ marginBottom: '8px' }}>No volunteers found.</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>Try adjusting your filters or invite new volunteers.</p>
          <button className="btn btn--primary"><FiUserPlus /> Invite Volunteer</button>
        </div>
      </div>
    )
  }

  return (
    <div className="volunteers-crm">


      {/* 2. Quick KPI Cards */}
      <section className="v-kpi-grid">
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiUsers /> Total Volunteers</div>
          <span className="v-kpi-value">1,284</span>
          <span className="v-kpi-trend">+124 this month</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiActivity /> Currently Active</div>
          <span className="v-kpi-value">386</span>
          <span className="v-kpi-trend">+12%</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiCheckCircle /> Completed Events</div>
          <span className="v-kpi-value">942</span>
          <span className="v-kpi-trend neutral">All time</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiClock /> Average Attendance</div>
          <span className="v-kpi-value">91%</span>
          <span className="v-kpi-trend neutral">Consistent</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiAward /> Top Rated Volunteers</div>
          <span className="v-kpi-value">86</span>
          <span className="v-kpi-trend">+5 new</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiUserPlus /> Returning Volunteers</div>
          <span className="v-kpi-value">71%</span>
          <span className="v-kpi-trend neutral">High retention</span>
        </div>
      </section>

      {/* 3. Search & Filter Bar */}
      <section className="v-filter-bar">
        <div className="v-filter-input" style={{ flex: 2 }}>
          <FiSearch color="var(--color-text-muted)" />
          <input type="text" placeholder="Search Volunteer..." />
        </div>
        <div className="v-filter-input">
          <select defaultValue=""><option value="" disabled>Status</option></select>
        </div>
        <div className="v-filter-input">
          <select defaultValue=""><option value="" disabled>Skills</option></select>
        </div>
        <div className="v-filter-input">
          <select defaultValue=""><option value="" disabled>Availability</option></select>
        </div>
        <div className="v-filter-input">
          <select defaultValue=""><option value="" disabled>Sort By: Newest</option></select>
        </div>
        <button className="btn btn--outline btn--sm" style={{ border: 'none' }}>Reset</button>
      </section>

      <div className="v-grid-main">
        {/* LEFT COLUMN */}
        <div className="v-section-col">
          
          {/* 4. Volunteer Table */}
          <section className="v-section">
            <h2>Volunteer Database</h2>
            <div className="v-table-wrapper">
              <table className="v-table">
                <thead>
                  <tr>
                    <th>Volunteer Name</th>
                    <th>Skills</th>
                    <th>Events Joined</th>
                    <th>Hours</th>
                    <th>Attendance</th>
                    <th>Status</th>
                    <th>Rating</th>
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
                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{vol.lastActivity}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="v-skills">
                          {vol.skills.map(skill => <span key={skill} className="v-skill-tag">{skill}</span>)}
                        </div>
                      </td>
                      <td>{vol.eventsJoined}</td>
                      <td>{vol.hours}H</td>
                      <td style={{ color: 'var(--color-success)', fontWeight: 600 }}>{vol.attendance}</td>
                      <td>
                        <span className={`badge ${vol.status === 'Active' || vol.status === 'Volunteer Leader' ? 'badge--success' : (vol.status === 'Completed' ? 'badge--info' : 'badge--warning')}`}>
                          {vol.status}
                        </span>
                      </td>
                      <td className="v-rating">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} style={{ color: i < vol.rating ? '#f59e0b' : '#e5e7eb' }}>★</span>
                        ))}
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
            
            {/* 13. Pagination */}
            <div className="v-pagination">
              <div>Rows per page: <strong>10</strong></div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="btn btn--sm btn--outline">Prev</button>
                <button className="btn btn--sm btn--primary">1</button>
                <button className="btn btn--sm btn--outline">2</button>
                <button className="btn btn--sm btn--outline">3</button>
                <button className="btn btn--sm btn--outline">Next</button>
              </div>
            </div>
          </section>

          {/* 5. Volunteer Performance & 12. Quick Insights */}
          <section className="v-section">
            <h2>Performance & Insights</h2>
            <div className="v-perf-grid">
              <div className="v-perf-card">
                <div className="v-perf-icon"><FiAward /></div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Most Active Volunteer</div>
                  <div style={{ fontWeight: 600 }}>Michael Tan</div>
                </div>
              </div>
              <div className="v-perf-card">
                <div className="v-perf-icon" style={{ color: '#10b981', background: '#d1fae5' }}><FiCheckCircle /></div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Highest Attendance</div>
                  <div style={{ fontWeight: 600 }}>Daniel Pratama</div>
                </div>
              </div>
              <div className="v-perf-card">
                <div className="v-perf-icon" style={{ color: '#f59e0b', background: '#fef3c7' }}><FiStar /></div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Highest Impact Score</div>
                  <div style={{ fontWeight: 600 }}>Ahmad Fauzan</div>
                </div>
              </div>
            </div>
          </section>

          {/* 8. Status Overview & 9. Top Contributors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
            <section className="v-section">
              <h2>Status Overview</h2>
              <div className="v-status-grid">
                <div className="v-status-box"><h4>Applied</h4><p>145</p></div>
                <div className="v-status-box"><h4>Accepted</h4><p>112</p></div>
                <div className="v-status-box"><h4>Active</h4><p>386</p></div>
                <div className="v-status-box"><h4>Completed</h4><p>942</p></div>
                <div className="v-status-box"><h4>Inactive</h4><p>42</p></div>
                <div className="v-status-box"><h4>No-show</h4><p>18</p></div>
              </div>
            </section>
            <section className="v-section">
              <h2>Top Contributors</h2>
              <div className="v-leaderboard">
                <div className="v-leaderboard-row">
                  <div className="v-leaderboard-rank">#1</div>
                  <div style={{ fontWeight: 600 }}>Michael Tan</div>
                  <div>312H</div>
                  <div>18 Evts</div>
                  <div style={{ color: 'var(--color-success)', fontWeight: 600 }}>96%</div>
                </div>
                <div className="v-leaderboard-row">
                  <div className="v-leaderboard-rank">#2</div>
                  <div style={{ fontWeight: 600 }}>Daniel</div>
                  <div>201H</div>
                  <div>15 Evts</div>
                  <div style={{ color: 'var(--color-success)', fontWeight: 600 }}>98%</div>
                </div>
                <div className="v-leaderboard-row">
                  <div className="v-leaderboard-rank">#3</div>
                  <div style={{ fontWeight: 600 }}>Ahmad</div>
                  <div>124H</div>
                  <div>12 Evts</div>
                  <div style={{ color: 'var(--color-success)', fontWeight: 600 }}>97%</div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="v-section-col">
          
          {/* 11. AI Recommendations */}
          <section className="v-section">
            <h2>AI Recommendations</h2>
            <div>
              <div className="v-ai-card">
                <FiStar className="v-ai-icon" />
                <div>
                  <p style={{ margin: 0, fontSize: '13px' }}><strong>Michael Tan</strong> is an excellent fit for the upcoming Mangrove Planting event.</p>
                  <span className="v-ai-score">95% Match</span>
                </div>
              </div>
              <div className="v-ai-card">
                <FiStar className="v-ai-icon" />
                <div>
                  <p style={{ margin: 0, fontSize: '13px' }}><strong>Sarah Wijaya</strong> has high compatibility with Community Teaching.</p>
                  <span className="v-ai-score">91% Match</span>
                </div>
              </div>
              <div className="v-ai-card">
                <FiStar className="v-ai-icon" />
                <div>
                  <p style={{ margin: 0, fontSize: '13px' }}><strong>Daniel Pratama</strong> has attended every Health event and is recommended for future medical activities.</p>
                  <span className="v-ai-score">89% Match</span>
                </div>
              </div>
              <div className="v-ai-card">
                <FiStar className="v-ai-icon" />
                <div>
                  <p style={{ margin: 0, fontSize: '13px' }}><strong>Lisa Amelia</strong> has strong design skills and could assist with event branding.</p>
                  <span className="v-ai-score">85% Match</span>
                </div>
              </div>
            </div>
          </section>

          {/* 6. Skill Distribution */}
          <section className="v-section card">
            <h2>Skill Distribution</h2>
            <ReactECharts option={skillChartOption} style={{ height: 250 }} />
          </section>

          {/* 7. Recently Active Volunteers */}
          <section className="v-section card">
            <h2>Recently Active</h2>
            <div className="v-timeline">
              <div className="v-timeline-item">
                <div className="v-timeline-dot" />
                <div style={{ fontSize: '13px' }}><strong>Ahmad</strong> checked into Beach Cleanup</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>10 mins ago</div>
              </div>
              <div className="v-timeline-item">
                <div className="v-timeline-dot" />
                <div style={{ fontSize: '13px' }}><strong>Sarah</strong> completed Community Teaching</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>1 hour ago</div>
              </div>
              <div className="v-timeline-item">
                <div className="v-timeline-dot" />
                <div style={{ fontSize: '13px' }}><strong>Daniel</strong> received Certificate</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>3 hours ago</div>
              </div>
              <div className="v-timeline-item">
                <div className="v-timeline-dot" style={{ background: '#d1d5db' }} />
                <div style={{ fontSize: '13px' }}><strong>Lisa</strong> accepted Event Invitation</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Yesterday</div>
              </div>
              <div className="v-timeline-item">
                <div className="v-timeline-dot" style={{ background: '#d1d5db' }} />
                <div style={{ fontSize: '13px' }}><strong>Michael</strong> updated profile</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>2 days ago</div>
              </div>
            </div>
          </section>

          {/* 10. Upcoming Availability */}
          <section className="v-section card">
            <h2>Upcoming Availability</h2>
            <div className="v-avail-card">
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>Budi Santoso</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Available this weekend</div>
              </div>
              <button className="btn btn--primary btn--sm">Invite</button>
            </div>
            <div className="v-avail-card">
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>Siti Aminah</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Available July 20</div>
              </div>
              <button className="btn btn--primary btn--sm">Invite</button>
            </div>
          </section>

        </div>
      </div>

      <VolunteerProfileDrawer 
        volunteer={selectedProfile}
        isOpen={selectedProfile !== null}
        onClose={() => setSelectedProfile(null)}
      />
    </div>
  )
}
