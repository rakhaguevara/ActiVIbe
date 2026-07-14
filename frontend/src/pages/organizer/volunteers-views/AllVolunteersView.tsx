import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiSearch, FiUsers, FiCheckCircle,
  FiAward, FiStar, FiActivity, FiClock, FiUser, FiMessageSquare
} from 'react-icons/fi'
import ReactECharts from 'echarts-for-react'
import VolunteerProfileDrawer from '../../../components/organizer/VolunteerProfileDrawer'
import DropdownMenu from '../../../components/DropdownMenu'
import { formatRelativeTime, volunteerDisplayStatus, attendanceLabel, type VolunteerDisplayStatus } from './volunteerFormat'
import { generateVolunteerProfilePdf } from '../../../utils/volunteerProfilePdf'
import { downloadCertificatePdf } from '../../../utils/certificateGenerator'
import type { OrganizerVolunteer, OrganizerVolunteersResponse } from '../../../types/organizer'
import '../VolunteersPage.css'

const STATUS_BADGE_CLASS: Record<VolunteerDisplayStatus, string> = {
  Active: 'badge--success',
  Completed: 'badge--info',
  Inactive: 'badge--warning',
}

export default function AllVolunteersView({ data }: { data: OrganizerVolunteersResponse }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | VolunteerDisplayStatus>('')
  const [selectedProfile, setSelectedProfile] = useState<OrganizerVolunteer | null>(null)
  
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const volunteers = data.volunteers

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return volunteers.filter((v) => {
      if (statusFilter && volunteerDisplayStatus(v) !== statusFilter) return false
      if (!query) return true
      return (
        v.name.toLowerCase().includes(query) ||
        v.email.toLowerCase().includes(query) ||
        v.skills.some((s) => s.toLowerCase().includes(query))
      )
    })
  }, [volunteers, search, statusFilter])

  // Reset pagination if search or filter changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedVolunteers = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

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
        data: data.skillDistribution.map((s) => ({ value: s.value, name: s.name })),
      }
    ]
  }

  if (volunteers.length === 0) {
    return (
      <div className="volunteers-crm">
        <div className="v-empty-state">
          <FiUsers size={64} color="var(--color-text-muted)" style={{ marginBottom: '16px' }} />
          <h2 style={{ marginBottom: '8px' }}>No volunteers found.</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>Volunteers who apply to your events will appear here.</p>
        </div>
      </div>
    )
  }

  const mostActive = [...volunteers].sort((a, b) => b.hoursCompleted - a.hoursCompleted)[0]
  const highestAttendance = [...volunteers]
    .filter((v) => v.attendanceRatePercent !== null)
    .sort((a, b) => (b.attendanceRatePercent ?? 0) - (a.attendanceRatePercent ?? 0))[0]
  const mostSkilled = [...volunteers].sort((a, b) => b.skills.length - a.skills.length)[0]

  const topContributors = [...volunteers].sort((a, b) => b.hoursCompleted - a.hoursCompleted).slice(0, 3)

  const statusCounts = { applied: 0, accepted: 0, active: 0, completed: 0, inactive: 0, no_show: 0 }
  for (const v of volunteers) {
    for (const app of v.applications) {
      if (app.status === 'applied' || app.status === 'under_review') statusCounts.applied += 1
      else if (app.status === 'accepted') statusCounts.accepted += 1
      else if (app.status === 'checked_in') statusCounts.active += 1
      else if (app.status === 'completed') statusCounts.completed += 1
      else if (app.status === 'no_show') statusCounts.no_show += 1
      else statusCounts.inactive += 1
    }
  }

  return (
    <div className="volunteers-crm">

      {/* 2. Quick KPI Cards */}
      <section className="v-kpi-grid">
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiUsers /> Total Volunteers</div>
          <span className="v-kpi-value">{data.kpis.totalVolunteers.toLocaleString('id-ID')}</span>
          <span className="v-kpi-trend neutral">Across all events</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiActivity /> Currently Active</div>
          <span className="v-kpi-value">{data.kpis.currentlyActive.toLocaleString('id-ID')}</span>
          <span className="v-kpi-trend neutral">On live events</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiCheckCircle /> Completed Events</div>
          <span className="v-kpi-value">{data.kpis.completedEventParticipations.toLocaleString('id-ID')}</span>
          <span className="v-kpi-trend neutral">All time</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiClock /> Average Attendance</div>
          <span className="v-kpi-value">{attendanceLabel(data.kpis.averageAttendancePercent)}</span>
          <span className="v-kpi-trend neutral">Across volunteers</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiAward /> Veteran Volunteers</div>
          <span className="v-kpi-value">{data.kpis.veteranVolunteers.toLocaleString('id-ID')}</span>
          <span className="v-kpi-trend neutral">200+ hours</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiUsers /> Returning Volunteers</div>
          <span className="v-kpi-value">{data.kpis.returningVolunteersPercent === null ? '—' : `${data.kpis.returningVolunteersPercent}%`}</span>
          <span className="v-kpi-trend neutral">2+ completed events</span>
        </div>
      </section>

      {/* 3. Search & Filter Bar */}
      <section className="v-filter-bar">
        <div className="v-filter-input" style={{ flex: 2 }}>
          <FiSearch color="var(--color-text-muted)" />
          <input type="text" placeholder="Search Volunteer..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="v-filter-input">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as '' | VolunteerDisplayStatus)}>
            <option value="">Status</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Inactive">Inactive</option>
          </select>
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
        <button className="btn btn--outline btn--sm" style={{ border: 'none' }} onClick={() => { setSearch(''); setStatusFilter('') }}>Reset</button>
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
                  {paginatedVolunteers.map(vol => {
                    const status = volunteerDisplayStatus(vol)
                    const rating = vol.ratingProxy ?? 0
                    return (
                      <tr key={vol.id}>
                        <td>
                          <div className="v-volunteer-info">
                            <div className="v-avatar">{vol.avatarInitials}</div>
                            <div>
                              <span className="v-volunteer-name">{vol.name}</span>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{formatRelativeTime(vol.lastActivityAt)}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="v-skills">
                            {vol.skills.length > 0
                              ? vol.skills.map(skill => <span key={skill} className="v-skill-tag">{skill}</span>)
                              : <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>—</span>}
                          </div>
                        </td>
                        <td>{vol.eventsJoined}</td>
                        <td>{vol.hoursCompleted}H</td>
                        <td style={{ color: 'var(--color-success)', fontWeight: 600 }}>{attendanceLabel(vol.attendanceRatePercent)}</td>
                        <td>
                          <span className={`badge ${STATUS_BADGE_CLASS[status]}`}>{status}</span>
                        </td>
                        <td className="v-rating">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} style={{ color: i < rating ? '#f59e0b' : '#e5e7eb' }}>★</span>
                          ))}
                        </td>
                        <td>
                          <div className="v-table-actions">
                            <button className="btn btn--sm btn--outline" onClick={() => setSelectedProfile(vol)}>Profile</button>
                            <DropdownMenu
                              items={[
                                { label: 'Lihat Profil Lengkap', icon: <FiUser />, onClick: () => setSelectedProfile(vol) },
                                { label: 'Kirim Pesan', icon: <FiMessageSquare />, onClick: () => navigate('/organizer/communication?tab=broadcast') },
                              ]}
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            
            {filtered.length > 0 && totalPages > 1 && (
              <div className="v-pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} volunteer
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn btn--outline btn--sm" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                  <button 
                    className="btn btn--outline btn--sm" 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {filtered.length === 0 && (
              <p style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No volunteers match your filters.</p>
            )}
          </section>

          {/* 5. Volunteer Performance & 12. Quick Insights */}
          <section className="v-section">
            <h2>Performance & Insights</h2>
            <div className="v-perf-grid">
              <div className="v-perf-card">
                <div className="v-perf-icon"><FiAward /></div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Most Active Volunteer</div>
                  <div style={{ fontWeight: 600 }}>{mostActive?.name ?? '—'}</div>
                </div>
              </div>
              <div className="v-perf-card">
                <div className="v-perf-icon" style={{ color: '#10b981', background: '#d1fae5' }}><FiCheckCircle /></div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Highest Attendance</div>
                  <div style={{ fontWeight: 600 }}>{highestAttendance?.name ?? '—'}</div>
                </div>
              </div>
              <div className="v-perf-card">
                <div className="v-perf-icon" style={{ color: '#f59e0b', background: '#fef3c7' }}><FiStar /></div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Most Skilled</div>
                  <div style={{ fontWeight: 600 }}>{mostSkilled?.name ?? '—'}</div>
                </div>
              </div>
            </div>
          </section>

          {/* 8. Status Overview & 9. Top Contributors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
            <section className="v-section">
              <h2>Status Overview</h2>
              <div className="v-status-grid">
                <div className="v-status-box"><h4>Applied</h4><p>{statusCounts.applied}</p></div>
                <div className="v-status-box"><h4>Accepted</h4><p>{statusCounts.accepted}</p></div>
                <div className="v-status-box"><h4>Active</h4><p>{statusCounts.active}</p></div>
                <div className="v-status-box"><h4>Completed</h4><p>{statusCounts.completed}</p></div>
                <div className="v-status-box"><h4>Inactive</h4><p>{statusCounts.inactive}</p></div>
                <div className="v-status-box"><h4>No-show</h4><p>{statusCounts.no_show}</p></div>
              </div>
            </section>
            <section className="v-section">
              <h2>Top Contributors</h2>
              <div className="v-leaderboard">
                {topContributors.length === 0 && <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Belum ada data.</p>}
                {topContributors.map((v, i) => (
                  <div className="v-leaderboard-row" key={v.id}>
                    <div className="v-leaderboard-rank">#{i + 1}</div>
                    <div style={{ fontWeight: 600 }}>{v.name}</div>
                    <div>{v.hoursCompleted}H</div>
                    <div>{v.eventsJoined} Evts</div>
                    <div style={{ color: 'var(--color-success)', fontWeight: 600 }}>{attendanceLabel(v.attendanceRatePercent)}</div>
                  </div>
                ))}
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
              {data.recommendations.length === 0 && (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Belum ada rekomendasi — belum ada event mendatang atau kecocokan skill yang terdeteksi.</p>
              )}
              {data.recommendations.map((rec) => (
                <div className="v-ai-card" key={`${rec.volunteerId}-${rec.eventId}`}>
                  <FiStar className="v-ai-icon" />
                  <div>
                    <p style={{ margin: 0, fontSize: '13px' }}>{rec.reasoning}</p>
                    <span className="v-ai-score">{rec.matchPercent}% Match</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Skill Distribution */}
          <section className="v-section card">
            <h2>Skill Distribution</h2>
            {data.skillDistribution.length > 0
              ? <ReactECharts option={skillChartOption} style={{ height: 250 }} />
              : <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Belum ada data skill volunteer.</p>}
          </section>

          {/* 7. Recently Active Volunteers */}
          <section className="v-section card">
            <h2>Recently Active</h2>
            <div className="v-timeline">
              {data.recentActivity.length === 0 && <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Belum ada aktivitas.</p>}
              {data.recentActivity.map((item) => (
                <div className="v-timeline-item" key={item.id}>
                  <div className="v-timeline-dot" />
                  <div style={{ fontSize: '13px' }}>{item.text}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{formatRelativeTime(item.timestamp)}</div>
                </div>
              ))}
            </div>
          </section>

          {/* 10. Upcoming Availability — static, no invite system exists yet */}
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
        // Belum ada sistem "invite volunteer ke event tertentu" di backend
        // (di luar scope fase ini) — arahkan ke composer broadcast yang
        // sudah nyata, bukan pura-pura sukses invite langsung.
        onInvite={() => navigate('/organizer/communication?tab=broadcast')}
        onMessage={() => navigate('/organizer/communication?tab=broadcast')}
        onDownloadProfile={
          selectedProfile
            ? async () => {
                const bytes = await generateVolunteerProfilePdf(selectedProfile)
                downloadCertificatePdf(bytes, `Profil - ${selectedProfile.name}.pdf`)
              }
            : undefined
        }
      />
    </div>
  )
}
