import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/svg/logo.svg'
import { FiChevronDown, FiLogOut, FiBell, FiBookOpen, FiHeart, FiClipboard } from 'react-icons/fi'
import './DashboardLayout.css'

type OpenMenu = 'cari-aktivitas' | 'cari-organisasi' | 'user' | 'notif' | null

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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
          <div className="dashboard-layout__menu-wrap">
            <button
              type="button"
              className="dashboard-layout__link"
              onClick={() => toggleMenu('cari-aktivitas')}
            >
              Cari Aktivitas <FiChevronDown className="dashboard-layout__link-chevron" />
            </button>
            {openMenu === 'cari-aktivitas' && (
              <div className="dashboard-layout__mega">
                <div className="dashboard-layout__mega-col">
                  <p className="dashboard-layout__mega-eyebrow">AKTIVITAS</p>
                  <Link
                    to="/dashboard"
                    className="dashboard-layout__mega-item"
                    onClick={() => setOpenMenu(null)}
                  >
                    Semua Kegiatan Volunteer
                  </Link>
                  <div className="dashboard-layout__mega-item dashboard-layout__mega-item--disabled">
                    Kegiatan Match Tertinggi
                    <span className="dashboard-layout__mega-badge">Segera Hadir</span>
                  </div>
                </div>
                <div className="dashboard-layout__mega-col">
                  <p className="dashboard-layout__mega-eyebrow">RESOURCES</p>
                  <div className="dashboard-layout__mega-card dashboard-layout__mega-card--disabled">
                    <FiBookOpen className="dashboard-layout__mega-card-icon" />
                    <div className="dashboard-layout__mega-card-text">
                      <p className="dashboard-layout__mega-card-title">
                        Tips Jadi Volunteer
                        <span className="dashboard-layout__mega-badge">Segera Hadir</span>
                      </p>
                      <p className="dashboard-layout__mega-card-desc">
                        Tips dan inspirasi menemukan kegiatan volunteer yang cocok.
                      </p>
                    </div>
                  </div>
                  <div className="dashboard-layout__mega-card dashboard-layout__mega-card--disabled">
                    <FiHeart className="dashboard-layout__mega-card-icon" />
                    <div className="dashboard-layout__mega-card-text">
                      <p className="dashboard-layout__mega-card-title">
                        Cerita Dampak Komunitas
                        <span className="dashboard-layout__mega-badge">Segera Hadir</span>
                      </p>
                      <p className="dashboard-layout__mega-card-desc">
                        Kumpulan cerita dampak nyata dari komunitas volunteer ActiVibe.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="dashboard-layout__menu-wrap">
            <button
              type="button"
              className="dashboard-layout__link"
              onClick={() => toggleMenu('cari-organisasi')}
            >
              Cari Organisasi <FiChevronDown className="dashboard-layout__link-chevron" />
            </button>
            {openMenu === 'cari-organisasi' && (
              <div className="dashboard-layout__mega">
                <div className="dashboard-layout__mega-col">
                  <p className="dashboard-layout__mega-eyebrow">ORGANISASI</p>
                  <div className="dashboard-layout__mega-item dashboard-layout__mega-item--disabled">
                    Semua Organisasi
                    <span className="dashboard-layout__mega-badge">Segera Hadir</span>
                  </div>
                  <div className="dashboard-layout__mega-item dashboard-layout__mega-item--disabled">
                    Organisasi Terverifikasi
                    <span className="dashboard-layout__mega-badge">Segera Hadir</span>
                  </div>
                </div>
                <div className="dashboard-layout__mega-col">
                  <p className="dashboard-layout__mega-eyebrow">RESOURCES</p>
                  <div className="dashboard-layout__mega-card dashboard-layout__mega-card--disabled">
                    <FiClipboard className="dashboard-layout__mega-card-icon" />
                    <div className="dashboard-layout__mega-card-text">
                      <p className="dashboard-layout__mega-card-title">
                        Panduan untuk Organisasi
                        <span className="dashboard-layout__mega-badge">Segera Hadir</span>
                      </p>
                      <p className="dashboard-layout__mega-card-desc">
                        Panduan lengkap mendaftarkan organisasimu di ActiVibe.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link to="/cara-kerja" className="dashboard-layout__link">Cara Kerja</Link>
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

        <button
          type="button"
          className={`dashboard-layout__hamburger${isMobileMenuOpen ? ' is-open' : ''}`}
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={isMobileMenuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        {isMobileMenuOpen && (
          <div className="dashboard-layout__mobile-menu">
            <Link
              to="/dashboard"
              className="dashboard-layout__mobile-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Semua Kegiatan Volunteer
            </Link>
            <div className="dashboard-layout__mobile-link dashboard-layout__mobile-link--disabled">
              Kegiatan Match Tertinggi
              <span className="dashboard-layout__mega-badge">Segera Hadir</span>
            </div>
            <div className="dashboard-layout__mobile-link dashboard-layout__mobile-link--disabled">
              Semua Organisasi
              <span className="dashboard-layout__mega-badge">Segera Hadir</span>
            </div>
            <div className="dashboard-layout__mobile-link dashboard-layout__mobile-link--disabled">
              Organisasi Terverifikasi
              <span className="dashboard-layout__mega-badge">Segera Hadir</span>
            </div>
            <Link
              to="/cara-kerja"
              className="dashboard-layout__mobile-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Cara Kerja
            </Link>
            <Link
              to="/tentang-kami"
              className="dashboard-layout__mobile-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Tentang Kami
            </Link>
          </div>
        )}
      </header>

      {isMobileMenuOpen && (
        <div className="dashboard-layout__backdrop" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <Outlet />
    </div>
  )
}
