import { useMemo, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { FiAward, FiClock, FiUsers, FiStar, FiCopy, FiCheck } from 'react-icons/fi'
import { FaWhatsapp, FaLinkedin, FaInstagram } from 'react-icons/fa'
import PassportBook from '../../components/passport-book/PassportBook'
import { MOCK_CHAPTERS } from '../../components/passport-book/passportBook.mockData'
import './PassportPage.css'

interface SkillProgress {
  name: string
  xp: number
  xpTarget: number
  level: number
}

const SKILLS: SkillProgress[] = [
  { name: 'Kerja Tim', xp: 340, xpTarget: 500, level: 3 },
  { name: 'Mengajar', xp: 210, xpTarget: 300, level: 2 },
  { name: 'Fisik/Lapangan', xp: 180, xpTarget: 300, level: 2 },
  { name: 'Kreativitas', xp: 90, xpTarget: 200, level: 1 },
]

const STATS = {
  totalHours: 42,
  eventsCompleted: MOCK_CHAPTERS.length,
  ngoCount: new Set(MOCK_CHAPTERS.map((c) => c.organizerName)).size,
  points: 950,
}

export default function PassportPage() {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  const firstName = user?.name.split(' ')[0] ?? 'Volunteer'
  const slug = useMemo(
    () => (user?.name ?? 'volunteer').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
    [user?.name],
  )
  const publicUrl = `activivibe.id/passport/${slug}`
  const shareText = `Aku baru saja menyelesaikan ${STATS.eventsCompleted} kegiatan volunteer dan berkontribusi ${STATS.totalHours} jam bersama ${STATS.ngoCount} organisasi lewat ActiVibe!`

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
    <main className="passport-page">
      <section className="passport-page__hero card">
        <span className="badge badge--info passport-page__ai-badge">AI-Generated</span>
        <h1 className="passport-page__tagline">
          "{firstName} adalah volunteer aktif yang telah mengabdikan {STATS.totalHours} jam untuk lingkungan dan
          pendidikan bersama {STATS.ngoCount} organisasi berbeda."
        </h1>
        <p className="passport-page__hero-sub">
          Tagline ini otomatis dibuat dari riwayat kontribusimu — akan makin personal seiring kegiatan yang kamu
          selesaikan.
        </p>
      </section>

      <section className="passport-page__stats">
        <div className="card passport-page__stat">
          <FiClock className="passport-page__stat-icon" />
          <span className="passport-page__stat-value">{STATS.totalHours}</span>
          <span className="passport-page__stat-label">Jam Kontribusi</span>
        </div>
        <div className="card passport-page__stat">
          <FiAward className="passport-page__stat-icon" />
          <span className="passport-page__stat-value">{STATS.eventsCompleted}</span>
          <span className="passport-page__stat-label">Kegiatan Selesai</span>
        </div>
        <div className="card passport-page__stat">
          <FiUsers className="passport-page__stat-icon" />
          <span className="passport-page__stat-value">{STATS.ngoCount}</span>
          <span className="passport-page__stat-label">Organisasi Berbeda</span>
        </div>
        <div className="card passport-page__stat">
          <FiStar className="passport-page__stat-icon" />
          <span className="passport-page__stat-value">{STATS.points}</span>
          <span className="passport-page__stat-label">Poin Reward</span>
        </div>
      </section>

      <section className="passport-page__columns">
        <div className="card passport-page__skills">
          <h2 className="passport-page__section-title">Skill Progress Tracker</h2>
          {SKILLS.map((skill) => (
            <div key={skill.name} className="passport-page__skill">
              <div className="passport-page__skill-head">
                <span className="passport-page__skill-name">{skill.name}</span>
                <span className="passport-page__skill-level">Level {skill.level}</span>
              </div>
              <div className="passport-page__skill-bar-track">
                <div
                  className="passport-page__skill-bar-fill"
                  style={{ width: `${Math.min(100, (skill.xp / skill.xpTarget) * 100)}%` }}
                />
              </div>
              <span className="passport-page__skill-xp">{skill.xp} / {skill.xpTarget} XP</span>
            </div>
          ))}
        </div>

        <div className="card passport-page__share">
          <h2 className="passport-page__section-title">Bagikan Impact Passport</h2>
          <p className="passport-page__share-desc">
            Bisa dilampirkan ke CV, portofolio, atau pengajuan beasiswa.
          </p>
          <div className="passport-page__share-link">
            <span>{publicUrl}</span>
            <button type="button" className="passport-page__copy-btn" onClick={handleCopyLink}>
              {copied ? <FiCheck /> : <FiCopy />}
            </button>
          </div>
          <div className="passport-page__share-buttons">
            <button type="button" className="btn btn--outline btn--sm" onClick={handleShareWhatsapp}>
              <FaWhatsapp /> WhatsApp
            </button>
            <button type="button" className="btn btn--outline btn--sm" onClick={handleShareLinkedin}>
              <FaLinkedin /> LinkedIn
            </button>
            <button type="button" className="btn btn--outline btn--sm" onClick={handleShareInstagram}>
              <FaInstagram /> Instagram
            </button>
          </div>
          <p className="passport-page__share-note">
            URL publik akan aktif otomatis setelah backend Impact Passport tersambung.
          </p>
        </div>
      </section>

      <section className="passport-page__book-section">
        <h2 className="passport-page__section-title">Buku Perjalananmu</h2>
        <p className="passport-page__book-hint">Klik sampul untuk membuka riwayat kegiatanmu, bab demi bab.</p>
        <div className="passport-page__book-wrap">
          <PassportBook title="Impact Passport" chapters={MOCK_CHAPTERS} />
        </div>
      </section>
    </main>
  )
}
