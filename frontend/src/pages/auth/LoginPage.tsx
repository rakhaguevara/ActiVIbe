import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiChevronLeft } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { PORTAL_URLS } from '../../config/portalUrls'
import type { AuthUser } from '../../lib/api'
import logo from '../../assets/svg/logo.svg'
import { motion } from 'framer-motion'
import './AuthPage.css'

interface LoginPageProps {
  allowedRole: AuthUser['role']
  homeRoute: string
  title: string
  subtitle?: string
}

export default function LoginPage({ allowedRole, homeRoute, title, subtitle }: LoginPageProps) {
  const { login, verifyTwoFactorLogin, logout } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle')
  // 2FA (TOTP) — cuma bisa diaktifkan lewat Settings > Security di portal
  // Organizer, tapi gate loginnya generik per-akun (bisa kena Admin juga kalau
  // suatu saat akunnya diaktifkan 2FA) — makanya dicek di komponen bersama ini,
  // bukan cuma di portal organizer.
  const [pendingTwoFactorUserId, setPendingTwoFactorUserId] = useState<string | null>(null)
  const [twoFactorCode, setTwoFactorCode] = useState('')

  const afterLoginSuccess = async (user: AuthUser) => {
    if (user.role !== allowedRole) {
      await logout()
      setStatus('idle')
      setError(
        `Akun ini terdaftar sebagai ${user.role}. Silakan masuk lewat portal yang sesuai: ${PORTAL_URLS[user.role]}`,
      )
      return
    }
    navigate(homeRoute)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setStatus('submitting')

    const formData = new FormData(e.currentTarget)

    try {
      const result = await login({
        email: String(formData.get('email')),
        password: String(formData.get('password')),
      })

      if ('requiresTwoFactor' in result) {
        setStatus('idle')
        setPendingTwoFactorUserId(result.userId)
        return
      }

      await afterLoginSuccess(result.user)
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi.')
    }
  }

  const handleTwoFactorSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!pendingTwoFactorUserId) return
    setError(null)
    setStatus('submitting')

    try {
      const user = await verifyTwoFactorLogin(pendingTwoFactorUserId, twoFactorCode.trim())
      await afterLoginSuccess(user)
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error ? err.message : 'Kode verifikasi salah.')
    }
  }

  if (pendingTwoFactorUserId) {
    return (
      <main className="auth-page">
        <motion.div
          className="auth-page__panel"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <img src={logo} alt="ActiVibe" className="auth-page__logo" />
          <h1 className="auth-page__title">Verifikasi 2 Langkah</h1>
          <p className="auth-page__subtitle">Masukkan kode 6 digit dari aplikasi authenticator kamu.</p>

          <form className="auth-page__form" onSubmit={handleTwoFactorSubmit}>
            <div className="auth-page__field">
              <label htmlFor="twoFactorCode">Kode Verifikasi</label>
              <input
                id="twoFactorCode"
                name="twoFactorCode"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                required
                autoFocus
              />
            </div>

            {error && <p className="auth-page__error">{error}</p>}

            <button type="submit" className="auth-page__submit" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Memverifikasi...' : 'Verifikasi'}
            </button>
            <button
              type="button"
              className="auth-page__submit"
              style={{ background: 'transparent', color: 'var(--color-text-muted, #64748b)', marginTop: '8px' }}
              onClick={() => {
                setPendingTwoFactorUserId(null)
                setTwoFactorCode('')
                setError(null)
              }}
            >
              <FiChevronLeft /> Kembali
            </button>
          </form>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="auth-page">
      <motion.div
        className="auth-page__panel"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >

        <img src={logo} alt="ActiVibe" className="auth-page__logo" />

        <h1 className="auth-page__title">{title}</h1>
        {subtitle && <p className="auth-page__subtitle">{subtitle}</p>}

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
      </motion.div>
    </main>
  )
}
