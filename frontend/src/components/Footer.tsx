import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import newsletterBg from '../assets/svg/background-1.svg'
import {
  FaYoutube,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaPhoneAlt,
  FaEnvelope,
} from 'react-icons/fa'
import logo from '../assets/svg/logo.svg'
import './Footer.css'

const SOCIAL_LINKS = [
  { icon: FaYoutube, label: 'YouTube' },
  { icon: FaFacebookF, label: 'Facebook' },
  { icon: FaTwitter, label: 'Twitter' },
  { icon: FaInstagram, label: 'Instagram' },
  { icon: FaLinkedinIn, label: 'LinkedIn' },
]

const FOOTER_COLUMNS = [
  { title: 'Perusahaan', links: ['Tentang Kami', 'Karir', 'Komunitas', 'Testimoni'] },
  { title: 'Bantuan', links: ['Pusat Bantuan', 'Webinar', 'Kirim Masukan'] },
  { title: 'Tautan', links: ['Cara Kerja', 'Cari Aktivitas', 'Cari Organisasi'] },
]

const CONTACT_INFO = [
  { icon: FaPhoneAlt, label: '0813-8900-8988' },
  { icon: FaEnvelope, label: 'support@activibe.com' },
]

const LEGAL_LINKS = ['Kebijakan Privasi', 'Syarat Penggunaan', 'Legal']

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEmail('')
  }

  return (
    <footer className="site-footer">
      <div className="footer__newsletter">
        <img src={newsletterBg} alt="" className="footer__newsletter-bg" aria-hidden="true" />
        <div className="footer__newsletter-overlay" aria-hidden="true" />

        <div className="footer__newsletter-content">
          <h2 className="footer__newsletter-title">
            Subscribe to our newsletter to get updates to our latest activity
          </h2>
          <p className="footer__newsletter-desc">
            Enter your email here and get the most vibes activity ever!
          </p>

          <form className="footer__newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="footer__newsletter-input"
              aria-label="Email"
            />
            <button type="submit" className="footer__newsletter-submit">
              Subscribe
            </button>
          </form>

          <p className="footer__newsletter-hint">You'll able to unsubscribe at any time</p>
        </div>
      </div>

      <div className="footer__main">
        <div className="footer__brand">
          <img src={logo} alt="ActiVibe" className="footer__logo" />
          <p className="footer__tagline">Find Your Activity With Vibe</p>
          <p className="footer__desc">
            Lorem ipsum dolor sit amet consectetur. Quis diam sed scelerisque aliquam imperdiet egestas. Eros at sit enim.
          </p>
          <div className="footer__social">
            {SOCIAL_LINKS.map(({ icon: Icon, label }) => (
              <a key={label} href="#" className="footer__social-link" aria-label={label}>
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {FOOTER_COLUMNS.map(({ title, links }) => (
          <div key={title} className="footer__column">
            <h3 className="footer__column-title">{title}</h3>
            <ul className="footer__column-list">
              {links.map((link) => (
                <li key={link}>
                  {link === 'Cara Kerja' ? (
                    <Link to="/cara-kerja" className="footer__column-link">{link}</Link>
                  ) : (
                    <a href="#" className="footer__column-link">{link}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="footer__column">
          <h3 className="footer__column-title">Hubungi Kami</h3>
          <ul className="footer__column-list">
            {CONTACT_INFO.map(({ icon: Icon, label }) => (
              <li key={label} className="footer__contact-item">
                <Icon className="footer__contact-icon" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <p className="footer__copyright">
          © {new Date().getFullYear()} ActiVibe. Semua hak dilindungi.
        </p>
        <div className="footer__legal">
          {LEGAL_LINKS.map((label, i) => (
            <span key={label} className="footer__legal-item">
              <a href="#" className="footer__legal-link">{label}</a>
              {i < LEGAL_LINKS.length - 1 && (
                <span className="footer__legal-sep" aria-hidden="true">·</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}
