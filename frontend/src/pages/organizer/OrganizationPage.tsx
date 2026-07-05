import React from 'react'
import { useLocation } from 'react-router-dom'
import { FiEdit2, FiExternalLink } from 'react-icons/fi'

import OrganizationProfileView from './organization-views/OrganizationProfileView'
import TeamMembersView from './organization-views/TeamMembersView'
import SubscriptionView from './organization-views/SubscriptionView'
import BrandingView from './organization-views/BrandingView'

import './OrganizationPage.css'

export default function OrganizationPage() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const tabParam = searchParams.get('tab')

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
        return <OrganizationProfileView />
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
              <button type="button" className="btn btn--outline btn--sm"><FiExternalLink /> Preview Public Profile</button>
              <button type="button" className="btn btn--primary btn--sm"><FiEdit2 /> Edit Profile</button>
            </>
          )}
        </div>
      </header>

      {/* Render the contextual content area below the header */}
      {renderView()}
    </div>
  )
}
