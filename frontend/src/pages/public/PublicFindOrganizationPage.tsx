import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/apiFetch'
import { FiMapPin, FiUsers, FiStar, FiTrendingUp, FiAward } from 'react-icons/fi'
import wave from '../../assets/svg/wave.svg'
import Footer from '../../components/Footer'
import './PublicFindActivityPage.css'
import './PublicFindOrganizationPage.css'

interface PublicOrg {
  id: string
  name: string
  category: string
  city: string
  province: string
  logoUrl: string
  memberCount: number
  eventCount: number
  rating: number
  reviewCount: number
  createdAt: string
}

function OrgCard({ org, onLoginClick }: { org: PublicOrg; onLoginClick?: () => void }) {
  return (
    <div className="poc-card">
      <div className="poc-card-logo">
        {org.logoUrl
          ? <img src={org.logoUrl} alt={org.name} className="poc-logo-img" />
          : <div className="poc-logo-placeholder">{org.name.charAt(0).toUpperCase()}</div>
        }
      </div>
      <div className="poc-card-body">
        <h3 className="poc-card-title">{org.name}</h3>
        <span className="poc-card-category">{org.category || 'Organisasi'}</span>
        {(org.city || org.province) && (
          <p className="poc-card-location">
            <FiMapPin size={12} /> {[org.city, org.province].filter(Boolean).join(', ')}
          </p>
        )}
        <div className="poc-card-stats">
          {org.eventCount > 0 && (
            <span><FiAward size={12} /> {org.eventCount} event</span>
          )}
          {org.memberCount > 0 && (
            <span><FiUsers size={12} /> {org.memberCount} anggota</span>
          )}
          {org.rating > 0 && (
            <span><FiStar size={12} className="poc-star" /> {org.rating.toFixed(1)}</span>
          )}
        </div>
        <button className="poc-btn" onClick={onLoginClick}>Ikuti Organisasi</button>
      </div>
    </div>
  )
}

interface OrgSectionProps {
  title: string
  subtitle: string
  icon: React.ReactNode
  orgs: PublicOrg[]
  onLoginClick?: () => void
}

function OrgSection({ title, subtitle, icon, orgs, onLoginClick }: OrgSectionProps) {
  if (orgs.length === 0) return null
  return (
    <section className="pac-section">
      <div className="pac-section-header">
        <div className="pac-section-icon">{icon}</div>
        <div>
          <h2 className="pac-section-title">{title}</h2>
          <p className="pac-section-sub">{subtitle}</p>
        </div>
      </div>
      <div className="pac-row-wrapper">
        <div className="pac-row">
          {orgs.map(org => (
            <OrgCard key={org.id} org={org} onLoginClick={onLoginClick} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default function PublicFindOrganizationPage({ onLoginClick }: { onLoginClick?: () => void }) {
  const [orgs, setOrgs] = useState<PublicOrg[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch(`${import.meta.env.VITE_API_URL ?? ''}/organizations`)
        const data = await res.json()
        if (data.organizations) {
          setOrgs(
            data.organizations.map((o: any) => ({
              id: o.id,
              name: o.name ?? '',
              category: o.category ?? '',
              city: o.city ?? '',
              province: o.province ?? '',
              logoUrl: o.logoUrl ?? '',
              memberCount: o.memberCount ?? 0,
              eventCount: o.eventCount ?? 0,
              rating: o.rating ?? 0,
              reviewCount: o.reviewCount ?? 0,
              createdAt: o.createdAt ?? new Date().toISOString(),
            }))
          )
        }
      } catch (err) {
        console.error('Failed to load organizations', err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  /** 1. Terpopuler — rating tertinggi (fallback: semua org jika tidak ada yang punya rating) */
  const topRated = (() => {
    const withRating = [...orgs].filter(o => o.rating > 0).sort((a, b) => b.rating - a.rating)
    // Jika tidak ada yg punya rating, tampilkan semua org (urutan createdAt terbaru)
    return (withRating.length > 0 ? withRating : [...orgs].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )).slice(0, 10)
  })()

  /** 2. Paling Aktif — event terbanyak, fallback ke nama A-Z */
  const mostActive = [...orgs]
    .sort((a, b) => b.eventCount - a.eventCount || a.name.localeCompare(b.name))
    .slice(0, 10)

  /** 3. Baru Bergabung — createdAt terbaru */
  const newest = [...orgs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)


  return (
    <div className="pac-page">
      {/* Hero (Background Banner) */}
      <div className="pac-hero pac-hero--org">
        <img src={wave} alt="" className="pac-hero-wave" />
      </div>

      {/* Page Title & Subtitle */}
      <div className="pac-header-text">
        <div className="pac-header-text-inner">
          <h1 className="pac-hero-title">Cari Organisasi</h1>
          <p className="pac-hero-sub">
            Temukan organisasi yang sejalan dengan nilai-nilai Anda dan ikuti kegiatan mereka.
          </p>
        </div>
      </div>

      <div className="pac-content">
        {isLoading ? (
          <div className="pac-loading">
            <div className="pac-spinner" />
            <p>Memuat organisasi...</p>
          </div>
        ) : orgs.length === 0 ? (
          <div className="pac-empty-state">Belum ada organisasi yang terdaftar saat ini.</div>
        ) : (
          <>
            <OrgSection
              title="Terpopuler"
              subtitle="Organisasi dengan reputasi terbaik dari para relawan"
              icon={<FiStar />}
              orgs={topRated}
              onLoginClick={onLoginClick}
            />
            <OrgSection
              title="Paling Aktif"
              subtitle="Organisasi yang paling sering mengadakan kegiatan relawan"
              icon={<FiTrendingUp />}
              orgs={mostActive}
              onLoginClick={onLoginClick}
            />
            <OrgSection
              title="Baru Bergabung"
              subtitle="Organisasi yang baru saja hadir di ActiVibe"
              icon={<FiAward />}
              orgs={newest}
              onLoginClick={onLoginClick}
            />
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
