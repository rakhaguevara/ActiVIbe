import { NavLink } from 'react-router-dom'
import { FiSearch, FiHeart, FiAward, FiMessageSquare, FiUser } from 'react-icons/fi'
import './MobileBottomNav.css'

export default function MobileBottomNav() {
  return (
    <nav className="mobile-bottom-nav">
      <NavLink
        to="/dashboard"
        end
        className={({ isActive }) =>
          ['mobile-bottom-nav__item', isActive ? 'is-active' : ''].filter(Boolean).join(' ')
        }
      >
        <FiSearch className="mobile-bottom-nav__icon" />
        <span className="mobile-bottom-nav__label">Explore</span>
      </NavLink>

      <NavLink
        to="/dashboard/saved"
        className={({ isActive }) =>
          ['mobile-bottom-nav__item', isActive ? 'is-active' : ''].filter(Boolean).join(' ')
        }
      >
        <FiHeart className="mobile-bottom-nav__icon" />
        <span className="mobile-bottom-nav__label">Wishlists</span>
      </NavLink>

      <NavLink
        to="/dashboard/passport"
        className={({ isActive }) =>
          ['mobile-bottom-nav__item', isActive ? 'is-active' : ''].filter(Boolean).join(' ')
        }
      >
        <FiAward className="mobile-bottom-nav__icon" />
        <span className="mobile-bottom-nav__label">Passport</span>
      </NavLink>

      <NavLink
        to="/dashboard/history"
        className={({ isActive }) =>
          ['mobile-bottom-nav__item', isActive ? 'is-active' : ''].filter(Boolean).join(' ')
        }
      >
        <FiMessageSquare className="mobile-bottom-nav__icon" />
        <span className="mobile-bottom-nav__label">History</span>
      </NavLink>

      <NavLink
        to="/dashboard/profile"
        className={({ isActive }) =>
          ['mobile-bottom-nav__item', isActive ? 'is-active' : ''].filter(Boolean).join(' ')
        }
      >
        <FiUser className="mobile-bottom-nav__icon" />
        <span className="mobile-bottom-nav__label">Profile</span>
      </NavLink>
    </nav>
  )
}
