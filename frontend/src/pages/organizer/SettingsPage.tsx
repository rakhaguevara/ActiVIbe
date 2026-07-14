import React from 'react'
import { useLocation } from 'react-router-dom'

import GeneralSettingsView from './settings-views/GeneralSettingsView'
import NotificationSettingsView from './settings-views/NotificationSettingsView'
import SecuritySettingsView from './settings-views/SecuritySettingsView'
import ApiSettingsView from './settings-views/ApiSettingsView'

import './SettingsPage.css'

export default function SettingsPage() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const tabParam = searchParams.get('tab')

  const renderView = () => {
    switch (tabParam) {
      case 'notifications':
        return <NotificationSettingsView />
      case 'security':
        return <SecuritySettingsView />
      case 'api':
        return <ApiSettingsView />
      case 'general':
      default:
        return <GeneralSettingsView />
    }
  }

  const getTitle = () => {
    switch (tabParam) {
      case 'notifications': return 'Notification Settings'
      case 'security': return 'Account Security'
      case 'api': return 'API & Integrations'
      case 'general': 
      default: return 'General Settings'
    }
  }

  const getSubtitle = () => {
    switch (tabParam) {
      case 'notifications': return 'Manage your alerts and notification preferences.'
      case 'security': return 'Protect your organization data and manage sessions.'
      case 'api': return 'Connect ActiVibe to your existing tools.'
      case 'general': 
      default: return 'Configure global organization preferences.'
    }
  }

  return (
    <div className="settings-hub">
      {/* Universal Page Header */}
      <header className="settings-header">
        <div className="settings-header__title">
          <h1>{getTitle()}</h1>
          <p className="settings-header__subtitle">{getSubtitle()}</p>
        </div>
      </header>

      {/* Render the contextual content area below the header */}
      {renderView()}
    </div>
  )
}
