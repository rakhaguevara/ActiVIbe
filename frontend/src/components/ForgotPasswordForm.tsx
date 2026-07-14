import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import type { AuthUser } from '../lib/api'
import './ForgotPasswordForm.css'

const RESEND_COOLDOWN_SECONDS = 60

interface ForgotPasswordFormProps {
  onDone: (user: AuthUser) => void
  onBackToLogin: () => void
}

type Step = 'email' | 'reset'

// Dipicu dari link "Lupa password?" di AuthModal (login mode). 2 langkah:
// (1) minta kode OTP via email — auth.service.js requestPasswordResetOtp()
// sengaja tidak mengungkap apakah email terdaftar, jadi UI di sini selalu
// lanjut ke langkah 2 apa pun hasilnya; (2) masukkan kode + password baru —
// begitu cocok, password diganti & sesi baru langsung terbit (auto-login,
// lihat resetPasswordWithOtp), sama pola dgn OtpVerifyForm pasca-registrasi.
export default function ForgotPasswordForm({ onDone, onBackToLogin }: ForgotPasswordFormProps) {
  const { requestPasswordReset, resetPassword } = useAuth()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle')
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleRequestOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setStatus('submitting')
    try {
      await requestPasswordReset(email)
      setStep('reset')
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi.')
    } finally {
      setStatus('idle')
    }
  }

  const handleResend = async () => {
    setError(null)
    setInfo(null)
    try {
      await requestPasswordReset(email)
      setInfo('Kalau email itu terdaftar, kode baru sudah dikirim.')
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi.')
    }
  }

  const handleReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok')
      return
    }
    setStatus('submitting')
    try {
      const user = await resetPassword(email, code, newPassword)
      onDone(user)
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi.')
    }
  }

  if (step === 'email') {
    return (
      <form className="forgot-password-form" onSubmit={handleRequestOtp}>
        <p className="forgot-password-form__heading">Lupa Password?</p>
        <p className="forgot-password-form__subtitle">
          Masukkan email akunmu. Kalau terdaftar, kami kirim kode verifikasi untuk atur ulang password.
        </p>

        <div className="forgot-password-form__field">
          <label htmlFor="forgot-email">Email</label>
          <input
            id="forgot-email"
            type="email"
            placeholder="casey.smith@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {error && <p className="forgot-password-form__error">{error}</p>}

        <button type="submit" className="forgot-password-form__submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Mengirim...' : 'Kirim Kode'}
        </button>

        <button type="button" className="forgot-password-form__back" onClick={onBackToLogin}>
          Kembali ke halaman masuk
        </button>
      </form>
    )
  }

  return (
    <form className="forgot-password-form" onSubmit={handleReset}>
      <p className="forgot-password-form__heading">Atur Ulang Password</p>
      <p className="forgot-password-form__subtitle">
        Kalau <strong>{email}</strong> terdaftar, kami mengirim kode 6 digit ke email itu. Masukkan kodenya beserta password barumu.
      </p>

      <div className="forgot-password-form__field">
        <label htmlFor="reset-code">Kode OTP</label>
        <input
          id="reset-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          required
        />
      </div>

      <div className="forgot-password-form__field">
        <label htmlFor="new-password">Password Baru</label>
        <input
          id="new-password"
          type="password"
          placeholder="••••••••"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={8}
          required
        />
      </div>

      <div className="forgot-password-form__field">
        <label htmlFor="confirm-new-password">Konfirmasi Password Baru</label>
        <input
          id="confirm-new-password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={8}
          required
        />
      </div>

      {error && <p className="forgot-password-form__error">{error}</p>}
      {info && <p className="forgot-password-form__info">{info}</p>}

      <button
        type="submit"
        className="forgot-password-form__submit"
        disabled={status === 'submitting' || code.length !== 6}
      >
        {status === 'submitting' ? 'Memproses...' : 'Atur Ulang Password'}
      </button>

      <button
        type="button"
        className="forgot-password-form__resend"
        onClick={handleResend}
        disabled={cooldown > 0}
      >
        {cooldown > 0 ? `Kirim ulang kode (${cooldown}s)` : 'Kirim ulang kode'}
      </button>

      <button type="button" className="forgot-password-form__back" onClick={onBackToLogin}>
        Kembali ke halaman masuk
      </button>
    </form>
  )
}
