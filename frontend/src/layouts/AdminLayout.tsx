import { useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FiGrid, FiUsers, FiCalendar, FiDownload, FiClipboard, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/svg/logo.svg'
import './AdminLayout.css'

const NAV_ITEMS = [
  { to: '/admin', label: 'Overview', icon: FiGrid, end: true },
  { to: '/admin/users', label: 'Pengguna', icon: FiUsers, end: false },
  { to: '/admin/events', label: 'Kegiatan', icon: FiCalendar, end: false },
  { to: '/admin/participation', label: 'Ekspor Partisipasi', icon: FiDownload, end: false },
  { to: '/admin/activity-log', label: 'Log Aktivitas', icon: FiClipboard, end: false },
]

export default function AdminLayout() {
  const { user, isLoading, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      navigate('/', { replace: true })
    }
  }, [isLoading, user, navigate])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (isLoading || !user || user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar">
        <div className="admin-layout__brand">
          <img src={logo} alt="ActiVibe" height="28" />
          <span className="admin-layout__brand-label">Admin Panel</span>
        </div>

        <nav className="admin-layout__nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                ['admin-layout__nav-link', isActive ? 'is-active' : ''].filter(Boolean).join(' ')
              }
            >
              <Icon className="admin-layout__nav-icon" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-layout__footer">
          <p className="admin-layout__user-name">{user.name}</p>
          <button type="button" className="admin-layout__logout" onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      <main className="admin-layout__content">
        <Outlet />
      </main>
    </div>
  )
}
