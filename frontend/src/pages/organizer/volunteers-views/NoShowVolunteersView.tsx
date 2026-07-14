import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiSearch, FiAlertTriangle, FiUserX, FiTrendingDown, FiActivity, FiShieldOff, FiUser, FiMessageSquare
} from 'react-icons/fi'
import ReactECharts from 'echarts-for-react'
import VolunteerProfileDrawer from '../../../components/organizer/VolunteerProfileDrawer'
import DropdownMenu from '../../../components/DropdownMenu'
import { attendanceLabel } from './volunteerFormat'
import type { OrganizerVolunteer, OrganizerVolunteerApplication, OrganizerVolunteersResponse } from '../../../types/organizer'
import '../VolunteersPage.css'

type WarningLevel = 'High' | 'Medium' | 'Low'

interface NoShowRow {
  volunteer: OrganizerVolunteer
  application: OrganizerVolunteerApplication
  warningLevel: WarningLevel
}

function warningLevelFor(noShowCount: number): WarningLevel {
  if (noShowCount >= 3) return 'High'
  if (noShowCount === 2) return 'Medium'
  return 'Low'
}

export default function NoShowVolunteersView({ data }: { data: OrganizerVolunteersResponse }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [warningFilter, setWarningFilter] = useState<'' | WarningLevel>('')
  const [selectedProfile, setSelectedProfile] = useState<OrganizerVolunteer | null>(null)

  const rows: NoShowRow[] = useMemo(() => {
    const result: NoShowRow[] = []
    for (const volunteer of data.volunteers) {
      for (const application of volunteer.applications) {
        if (application.status === 'no_show') {
          result.push({ volunteer, application, warningLevel: warningLevelFor(volunteer.noShowCount) })
        }
      }
    }
    return result
  }, [data.volunteers])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (warningFilter && r.warningLevel !== warningFilter) return false
      if (!query) return true
      return r.volunteer.name.toLowerCase().includes(query)
    })
  }, [rows, search, warningFilter])

  const noShowTrendOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.noShowTrend.months, axisLine: { show: false }, axisTick: { show: false } },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } } },
    series: [
      {
        data: data.noShowTrend.counts,
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

  const getWarningBadge = (level: WarningLevel) => {
    switch (level) {
      case 'High': return <span className="badge badge--danger"><FiShieldOff /> High Risk</span>
      case 'Medium': return <span className="badge badge--warning">Medium</span>
      case 'Low': return <span className="badge badge--info">Low</span>
    }
  }

  const distinctVolunteers = Array.from(new Set(rows.map((r) => r.volunteer.id))).map(
    (id) => data.volunteers.find((v) => v.id === id)!,
  )
  const repeatNoShow = distinctVolunteers.filter((v) => v.noShowCount >= 2).length
  const highRisk = distinctVolunteers.filter((v) => v.noShowCount >= 3).sort((a, b) => b.noShowCount - a.noShowCount)
  const riskInsights = distinctVolunteers.filter((v) => v.noShowCount >= 2).sort((a, b) => b.noShowCount - a.noShowCount).slice(0, 3)

  return (
    <div className="volunteers-crm">
      {/* KPI Cards */}
      <section className="v-kpi-grid">
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiUserX /> Total No-show</div>
          <span className="v-kpi-value">{rows.length}</span>
          <span className="v-kpi-trend neutral">All time</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header" style={{ color: 'var(--color-danger)' }}><FiAlertTriangle /> Repeat No-show</div>
          <span className="v-kpi-value">{repeatNoShow}</span>
          <span className="v-kpi-trend" style={{ color: repeatNoShow > 0 ? 'var(--color-danger)' : undefined }}>{repeatNoShow > 0 ? 'Requires attention' : 'None'}</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header" style={{ color: 'var(--color-warning)' }}><FiAlertTriangle /> High Risk</div>
          <span className="v-kpi-value">{highRisk.length}</span>
          <span className="v-kpi-trend" style={{ color: highRisk.length > 0 ? 'var(--color-warning)' : undefined }}>{highRisk.length > 0 ? '3+ no-shows' : 'None'}</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiTrendingDown /> Overall Attendance Rate</div>
          <span className="v-kpi-value">{attendanceLabel(data.kpis.averageAttendancePercent)}</span>
          <span className="v-kpi-trend neutral">Across all volunteers</span>
        </div>
      </section>

      {/* AI Insights & Trend Chart */}
      <div className="v-grid-main" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <section className="v-section card">
          <h2>Risk Insights</h2>
          <div>
            {riskInsights.length === 0 && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Belum ada volunteer dengan riwayat no-show berulang.</p>
            )}
            {riskInsights.map((v) => {
              const isHigh = v.noShowCount >= 3
              return (
                <div
                  key={v.id}
                  className="v-ai-card"
                  style={isHigh ? { background: '#fef2f2', borderColor: '#fecaca' } : { background: '#fffbeb', borderColor: '#fde68a' }}
                >
                  <FiAlertTriangle style={{ color: isHigh ? 'var(--color-danger)' : 'var(--color-warning)', fontSize: 20, marginTop: 2 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '13px' }}>
                      <strong>{v.name}</strong> has missed {v.noShowCount} event{v.noShowCount > 1 ? 's' : ''}
                      {isHigh ? '. Consider restricting registration for future events.' : '. Keep an eye on upcoming assignments.'}
                    </p>
                    {isHigh && (
                      <button className="btn btn--sm btn--outline" style={{ marginTop: 8, borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }} onClick={() => setSelectedProfile(v)}>Review Profile</button>
                    )}
                  </div>
                </div>
              )
            })}
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
          <input type="text" placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="v-filter-input">
          <select value={warningFilter} onChange={(e) => setWarningFilter(e.target.value as '' | WarningLevel)}>
            <option value="">Warning Level</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <button className="btn btn--outline btn--sm" style={{ border: 'none' }} onClick={() => { setSearch(''); setWarningFilter('') }}>Reset</button>
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
              {filtered.map(({ volunteer: vol, application: app, warningLevel }) => (
                <tr key={app.applicationId}>
                  <td>
                    <div className="v-volunteer-info">
                      <div className="v-avatar">{vol.avatarInitials}</div>
                      <div>
                        <span className="v-volunteer-name">{vol.name}</span>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{vol.phone ?? vol.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{app.eventTitle}</td>
                  <td><span style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>Tidak ada catatan alasan</span></td>
                  <td>Missed {vol.noShowCount}/{vol.eventsJoined} events</td>
                  <td>{getWarningBadge(warningLevel)}</td>
                  <td><span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Tidak ada pembatasan</span></td>
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
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <p style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No no-show records.</p>
        )}
      </section>

      <VolunteerProfileDrawer
        volunteer={selectedProfile}
        isOpen={selectedProfile !== null}
        onClose={() => setSelectedProfile(null)}
      />
    </div>
  )
}
