import { forwardRef, useState } from 'react'
import { FiAward, FiClock, FiUsers, FiStar, FiCopy, FiCheck } from 'react-icons/fi'
import { FaWhatsapp, FaLinkedin, FaInstagram } from 'react-icons/fa'
import type { PassportSkill, PassportStats } from './passportBook.types'

// Sama seperti ChapterPages.tsx — semua komponen di sini forwardRef ke <div>
// root-nya, wajib supaya react-pageflip bisa mengumpulkan node DOM-nya (lihat
// komentar panjang di ChapterPages.tsx).

// Halaman bio/ringkasan — dulu section "hero" + "stats" terpisah di atas
// PassportPage.tsx, sekarang jadi halaman pertama buku (tampil sendirian
// lewat showCover, seperti bio page paspor asli).
export const SummaryStatsPage = forwardRef<HTMLDivElement, { tagline: string; stats: PassportStats }>(
  function SummaryStatsPage({ tagline, stats }, ref) {
    return (
      <div ref={ref} className="passport-book__page passport-book__page--summary">
        <span className="badge badge--info passport-book__ai-badge">AI-Generated</span>
        <p className="passport-book__tagline">{tagline}</p>
        <div className="passport-book__stats-grid">
          <div className="passport-book__stat-mini">
            <FiClock className="passport-book__stat-mini-icon" />
            <span className="passport-book__stat-mini-value">{stats.totalHours}</span>
            <span className="passport-book__stat-mini-label">Jam Kontribusi</span>
          </div>
          <div className="passport-book__stat-mini">
            <FiAward className="passport-book__stat-mini-icon" />
            <span className="passport-book__stat-mini-value">{stats.eventsCompleted}</span>
            <span className="passport-book__stat-mini-label">Kegiatan Selesai</span>
          </div>
          <div className="passport-book__stat-mini">
            <FiUsers className="passport-book__stat-mini-icon" />
            <span className="passport-book__stat-mini-value">{stats.ngoCount}</span>
            <span className="passport-book__stat-mini-label">Organisasi Berbeda</span>
          </div>
          <div className="passport-book__stat-mini">
            <FiStar className="passport-book__stat-mini-icon" />
            <span className="passport-book__stat-mini-value">{stats.points}</span>
            <span className="passport-book__stat-mini-label">Poin Reward</span>
          </div>
        </div>
      </div>
    )
  },
)

export const SkillsPage = forwardRef<HTMLDivElement, { skills: PassportSkill[] }>(function SkillsPage(
  { skills },
  ref,
) {
  return (
    <div ref={ref} className="passport-book__page">
      <h3 className="passport-book__page-label">Skill Progress Tracker</h3>
      {skills.map((skill) => (
        <div key={skill.name} className="passport-book__skill">
          <div className="passport-book__skill-head">
            <span className="passport-book__skill-name">{skill.name}</span>
            <span className="passport-book__skill-level">Level {skill.level}</span>
          </div>
          <div className="passport-book__skill-bar-track">
            <div
              className="passport-book__skill-bar-fill"
              style={{ width: `${Math.min(100, (skill.xp / skill.xpTarget) * 100)}%` }}
            />
          </div>
          <span className="passport-book__skill-xp">
            {skill.xp} / {skill.xpTarget} XP
          </span>
        </div>
      ))}
    </div>
  )
})

export const SharePage = forwardRef<HTMLDivElement, { publicUrl: string; shareText: string }>(function SharePage(
  { publicUrl, shareText },
  ref,
) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(`https://${publicUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareWhatsapp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} https://${publicUrl}`)}`, '_blank')
  }

  const handleShareLinkedin = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://${publicUrl}`)}`,
      '_blank',
    )
  }

  const handleShareInstagram = async () => {
    await navigator.clipboard.writeText(`${shareText} https://${publicUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div ref={ref} className="passport-book__page">
      <h3 className="passport-book__page-label">Bagikan Impact Passport</h3>
      <p className="passport-book__summary-text">Bisa dilampirkan ke CV, portofolio, atau pengajuan beasiswa.</p>
      <div className="passport-book__share-link">
        <span>{publicUrl}</span>
        <button type="button" className="passport-book__copy-btn" onClick={handleCopyLink} aria-label="Salin link">
          {copied ? <FiCheck /> : <FiCopy />}
        </button>
      </div>
      <div className="passport-book__share-row">
        <button type="button" className="passport-book__share-btn" onClick={handleShareWhatsapp} aria-label="Bagikan ke WhatsApp">
          <FaWhatsapp />
        </button>
        <button type="button" className="passport-book__share-btn" onClick={handleShareLinkedin} aria-label="Bagikan ke LinkedIn">
          <FaLinkedin />
        </button>
        <button type="button" className="passport-book__share-btn" onClick={handleShareInstagram} aria-label="Salin link untuk Instagram">
          {copied ? <FiCheck /> : <FaInstagram />}
        </button>
      </div>
      <p className="passport-book__feedback-hint">URL publik akan aktif otomatis setelah backend Impact Passport tersambung.</p>
    </div>
  )
})
