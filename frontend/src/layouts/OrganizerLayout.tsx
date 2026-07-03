import { useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  FiGrid,
  FiCalendar,
  FiUsers,
  FiUserCheck,
  FiCheckSquare,
  FiMessageSquare,
  FiBarChart2,
  FiSettings,
  FiLogOut,
} from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { OrganizerDataProvider } from '../contexts/OrganizerDataContext'
import logo from '../assets/svg/logo.svg'
import './OrganizerLayout.css'

const NAV_ITEMS = [
  { to: '/organizer', label: 'Overview', icon: FiGrid, end: true },
  { to: '/organizer/events', label: 'Events', icon: FiCalendar, end: false },
  { to: '/organizer/applicants', label: 'Applicants', icon: FiUsers, end: false },
  { to: '/organizer/assignments', label: 'Assignments', icon: FiUserCheck, end: false },
  { to: '/organizer/attendance', label: 'Attendance', icon: FiCheckSquare, end: false },
  { to: '/organizer/communication', label: 'Communication', icon: FiMessageSquare, end: false },
  { to: '/organizer/reports', label: 'Reports & Impact', icon: FiBarChart2, end: false },
  { to: '/organizer/settings', label: 'Organization Settings', icon: FiSettings, end: false },
]

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
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                ['organizer-layout__nav-link', isActive ? 'is-active' : ''].filter(Boolean).join(' ')
              }
            >
              <Icon className="organizer-layout__nav-icon" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="organizer-layout__footer">
          <p className="organizer-layout__user-name">{user.name}</p>
          <button type="button" className="organizer-layout__logout" onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      <main className="organizer-layout__content">
        <OrganizerDataProvider>
          <Outlet />
        </OrganizerDataProvider>
      </main>
    </div>
  )
}
