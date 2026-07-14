import type { Event } from '../types/event'
import './PersonalizationInsightCard.css'

interface PersonalizationInsightCardProps {
  events: Event[]
  aiEnabled: boolean
  profileComplete: boolean
  /** 'compact' = sidebar (list), 'full' = settings page */
  variant?: 'compact' | 'full'
}

/** Hitung rata-rata matchScore dari events yang sudah dipersonalisasi (matchScore ≥ 50) */
function calcPersonalizationStats(events: Event[]) {
  if (events.length === 0) return { personalizedPct: 0, avgScore: 0, totalEvents: 0, personalizedCount: 0, topCategories: [] as TopCategory[] }

  const personalized = events.filter(e => e.matchScore >= 50)
  const avgScore = personalized.length > 0
    ? Math.round(personalized.reduce((sum, e) => sum + e.matchScore, 0) / personalized.length)
    : 0
  const personalizedPct = Math.round((personalized.length / events.length) * 100)

  /** Top 3 kategori berdasarkan rata-rata matchScore tertinggi */
  const categoryMap = new Map<string, { totalScore: number; count: number }>()
  for (const ev of events) {
    if (!ev.category) continue
    const cur = categoryMap.get(ev.category) ?? { totalScore: 0, count: 0 }
    cur.totalScore += ev.matchScore
    cur.count += 1
    categoryMap.set(ev.category, cur)
  }
  const topCategories: TopCategory[] = Array.from(categoryMap.entries())
    .map(([cat, { totalScore, count }]) => ({
      name: cat,
      avgScore: Math.round(totalScore / count),
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 3)

  return { personalizedPct, avgScore, totalEvents: events.length, personalizedCount: personalized.length, topCategories }
}

interface TopCategory {
  name: string
  avgScore: number
}

/** Pasangkan kategori dengan emoji & warna pastel berbasis nama */
const CATEGORY_META: Record<string, { emoji: string; color: string }> = {
  'Lingkungan':     { emoji: '🌿', color: '#bbf7d0' },
  'Pendidikan':     { emoji: '📚', color: '#bfdbfe' },
  'Kesehatan':      { emoji: '❤️', color: '#fecaca' },
  'Bencana & Sosial':{ emoji: '🤝', color: '#fde68a' },
  'Seni & Budaya':  { emoji: '🎨', color: '#ddd6fe' },
  'Musik':          { emoji: '🎵', color: '#fbcfe8' },
  'Olahraga':       { emoji: '⚽', color: '#a7f3d0' },
  'Teknologi':      { emoji: '💻', color: '#bae6fd' },
  'Amal':           { emoji: '💝', color: '#fecdd3' },
  'Keagamaan':      { emoji: '🕌', color: '#fef3c7' },
  'Pariwisata':     { emoji: '✈️', color: '#ccfbf1' },
  'Fotografi':      { emoji: '📷', color: '#e0e7ff' },
  'Pertanian':      { emoji: '🌾', color: '#dcfce7' },
  'Hukum & HAM':    { emoji: '⚖️', color: '#ffe4e6' },
  'Anak & Remaja':  { emoji: '👧', color: '#fce7f3' },
}

function getCategoryMeta(name: string): { emoji: string; color: string } {
  return CATEGORY_META[name] ?? { emoji: '✨', color: '#e9d5ff' }
}

/** SVG donut chart — single ring */
function DonutChart({ pct, size = 72, stroke = 9 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const filled = (pct / 100) * circ
  const cx = size / 2
  const cy = size / 2

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="paic-donut" aria-hidden="true">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={stroke} />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="#fff"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeDashoffset={circ / 4}
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
        fill="#fff" fontSize={size * 0.22} fontWeight="800" fontFamily="inherit">
        {pct}%
      </text>
    </svg>
  )
}

export default function PersonalizationInsightCard({
  events,
  aiEnabled,
  profileComplete,
  variant = 'compact',
}: PersonalizationInsightCardProps) {
  const { personalizedPct, avgScore, totalEvents, personalizedCount, topCategories } =
    calcPersonalizationStats(events)

  if (totalEvents === 0) return null

  const isCompact = variant === 'compact'

  return (
    <div className={`paic paic--${variant}`} role="region" aria-label="Insight personalisasi">
      <div className="paic__blob paic__blob--1" aria-hidden="true" />
      <div className="paic__blob paic__blob--2" aria-hidden="true" />

      <div className="paic__inner">
        {/* Left: chart */}
        <div className="paic__chart-wrap">
          <DonutChart pct={personalizedPct} size={isCompact ? 68 : 88} stroke={isCompact ? 8 : 10} />
          <p className="paic__chart-label">Beranda<br />dipersonalisasi</p>
        </div>

        {/* Right: text */}
        <div className="paic__text">

          {/* Top-3 category badges — gantikan badge AI */}
          {topCategories.length > 0 && (
            <div className="paic__cat-badges">
              {topCategories.map(cat => {
                const meta = getCategoryMeta(cat.name)
                return (
                  <span
                    key={cat.name}
                    className="paic__cat-badge"
                    style={{ background: meta.color, color: '#1e1b4b' }}
                    title={`Rata-rata skor: ${cat.avgScore}%`}
                  >
                    {meta.emoji} {cat.name}
                  </span>
                )
              })}
            </div>
          )}

          <h3 className="paic__title">
            {personalizedPct >= 80
              ? '80%+ beranda sudah dipersonalisasi untukmu!'
              : `${personalizedPct}% kegiatan cocok dengan profilmu`}
          </h3>

          <div className="paic__stats">
            <div className="paic__stat">
              <span className="paic__stat-value">{personalizedCount}</span>
              <span className="paic__stat-label">kegiatan cocok</span>
            </div>
            <div className="paic__stat-divider" />
            <div className="paic__stat">
              <span className="paic__stat-value">{avgScore}%</span>
              <span className="paic__stat-label">rata-rata skor</span>
            </div>
            <div className="paic__stat-divider" />
            <div className="paic__stat">
              <span className="paic__stat-value">{totalEvents}</span>
              <span className="paic__stat-label">total kegiatan</span>
            </div>
          </div>

          {personalizedPct >= 80 && (
            <p className="paic__notice">
              ⚠️ Lebih dari 80% hasil pencarian berdasarkan personalisasi — scroll ke bawah untuk melihat semua.
            </p>
          )}

          {!profileComplete && (
            <p className="paic__notice paic__notice--warn">
              💡 Lengkapi minat &amp; skill di Pengaturan agar rekomendasi makin akurat.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
