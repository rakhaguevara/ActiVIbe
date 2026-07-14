import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiPlus, FiDownload, FiCalendar, FiUsers, FiCheckSquare,
  FiMessageSquare, FiXCircle, FiTrendingUp, FiStar,
  FiSun, FiSearch, FiCpu, FiCheckCircle, FiSend, FiX, FiAlertCircle,
} from 'react-icons/fi'
import ReactECharts from 'echarts-for-react'
import { useOrganizerData } from '../../contexts/OrganizerDataContext'
import {
  getOrganizerOverviewStats,
  sendOrganizerAiChat,
  acknowledgeOrganizerWarning,
  getGrowthIdeas,
  type OrganizerOverviewStats,
  type OrganizerAiChatMessage,
  type OrganizerAiIdea,
} from '../../lib/organizerOverviewApi'
import type { OrganizerEvent } from '../../types/organizer'
import { formatDateShort } from '../../utils/formatDate'
import './OverviewPage.css'
import '../admin/OverviewPage.css' // Reuse the admin fixed header + AI chat modal styles

const EMPTY_STATS: OrganizerOverviewStats = {
  activeEvents: 0,
  pendingApplicants: 0,
  acceptedVolunteers: 0,
  eventsNeedClosing: 0,
  todayAttendance: { expected: 0, checkedIn: 0, pct: 0 },
  applicantsGrowth: { months: [], counts: [] },
  recentActivity: [],
  totals: { eventsCompleted: 0, volunteersReached: 0, contributionHours: 0, impact: { category: null, label: 'Jam Kontribusi', unit: 'Jam', value: 0 } },
  thisMonth: { eventsCompleted: 0, volunteersReached: 0, contributionHours: 0, impact: { category: null, label: 'Jam Kontribusi', unit: 'Jam', value: 0 } },
  warnings: [],
  eventsNeedingBoost: [],
  aiInsights: [],
  aiInsightsUnlocked: false,
}

const ACCEPTED_STATUSES = ['accepted', 'checked_in', 'completed']

const INSIGHT_TONE_STYLE = {
  success: { icon: FiTrendingUp, className: 'success' },
  warning: { icon: FiAlertCircle, className: 'warning' },
  info: { icon: FiCheckCircle, className: 'primary' },
} as const

const STATUS_LABEL: Record<OrganizerEvent['status'], string> = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  published: 'Published',
  ongoing: 'Ongoing',
  completed: 'Completed',
  rejected: 'Rejected',
  archived: 'Archived',
}

const STATUS_BADGE_CLASS: Record<OrganizerEvent['status'], string> = {
  draft: 'badge--info',
  pending_approval: 'badge--info',
  published: 'badge--success',
  ongoing: 'badge--warning',
  completed: 'badge--success',
  rejected: 'badge--info',
  archived: 'badge--info',
}

const STATUS_BANNER_STYLE: Record<OrganizerEvent['status'], React.CSSProperties | undefined> = {
  draft: { background: 'linear-gradient(135deg, #e5e7eb, #9ca3af)' },
  pending_approval: { background: 'linear-gradient(135deg, #e5e7eb, #9ca3af)' },
  published: undefined,
  ongoing: { background: 'linear-gradient(135deg, #fef3c7, #f59e0b)' },
  completed: { background: 'linear-gradient(135deg, #d1fae5, #10b981)' },
  rejected: { background: 'linear-gradient(135deg, #fee2e2, #ef4444)' },
  archived: { background: 'linear-gradient(135deg, #e5e7eb, #9ca3af)' },
}

const STATUS_PROGRESS_COLOR: Record<OrganizerEvent['status'], string | undefined> = {
  draft: undefined,
  pending_approval: undefined,
  published: undefined,
  ongoing: '#f59e0b',
  completed: '#10b981',
  rejected: '#ef4444',
  archived: undefined,
}

function actionLabelForStatus(status: OrganizerEvent['status']) {
  if (status === 'draft' || status === 'pending_approval') return 'Continue Editing'
  if (status === 'ongoing') return 'Check Attendance'
  if (status === 'completed' || status === 'archived') return 'View Report'
  return 'Manage Event'
}

const eventStatusRank: Record<OrganizerEvent['status'], number> = {
  ongoing: 0,
  published: 1,
  pending_approval: 2,
  draft: 3,
  completed: 4,
  archived: 5,
  rejected: 6,
}

export default function OverviewPage() {
  const navigate = useNavigate()
  const { events, applicants } = useOrganizerData()
  const [stats, setStats] = useState<OrganizerOverviewStats>(EMPTY_STATS)
  const [isStatsLoaded, setIsStatsLoaded] = useState(false)

  // GET /reports/search (Phase 6) belum dibangun — utk fase ini pencarian
  // difilter langsung dari daftar event organizer yang sudah di-load
  // useOrganizerData() (tidak ada query baru ke backend). Debounce ringan
  // supaya tidak filter di tiap keystroke pada daftar event yang besar.
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearchQuery(searchQuery), 250)
    return () => clearTimeout(timeout)
  }, [searchQuery])

  const searchResults = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase()
    if (!query) return []
    return events.filter((e) => e.title.toLowerCase().includes(query)).slice(0, 8)
  }, [events, debouncedSearchQuery])

  useEffect(() => {
    let cancelled = false
    getOrganizerOverviewStats()
      .then((data) => {
        if (cancelled) return
        setStats(data)
        setIsStatsLoaded(true)
      })
      .catch((err) => window.alert(err instanceof Error ? err.message : 'Gagal memuat ringkasan dashboard.'))
    return () => { cancelled = true }
  }, [])

  const handleMockClick = (feature: string) => {
    alert(`Fitur "${feature}" belum tersedia — belum ada fitur generate laporan di backend.`)
  }

  const handleDismissWarning = async (id: string) => {
    // Optimistic: hilangkan dari UI dulu, baru panggil API — banner peringatan
    // ini bukan data kritikal (murni reminder), tidak perlu rollback kalau gagal.
    setStats((prev) => ({ ...prev, warnings: prev.warnings.filter((w) => w.id !== id) }))
    try {
      await acknowledgeOrganizerWarning(id)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal menandai peringatan sudah dibaca.')
    }
  }

  /* ── Ask AI chat modal — POST /organizer/overview/ai-chat, jawaban
     digrounding ke data dashboard organizer ini (lihat organizerOverviewAi.service.js) ── */
  const [isAiOpen, setIsAiOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<OrganizerAiChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isSendingChat, setIsSendingChat] = useState(false)

  const handleSendChat = async () => {
    const content = chatInput.trim()
    if (!content || isSendingChat) return

    const nextMessages: OrganizerAiChatMessage[] = [...chatMessages, { role: 'user', content }]
    setChatMessages(nextMessages)
    setChatInput('')
    setIsSendingChat(true)
    try {
      const { reply } = await sendOrganizerAiChat(nextMessages)
      setChatMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: err instanceof Error ? err.message : 'Maaf, terjadi kesalahan. Coba lagi.' },
      ])
    } finally {
      setIsSendingChat(false)
    }
  }

  /* ── "Cari Ide Event/Campaign Baru" — POST /organizer/overview/ai/growth-ideas,
     riset web on-demand (lihat organizerOverviewAi.service.js generateGrowthIdeas)
     — server-side memilih fokus riset (event baru vs campaign) dari data
     dashboard, TIDAK auto-run di page load ── */
  const [growthIdeas, setGrowthIdeas] = useState<OrganizerAiIdea[] | null>(null)
  const [growthIdeasReason, setGrowthIdeasReason] = useState<string | null>(null)
  const [isSearchingGrowthIdeas, setIsSearchingGrowthIdeas] = useState(false)

  const handleSearchGrowthIdeas = async () => {
    if (isSearchingGrowthIdeas) return
    setIsSearchingGrowthIdeas(true)
    setGrowthIdeasReason(null)
    try {
      const result = await getGrowthIdeas()
      if (result.available && result.ideas) {
        setGrowthIdeas(result.ideas)
      } else {
        setGrowthIdeas(null)
        setGrowthIdeasReason(result.reason ?? 'Fitur riset AI sedang tidak tersedia.')
      }
    } catch (err) {
      setGrowthIdeas(null)
      setGrowthIdeasReason(err instanceof Error ? err.message : 'Gagal mengambil ide, coba lagi.')
    } finally {
      setIsSearchingGrowthIdeas(false)
    }
  }

  /* ── Organization Performance charts: 2 slide nyata (bukan 3 dummy) ── */
  const [activeChart, setActiveChart] = useState(0)

  const applicantsChartOption = useMemo(() => ({
    grid: { top: 10, right: 10, bottom: 20, left: 30 },
    xAxis: { type: 'category', data: stats.applicantsGrowth.months, axisLine: { lineStyle: { color: '#ccc' } } },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed' } } },
    series: [{ data: stats.applicantsGrowth.counts, type: 'line', smooth: true, lineStyle: { color: '#2B5A50', width: 3 }, itemStyle: { color: '#2B5A50' }, areaStyle: { color: 'rgba(43, 90, 80, 0.1)' } }],
    tooltip: { trigger: 'axis' },
  }), [stats.applicantsGrowth])

  const categoryBreakdown = useMemo(() => {
    const counts = new Map<string, number>()
    events.forEach((e) => {
      const key = e.category ?? 'Umum'
      counts.set(key, (counts.get(key) ?? 0) + 1)
    })
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
  }, [events])

  const categoryChartOption = useMemo(() => ({
    grid: { top: 10, right: 10, bottom: 40, left: 30 },
    xAxis: { type: 'category', data: categoryBreakdown.map(([cat]) => cat), axisLabel: { rotate: 20 } },
    yAxis: { type: 'value' },
    series: [{ data: categoryBreakdown.map(([, count]) => count), type: 'bar', itemStyle: { color: '#2B5A50', borderRadius: [4, 4, 0, 0] } }],
    tooltip: { trigger: 'axis' },
  }), [categoryBreakdown])

  /* ── Event Status Overview: event nyata, diprioritaskan yang sedang
     berjalan/segera terbit dulu ── */
  const priorityEvents = useMemo(
    () => [...events].sort((a, b) => eventStatusRank[a.status] - eventStatusRank[b.status] || a.startDate.localeCompare(b.startDate)).slice(0, 4),
    [events],
  )

  const filledForEvent = (eventId: string) =>
    applicants.filter((a) => a.eventId === eventId && ACCEPTED_STATUSES.includes(a.status)).length

  /* ── Upcoming events + mini calendar (bulan berjalan) ── */
  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)

  const upcomingEvents = useMemo(
    () => events.filter((e) => e.startDate >= todayStr).sort((a, b) => a.startDate.localeCompare(b.startDate)).slice(0, 4),
    [events, todayStr],
  )

  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const eventsByDay = useMemo(() => {
    const map = new Map<number, OrganizerEvent>()
    events.forEach((e) => {
      const d = new Date(e.startDate)
      if (d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth()) {
        map.set(d.getDate(), e)
      }
    })
    return map
  }, [events, today])

  /* ── Today's Tasks: 3 tugas nyata dari angka stats, bukan checklist palsu ── */
  const tasks = useMemo(() => [
    { label: `Review ${stats.pendingApplicants} pelamar`, done: stats.pendingApplicants === 0 },
    { label: `Tutup ${stats.eventsNeedClosing} kegiatan`, done: stats.eventsNeedClosing === 0 },
    {
      label: `Cek kehadiran hari ini (${stats.todayAttendance.checkedIn}/${stats.todayAttendance.expected})`,
      done: stats.todayAttendance.expected === 0 || stats.todayAttendance.checkedIn === stats.todayAttendance.expected,
    },
  ], [stats])
  const completedTaskCount = tasks.filter((t) => t.done).length

  return (
    <div className="admin-overview">
      {/* ================= FIXED HEADER ================= */}
      <div className="admin-dashboard-header">
        <div className="admin-dashboard-header__top">
          <h1 className="admin-dashboard-header__title">Dashboard</h1>
          <div className="admin-dashboard-header__top-actions">
            <div className="admin-dashboard-header__search" style={{ position: 'relative' }}>
              <FiSearch />
              <input
                type="text"
                placeholder="Search everything"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
              />
              {isSearchFocused && searchQuery.trim() && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    minWidth: '280px',
                    background: 'var(--color-bg-true)',
                    border: '1px solid var(--color-border-light)',
                    borderRadius: '12px',
                    boxShadow: '0 12px 32px rgba(26, 26, 46, 0.18)',
                    padding: '6px',
                    zIndex: 60,
                  }}
                >
                  {searchResults.length === 0 ? (
                    <p style={{ margin: 0, padding: '8px 10px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      Tidak ada event yang cocok dengan &quot;{searchQuery}&quot;.
                    </p>
                  ) : (
                    searchResults.map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => {
                          setSearchQuery('')
                          navigate(`/organizer/events/${event.id}`)
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 10px',
                          border: 'none',
                          background: 'transparent',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          color: 'var(--color-text-body)',
                        }}
                      >
                        <strong>{event.title}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{STATUS_LABEL[event.status]}</div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="admin-dashboard-header__bottom">
          <div className="admin-dashboard-header__bottom-left">
            <button className="admin-dashboard-btn admin-dashboard-btn--dark" onClick={() => setIsAiOpen(true)}>
              <FiCpu /> Ask AI
            </button>
          </div>
          <div className="admin-dashboard-header__bottom-right">
            <span className="admin-dashboard-header__updated">
              {isStatsLoaded ? <><FiCheckCircle className="icon-success" /> Last updated now</> : 'Memuat data...'}
            </span>
            <button className="admin-dashboard-btn" onClick={() => handleMockClick('Unduh Laporan')}><FiDownload /> Unduh Laporan</button>
            <Link to="/organizer/events/new" className="admin-dashboard-btn admin-dashboard-btn--dark" style={{ textDecoration: 'none' }}>
              <FiPlus /> Buat Event
            </Link>
          </div>
        </div>
      </div>

      {/* ================= SCROLLABLE CONTENT ================= */}
      <div className="admin-overview__scroll-content">
        {/* 1b. ADMIN WARNINGS — penutupan dini event (closedBeforeSchedule),
            lihat backend organizerOverview.service.js getActiveWarnings.
            Cuma peringatan tercatat, bukan strike/suspend — bisa di-dismiss. */}
        {stats.warnings.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.warnings.map((warning) => (
              <div
                key={warning.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: 'var(--color-danger-soft)',
                  color: 'var(--color-danger)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <strong>⚠ Peringatan dari Admin — {warning.eventTitle}</strong>
                  <span>
                    Event ditutup sebelum jadwal dengan partisipasi {warning.participationRatePercent}% dari kuota.
                  </span>
                  <span>{warning.message}</span>
                </div>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)', flexShrink: 0 }}
                  onClick={() => handleDismissWarning(warning.id)}
                >
                  <FiX /> Tutup
                </button>
              </div>
            ))}
          </section>
        )}

        {/* 2. QUICK ACTIONS */}
        <section className="quick-actions-grid">
          <Link to="/organizer/events/new" className="quick-action-card">
            <FiCalendar className="quick-action-card__icon" />
            <div>
              <h3>Create Event</h3>
              <p>Draft a new volunteer activity</p>
            </div>
          </Link>
          <Link to="/organizer/volunteers" className="quick-action-card">
            <FiUsers className="quick-action-card__icon" style={{ color: '#D4AF37', backgroundColor: '#fcf6e3' }} />
            <div>
              <h3>Review Applicants</h3>
              <p>{stats.pendingApplicants} volunteers pending review</p>
            </div>
          </Link>
          <Link to="/organizer/events?status=ongoing" className="quick-action-card">
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
              <p>{stats.eventsNeedClosing} events require closing</p>
            </div>
          </Link>
        </section>

        {/* 3. KPI SECTION */}
        <section className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-card__header"><FiCalendar /> Active Events</div>
            <p className="kpi-card__value">{stats.activeEvents}</p>
          </div>
          <div className="kpi-card">
            <div className="kpi-card__header"><FiUsers /> Pending Applicants</div>
            <p className="kpi-card__value">{stats.pendingApplicants}</p>
          </div>
          <div className="kpi-card">
            <div className="kpi-card__header"><FiStar /> Accepted Volunteers</div>
            <p className="kpi-card__value">{stats.acceptedVolunteers}</p>
          </div>
          <div className="kpi-card">
            <div className="kpi-card__header"><FiCheckSquare /> Today's Attendance</div>
            <p className="kpi-card__value">{stats.todayAttendance.checkedIn} / {stats.todayAttendance.expected}</p>
            <span className="kpi-card__trend" style={{ color: '#6b7280' }}>{stats.todayAttendance.pct}% Complete</span>
          </div>
          <div className="kpi-card" style={stats.eventsNeedClosing > 0 ? { borderColor: '#fcd34d', backgroundColor: '#fffbeb' } : undefined}>
            <div className="kpi-card__header" style={stats.eventsNeedClosing > 0 ? { color: '#b45309' } : undefined}><FiXCircle /> Events Need Closing</div>
            <p className="kpi-card__value" style={stats.eventsNeedClosing > 0 ? { color: '#b45309' } : undefined}>{stats.eventsNeedClosing}</p>
            {stats.eventsNeedClosing > 0 && <span className="kpi-card__trend kpi-card__trend--warning">Requires attention</span>}
          </div>
          <div className="kpi-card">
            <div className="kpi-card__header"><FiSun /> Organization Impact</div>
            <p className="kpi-card__value">{stats.totals.impact.value.toLocaleString('id-ID')} <span style={{ fontSize: '1rem', color: '#6b7280' }}>{stats.totals.impact.unit}</span></p>
            <span className="kpi-card__trend" style={{ color: '#6b7280' }}>{stats.totals.impact.label}</span>
          </div>
        </section>

        <div className="dashboard-grid">
          {/* LEFT COLUMN */}
          <div className="dashboard-left-column" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-xl)',
            position: 'sticky',
            top: 0,
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto',
            paddingRight: '12px',
          }}>

            {/* ORGANIZATION PERFORMANCE (Charts) */}
            <section className="dashboard-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ margin: 0 }}>Organization Performance</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={() => setActiveChart((prev) => (prev > 0 ? prev - 1 : 1))}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={() => setActiveChart((prev) => (prev < 1 ? prev + 1 : 0))}
                  >
                    Next Chart
                  </button>
                </div>
              </div>

              <div className="admin-overview__card" style={{ zIndex: 10 }}>
                {activeChart === 0 && (
                  <>
                    <h3 style={{ fontSize: '14px', marginBottom: '16px' }}>Applicants Growth</h3>
                    <ReactECharts option={applicantsChartOption} style={{ height: 280 }} />
                  </>
                )}
                {activeChart === 1 && (
                  <>
                    <h3 style={{ fontSize: '14px', marginBottom: '16px' }}>Sebaran Kategori Event</h3>
                    <ReactECharts option={categoryChartOption} style={{ height: 280 }} />
                  </>
                )}
              </div>
            </section>

            {/* EVENT STATUS OVERVIEW */}
            <section className="dashboard-section">
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <h2 style={{ margin: 0 }}>Event Status Overview</h2>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Maksimal 4 Event Prioritas</span>
              </div>
              {priorityEvents.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Belum ada kegiatan.</p>
              ) : (
                <div className="event-status-grid">
                  {priorityEvents.map((event) => {
                    const filled = filledForEvent(event.id)
                    const pct = event.quota > 0 ? Math.round((filled / event.quota) * 100) : 0
                    return (
                      <div className="event-status-card" key={event.id}>
                        <div className="event-status-card__banner" style={STATUS_BANNER_STYLE[event.status]}>
                          <span className={`badge ${STATUS_BADGE_CLASS[event.status]} event-status-card__badge`}>{STATUS_LABEL[event.status]}</span>
                        </div>
                        <div className="event-status-card__content">
                          <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>{(event.category ?? 'UMUM').toUpperCase()}</span>
                          <h3>{event.title}</h3>
                          <div className="event-status-card__meta">
                            <FiCalendar /> {formatDateShort(event.startDate)} &middot; <FiUsers /> {event.quota} Volunteers
                          </div>
                          <div className="event-status-card__progress-bg">
                            <div className="event-status-card__progress-fill" style={{ width: `${pct}%`, background: STATUS_PROGRESS_COLOR[event.status] }} />
                          </div>
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>{pct}% Full</span>
                          <Link to={`/organizer/events/${event.id}`} className={`btn btn--sm ${event.status === 'draft' || event.status === 'pending_approval' ? 'btn--primary' : 'btn--outline'}`} style={{ marginTop: '8px', textDecoration: 'none', textAlign: 'center' }}>
                            {actionLabelForStatus(event.status)}
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* FOOTER SUMMARY — this month */}
            <footer className="overview-footer-banner" style={{ marginTop: '0' }}>
              <div>
                <h2>This Month's Impact</h2>
                <p>Thank you for making a difference.</p>
              </div>
              <div className="footer-stats">
                <div className="footer-stat-item">
                  <span className="footer-stat-value">{stats.thisMonth.eventsCompleted}</span>
                  <span className="footer-stat-label">Events Completed</span>
                </div>
                <div className="footer-stat-item">
                  <span className="footer-stat-value">{stats.thisMonth.volunteersReached}</span>
                  <span className="footer-stat-label">Volunteers Reached</span>
                </div>
                <div className="footer-stat-item">
                  <span className="footer-stat-value">{stats.thisMonth.contributionHours.toLocaleString('id-ID')}</span>
                  <span className="footer-stat-label">Contribution Hours</span>
                </div>
                <div className="footer-stat-item">
                  <span className="footer-stat-value">{stats.thisMonth.impact.value.toLocaleString('id-ID')}</span>
                  <span className="footer-stat-label">{stats.thisMonth.impact.label}</span>
                </div>
              </div>
            </footer>

          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>

            {/* AI INSIGHTS */}
            <section className="dashboard-section">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                AI Insights
                {!stats.aiInsightsUnlocked && (
                  <span className="badge badge--warning" style={{ fontSize: '11px' }}>Insight Biasa</span>
                )}
              </h2>
              {!stats.aiInsightsUnlocked && (
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '-8px', marginBottom: '12px' }}>
                  Rekomendasi AI Management penuh khusus <strong>ActiVibe Plus Pro</strong> — kartu di bawah adalah insight dasar dari data kegiatanmu.{' '}
                  <Link to="/activibe-plus" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Upgrade</Link>
                </p>
              )}
              <div className="insights-grid">
                {stats.aiInsights.length === 0 && (
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Memuat insight...</p>
                )}
                {stats.aiInsights.map((insight, i) => {
                  const { icon: Icon } = INSIGHT_TONE_STYLE[insight.tone]
                  return (
                    <div className="insight-card" key={i}>
                      <Icon className="insight-icon" />
                      <p className="insight-text"><strong>{insight.title}</strong> — {insight.description}</p>
                    </div>
                  )
                })}
              </div>

              <div className="admin-overview__ai-search-panel">
                <button
                  className="admin-overview__ai-search-btn"
                  onClick={handleSearchGrowthIdeas}
                  disabled={isSearchingGrowthIdeas}
                >
                  <FiCpu /> {isSearchingGrowthIdeas ? 'Mencari ide...' : 'Cari Ide Event/Campaign Baru'}
                </button>

                {growthIdeasReason && (
                  <p className="admin-overview__ai-search-empty">{growthIdeasReason}</p>
                )}

                {growthIdeas && (
                  <div className="admin-overview__ai-search-results" style={{ gridTemplateColumns: '1fr' }}>
                    {growthIdeas.map((idea, i) => (
                      <div className="insight-card" key={i}>
                        <FiCpu className="insight-icon" />
                        <div>
                          <p className="insight-text"><strong>{idea.title}</strong> — {idea.description}</p>
                          <span className="admin-overview__ai-search-source">{idea.sourceHint}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* TODAY'S TASKS */}
            <section className="dashboard-section card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Today's Tasks</h2>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)' }}>{completedTaskCount} / {tasks.length} Completed</span>
              </div>
              <div className="task-list">
                {tasks.map((task) => (
                  <label className={`task-item ${task.done ? 'completed' : ''}`} key={task.label}>
                    <input type="checkbox" checked={task.done} readOnly />
                    {task.label}
                  </label>
                ))}
              </div>
            </section>

            {/* RECENT ACTIVITY */}
            <section className="dashboard-section card">
              <h2>Recent Activity</h2>
              {stats.recentActivity.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Belum ada aktivitas.</p>
              ) : (
                <div className="timeline">
                  {stats.recentActivity.map((activity) => (
                    <div className="timeline-item" key={activity.id}>
                      <div className="timeline-dot" />
                      <div className="timeline-content">
                        <span className="timeline-time">{new Date(activity.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="timeline-text">{activity.action}{activity.targetLabel ? ` — ${activity.targetLabel}` : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* UPCOMING EVENTS & CALENDAR */}
            <section className="dashboard-section card">
              <h2>Upcoming Events</h2>

              <div className="mini-calendar" style={{ marginBottom: '16px' }}>
                <div className="mini-calendar__header">
                  <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                </div>
                <div className="mini-calendar__grid">
                  {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1
                    const isToday = day === today.getDate()
                    const dayEvent = eventsByDay.get(day)

                    let className = 'mini-calendar__day'
                    if (isToday) className += ' mini-calendar__day--today'
                    if (dayEvent) className += ' mini-calendar__day--event'

                    return (
                      <div key={day} className={className}>
                        {day}
                        {dayEvent && <div className="mini-calendar__tooltip">{dayEvent.title}</div>}
                      </div>
                    )
                  })}
                </div>
              </div>

              {upcomingEvents.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Tidak ada kegiatan mendatang.</p>
              ) : (
                <div className="timeline">
                  {upcomingEvents.map((event) => (
                    <div className="timeline-item" key={event.id}>
                      <div className="timeline-dot" style={{ background: 'var(--color-primary)' }} />
                      <div className="timeline-content">
                        <span className="timeline-text">{event.title}</span>
                        <span className="timeline-time">{formatDateShort(event.startDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* OVERALL IMPACT — all-time */}
            <section className="dashboard-section card">
              <h2>Overall Impact</h2>
              <div className="impact-grid">
                <div className="impact-card">
                  <span className="impact-card__value">{stats.totals.eventsCompleted}</span>
                  <span className="impact-card__label">Events Completed</span>
                </div>
                <div className="impact-card">
                  <span className="impact-card__value">{stats.totals.volunteersReached}</span>
                  <span className="impact-card__label">Volunteers Reached</span>
                </div>
                <div className="impact-card">
                  <span className="impact-card__value">{stats.totals.contributionHours.toLocaleString('id-ID')}</span>
                  <span className="impact-card__label">Contribution Hours</span>
                </div>
                <div className="impact-card">
                  <span className="impact-card__value">{stats.totals.impact.value.toLocaleString('id-ID')}</span>
                  <span className="impact-card__label">{stats.totals.impact.label}</span>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>

      {/* ================= AI CHAT MODAL ================= */}
      {isAiOpen && (
        <div className="admin-ai-modal__overlay" onClick={() => setIsAiOpen(false)}>
          <div className="admin-ai-modal__content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-ai-modal__header">
              <div className="admin-ai-modal__header-left">
                <FiCpu className="ai-icon" />
                <h2>ActiVibe AI Assistant</h2>
              </div>
              <button className="admin-ai-modal__close" onClick={() => setIsAiOpen(false)}>
                <FiX />
              </button>
            </div>
            <div className="admin-ai-modal__body">

              <div className="ai-chat-bubble ai">
                <strong>✨ AI Assistant</strong>
                <p>Halo! Tanyakan apa saja soal data kegiatanmu hari ini — saya akan menjawab berdasarkan angka nyata di database.</p>
              </div>

              {chatMessages.map((m, i) => (
                <div className={`ai-chat-bubble ${m.role === 'user' ? 'user' : 'ai'}`} key={i}>
                  <strong>{m.role === 'user' ? 'Kamu' : '✨ AI Assistant'}</strong>
                  <p>{m.content}</p>
                </div>
              ))}

              {isSendingChat && (
                <div className="ai-chat-bubble ai">
                  <strong>✨ AI Assistant</strong>
                  <p>Mengetik...</p>
                </div>
              )}

            </div>
            <div className="admin-ai-modal__footer">
              <input
                type="text"
                placeholder="Tanyakan saran lain tentang data..."
                className="admin-ai-modal__input"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendChat() }}
                disabled={isSendingChat}
              />
              <button className="admin-ai-modal__send" onClick={handleSendChat} disabled={isSendingChat}>
                <FiSend />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
