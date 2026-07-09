import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import type { AuthUser } from '../lib/api'
import './OtpVerifyForm.css'

const RESEND_COOLDOWN_SECONDS = 60

interface OtpVerifyFormProps {
  email: string
  onVerified: (user: AuthUser) => void
}

// FR-002/003: form verifikasi kode OTP registrasi, dipakai dari AuthModal
// (volunteer, popup). Portal Organizer/Admin login-only sejak halaman
// signup mandirinya dihapus — organizer baru masuk lewat alur "Daftarkan
// Organisasimu" + SetOrganizationPasswordPage (beda OTP purpose, tidak
// lewat komponen ini — lihat organization.service.js).
export default function OtpVerifyForm({ email, onVerified }: OtpVerifyFormProps) {
  const { verifyOtp, resendOtp } = useAuth()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle')
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setStatus('submitting')
    try {
      const user = await verifyOtp(email, code)
      onVerified(user)
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi.')
    }
  }

  const handleResend = async () => {
    setError(null)
    setInfo(null)
    try {
      await resendOtp(email)
      setInfo('Kode baru sudah dikirim ke email kamu.')
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi.')
    }
  }

  return (
    <form className="otp-verify-form" onSubmit={handleSubmit}>
      <p className="otp-verify-form__heading">Verifikasi Email</p>
      <p className="otp-verify-form__subtitle">
        Kami mengirim kode 6 digit ke <strong>{email}</strong>. Masukkan kodenya di bawah untuk menyelesaikan registrasi.
      </p>

      <div className="otp-verify-form__field">
        <label htmlFor="otp-code">Kode OTP</label>
        <input
          id="otp-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          required
        />
      </div>

      {error && <p className="otp-verify-form__error">{error}</p>}
      {info && <p className="otp-verify-form__info">{info}</p>}

      <button
        type="submit"
        className="otp-verify-form__submit"
        disabled={status === 'submitting' || code.length !== 6}
      >
        {status === 'submitting' ? 'Memverifikasi...' : 'Verifikasi'}
      </button>

      <button
        type="button"
        className="otp-verify-form__resend"
        onClick={handleResend}
        disabled={cooldown > 0}
      >
        {cooldown > 0 ? `Kirim ulang kode (${cooldown}s)` : 'Kirim ulang kode'}
      </button>
    </form>
  )
}
