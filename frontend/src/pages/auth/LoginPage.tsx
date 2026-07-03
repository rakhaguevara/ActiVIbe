import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiChevronLeft } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { PORTAL_URLS } from '../../config/portalUrls'
import type { AuthUser } from '../../lib/api'
import logo from '../../assets/svg/logo.svg'
import './AuthPage.css'

interface LoginPageProps {
  allowedRole: AuthUser['role']
  homeRoute: string
  title: string
  subtitle?: string
  showSignupLink?: boolean
}

export default function LoginPage({ allowedRole, homeRoute, title, subtitle, showSignupLink }: LoginPageProps) {
  const { login, logout } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setStatus('submitting')

    const formData = new FormData(e.currentTarget)

    try {
      const user = await login({
        email: String(formData.get('email')),
        password: String(formData.get('password')),
      })

      if (user.role !== allowedRole) {
        await logout()
        setStatus('idle')
        setError(
          `Akun ini terdaftar sebagai ${user.role}. Silakan masuk lewat portal yang sesuai: ${PORTAL_URLS[user.role]}`,
        )
        return
      }

      navigate(homeRoute)
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi.')
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-page__panel">
        <Link to="/" className="auth-page__back">
          <FiChevronLeft /> Kembali
        </Link>

        <img src={logo} alt="ActiVibe" className="auth-page__logo" />

        <h1 className="auth-page__title">{title}</h1>
        {subtitle && <p className="auth-page__subtitle">{subtitle}</p>}

        {showSignupLink && (
          <p className="auth-page__subtitle">
            Belum punya akun?{' '}
            <Link to="/daftar" className="auth-page__switch">
              Daftar
            </Link>
          </p>
        )}

        <form className="auth-page__form" onSubmit={handleSubmit}>
          <div className="auth-page__field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="nama@email.com" required />
          </div>

          <div className="auth-page__field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="••••••••" required />
          </div>

          {error && <p className="auth-page__error">{error}</p>}

          <button type="submit" className="auth-page__submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </main>
  )
}
