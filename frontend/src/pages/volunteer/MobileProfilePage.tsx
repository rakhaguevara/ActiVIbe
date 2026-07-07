import { Link } from 'react-router-dom'
import { FiBell, FiSettings, FiUser, FiShield, FiHelpCircle, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import './MobileProfilePage.css'

export default function MobileProfilePage() {
  const { user, logout } = useAuth()

  if (!user) return null

  // Fallback initial
  const initial = user.firstName ? user.firstName[0].toUpperCase() : 'U'
  const displayName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Guest'

  return (
    <main className="mobile-profile-page">
      <header className="mobile-profile-page__header">
        <h1>Profile</h1>
        <button type="button" className="mobile-profile-page__bell" aria-label="Notifications">
          <FiBell />
        </button>
      </header>

      <div className="mobile-profile-page__card">
        <div className="mobile-profile-page__avatar">
          {initial}
        </div>
        <div className="mobile-profile-page__name">{displayName}</div>
        <div className="mobile-profile-page__role">Guest</div>
      </div>

      <div className="mobile-profile-page__links">
        <Link to="/dashboard/settings" className="mobile-profile-page__link-item">
          <FiSettings className="mobile-profile-page__link-icon" />
          <span>Account settings</span>
          <span className="mobile-profile-page__chevron">›</span>
        </Link>
        <Link to="/dashboard" className="mobile-profile-page__link-item">
          <FiUser className="mobile-profile-page__link-icon" />
          <span>View profile</span>
          <span className="mobile-profile-page__chevron">›</span>
        </Link>
        <button type="button" className="mobile-profile-page__link-item">
          <FiShield className="mobile-profile-page__link-icon" />
          <span>Privacy</span>
          <span className="mobile-profile-page__chevron">›</span>
        </button>
        <button type="button" className="mobile-profile-page__link-item">
          <FiHelpCircle className="mobile-profile-page__link-icon" />
          <span>Get help</span>
          <span className="mobile-profile-page__chevron">›</span>
        </button>
      </div>

      <div className="mobile-profile-page__logout-wrap">
        <button type="button" onClick={logout} className="mobile-profile-page__logout">
          Log out
        </button>
      </div>
    </main>
  )
}
