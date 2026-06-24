import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/svg/logo.svg'
import './DashboardLayout.css'

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="dashboard-layout">
      <header className="dashboard-layout__topbar">
        <Link to="/dashboard" className="dashboard-layout__logo">
          <img src={logo} alt="ActiVibe" height="36" />
        </Link>

        {user && (
          <div className="dashboard-layout__user">
            <span className="dashboard-layout__user-name">{user.name.split(' ')[0]}</span>
            <button type="button" className="dashboard-layout__logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </header>

      <Outlet />
    </div>
  )
}
