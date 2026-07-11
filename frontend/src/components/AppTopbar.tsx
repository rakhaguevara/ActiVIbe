import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/svg/logo.svg'
import {
  FiChevronDown,
  FiLogOut,
  FiBell,
  FiBookOpen,
  FiHeart,
  FiClipboard,
  FiAward,
  FiSettings,
  FiBookmark,
} from 'react-icons/fi'
import './AppTopbar.css'

type OpenMenu = 'cari-aktivitas' | 'cari-organisasi' | 'user' | 'notif' | null

const ORGANISASI_ROUTES: string[] = ['/dashboard/organisasi']

interface AppTopbarProps {
  logoTo: string
}

export default function AppTopbar({ logoTo }: AppTopbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isOrganisasiActive = ORGANISASI_ROUTES.some((route) => location.pathname.startsWith(route))
  const isAktivitasActive = location.pathname.startsWith('/dashboard') && !isOrganisasiActive
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
    <>
      <header className="app-topbar" ref={topbarRef}>
        <Link to={logoTo} className="app-topbar__logo">
          <img src={logo} alt="ActiVibe" height="36" />
        </Link>

        <nav className="app-topbar__nav">
          <div className="app-topbar__menu-wrap">
            <button
              type="button"
              className={['app-topbar__link', 'app-topbar__link--primary', isAktivitasActive ? 'is-active' : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => toggleMenu('cari-aktivitas')}
            >
              Cari Aktivitas <FiChevronDown className="app-topbar__link-chevron" />
            </button>
            {openMenu === 'cari-aktivitas' && (
              <div className="app-topbar__mega">
                <div className="app-topbar__mega-col">
                  <p className="app-topbar__mega-eyebrow">AKTIVITAS</p>
                  <Link
                    to="/dashboard"
                    className="app-topbar__mega-item"
                    onClick={() => setOpenMenu(null)}
                  >
                    Semua Kegiatan Volunteer
                  </Link>
                  <div className="app-topbar__mega-item app-topbar__mega-item--disabled">
                    Kegiatan Match Tertinggi
                    <span className="app-topbar__mega-badge">Segera Hadir</span>
                  </div>
                </div>
                <div className="app-topbar__mega-col">
                  <p className="app-topbar__mega-eyebrow">RESOURCES</p>
                  <div className="app-topbar__mega-card app-topbar__mega-card--disabled">
                    <FiBookOpen className="app-topbar__mega-card-icon" />
                    <div className="app-topbar__mega-card-text">
                      <p className="app-topbar__mega-card-title">
                        Tips Jadi Volunteer
                        <span className="app-topbar__mega-badge">Segera Hadir</span>
                      </p>
                      <p className="app-topbar__mega-card-desc">
                        Tips dan inspirasi menemukan kegiatan volunteer yang cocok.
                      </p>
                    </div>
                  </div>
                  <div className="app-topbar__mega-card app-topbar__mega-card--disabled">
                    <FiHeart className="app-topbar__mega-card-icon" />
                    <div className="app-topbar__mega-card-text">
                      <p className="app-topbar__mega-card-title">
                        Cerita Dampak Komunitas
                        <span className="app-topbar__mega-badge">Segera Hadir</span>
                      </p>
                      <p className="app-topbar__mega-card-desc">
                        Kumpulan cerita dampak nyata dari komunitas volunteer ActiVibe.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="app-topbar__menu-wrap">
            <button
              type="button"
              className={['app-topbar__link', 'app-topbar__link--secondary', isOrganisasiActive ? 'is-active' : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => toggleMenu('cari-organisasi')}
            >
              Cari Organisasi <FiChevronDown className="app-topbar__link-chevron" />
            </button>
            {openMenu === 'cari-organisasi' && (
              <div className="app-topbar__mega">
                <div className="app-topbar__mega-col">
                  <p className="app-topbar__mega-eyebrow">ORGANISASI</p>
                  <Link
                    to="/dashboard/organisasi"
                    className="app-topbar__mega-item"
                    onClick={() => setOpenMenu(null)}
                  >
                    Semua Organisasi
                  </Link>
                  <Link
                    to="/dashboard/organisasi/daftar"
                    className="app-topbar__mega-item"
                    onClick={() => setOpenMenu(null)}
                  >
                    Daftarkan Organisasimu
                  </Link>
                </div>
                <div className="app-topbar__mega-col">
                  <p className="app-topbar__mega-eyebrow">RESOURCES</p>
                  <div className="app-topbar__mega-card app-topbar__mega-card--disabled">
                    <FiClipboard className="app-topbar__mega-card-icon" />
                    <div className="app-topbar__mega-card-text">
                      <p className="app-topbar__mega-card-title">
                        Panduan untuk Organisasi
                        <span className="app-topbar__mega-badge">Segera Hadir</span>
                      </p>
                      <p className="app-topbar__mega-card-desc">
                        Panduan lengkap mendaftarkan organisasimu di ActiVibe.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <NavLink
            to="/donasi"
            className={({ isActive }) =>
              ['app-topbar__link', 'app-topbar__link--orange', isActive ? 'is-active' : '']
                .filter(Boolean)
                .join(' ')
            }
          >
            Donasi
          </NavLink>

          <NavLink
            to="/activibe-plus"
            className={({ isActive }) =>
              ['app-topbar__link', 'app-topbar__link--yellow', isActive ? 'is-active' : '']
                .filter(Boolean)
                .join(' ')
            }
          >
            ActiVibe Plus
          </NavLink>
        </nav>

        {user && (
          <div className="app-topbar__actions">
            <div className="app-topbar__menu-wrap">
              <button
                type="button"
                className="app-topbar__icon-btn"
                aria-label="Notifikasi"
                onClick={() => toggleMenu('notif')}
              >
                <FiBell />
              </button>
              {openMenu === 'notif' && (
                <div className="app-topbar__dropdown app-topbar__dropdown--notif">
                  <p className="app-topbar__notif-empty">Belum ada notifikasi</p>
                </div>
              )}
            </div>

            <div className="app-topbar__menu-wrap">
              <button
                type="button"
                className="app-topbar__user-trigger"
                onClick={() => toggleMenu('user')}
              >
                <span className="app-topbar__user-name">Hi, {user.name.split(' ')[0]}!</span>
                <FiChevronDown />
              </button>
              {openMenu === 'user' && (
                <div className="app-topbar__dropdown app-topbar__dropdown--user">
                  <Link
                    to="/dashboard/saved"
                    className="app-topbar__dropdown-item"
                    onClick={() => setOpenMenu(null)}
                  >
                    <FiBookmark /> My Saved Items
                  </Link>
                  <Link
                    to="/dashboard/passport"
                    className="app-topbar__dropdown-item"
                    onClick={() => setOpenMenu(null)}
                  >
                    <FiAward /> Impact Passport
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    className="app-topbar__dropdown-item"
                    onClick={() => setOpenMenu(null)}
                  >
                    <FiSettings /> Pengaturan
                  </Link>
                  <Link
                    to="/dashboard/history"
                    className="app-topbar__dropdown-item"
                    onClick={() => setOpenMenu(null)}
                  >
                    <FiClipboard /> Application History
                  </Link>
                  <div className="app-topbar__dropdown-divider" />
                  <button type="button" className="app-topbar__dropdown-item" onClick={handleLogout}>
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          className={`app-topbar__hamburger${isMobileMenuOpen ? ' is-open' : ''}`}
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={isMobileMenuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        {isMobileMenuOpen && (
          <div className="app-topbar__mobile-menu">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                ['app-topbar__mobile-link', 'app-topbar__mobile-link--primary', isActive ? 'is-active' : '']
                  .filter(Boolean)
                  .join(' ')
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Semua Kegiatan Volunteer
            </NavLink>
            <div className="app-topbar__mobile-link app-topbar__mobile-link--disabled">
              Kegiatan Match Tertinggi
              <span className="app-topbar__mega-badge">Segera Hadir</span>
            </div>
            <NavLink
              to="/dashboard/organisasi"
              className={({ isActive }) =>
                ['app-topbar__mobile-link', 'app-topbar__mobile-link--secondary', isActive ? 'is-active' : '']
                  .filter(Boolean)
                  .join(' ')
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Semua Organisasi
            </NavLink>
            <NavLink
              to="/dashboard/organisasi/daftar"
              className={({ isActive }) =>
                ['app-topbar__mobile-link', 'app-topbar__mobile-link--secondary', isActive ? 'is-active' : '']
                  .filter(Boolean)
                  .join(' ')
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Daftarkan Organisasimu
            </NavLink>
            <NavLink
              to="/donasi"
              className={({ isActive }) =>
                ['app-topbar__mobile-link', 'app-topbar__mobile-link--orange', isActive ? 'is-active' : '']
                  .filter(Boolean)
                  .join(' ')
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Donasi
            </NavLink>
            <NavLink
              to="/activibe-plus"
              className={({ isActive }) =>
                ['app-topbar__mobile-link', 'app-topbar__mobile-link--yellow', isActive ? 'is-active' : '']
                  .filter(Boolean)
                  .join(' ')
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ActiVibe Plus
            </NavLink>
          </div>
        )}
      </header>

      {isMobileMenuOpen && (
        <div className="app-topbar__backdrop" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </>
  )
}
