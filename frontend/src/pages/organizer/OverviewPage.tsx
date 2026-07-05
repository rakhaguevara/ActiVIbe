import React from 'react'
import { Link } from 'react-router-dom'
import { 
  FiPlus, FiDownload, FiBell, FiCalendar, FiUsers, FiCheckSquare, 
  FiMessageSquare, FiXCircle, FiTrendingUp, FiActivity, FiStar,
  FiClock, FiWind, FiSun
} from 'react-icons/fi'
import ReactECharts from 'echarts-for-react'
import './OverviewPage.css'

export default function OverviewPage() {
  // 1. Header Data
  const orgName = "Green Earth Foundation"
  const currentDate = "Tuesday, July 7, 2026"

  // 11. Chart Configurations (ECharts)
  const applicantsChartOption = {
    grid: { top: 10, right: 10, bottom: 20, left: 30 },
    xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], axisLine: { lineStyle: { color: '#ccc' } } },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed' } } },
    series: [{ data: [120, 200, 150, 80, 70, 420], type: 'line', smooth: true, lineStyle: { color: '#2B5A50', width: 3 }, itemStyle: { color: '#2B5A50' }, areaStyle: { color: 'rgba(43, 90, 80, 0.1)' } }],
    tooltip: { trigger: 'axis' }
  }

  const attendanceChartOption = {
    grid: { top: 10, right: 10, bottom: 20, left: 30 },
    xAxis: { type: 'category', data: ['W1', 'W2', 'W3', 'W4'] },
    yAxis: { type: 'value', max: 100 },
    series: [{ data: [80, 85, 92, 88], type: 'bar', itemStyle: { color: '#D4AF37', borderRadius: [4, 4, 0, 0] } }],
    tooltip: { trigger: 'axis', valueFormatter: (val: number) => val + '%' }
  }

  const impactChartOption = {
    grid: { top: 10, right: 10, bottom: 20, left: 40 },
    xAxis: { type: 'category', data: ['Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    yAxis: { type: 'value' },
    series: [{ data: [2000, 4500, 3200, 6000, 8540], type: 'line', smooth: true, lineStyle: { color: '#10b981', width: 3 }, itemStyle: { color: '#10b981' } }],
    tooltip: { trigger: 'axis' }
  }

  return (
    <div className="organizer-overview">
      {/* 1. HEADER */}
      <header className="overview-header">
        <div className="overview-header__title">
          <h1>Overview</h1>
          <p className="overview-header__subtitle">Welcome back, {orgName} 👋</p>
          <span className="overview-header__date">{currentDate}</span>
        </div>
        <div className="overview-header__actions">
          <button type="button" className="btn btn--outline btn--sm"><FiDownload /> Export Report</button>
          <button type="button" className="btn btn--outline btn--sm" style={{ padding: '8px' }}><FiBell /></button>
          <Link to="/organizer/events/new" className="btn btn--primary btn--sm"><FiPlus /> Create Event</Link>
        </div>
      </header>

      {/* 2. QUICK ACTIONS */}
      <section className="quick-actions-grid">
        <Link to="/organizer/events/new" className="quick-action-card">
          <FiCalendar className="quick-action-card__icon" />
          <div>
            <h3>Create Event</h3>
            <p>Draft a new volunteer activity</p>
          </div>
        </Link>
        <Link to="/organizer/applicants" className="quick-action-card">
          <FiUsers className="quick-action-card__icon" style={{ color: '#D4AF37', backgroundColor: '#fcf6e3' }} />
          <div>
            <h3>Review Applicants</h3>
            <p>14 volunteers pending review</p>
          </div>
        </Link>
        <Link to="/organizer/attendance" className="quick-action-card">
          <FiCheckSquare className="quick-action-card__icon" style={{ color: '#10b981', backgroundColor: '#e6f8f0' }} />
          <div>
            <h3>Today's Attendance</h3>
            <p>Scan QR codes for check-in</p>
          </div>
        </Link>
        <Link to="/organizer/communication" className="quick-action-card">
          <FiMessageSquare className="quick-action-card__icon" style={{ color: '#6366f1', backgroundColor: '#eff0fe' }} />
          <div>
            <h3>Broadcast Message</h3>
            <p>Send updates to volunteers</p>
          </div>
        </Link>
        <Link to="/organizer/events" className="quick-action-card">
          <FiXCircle className="quick-action-card__icon" style={{ color: '#ef4444', backgroundColor: '#fee2e2' }} />
          <div>
            <h3>Close Event</h3>
            <p>2 events require closing</p>
          </div>
        </Link>
      </section>

      {/* 3. KPI SECTION */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card__header"><FiCalendar /> Active Events</div>
          <p className="kpi-card__value">4</p>
          <span className="kpi-card__trend kpi-card__trend--up"><FiTrendingUp /> +2 this month</span>
        </div>
        <div className="kpi-card">
          <div className="kpi-card__header"><FiUsers /> Pending Applicants</div>
          <p className="kpi-card__value">86</p>
          <span className="kpi-card__trend kpi-card__trend--up"><FiTrendingUp /> +18%</span>
        </div>
        <div className="kpi-card">
          <div className="kpi-card__header"><FiStar /> Accepted Volunteers</div>
          <p className="kpi-card__value">42</p>
          <span className="kpi-card__trend kpi-card__trend--up"><FiTrendingUp /> +6%</span>
        </div>
        <div className="kpi-card">
          <div className="kpi-card__header"><FiCheckSquare /> Today's Attendance</div>
          <p className="kpi-card__value">31 / 38</p>
          <span className="kpi-card__trend" style={{ color: '#6b7280' }}>81% Complete</span>
        </div>
        <div className="kpi-card" style={{ borderColor: '#fcd34d', backgroundColor: '#fffbeb' }}>
          <div className="kpi-card__header" style={{ color: '#b45309' }}><FiXCircle /> Events Need Closing</div>
          <p className="kpi-card__value" style={{ color: '#b45309' }}>2</p>
          <span className="kpi-card__trend kpi-card__trend--warning">Requires attention</span>
        </div>
        <div className="kpi-card">
          <div className="kpi-card__header"><FiSun /> Organization Impact</div>
          <p className="kpi-card__value">18,420 <span style={{ fontSize: '1rem', color: '#6b7280' }}>Trees</span></p>
          <span className="kpi-card__trend kpi-card__trend--up"><FiTrendingUp /> +420 this month</span>
        </div>
      </section>

      <div className="dashboard-grid">
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          
          {/* 4. EVENT STATUS OVERVIEW */}
          <section className="dashboard-section">
            <h2>Event Status Overview</h2>
            <div className="event-status-grid">
              <div className="event-status-card">
                <div className="event-status-card__banner">
                  <span className="badge badge--success event-status-card__badge">Published</span>
                </div>
                <div className="event-status-card__content">
                  <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>LINGKUNGAN</span>
                  <h3>Beach Cleanup</h3>
                  <div className="event-status-card__meta">
                    <FiCalendar /> Tomorrow &middot; <FiUsers /> 125 Volunteers
                  </div>
                  <div className="event-status-card__progress-bg">
                    <div className="event-status-card__progress-fill" style={{ width: '80%' }} />
                  </div>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>80% Full</span>
                  <button type="button" className="btn btn--outline btn--sm" style={{ marginTop: '8px' }}>Manage Event</button>
                </div>
              </div>
              
              <div className="event-status-card">
                <div className="event-status-card__banner" style={{ background: 'linear-gradient(135deg, #e5e7eb, #9ca3af)' }}>
                  <span className="badge badge--info event-status-card__badge">Draft</span>
                </div>
                <div className="event-status-card__content">
                  <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>PENDIDIKAN</span>
                  <h3>Education Camp</h3>
                  <div className="event-status-card__meta">
                    <FiCalendar /> TBD &middot; <FiUsers /> 50 Volunteers
                  </div>
                  <div className="event-status-card__progress-bg">
                    <div className="event-status-card__progress-fill" style={{ width: '0%' }} />
                  </div>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>0% Full</span>
                  <button type="button" className="btn btn--primary btn--sm" style={{ marginTop: '8px' }}>Continue Editing</button>
                </div>
              </div>
              
              <div className="event-status-card">
                <div className="event-status-card__banner" style={{ background: 'linear-gradient(135deg, #fef3c7, #f59e0b)' }}>
                  <span className="badge badge--warning event-status-card__badge">Ongoing</span>
                </div>
                <div className="event-status-card__content">
                  <span style={{ fontSize: '12px', color: '#b45309', fontWeight: 600 }}>KESEHATAN</span>
                  <h3>Blood Donation</h3>
                  <div className="event-status-card__meta">
                    <FiCalendar /> Today &middot; <FiUsers /> 220 Volunteers
                  </div>
                  <div className="event-status-card__progress-bg">
                    <div className="event-status-card__progress-fill" style={{ width: '100%', background: '#f59e0b' }} />
                  </div>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>100% Full</span>
                  <button type="button" className="btn btn--outline btn--sm" style={{ marginTop: '8px' }}>Check Attendance</button>
                </div>
              </div>
              
              <div className="event-status-card">
                <div className="event-status-card__banner" style={{ background: 'linear-gradient(135deg, #d1fae5, #10b981)' }}>
                  <span className="badge badge--success event-status-card__badge" style={{ background: '#064e3b', color: '#fff' }}>Completed</span>
                </div>
                <div className="event-status-card__content">
                  <span style={{ fontSize: '12px', color: '#064e3b', fontWeight: 600 }}>LINGKUNGAN</span>
                  <h3>Mangrove Planting</h3>
                  <div className="event-status-card__meta">
                    <FiCalendar /> Last Week &middot; <FiUsers /> 80 Volunteers
                  </div>
                  <div className="event-status-card__progress-bg">
                    <div className="event-status-card__progress-fill" style={{ width: '100%', background: '#10b981' }} />
                  </div>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>Completed</span>
                  <button type="button" className="btn btn--outline btn--sm" style={{ marginTop: '8px' }}>View Report</button>
                </div>
              </div>
            </div>
          </section>

          {/* 11. ORGANIZATION PERFORMANCE (Charts) */}
          <section className="dashboard-section">
            <h2>Organization Performance</h2>
            <div className="charts-grid">
              <div className="chart-card">
                <h3 style={{ fontSize: '14px', marginBottom: '16px' }}>Applicants Growth</h3>
                <ReactECharts option={applicantsChartOption} style={{ height: 200 }} />
              </div>
              <div className="chart-card">
                <h3 style={{ fontSize: '14px', marginBottom: '16px' }}>Attendance Trend</h3>
                <ReactECharts option={attendanceChartOption} style={{ height: 200 }} />
              </div>
              <div className="chart-card">
                <h3 style={{ fontSize: '14px', marginBottom: '16px' }}>Monthly Impact (Kg Trash)</h3>
                <ReactECharts option={impactChartOption} style={{ height: 200 }} />
              </div>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          
          {/* 10. AI INSIGHTS */}
          <section className="dashboard-section">
            <h2>AI Insights</h2>
            <div className="insights-grid">
              <div className="insight-card">
                <FiActivity className="insight-icon" />
                <p className="insight-text"><strong>14 applicants</strong> have over 90% match score for Beach Cleanup.</p>
              </div>
              <div className="insight-card">
                <FiActivity className="insight-icon" />
                <p className="insight-text"><strong>Beach Cleanup</strong> may require 12 more volunteers based on historical drop-out rates.</p>
              </div>
              <div className="insight-card">
                <FiActivity className="insight-icon" />
                <p className="insight-text"><strong>Attendance</strong> is predicted to reach 94% today.</p>
              </div>
              <div className="insight-card">
                <FiActivity className="insight-icon" />
                <p className="insight-text"><strong>Education Camp</strong> should open registration this week to meet quotas.</p>
              </div>
            </div>
          </section>

          {/* 5. TODAY'S TASKS */}
          <section className="dashboard-section card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Today's Tasks</h2>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)' }}>3 / 5 Completed</span>
            </div>
            <div className="task-list">
              <label className="task-item completed">
                <input type="checkbox" checked readOnly />
                Review 14 Applicants
              </label>
              <label className="task-item completed">
                <input type="checkbox" checked readOnly />
                Approve Beach Cleanup
              </label>
              <label className="task-item completed">
                <input type="checkbox" checked readOnly />
                Generate 38 Certificates
              </label>
              <label className="task-item">
                <input type="checkbox" readOnly />
                Broadcast Schedule Reminder
              </label>
              <label className="task-item">
                <input type="checkbox" readOnly />
                Upload Event Report
              </label>
            </div>
          </section>

          {/* 6. RECENT ACTIVITY */}
          <section className="dashboard-section card">
            <h2>Recent Activity</h2>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <span className="timeline-time">11:43</span>
                  <span className="timeline-text">Beach Cleanup published</span>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <span className="timeline-time">11:05</span>
                  <span className="timeline-text">Certificates generated</span>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <span className="timeline-time">10:20</span>
                  <span className="timeline-text">Broadcast sent</span>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot" style={{ background: '#d1d5db', borderColor: '#fff' }} />
                <div className="timeline-content">
                  <span className="timeline-time">10:02</span>
                  <span className="timeline-text">Attendance opened</span>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot" style={{ background: '#d1d5db', borderColor: '#fff' }} />
                <div className="timeline-content">
                  <span className="timeline-time">09:28</span>
                  <span className="timeline-text">Volunteer Sarah accepted</span>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot" style={{ background: '#d1d5db', borderColor: '#fff' }} />
                <div className="timeline-content">
                  <span className="timeline-time">09:14</span>
                  <span className="timeline-text">Volunteer Ahmad applied</span>
                </div>
              </div>
            </div>
          </section>

          {/* 8. UPCOMING EVENTS & 9. CALENDAR combined logically */}
          <section className="dashboard-section card">
            <h2>Upcoming Events</h2>
            
            {/* Custom Mini Calendar */}
            <div className="mini-calendar" style={{ marginBottom: '16px' }}>
              <div className="mini-calendar__header">
                <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
              </div>
              <div className="mini-calendar__grid">
                {[...Array(30)].map((_, i) => {
                  const day = i + 1;
                  const isToday = day === 7;
                  const isEvent1 = day === 8; // Tomorrow
                  const isEvent2 = day === 11; // Saturday
                  const isEvent3 = day === 20; // July 20
                  
                  let className = 'mini-calendar__day';
                  if (isToday) className += ' mini-calendar__day--today';
                  if (isEvent1 || isEvent2 || isEvent3) className += ' mini-calendar__day--event';

                  let tooltip = '';
                  if (isEvent1) tooltip = 'Beach Cleanup (125 Vol)';
                  if (isEvent2) tooltip = 'Education Camp (50 Vol)';
                  if (isEvent3) tooltip = 'Mangrove Planting (80 Vol)';

                  return (
                    <div key={day} className={className}>
                      {day}
                      {tooltip && <div className="mini-calendar__tooltip">{tooltip}</div>}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot" style={{ background: 'var(--color-primary)' }} />
                <div className="timeline-content">
                  <span className="timeline-text">Beach Cleanup</span>
                  <span className="timeline-time">Tomorrow</span>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot" style={{ background: '#f59e0b' }} />
                <div className="timeline-content">
                  <span className="timeline-text">Education Camp</span>
                  <span className="timeline-time">Saturday</span>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot" style={{ background: '#3b82f6' }} />
                <div className="timeline-content">
                  <span className="timeline-text">Blood Donation</span>
                  <span className="timeline-time">Next Week</span>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot" style={{ background: '#10b981' }} />
                <div className="timeline-content">
                  <span className="timeline-text">Mangrove Planting</span>
                  <span className="timeline-time">July 20</span>
                </div>
              </div>
            </div>
          </section>

          {/* 7. ORGANIZATION IMPACT */}
          <section className="dashboard-section card">
            <h2>Overall Impact</h2>
            <div className="impact-grid">
              <div className="impact-card">
                <span className="impact-card__value">18,420</span>
                <span className="impact-card__label">Trees Planted</span>
              </div>
              <div className="impact-card">
                <span className="impact-card__value">8,540</span>
                <span className="impact-card__label">Kg Trash Collected</span>
              </div>
              <div className="impact-card">
                <span className="impact-card__value">12,900</span>
                <span className="impact-card__label">Volunteer Hours</span>
              </div>
              <div className="impact-card">
                <span className="impact-card__value">1,820</span>
                <span className="impact-card__label">Teaching Hours</span>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* 12. FOOTER SUMMARY */}
      <footer className="overview-footer-banner">
        <div>
          <h2>This Month's Impact</h2>
          <p>Thank you for making a difference.</p>
        </div>
        <div className="footer-stats">
          <div className="footer-stat-item">
            <span className="footer-stat-value">4</span>
            <span className="footer-stat-label">Events</span>
          </div>
          <div className="footer-stat-item">
            <span className="footer-stat-value">420</span>
            <span className="footer-stat-label">New Volunteers</span>
          </div>
          <div className="footer-stat-item">
            <span className="footer-stat-value">8,540</span>
            <span className="footer-stat-label">Kg Trash</span>
          </div>
          <div className="footer-stat-item">
            <span className="footer-stat-value">18,420</span>
            <span className="footer-stat-label">Trees</span>
          </div>
          <div className="footer-stat-item">
            <span className="footer-stat-value">12,900</span>
            <span className="footer-stat-label">Volunteer Hours</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
