import { useState, type FormEvent } from 'react'
import newsletterBg from '../assets/svg/background-1.svg'
import './Footer.css'

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
    </footer>
  )
}
