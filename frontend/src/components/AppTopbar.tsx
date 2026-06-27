import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/svg/logo.svg'
import { FiChevronDown, FiLogOut, FiBell, FiBookOpen, FiHeart, FiClipboard } from 'react-icons/fi'
import './AppTopbar.css'

type OpenMenu = 'cari-aktivitas' | 'cari-organisasi' | 'user' | 'notif' | null

interface AppTopbarProps {
  logoTo: string
}

export default function AppTopbar({ logoTo }: AppTopbarProps) {
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
    <>
      <header className="app-topbar" ref={topbarRef}>
        <Link to={logoTo} className="app-topbar__logo">
          <img src={logo} alt="ActiVibe" height="36" />
        </Link>

        <nav className="app-topbar__nav">
          <div className="app-topbar__menu-wrap">
            <button
              type="button"
              className="app-topbar__link"
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
              className="app-topbar__link"
              onClick={() => toggleMenu('cari-organisasi')}
            >
              Cari Organisasi <FiChevronDown className="app-topbar__link-chevron" />
            </button>
            {openMenu === 'cari-organisasi' && (
              <div className="app-topbar__mega">
                <div className="app-topbar__mega-col">
                  <p className="app-topbar__mega-eyebrow">ORGANISASI</p>
                  <div className="app-topbar__mega-item app-topbar__mega-item--disabled">
                    Semua Organisasi
                    <span className="app-topbar__mega-badge">Segera Hadir</span>
                  </div>
                  <div className="app-topbar__mega-item app-topbar__mega-item--disabled">
                    Organisasi Terverifikasi
                    <span className="app-topbar__mega-badge">Segera Hadir</span>
                  </div>
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

          <Link to="/cara-kerja" className="app-topbar__link">Cara Kerja</Link>
          <Link to="/tentang-kami" className="app-topbar__link">Tentang Kami</Link>
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
            <Link
              to="/dashboard"
              className="app-topbar__mobile-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Semua Kegiatan Volunteer
            </Link>
            <div className="app-topbar__mobile-link app-topbar__mobile-link--disabled">
              Kegiatan Match Tertinggi
              <span className="app-topbar__mega-badge">Segera Hadir</span>
            </div>
            <div className="app-topbar__mobile-link app-topbar__mobile-link--disabled">
              Semua Organisasi
              <span className="app-topbar__mega-badge">Segera Hadir</span>
            </div>
            <div className="app-topbar__mobile-link app-topbar__mobile-link--disabled">
              Organisasi Terverifikasi
              <span className="app-topbar__mega-badge">Segera Hadir</span>
            </div>
            <Link
              to="/cara-kerja"
              className="app-topbar__mobile-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Cara Kerja
            </Link>
            <Link
              to="/tentang-kami"
              className="app-topbar__mobile-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Tentang Kami
            </Link>
          </div>
        )}
      </header>

      {isMobileMenuOpen && (
        <div className="app-topbar__backdrop" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </>
  )
}
