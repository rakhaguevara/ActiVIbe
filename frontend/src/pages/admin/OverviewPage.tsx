import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiSearch, FiBell, FiShare, FiCpu, FiCheckCircle, FiDownloadCloud, FiUploadCloud, FiPrinter, FiColumns, FiFileText, FiSend, FiX, FiTrendingUp, FiAlertCircle } from 'react-icons/fi'
import { mockAdminUsers, mockAdminEvents, mockActivityLog } from '../../data/mockAdmin'
import VisxLineChart from '../../components/VisxLineChart'
import RegionDistribution from '../../components/region-distribution'
import './OverviewPage.css'

// Mock Data untuk Tabel Historis
const mockHistoryTable = [
  { id: '#ACT-9628288', actor: 'Budi Santoso', type: 'Pendaftaran Volunteer', date: '22 Dec 2024 at 11:20', details: 'Menunggu review', status: 'Pending', statusColor: 'var(--color-warning)' },
  { id: '#ACT-9628287', actor: 'NGO Peduli Lingkungan', type: 'Pengajuan Pendaftaran NGO', date: '22 Dec 2024 at 11:30', details: 'Dokumen lengkap', status: 'Delivered', statusColor: 'var(--color-success)' },
  { id: '#ACT-9628286', actor: 'Komunitas Hijau', type: 'Mengajukan Event Baru', date: '22 Dec 2024 at 13:20', details: 'Aksi Bersih Pantai', status: 'Delivered', statusColor: 'var(--color-success)' },
  { id: '#ACT-9628285', actor: 'Andi Wijaya', type: 'Pendaftaran Volunteer', date: '21 Dec 2024 at 09:15', details: 'Disetujui', status: 'Delivered', statusColor: 'var(--color-success)' },
]

export default function OverviewPage() {
  const navigate = useNavigate()
  const [isAiOpen, setIsAiOpen] = useState(false)

  /* ── 1. KPI Stats ── */
  const stats = useMemo(() => {
    const totalUsers = mockAdminUsers.length
    const approvedEvents = mockAdminEvents.filter((e) => e.status === 'approved').length
    const pendingEvents = mockAdminEvents.filter((e) => e.status === 'pending').length
    // Dummy logic for ongoing
    const ongoingEvents = Math.floor(approvedEvents / 2) 

    return { totalUsers, approvedEvents, ongoingEvents, pendingEvents }
  }, [])

  const handleMockClick = (feature: string) => {
    alert(`Fitur "${feature}" telah diaktifkan secara visual. Fungsi sebenarnya sedang dalam tahap integrasi backend.`)
  }

  /* ── 2. Line Chart Data ── */
  const lineChartData = useMemo(() => {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
    const volunteerSeries = {
      label: 'Volunteer',
      color: '#63C2E0', // User request
      data: labels.map((l, i) => ({ x: l, y: [15, 22, 35, 48, 60, 85, 120][i] }))
    }
    const eoSeries = {
      label: 'Organizer',
      color: '#F36038', // User request
      data: labels.map((l, i) => ({ x: l, y: [2, 4, 5, 8, 12, 15, 25][i] }))
    }
    return { series: [eoSeries, volunteerSeries] }
  }, [])

  /* ── 3. Donut Chart Data ── */
  const donutData = useMemo(() => {
    const total = 12500 // simulated 12.5K
    const impact = 7500
    const attendance = 5000
    
    return {
      total,
      impact: { label: 'Impact Passport Terisi', value: impact, pct: Math.round((impact/total)*100), color: 'var(--color-primary)' },
      attendance: { label: 'Tingkat Kehadiran', value: attendance, pct: Math.round((attendance/total)*100), color: 'var(--color-accent-orange)' }
    }
  }, [])

  /* ── 4. Aktivitas Terbaru (Lead Pipeline style) ── */
  const recentActivity = useMemo(
    () =>
      [...mockActivityLog]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 4)
        .map((a, i) => ({
          ...a,
          // Calculate dummy width based on index for the progress bar visual
          pct: 100 - (i * 20),
          color: i === 0 ? 'var(--color-accent-orange)' : i === 1 ? 'var(--color-primary)' : i === 2 ? 'var(--color-secondary)' : 'var(--color-warning-chart)'
        })),
    [],
  )

  return (
    <div className="admin-overview">

      {/* ================= FIXED HEADER ================= */}
      <div className="admin-dashboard-header">
        <div className="admin-dashboard-header__top">
          <h1 className="admin-dashboard-header__title">Dashboard</h1>
          <div className="admin-dashboard-header__top-actions">
            <div className="admin-dashboard-header__search">
              <FiSearch />
              <input type="text" placeholder="Search everything" />
            </div>
            <button className="admin-dashboard-btn-icon" onClick={() => handleMockClick('Notifikasi')}><FiBell /></button>
            <button className="admin-dashboard-btn" onClick={() => handleMockClick('Bagikan')}><FiShare /> Share</button>
          </div>
        </div>
        
        <div className="admin-dashboard-header__bottom">
          <div className="admin-dashboard-header__bottom-left">
            <button className="admin-dashboard-btn admin-dashboard-btn--dark" onClick={() => setIsAiOpen(true)}>
              <FiCpu /> Ask AI
            </button>
            <button className="admin-dashboard-btn" onClick={() => handleMockClick('Customize Widget')}>Customize Widget</button>
          </div>
          <div className="admin-dashboard-header__bottom-right">
            <span className="admin-dashboard-header__updated">
              <FiCheckCircle className="icon-success" /> Last updated now
            </span>
            <button className="admin-dashboard-btn" onClick={() => handleMockClick('Imports')}><FiUploadCloud /> Imports</button>
            <button className="admin-dashboard-btn admin-dashboard-btn--dark" onClick={() => handleMockClick('Exports')}><FiDownloadCloud /> Exports</button>
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
                <p className="admin-overview__donut-inner-val">12.5K</p>
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
            {[
              { id: 1, name: 'Griya Belajar Anak Bangsa', desc: 'Fokus pada pendidikan anak kurang mampu di pelosok negeri.', status: 'active', img: 'https://ui-avatars.com/api/?name=Griya+Belajar&background=random' },
              { id: 2, name: 'Yayasan Alam Nusantara', desc: 'Melestarikan alam dan penanaman 1000 pohon setiap bulan.', status: 'active', img: 'https://ui-avatars.com/api/?name=Yayasan+Alam&background=random' },
              { id: 3, name: 'Bhakti Sehat', desc: 'Penyedia layanan kesehatan gratis untuk masyarakat prasejahtera.', status: 'inactive', img: 'https://ui-avatars.com/api/?name=Bhakti+Sehat&background=random' },
              { id: 4, name: 'Sahabat Pesisir', desc: 'Memberdayakan nelayan dan membersihkan ekosistem pantai.', status: 'active', img: 'https://ui-avatars.com/api/?name=Sahabat+Pesisir&background=random' },
              { id: 5, name: 'Generasi Cerdas', desc: 'Menyediakan beasiswa dan pelatihan digital untuk pemuda.', status: 'active', img: 'https://ui-avatars.com/api/?name=Generasi+Cerdas&background=random' },
              { id: 6, name: 'Lestari Fauna', desc: 'Konservasi satwa langka dan edukasi anti-perburuan liar.', status: 'inactive', img: 'https://ui-avatars.com/api/?name=Lestari+Fauna&background=random' },
              { id: 7, name: 'Peduli Lansia', desc: 'Pusat perawatan dan dukungan emosional bagi lansia sebatang kara.', status: 'active', img: 'https://ui-avatars.com/api/?name=Peduli+Lansia&background=random' },
            ].map(ngo => (
              <div key={ngo.id} style={{ display: 'flex', alignItems: 'center', padding: '12px', border: '1px solid var(--color-border-light)', borderRadius: '12px', background: 'var(--color-bg-base)' }}>
                <img src={ngo.img} alt={ngo.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', marginRight: '16px' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-heading)' }}>{ngo.name}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ngo.desc}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: '16px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, textAlign: 'center', background: ngo.status === 'active' ? 'var(--color-success-soft)' : 'var(--color-warning-soft)', color: ngo.status === 'active' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                    {ngo.status === 'active' ? 'Aktif' : 'Nonaktif'}
                  </span>
                  <button onClick={() => alert(`Membuka detail untuk ${ngo.name}`)} style={{ padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer' }}>
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
          <div className="admin-overview__ai-card">
            <div className="admin-overview__ai-card-icon success">
              <FiTrendingUp />
            </div>
            <div className="admin-overview__ai-card-content">
              <h4>Lonjakan Volunteer di Jawa Timur</h4>
              <p>Pendaftaran Volunteer di Jawa Timur meningkat drastis (+25%). Saran: Alokasikan lebih banyak event kampanye di area Surabaya dan Malang bulan ini.</p>
              <button className="admin-overview__ai-action">Buat Event Baru</button>
            </div>
          </div>
          <div className="admin-overview__ai-card">
            <div className="admin-overview__ai-card-icon warning">
              <FiAlertCircle />
            </div>
            <div className="admin-overview__ai-card-content">
              <h4>Izin NGO Mendekati Kedaluwarsa</h4>
              <p>Terdapat 3 NGO aktif yang izin organisasinya akan habis dalam 7 hari ke depan. Saran: Kirimkan notifikasi pengingat otomatis.</p>
              <button className="admin-overview__ai-action">Kirim Pengingat</button>
            </div>
          </div>
          <div className="admin-overview__ai-card">
            <div className="admin-overview__ai-card-icon primary">
              <FiCheckCircle />
            </div>
            <div className="admin-overview__ai-card-content">
              <h4>Review Aktivitas Pending</h4>
              <p>Ada 4 aktivitas pendaftaran yang menunggu review Anda lebih dari 24 jam. Saran: Segera setujui Budi Santoso karena memiliki trust score 98%.</p>
              <button className="admin-overview__ai-action">Tinjau Sekarang</button>
            </div>
          </div>
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
              {mockHistoryTable.map(row => (
                <tr key={row.id}>
                  <td><input type="checkbox" /></td>
                  <td style={{ fontWeight: 600 }}>{row.id}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-text-heading)' }}>{row.actor}</td>
                  <td>{row.type}</td>
                  <td>{row.date}</td>
                  <td>{row.details}</td>
                  <td style={{ color: row.statusColor, fontWeight: 500 }}>{row.status}</td>
                </tr>
              ))}
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
                <p>Halo Admin! Saya telah menganalisis data dashboard hari ini. Terdapat peningkatan pendaftaran Volunteer sebesar <strong>12.5%</strong> di Jakarta. Namun, performa kegiatan Lingkungan sedikit stagnan minggu ini. Ada yang bisa saya bantu menerjemahkan data metrik spesifik atau memberikan saran?</p>
              </div>

              <div className="ai-chat-bubble user">
                <strong>Admin</strong>
                <p>Coba berikan saran untuk 3 tabel pengajuan terbaru yang masuk, apakah aman disetujui?</p>
              </div>

              <div className="ai-chat-bubble ai">
                <strong>✨ AI Assistant</strong>
                <p>Berdasarkan <strong>Aktivitas Keseluruhan App</strong> terbaru:<br/><br/>
                  1. <strong>Pendaftaran Volunteer (Budi Santoso)</strong>: Aman. Reputasi positif dan belum pernah melanggar TOS.<br/>
                  2. <strong>Pengajuan Event (Komunitas Hijau - Aksi Bersih Pantai)</strong>: Sangat direkomendasikan. Event sejenis memiliki engagement tinggi (+35%) bulan lalu.<br/>
                  3. <strong>Pendaftaran NGO Peduli Lingkungan</strong>: Dokumen pendirian lengkap, tapi izin domisili akan kedaluwarsa 2 bulan lagi. Saran: <i>Setujui dengan catatan pengingat pembaruan izin.</i>
                </p>
              </div>

            </div>
            <div className="admin-ai-modal__footer">
              <input type="text" placeholder="Tanyakan saran lain tentang data..." className="admin-ai-modal__input" />
              <button className="admin-ai-modal__send" onClick={() => handleMockClick('Kirim Pesan AI')}>
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
