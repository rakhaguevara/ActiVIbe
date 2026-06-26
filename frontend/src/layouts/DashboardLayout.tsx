import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/svg/logo.svg'
import { FiChevronDown, FiLogOut, FiBell } from 'react-icons/fi'
import './DashboardLayout.css'

type OpenMenu = 'user' | 'notif' | null

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null)
  const topbarRef = useRef<HTMLElement>(null)

  const toggleMenu = (menu: OpenMenu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu))
  }

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (topbarRef.current && !topbarRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    setOpenMenu(null)
    navigate('/')
  }

  return (
    <div className="dashboard-layout">
      <header className="dashboard-layout__topbar" ref={topbarRef}>
        <Link to="/dashboard" className="dashboard-layout__logo">
          <img src={logo} alt="ActiVibe" height="36" />
        </Link>

        <nav className="dashboard-layout__nav">
          <Link to="/#cara-kerja" className="dashboard-layout__link">Cara Kerja</Link>
          <Link to="/tentang-kami" className="dashboard-layout__link">Tentang Kami</Link>
        </nav>

        {user && (
          <div className="dashboard-layout__actions">
            <div className="dashboard-layout__menu-wrap">
              <button
                type="button"
                className="dashboard-layout__icon-btn"
                aria-label="Notifikasi"
                onClick={() => toggleMenu('notif')}
              >
                <FiBell />
              </button>
              {openMenu === 'notif' && (
                <div className="dashboard-layout__dropdown dashboard-layout__dropdown--notif">
                  <p className="dashboard-layout__notif-empty">Belum ada notifikasi</p>
                </div>
              )}
            </div>

            <div className="dashboard-layout__menu-wrap">
              <button
                type="button"
                className="dashboard-layout__user-trigger"
                onClick={() => toggleMenu('user')}
              >
                <span className="dashboard-layout__user-name">Hi, {user.name.split(' ')[0]}!</span>
                <FiChevronDown />
              </button>
              {openMenu === 'user' && (
                <div className="dashboard-layout__dropdown dashboard-layout__dropdown--user">
                  <button type="button" className="dashboard-layout__dropdown-item" onClick={handleLogout}>
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <Outlet />
    </div>
  )
}
