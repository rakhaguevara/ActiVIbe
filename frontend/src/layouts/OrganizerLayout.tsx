import { useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FiGrid, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/svg/logo.svg'
import './OrganizerLayout.css'

export default function OrganizerLayout() {
  const { user, isLoading, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ORGANIZER')) {
      navigate('/', { replace: true })
    }
  }, [isLoading, user, navigate])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (isLoading || !user || user.role !== 'ORGANIZER') {
    return null
  }

  return (
    <div className="organizer-layout">
      <aside className="organizer-layout__sidebar">
        <div className="organizer-layout__brand">
          <img src={logo} alt="ActiVibe" height="28" />
          <span className="organizer-layout__brand-label">Organizer Panel</span>
        </div>

        <nav className="organizer-layout__nav">
          <NavLink to="/organizer" end className="organizer-layout__nav-link">
            <FiGrid className="organizer-layout__nav-icon" />
            Dashboard
          </NavLink>
        </nav>

        <div className="organizer-layout__footer">
          <p className="organizer-layout__user-name">{user.name}</p>
          <button type="button" className="organizer-layout__logout" onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      <main className="organizer-layout__content">
        <Outlet />
      </main>
    </div>
  )
}
