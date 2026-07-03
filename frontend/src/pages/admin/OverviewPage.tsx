import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FiUsers, FiCalendar, FiClock } from 'react-icons/fi'
import { mockAdminUsers, mockAdminEvents, mockParticipationRecords, mockActivityLog } from '../../data/mockAdmin'
import BarChart, { type BarChartDatum } from '../../components/BarChart'
import DonutChart from '../../components/DonutChart'
import './OverviewPage.css'

const MONTH_LABEL = new Intl.DateTimeFormat('id-ID', { month: 'short' })

export default function OverviewPage() {
  const stats = useMemo(() => {
    const totalUsers = mockAdminUsers.length
    const pendingEvents = mockAdminEvents.filter((e) => e.status === 'pending').length
    const approvedEvents = mockAdminEvents.filter((e) => e.status === 'approved').length

    const attended = mockParticipationRecords.filter((r) => r.attended).length
    const participationRate = mockParticipationRecords.length
      ? Math.round((attended / mockParticipationRecords.length) * 100)
      : 0

    const withImpact = mockParticipationRecords.filter((r) => r.impactValue > 0).length
    const impactPassportRate = mockParticipationRecords.length
      ? Math.round((withImpact / mockParticipationRecords.length) * 100)
      : 0

    return { totalUsers, pendingEvents, approvedEvents, participationRate, impactPassportRate }
  }, [])

  const usersByStatus: BarChartDatum[] = useMemo(() => {
    const counts = { active: 0, inactive: 0, suspended: 0 }
    mockAdminUsers.forEach((u) => { counts[u.status] += 1 })

    return [
      { label: 'Aktif', value: counts.active, color: 'var(--color-success)', displayValue: String(counts.active) },
      {
        label: 'Nonaktif',
        value: counts.inactive,
        color: 'var(--color-warning-chart)',
        displayValue: String(counts.inactive),
      },
      {
        label: 'Ditangguhkan',
        value: counts.suspended,
        color: 'var(--color-danger)',
        displayValue: String(counts.suspended),
      },
    ]
  }, [])

  const eventsByStatus: BarChartDatum[] = useMemo(() => {
    const counts = { pending: 0, approved: 0, rejected: 0 }
    mockAdminEvents.forEach((e) => { counts[e.status] += 1 })

    return [
      {
        label: 'Menunggu',
        value: counts.pending,
        color: 'var(--color-warning-chart)',
        displayValue: String(counts.pending),
      },
      {
        label: 'Disetujui',
        value: counts.approved,
        color: 'var(--color-success)',
        displayValue: String(counts.approved),
      },
      { label: 'Ditolak', value: counts.rejected, color: 'var(--color-danger)', displayValue: String(counts.rejected) },
    ]
  }, [])

  const attendanceByMonth: BarChartDatum[] = useMemo(() => {
    const buckets = new Map<string, { total: number; attended: number }>()

    mockParticipationRecords.forEach((r) => {
      const monthKey = r.date.slice(0, 7)
      const bucket = buckets.get(monthKey) ?? { total: 0, attended: 0 }
      bucket.total += 1
      if (r.attended) bucket.attended += 1
      buckets.set(monthKey, bucket)
    })

    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, bucket]) => {
        const rate = bucket.total ? Math.round((bucket.attended / bucket.total) * 100) : 0
        return {
          label: MONTH_LABEL.format(new Date(`${monthKey}-01`)),
          value: rate,
          color: 'var(--color-primary)',
          displayValue: `${rate}%`,
        }
      })
  }, [])

  const recentActivity = useMemo(
    () =>
      [...mockActivityLog]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5),
    [],
  )

  return (
    <div className="admin-overview">
      <header className="admin-overview__header">
        <h1>Overview</h1>
        <p>Ringkasan data pengguna, kegiatan, dan partisipasi di platform ActiVibe.</p>
      </header>

      <div className="admin-overview__donuts">
        <DonutChart
          title="Tingkat Kehadiran"
          value={stats.participationRate}
          color="var(--color-primary)"
          trackColor="var(--color-primary-soft)"
        />
        <DonutChart
          title="Impact Passport Terisi"
          value={stats.impactPassportRate}
          color="var(--color-accent-orange)"
          trackColor="var(--color-accent-orange-soft)"
        />
      </div>

      <div className="admin-overview__charts">
        <BarChart title="Pengguna per Status" data={usersByStatus} />
        <BarChart title="Kegiatan per Status" data={eventsByStatus} />
        <BarChart title="Tingkat Kehadiran per Bulan" data={attendanceByMonth} />
      </div>

      <div className="admin-overview__stats">
        <div className="card admin-overview__stat">
          <FiUsers className="admin-overview__stat-icon" />
          <p className="admin-overview__stat-value">{stats.totalUsers}</p>
          <p className="admin-overview__stat-label">Pengguna Terdaftar</p>
        </div>

        <div className="card admin-overview__stat">
          <FiCalendar className="admin-overview__stat-icon" />
          <p className="admin-overview__stat-value">{stats.approvedEvents}</p>
          <p className="admin-overview__stat-label">Kegiatan Disetujui</p>
        </div>

        <div className="card admin-overview__stat admin-overview__stat--warning">
          <FiClock className="admin-overview__stat-icon" />
          <p className="admin-overview__stat-value">{stats.pendingEvents}</p>
          <p className="admin-overview__stat-label">Menunggu Persetujuan</p>
        </div>
      </div>

      {stats.pendingEvents > 0 && (
        <div className="card admin-overview__callout">
          <p>
            Ada <strong>{stats.pendingEvents} kegiatan</strong> menunggu persetujuan.
          </p>
          <Link to="/admin/events" className="btn btn--primary btn--sm">
            Tinjau Kegiatan
          </Link>
        </div>
      )}

      <section className="admin-overview__activity card">
        <h2>Aktivitas Terbaru</h2>
        <ul className="admin-overview__activity-list">
          {recentActivity.map((entry) => (
            <li key={entry.id}>
              <span className="admin-overview__activity-actor">{entry.actorName}</span>
              {' '}
              {entry.action.toLowerCase()}
              {' '}
              <span className="admin-overview__activity-target">{entry.targetLabel}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
