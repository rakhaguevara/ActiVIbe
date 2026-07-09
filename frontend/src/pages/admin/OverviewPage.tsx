import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiSearch, FiBell, FiShare, FiCpu, FiCheckCircle, FiDownloadCloud, FiUploadCloud, FiPrinter, FiColumns, FiFileText, FiSend, FiX, FiTrendingUp, FiAlertCircle, FiPlus } from 'react-icons/fi'
import { getOverviewStats, listActivityLog, sendAdminAiChat, type AdminOverviewStats, type AiChatMessage } from '../../lib/adminApi'
import { getActivityLogStatus } from '../../lib/activityLogStatus'
import { listOrganizations } from '../../lib/organizationApi'
import type { ActivityLogEntry } from '../../types/admin'
import type { Organization } from '../../types/organization'
import VisxLineChart from '../../components/VisxLineChart'
import RegionDistribution from '../../components/region-distribution'
import './OverviewPage.css'

const EMPTY_STATS: AdminOverviewStats = {
  totalUsers: 0,
  pendingEvents: 0,
  approvedEvents: 0,
  ongoingEvents: 0,
  rejectedEvents: 0,
  recentActivity: [],
  userGrowth: { months: [], volunteer: [], organizer: [] },
  participation: { totalActive: 0, attendancePct: 0, impactFilledPct: 0 },
  aiInsights: [],
}

const historyTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const INSIGHT_TONE_STYLE = {
  success: { icon: FiTrendingUp, className: 'success' },
  warning: { icon: FiAlertCircle, className: 'warning' },
  info: { icon: FiCheckCircle, className: 'primary' },
} as const

export default function OverviewPage() {
  const navigate = useNavigate()
  const [isAiOpen, setIsAiOpen] = useState(false)

  /* ── 1. KPI Stats — real counts from GET /admin/overview ── */
  const [stats, setStats] = useState<AdminOverviewStats>(EMPTY_STATS)

  useEffect(() => {
    let cancelled = false
    getOverviewStats()
      .then((data) => { if (!cancelled) setStats(data) })
      .catch((err) => window.alert(err instanceof Error ? err.message : 'Gagal memuat ringkasan dashboard.'))
    return () => { cancelled = true }
  }, [])

  /* ── History table + NGO list — data asli, dipisah dari /admin/overview
     supaya widget ini tidak memblok render KPI/chart kalau lambat ── */
  const [historyLog, setHistoryLog] = useState<ActivityLogEntry[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])

  useEffect(() => {
    let cancelled = false
    listActivityLog()
      .then((data) => { if (!cancelled) setHistoryLog(data) })
      .catch((err) => window.alert(err instanceof Error ? err.message : 'Gagal memuat log aktivitas.'))
    listOrganizations()
      .then((data) => { if (!cancelled) setOrganizations(data) })
      .catch((err) => window.alert(err instanceof Error ? err.message : 'Gagal memuat daftar organisasi.'))
    return () => { cancelled = true }
  }, [])

  const historyRows = useMemo(
    () =>
      [...historyLog]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5),
    [historyLog],
  )

  const handleMockClick = (feature: string) => {
    alert(`Fitur "${feature}" telah diaktifkan secara visual. Fungsi sebenarnya sedang dalam tahap integrasi backend.`)
  }

  /* ── Ask AI chat modal — POST /admin/ai/chat, jawaban digrounding ke data
     dashboard asli di backend (lihat adminAi.service.js) ── */
  const [chatMessages, setChatMessages] = useState<AiChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isSendingChat, setIsSendingChat] = useState(false)

  const handleSendChat = async () => {
    const content = chatInput.trim()
    if (!content || isSendingChat) return

    const nextMessages: AiChatMessage[] = [...chatMessages, { role: 'user', content }]
    setChatMessages(nextMessages)
    setChatInput('')
    setIsSendingChat(true)
    try {
      const { reply } = await sendAdminAiChat(nextMessages)
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

  /* ── 2. Line Chart Data — pendaftaran baru per bulan, dari GET /admin/overview ── */
  const lineChartData = useMemo(() => {
    const { months, volunteer, organizer } = stats.userGrowth
    const volunteerSeries = {
      label: 'Volunteer',
      color: '#63C2E0', // User request
      data: months.map((m, i) => ({ x: m, y: volunteer[i] ?? 0 })),
    }
    const eoSeries = {
      label: 'Organizer',
      color: '#F36038', // User request
      data: months.map((m, i) => ({ x: m, y: organizer[i] ?? 0 })),
    }
    return { series: [eoSeries, volunteerSeries] }
  }, [stats.userGrowth])

  /* ── 3. Donut Chart Data — dari GET /admin/overview (Application ter-tracking) ── */
  const donutData = useMemo(() => {
    const { totalActive, impactFilledPct, attendancePct } = stats.participation
    return {
      total: totalActive,
      impact: { label: 'Impact Passport Terisi', pct: impactFilledPct, color: 'var(--color-primary)' },
      attendance: { label: 'Tingkat Kehadiran', pct: attendancePct, color: 'var(--color-accent-orange)' },
    }
  }, [stats.participation])

  /* ── 4. Aktivitas Terbaru (Lead Pipeline style) — dari AuditLog sungguhan,
     sudah diurutkan+dibatasi 5 oleh backend (lihat admin.service.js) ── */
  const recentActivity = useMemo(
    () =>
      stats.recentActivity.slice(0, 4).map((a, i) => ({
        ...a,
        // Lebar progress bar tetap dummy (visual saja) berdasarkan urutan
        pct: 100 - (i * 20),
        color: i === 0 ? 'var(--color-accent-orange)' : i === 1 ? 'var(--color-primary)' : i === 2 ? 'var(--color-secondary)' : 'var(--color-warning-chart)'
      })),
    [stats.recentActivity],
  )

  return (
    <div className="admin-overview">

      <div className="admin-dashboard-header">
        <div className="admin-dashboard-header__top">
          <h1 className="admin-dashboard-header__title">Dashboard</h1>
          <div className="admin-dashboard-header__top-actions">
            <div className="admin-dashboard-header__search">
              <FiSearch />
              <input type="text" placeholder="Search everything" />
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
              <FiCheckCircle className="icon-success" /> Last updated now
            </span>
            <button className="admin-dashboard-btn" onClick={() => handleMockClick('Unduh Laporan')}><FiDownloadCloud /> Unduh Laporan</button>
          </div>
        </div>
      </div>

      {/* ================= SCROLLABLE CONTENT ================= */}
      <div className="admin-overview__scroll-content">

        {/* ================= TOP ROW: KPI Cards ================= */}
        <div className="admin-overview__kpi-row">
        
        <div className="admin-overview__kpi-card">
          <div className="admin-overview__kpi-header">
            <h3 className="admin-overview__kpi-title">Pengguna Terdaftar</h3>
            <span className="admin-overview__kpi-badge">+12%</span>
          </div>
          <p className="admin-overview__kpi-value">{stats.totalUsers}</p>
          <p className="admin-overview__kpi-subtitle">+5 vs bulan lalu</p>
        </div>

        <div className="admin-overview__kpi-card">
          <div className="admin-overview__kpi-header">
            <h3 className="admin-overview__kpi-title">Kegiatan Disetujui</h3>
            <span className="admin-overview__kpi-badge">+8%</span>
          </div>
          <p className="admin-overview__kpi-value">{stats.approvedEvents}</p>
          <p className="admin-overview__kpi-subtitle">+2 vs bulan lalu</p>
        </div>

        <div className="admin-overview__kpi-card">
          <div className="admin-overview__kpi-header">
            <h3 className="admin-overview__kpi-title">Kegiatan Berlangsung</h3>
            <span className="admin-overview__kpi-badge">+15%</span>
          </div>
          <p className="admin-overview__kpi-value">{stats.ongoingEvents}</p>
          <p className="admin-overview__kpi-subtitle">+1 vs minggu lalu</p>
        </div>

        <div className="admin-overview__kpi-card">
          <div className="admin-overview__kpi-header">
            <h3 className="admin-overview__kpi-title">Menunggu Persetujuan</h3>
            <span className="admin-overview__kpi-badge admin-overview__kpi-badge--danger">-5%</span>
          </div>
          <p className="admin-overview__kpi-value">{stats.pendingEvents}</p>
          <p className="admin-overview__kpi-subtitle">Turun vs minggu lalu</p>
        </div>

      </div>

      {/* ================= MIDDLE ROW: Charts ================= */}
      <div className="admin-overview__middle-row">
        
        {/* Graphic Chart */}
        <div className="admin-overview__card" style={{ zIndex: 10 }}>
          <VisxLineChart 
            title="Pertumbuhan Pengguna (Volunteer vs EO)" 
            series={lineChartData.series}
            height={280}
          />
        </div>

        {/* Pie Chart / Donut Chart */}
        <div className="admin-overview__card">
          <div className="admin-overview__card-header">
            <h3 className="admin-overview__card-title">Partisipasi</h3>
            <span className="admin-overview__kpi-subtitle">Bulan ini ▾</span>
          </div>
          
          <div className="admin-overview__donut-wrap">
            <div className="admin-overview__donut-circle">
              <div className="admin-overview__donut-inner">
                <p className="admin-overview__donut-inner-val">{donutData.total.toLocaleString('id-ID')}</p>
                <p className="admin-overview__donut-inner-lbl">Total Aktif</p>
              </div>
            </div>

            <div className="admin-overview__donut-legend">
              <div className="admin-overview__legend-item">
                <div className="admin-overview__legend-label">
                  <span className="admin-overview__legend-dot" style={{ background: donutData.impact.color }}></span>
                  {donutData.impact.label}
                </div>
                <div className="admin-overview__legend-val">{donutData.impact.pct}%</div>
              </div>
              <div className="admin-overview__legend-item">
                <div className="admin-overview__legend-label">
                  <span className="admin-overview__legend-dot" style={{ background: donutData.attendance.color }}></span>
                  {donutData.attendance.label}
                </div>
                <div className="admin-overview__legend-val">{donutData.attendance.pct}%</div>
              </div>
            </div>

            <Link to="/admin/participation" className="btn btn--outline btn--sm" style={{ width: '100%' }}>
              View reports
            </Link>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM ROW: 3 Cards ================= */}
      <div className="admin-overview__bottom-row">
        
        {/* Aktivitas Terbaru (Lead Pipeline style) */}
        <div className="admin-overview__card">
          <div className="admin-overview__card-header" style={{ marginBottom: '8px' }}>
            <h3 className="admin-overview__card-title">Aktivitas Terbaru</h3>
            <span className="admin-overview__kpi-subtitle">...</span>
          </div>
          <div className="admin-overview__pipeline-list">
            {recentActivity.map((act) => (
              <div key={act.id} className="admin-overview__pipeline-item">
                <div className="admin-overview__pipeline-info">
                  <span className="admin-overview__pipeline-name" title={act.targetLabel}>{act.action}</span>
                  <span className="admin-overview__pipeline-count">{new Date(act.timestamp).getDate()}d</span>
                </div>
                <div className="admin-overview__pipeline-bar-bg">
                  <div 
                    className="admin-overview__pipeline-bar-fill" 
                    style={{ width: `${act.pct}%`, background: act.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NGO List (Replaces Retention Rate) */}
        <div className="admin-overview__card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="admin-overview__card-header" style={{ marginBottom: '16px' }}>
            <h3 className="admin-overview__card-title">NGO Terdaftar</h3>
            <button 
              onClick={() => navigate('/admin/users?role=ORGANIZER')}
              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              Lihat Semua
            </button>
          </div>
          <div className="admin-overview__ngo-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto', maxHeight: '250px', paddingRight: '4px' }}>
            {organizations.length === 0 && (
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '24px 0' }}>
                Belum ada organisasi terdaftar.
              </p>
            )}
            {organizations.slice(0, 7).map((ngo) => (
              <div key={ngo.id} style={{ display: 'flex', alignItems: 'center', padding: '12px', border: '1px solid var(--color-border-light)', borderRadius: '12px', background: 'var(--color-bg-base)' }}>
                <img
                  src={ngo.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(ngo.name)}&background=random&color=fff`}
                  alt={ngo.name}
                  style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', marginRight: '16px' }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-heading)' }}>{ngo.name}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ngo.shortProfile}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: '16px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, textAlign: 'center', background: ngo.isVerified ? 'var(--color-success-soft)' : 'var(--color-warning-soft)', color: ngo.isVerified ? 'var(--color-success)' : 'var(--color-warning)' }}>
                    {ngo.isVerified ? 'Aktif' : 'Nonaktif'}
                  </span>
                  <button
                    onClick={() => navigate(`/admin/users?role=ORGANIZER`)}
                    style={{ padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer' }}
                  >
                    Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Region Distribution */}
        <RegionDistribution />

      </div> {/* end .admin-overview__bottom-row */}

      {/* ================= AI INSIGHT SECTION ================= */}
      <div className="admin-overview__ai-insight-section">
        <div className="admin-overview__ai-header">
          <div className="admin-overview__ai-title-wrap">
            <FiCpu className="ai-sparkle-icon" />
            <h3 className="admin-overview__ai-title">AI Insights & Recommendations</h3>
          </div>
          <button className="admin-dashboard-btn admin-dashboard-btn--dark" onClick={() => setIsAiOpen(true)}>
            Chat with AI
          </button>
        </div>
        <div className="admin-overview__ai-grid">
          {stats.aiInsights.length === 0 && (
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Memuat insight...</p>
          )}
          {stats.aiInsights.map((insight, i) => {
            const { icon: Icon, className } = INSIGHT_TONE_STYLE[insight.tone]
            return (
              <div className="admin-overview__ai-card" key={i}>
                <div className={`admin-overview__ai-card-icon ${className}`}>
                  <Icon />
                </div>
                <div className="admin-overview__ai-card-content">
                  <h4>{insight.title}</h4>
                  <p>{insight.description}</p>
                  <button className="admin-overview__ai-action" onClick={() => setIsAiOpen(true)}>{insight.actionLabel}</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ================= HISTORY TABLE ================= */}
      <div className="admin-overview__history-section">
        <div className="admin-overview__history-header">
          <div>
            <h3 className="admin-overview__history-title">Aktivitas Keseluruhan App</h3>
            <p className="admin-overview__history-subtitle">Pantau seluruh riwayat aktivitas terbaru pengguna</p>
          </div>
          <div className="admin-overview__history-actions">
            <span className="admin-overview__history-filter">Status: <strong>Semua</strong> <small>▼</small></span>
            <span className="admin-overview__history-filter">Waktu: <strong>Hari Ini</strong> <small>▼</small></span>
            <div className="admin-overview__table-icons">
              <FiPrinter onClick={() => handleMockClick('Print Data')} />
              <FiColumns onClick={() => handleMockClick('Ubah Kolom')} />
              <FiFileText onClick={() => handleMockClick('Lihat Detail Dokumen')} />
            </div>
          </div>
        </div>

        <div className="admin-overview__table-container">
          <table className="admin-overview__table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}><input type="checkbox" /></th>
                <th>ID Aktivitas <small>↕</small></th>
                <th>Nama Pelaku <small>↕</small></th>
                <th>Tipe Aktivitas <small>↕</small></th>
                <th>Tanggal & Waktu <small>↕</small></th>
                <th>Detail <small>↕</small></th>
                <th>Status <small>↕</small></th>
              </tr>
            </thead>
            <tbody>
              {historyRows.map((row) => {
                const status = getActivityLogStatus(row.action)
                return (
                  <tr key={row.id}>
                    <td><input type="checkbox" /></td>
                    <td style={{ fontWeight: 600 }}>#{row.id.toUpperCase().replace('-', '')}</td>
                    <td style={{ fontWeight: 600, color: 'var(--color-text-heading)' }}>{row.actorName}</td>
                    <td>{row.action}</td>
                    <td>{historyTimeFormatter.format(new Date(row.timestamp))}</td>
                    <td>{row.targetLabel}</td>
                    <td style={{ color: status.color, fontWeight: 500 }}>{status.label}</td>
                  </tr>
                )
              })}
              {historyRows.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-muted)' }}>
                    Belum ada aktivitas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
                <p>Halo Admin! Tanyakan apa saja soal data dashboard hari ini — saya akan menjawab berdasarkan angka nyata di database.</p>
              </div>

              {chatMessages.map((m, i) => (
                <div className={`ai-chat-bubble ${m.role === 'user' ? 'user' : 'ai'}`} key={i}>
                  <strong>{m.role === 'user' ? 'Admin' : '✨ AI Assistant'}</strong>
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

      </div> {/* end .admin-overview__scroll-content */}
    </div>
  )
}
