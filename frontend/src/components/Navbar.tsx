import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/svg/logo.svg'
import './Navbar.css'

const NAV_LINKS = [
  { label: 'Cari Aktivitas', href: '#' },
  { label: 'Cari Organisasi', href: '#' },
  { label: 'Cara Kerja', href: '#', to: '/cara-kerja' },
  { label: 'Tentang Kami', href: '#', to: '/tentang-kami' },
]

interface NavbarProps {
  onLoginClick: () => void
  onSignupClick: () => void
}

export default function Navbar({ onLoginClick, onSignupClick }: NavbarProps) {
  const [isSticky, setIsSticky] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setIsSticky(window.scrollY > 64)
      if (window.scrollY > 64) setIsMenuOpen(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) setIsMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const closeMenu = () => setIsMenuOpen(false)

  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    closeMenu()
    navigate('/')
  }

  return (
    <>
      <header
        className={[
          'navbar',
          isSticky ? 'navbar--sticky' : '',
          isMenuOpen ? 'navbar--open' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Link to="/" className="navbar__logo">
          <img src={logo} alt="ActiVibe" height="44" />
        </Link>

        <nav className="navbar__links">
          {NAV_LINKS.map(({ label, href, to }) => (
            to ? (
              <Link key={label} to={to} className="navbar__link">
                {label}
              </Link>
            ) : (
              <a key={label} href={href} className="navbar__link">
                {label}
              </a>
            )
          ))}
        </nav>

        <div className="navbar__auth">
          {user ? (
            <>
              <span className="navbar__user-name">{user.name.split(' ')[0]}</span>
              <button type="button" className="navbar__login" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button type="button" className="navbar__login" onClick={onLoginClick}>
                Masuk
              </button>
              <button type="button" className="navbar__signup" onClick={onSignupClick}>
                Daftar
              </button>
            </>
          )}
        </div>

        <button
          className={`navbar__hamburger${isMenuOpen ? ' is-open' : ''}`}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label={isMenuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={isMenuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        {isMenuOpen && (
          <div className="navbar__mobile-menu">
            {NAV_LINKS.map(({ label, href, to }) => (
              to ? (
                <Link
                  key={label}
                  to={to}
                  className="navbar__mobile-link"
                  onClick={closeMenu}
                >
                  {label}
                </Link>
              ) : (
                <a
                  key={label}
                  href={href}
                  className="navbar__mobile-link"
                  onClick={closeMenu}
                >
                  {label}
                </a>
              )
            ))}
            {user ? (
              <button
                type="button"
                className="navbar__mobile-login"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="navbar__mobile-login"
                  onClick={() => { closeMenu(); onLoginClick() }}
                >
                  Masuk
                </button>
                <button
                  type="button"
                  className="navbar__mobile-cta"
                  onClick={() => { closeMenu(); onSignupClick() }}
                >
                  Daftar
                </button>
              </>
            )}
          </div>
        )}
      </header>

      {isMenuOpen && (
        <div className="navbar__backdrop" onClick={closeMenu} />
      )}
    </>
  )
}
