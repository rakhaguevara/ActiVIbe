import { useState } from 'react'
import { FiHeart, FiShare2, FiCheckCircle } from 'react-icons/fi'
import { getCauseAreaStyle } from '../utils/causeAreaStyle'
import { useFollowedOrganizations } from '../hooks/useFollowedOrganizations'
import type { Organization } from '../types/organization'
import './OrganizationListSidebar.css'

interface OrganizationListSidebarProps {
  organizations: Organization[]
  selectedOrganizationId: string | null
  onSelect: (id: string) => void
}

export default function OrganizationListSidebar({
  organizations,
  selectedOrganizationId,
  onSelect,
}: OrganizationListSidebarProps) {
  const { isFollowed, toggle } = useFollowedOrganizations()
  const [copiedOrgId, setCopiedOrgId] = useState<string | null>(null)

  const handleShare = async (orgId: string) => {
    const link = `${window.location.origin}/dashboard/organisasi?org=${orgId}`
    await navigator.clipboard.writeText(link)
    setCopiedOrgId(orgId)
    setTimeout(() => {
      setCopiedOrgId((current) => (current === orgId ? null : current))
    }, 1500)
  }

  return (
    <div className="organization-list-sidebar">
      {organizations.map((org) => {
        const { icon: Icon, bgToken } = getCauseAreaStyle(org.causeAreas[0])
        const isSelected = org.id === selectedOrganizationId
        const visibleCauses = org.causeAreas.slice(0, 2)
        const extraCauseCount = org.causeAreas.length - visibleCauses.length
        const followed = isFollowed(org.id)

        return (
          <div
            key={org.id}
            className={`organization-list-sidebar__item${isSelected ? ' organization-list-sidebar__item--selected' : ''}`}
          >
            <div className="organization-list-sidebar__image-wrap" style={org.logoUrl ? undefined : { background: bgToken }}>
              {org.logoUrl ? (
                <img src={org.logoUrl} alt="" className="organization-list-sidebar__logo-image" />
              ) : (
                <span className="organization-list-sidebar__logo-letter">{org.name.charAt(0).toUpperCase()}</span>
              )}
              <span className="organization-list-sidebar__badge">★ {org.rating.toFixed(1)}</span>
            </div>

            <div className="organization-list-sidebar__content">
              <span className="organization-list-sidebar__title">
                {org.name}
                {org.isVerified && (
                  <FiCheckCircle className="organization-list-sidebar__verified" aria-label="Organisasi terverifikasi" />
                )}
              </span>

              <div className="organization-list-sidebar__tags-row">
                <Icon className="organization-list-sidebar__icon" aria-hidden="true" />
                {visibleCauses.map((cause) => (
                  <span key={cause} className="organization-list-sidebar__cause-chip">{cause}</span>
                ))}
                {extraCauseCount > 0 && (
                  <span className="organization-list-sidebar__cause-chip">+{extraCauseCount}</span>
                )}
              </div>

              <p className="organization-list-sidebar__desc">{org.shortProfile}</p>

              <div className="organization-list-sidebar__footer">
                <span className="organization-list-sidebar__events-count">{org.eventsCount} kegiatan</span>
                <span className="organization-list-sidebar__location">{org.location}</span>
              </div>

              <div className="organization-list-sidebar__actions">
                <button
                  type="button"
                  className="organization-list-sidebar__detail-button"
                  aria-label="Lihat profil organisasi"
                  onClick={() => onSelect(org.id)}
                >
                  Lihat Profil
                </button>
                <button
                  type="button"
                  className={`organization-list-sidebar__icon-button${followed ? ' organization-list-sidebar__icon-button--active' : ''}`}
                  aria-label={followed ? 'Berhenti mengikuti organisasi' : 'Ikuti organisasi'}
                  onClick={() => toggle(org.id)}
                >
                  <FiHeart fill={followed ? 'currentColor' : 'none'} />
                </button>
                <button
                  type="button"
                  className="organization-list-sidebar__icon-button"
                  aria-label="Bagikan profil organisasi"
                  onClick={() => handleShare(org.id)}
                >
                  <FiShare2 />
                </button>
                {copiedOrgId === org.id && (
                  <span className="organization-list-sidebar__copied-label">Disalin!</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
