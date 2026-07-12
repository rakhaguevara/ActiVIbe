import { Link } from 'react-router-dom'
import { FiHeart, FiShare2, FiChevronLeft, FiChevronRight, FiMapPin, FiPhone, FiMail, FiGlobe, FiImage, FiArrowRight } from 'react-icons/fi'
import { useFollowedOrganizations } from '../hooks/useFollowedOrganizations'
import type { Organization } from '../types/organization'
import './OrganizationDetailPanel.css'

interface OrganizationDetailPanelProps {
  organization: Organization
  availableEventsCount: number
  currentIndex: number
  total: number
  onPrev: () => void
  onNext: () => void
  onBackToResults: () => void
}

export default function OrganizationDetailPanel({
  organization,
  availableEventsCount,
  currentIndex,
  total,
  onPrev,
  onNext,
  onBackToResults,
}: OrganizationDetailPanelProps) {
  const { isFollowed, toggle } = useFollowedOrganizations()
  const followed = isFollowed(organization.id)

  const handleShare = async () => {
    const link = `${window.location.origin}/dashboard/organisasi?org=${organization.id}`
    await navigator.clipboard.writeText(link)
  }

  const paginationBar = (
    <div className="organization-detail-panel__topbar" style={{ justifyContent: 'flex-end' }}>
      <div className="organization-detail-panel__pagination">
        <button type="button" onClick={onPrev} disabled={currentIndex <= 0}>
          <FiChevronLeft /> Sebelumnya
        </button>
        <span>{currentIndex + 1} dari {total}</span>
        <button type="button" onClick={onNext} disabled={currentIndex >= total - 1}>
          Berikutnya <FiChevronRight />
        </button>
      </div>
    </div>
  )

  return (
    <div className="organization-detail-panel">
      {paginationBar}

      <div className="organization-detail-panel__body">
        <div className="organization-detail-panel__side">
          {organization.logoUrl ? (
            <img src={organization.logoUrl} alt={`Logo ${organization.name}`} className="organization-detail-panel__logo-image" />
          ) : (
            <div className="organization-detail-panel__logo-placeholder" aria-hidden="true">
              <FiImage />
              <span>Logo</span>
            </div>
          )}

          <h2 className="organization-detail-panel__side-title">{organization.name}</h2>
          <p className="organization-detail-panel__side-location">{organization.location}</p>
          <p className="organization-detail-panel__side-joined">Bergabung sejak {organization.joinedYear}</p>

          <div className="organization-detail-panel__side-divider" />

          <div className="organization-detail-panel__admin-box">
            <p>
              Apakah kamu bagian dari staf atau tim {organization.name}? Hubungi tim ActiVibe untuk mengelola profil
              dan kegiatan organisasi ini.
            </p>
            <a href={`mailto:${organization.email}`} className="organization-detail-panel__admin-link">
              Hubungi Organisasi <FiArrowRight />
            </a>
          </div>
        </div>

        <div className="organization-detail-panel__main">
          <span className="organization-detail-panel__eyebrow">
            ORGANISASI{organization.isVerified ? ' · TERVERIFIKASI' : ''}
          </span>

          <h2 className="organization-detail-panel__title">{organization.name}</h2>

          <p className="organization-detail-panel__subtitle">
            {organization.location}
            {organization.website && (
              <>
                {' | '}
                <a href={`https://${organization.website}`} target="_blank" rel="noreferrer">
                  {organization.website}
                </a>
              </>
            )}
          </p>

          <div className="organization-detail-panel__actions">
            <button
              type="button"
              className={`organization-detail-panel__action-button${followed ? ' organization-detail-panel__action-button--active' : ''}`}
              onClick={() => toggle(organization.id)}
            >
              <FiHeart fill={followed ? 'currentColor' : 'none'} /> {followed ? 'Mengikuti' : 'Ikuti'}
            </button>
            <button type="button" className="organization-detail-panel__action-button" onClick={handleShare}>
              <FiShare2 /> Bagikan
            </button>
            {availableEventsCount > 0 && (
              <Link
                to={`/dashboard?organizer=${encodeURIComponent(organization.name)}`}
                className="organization-detail-panel__action-button organization-detail-panel__action-button--primary"
              >
                Daftar Kegiatan ({availableEventsCount})
              </Link>
            )}
          </div>

          <div className="organization-detail-panel__section">
            <h3>Mission</h3>
            <p>{organization.mission}</p>

            <h3>About Us</h3>
            <p>{organization.aboutUs}</p>

            <h3>Cause Areas Include</h3>
            <ul className="organization-detail-panel__cause-list">
              {organization.causeAreas.map((cause) => (
                <li key={cause}>{cause}</li>
              ))}
            </ul>
          </div>

          <div className="organization-detail-panel__divider" />

          <div className="organization-detail-panel__section">
            <h3>Location &amp; Contact</h3>
            <ul className="organization-detail-panel__contact-list">
              <li>
                <FiPhone aria-hidden="true" /> {organization.phone}
              </li>
              <li>
                <FiMapPin aria-hidden="true" /> {organization.address}
              </li>
              <li>
                <FiMail aria-hidden="true" /> {organization.email}
              </li>
              {organization.website && (
                <li>
                  <FiGlobe aria-hidden="true" /> {organization.website}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {paginationBar}
    </div>
  )
}
