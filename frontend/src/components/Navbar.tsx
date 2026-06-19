import { useState, useEffect } from 'react'
import logo from '../assets/svg/logo.svg'
import './Navbar.css'

const NAV_LINKS = [
  { label: 'Cari Aktivitas', href: '#' },
  { label: 'Cari Organisasi', href: '#' },
  { label: 'Cara Kerja', href: '#' },
  { label: 'Tentang Kami', href: '#' },
]

export default function Navbar() {
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
        <a href="/" className="navbar__logo">
          <img src={logo} alt="ActiVibe" height="44" />
        </a>

        <nav className="navbar__links">
          {NAV_LINKS.map(({ label, href }) => (
            <a key={label} href={href} className="navbar__link">
              {label}
            </a>
          ))}
        </nav>

        <a href="/auth" className="navbar__cta">
          Login/Daftar
        </a>

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
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="navbar__mobile-link"
                onClick={closeMenu}
              >
                {label}
              </a>
            ))}
            <a href="/auth" className="navbar__mobile-cta" onClick={closeMenu}>
              Login/Daftar
            </a>
          </div>
        )}
      </header>

      {isMenuOpen && (
        <div className="navbar__backdrop" onClick={closeMenu} />
      )}
    </>
  )
}
