import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { FiEdit2, FiExternalLink } from 'react-icons/fi'

import OrganizationProfileView from './organization-views/OrganizationProfileView'
import TeamMembersView from './organization-views/TeamMembersView'
import SubscriptionView from './organization-views/SubscriptionView'
import BrandingView from './organization-views/BrandingView'
import { getMyOrganization } from '../../lib/organizationApi'
import type { Organization } from '../../types/organization'
import { PORTAL_URLS } from '../../config/portalUrls'

import './OrganizationPage.css'

export default function OrganizationPage() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const tabParam = searchParams.get('tab')

  // Diangkat ke sini (bukan cuma di dalam OrganizationProfileView) krn tombol
  // header "Preview Public Profile"/"Edit Profile" butuh organization.id +
  // kontrol mode edit lintas dua komponen berbeda. BrandingView/TeamMembersView
  // tetap fetch data sendiri-sendiri (pola yang sudah ada sejak Phase 2),
  // sengaja tidak dipaksa refactor ikut prop ini.
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  useEffect(() => {
    getMyOrganization()
      .then(setOrganization)
      .catch((err) => window.alert(err instanceof Error ? err.message : 'Gagal memuat data organisasi.'))
  }, [])

  const handleProfileSaved = (updated: Organization) => {
    setOrganization(updated)
    setIsEditingProfile(false)
  }

  const renderView = () => {
    switch (tabParam) {
      case 'team':
        return <TeamMembersView />
      case 'subscription':
        return <SubscriptionView />
      case 'branding':
        return <BrandingView />
      case 'profile':
      default:
        return (
          <OrganizationProfileView
            organization={organization}
            isEditing={isEditingProfile}
            onSaved={handleProfileSaved}
          />
        )
    }
  }

  const getTitle = () => {
    switch (tabParam) {
      case 'team': return 'Team Members'
      case 'subscription': return 'Organization Subscription'
      case 'branding': return 'Brand & Identity'
      case 'profile': 
      default: return 'Organization Profile'
    }
  }

  const getSubtitle = () => {
    switch (tabParam) {
      case 'team': return 'Manage people who have access to the organization dashboard.'
      case 'subscription': return 'Manage your organization SaaS subscription and usage limits.'
      case 'branding': return 'Customize your organization\'s visual identity, certificates, and emails.'
      case 'profile': 
      default: return 'Manage your organization\'s public information and identity.'
    }
  }

  return (
    <div className="org-hub">
      {/* Universal Page Header */}
      <header className="org-header">
        <div className="org-header__title">
          <h1>{getTitle()}</h1>
          <p className="org-header__subtitle">{getSubtitle()}</p>
        </div>
        <div className="org-header__actions">
          {(tabParam === 'profile' || !tabParam) && (
            <>
              {organization && (
                <a
                  className="btn btn--outline btn--sm"
                  href={`${PORTAL_URLS.VOLUNTEER}/dashboard/organisasi?org=${organization.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FiExternalLink /> Preview Public Profile
                </a>
              )}
              <button
                type="button"
                className="btn btn--primary btn--sm"
                disabled={!organization}
                onClick={() => setIsEditingProfile((prev) => !prev)}
              >
                <FiEdit2 /> {isEditingProfile ? 'Batal Edit' : 'Edit Profile'}
              </button>
            </>
          )}
        </div>
      </header>

      {/* Render the contextual content area below the header */}
      {renderView()}
    </div>
  )
}
