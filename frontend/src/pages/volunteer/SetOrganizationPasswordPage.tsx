import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiCheckCircle, FiChevronLeft } from 'react-icons/fi'
import { requestOrganizationSetPasswordOtp, setOrganizationPassword } from '../../lib/organizationApi'
import { PORTAL_URLS } from '../../config/portalUrls'
import './SetOrganizationPasswordPage.css'

type Step = 'password' | 'otp' | 'done'

const RESEND_COOLDOWN_SECONDS = 60

// Satu alur untuk SEMUA pendaftar "Daftarkan Organisasimu" (login state saat
// submit form tidak relevan lagi — lihat organization.service.js
// registerOrganization). 3 langkah dalam satu halaman:
// 1. password + konfirmasi -> trigger kirim OTP ke email organisasi
// 2. kode OTP -> verifikasi, baru di titik ini password beneran disimpan +
//    organisasi diaktifkan (lihat verifyOrganizationActivationOtp)
// 3. kartu selesai -> arahkan ke login portal organizer (beda origin/port
//    dari halaman ini, jadi tidak auto-login — user login manual pakai
//    password yang baru diatur).
export default function SetOrganizationPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [step, setStep] = useState<Step>('password')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [code, setCode] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [resultEmail, setResultEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle')
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleSubmitPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!token) {
      setError('Link tidak valid. Buka lagi link dari email yang kamu terima.')
      return
    }
    if (password.length < 8) {
      setError('Password minimal 8 karakter.')
      return
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak sama.')
      return
    }

    setStatus('submitting')
    try {
      const data = await requestOrganizationSetPasswordOtp({ token })
      setOrganizationName(data.organizationName)
      setCooldown(RESEND_COOLDOWN_SECONDS)
      setStep('otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi.')
    } finally {
      setStatus('idle')
    }
  }

  const handleSubmitOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setStatus('submitting')
    try {
      const data = await setOrganizationPassword({ token, password, code })
      setResultEmail(data.email)
      setStep('done')
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi.')
    }
  }

  const handleResendOtp = async () => {
    setError(null)
    setInfo(null)
    try {
      await requestOrganizationSetPasswordOtp({ token })
      setInfo('Kode baru sudah dikirim ke email organisasi.')
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi.')
    }
  }

  return (
    <main className="set-org-password-page">
      <div className="set-org-password-page__panel card">
        <Link to="/" className="set-org-password-page__back">
          <FiChevronLeft /> Kembali ke ActiVibe
        </Link>

        {step === 'done' && (
          <div className="set-org-password-page__confirmation">
            <FiCheckCircle className="set-org-password-page__confirmation-icon" />
            <h1>Selesai!</h1>
            <p>
              Organisasi <strong>{organizationName}</strong> sudah aktif. Sekarang kamu bisa login sebagai organizer
              memakai email <strong>{resultEmail}</strong> dan password yang baru kamu atur.
            </p>
            <a className="btn btn--primary" href={PORTAL_URLS.ORGANIZER}>
              Masuk ke Portal Organizer
            </a>
          </div>
        )}

        {step === 'password' && (
          <>
            <h1 className="set-org-password-page__title">Atur Password</h1>
            <p className="set-org-password-page__subtitle">
              Ini password yang akan kamu pakai untuk login sebagai organizer di ActiVibe.
            </p>

            <form className="set-org-password-page__form" onSubmit={handleSubmitPassword}>
              <label className="set-org-password-page__field">
                <span>Password Baru</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  autoComplete="new-password"
                  required
                />
              </label>

              <label className="set-org-password-page__field">
                <span>Konfirmasi Password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password di atas"
                  autoComplete="new-password"
                  required
                />
              </label>

              {error && <p className="set-org-password-page__error">{error}</p>}

              <button type="submit" className="btn btn--primary" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Mengirim kode...' : 'Lanjut'}
              </button>
            </form>
          </>
        )}

        {step === 'otp' && (
          <>
            <h1 className="set-org-password-page__title">Verifikasi Email</h1>
            <p className="set-org-password-page__subtitle">
              Kami mengirim kode 6 digit ke email organisasi <strong>{organizationName}</strong>. Masukkan kodenya di
              bawah untuk menyelesaikan aktivasi.
            </p>

            <form className="set-org-password-page__form" onSubmit={handleSubmitOtp}>
              <label className="set-org-password-page__field">
                <span>Kode OTP</span>
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                />
              </label>

              {error && <p className="set-org-password-page__error">{error}</p>}
              {info && <p className="set-org-password-page__info">{info}</p>}

              <button
                type="submit"
                className="btn btn--primary"
                disabled={status === 'submitting' || code.length !== 6}
              >
                {status === 'submitting' ? 'Memverifikasi...' : 'Verifikasi & Aktifkan'}
              </button>

              <button
                type="button"
                className="set-org-password-page__resend"
                onClick={handleResendOtp}
                disabled={cooldown > 0}
              >
                {cooldown > 0 ? `Kirim ulang kode (${cooldown}s)` : 'Kirim ulang kode'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
