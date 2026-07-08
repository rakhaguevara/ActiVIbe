import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiChevronLeft } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import type { AuthUser } from '../../lib/api'
import { updateMyProfile } from '../../lib/profileApi'
import LocationSelector, { EMPTY_LOCATION, type LocationValue } from '../../components/location/LocationSelector'
import OtpVerifyForm from '../../components/OtpVerifyForm'
import logo from '../../assets/svg/logo.svg'
import './AuthPage.css'

interface SignupPageProps {
  role: AuthUser['role']
  homeRoute: string
  loginRoute: string
  title: string
}

export default function SignupPage({ role, homeRoute, loginRoute, title }: SignupPageProps) {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'otp-pending'>('idle')
  const [pendingEmail, setPendingEmail] = useState('')
  const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setStatus('submitting')

    const formData = new FormData(e.currentTarget)

    try {
      const { email } = await register({
        firstName: String(formData.get('firstName')),
        lastName: String(formData.get('lastName')),
        email: String(formData.get('email')),
        password: String(formData.get('password')),
        role,
      })

      setPendingEmail(email)
      setStatus('otp-pending')
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi.')
    }
  }

  // Dipanggil setelah OtpVerifyForm berhasil verifikasi kode — sesi (cookie)
  // baru terbit di titik ini, jadi update lokasi profil baru boleh dikirim
  // sekarang (bukan langsung setelah register(), krn belum ada sesi otentikasi).
  const handleOtpVerified = () => {
    if (location.regencyId) {
      const locationString = location.provinceName
        ? `${location.regencyName}, ${location.provinceName}`
        : location.regencyName
      // fire-and-forget — kegagalan tidak memblokir navigasi
      updateMyProfile({ location: locationString }).catch(() => {})
    } else if (location.provinceId) {
      updateMyProfile({ location: location.provinceName }).catch(() => {})
    }

    navigate(homeRoute)
  }

  return (
    <main className="auth-page">
      <div className="auth-page__panel">
        <Link to="/" className="auth-page__back">
          <FiChevronLeft /> Kembali
        </Link>

        <img src={logo} alt="ActiVibe" className="auth-page__logo" />

        <h1 className="auth-page__title">{title}</h1>
        <p className="auth-page__subtitle">
          Sudah punya akun?{' '}
          <Link to={loginRoute} className="auth-page__switch">
            Masuk
          </Link>
        </p>

        {status === 'otp-pending' ? (
          <OtpVerifyForm email={pendingEmail} onVerified={handleOtpVerified} />
        ) : (
          <form className="auth-page__form" onSubmit={handleSubmit}>
            <div className="auth-page__row">
              <div className="auth-page__field">
                <label htmlFor="firstName">Nama Depan</label>
                <input id="firstName" name="firstName" type="text" placeholder="Casey" required />
              </div>
              <div className="auth-page__field">
                <label htmlFor="lastName">Nama Belakang</label>
                <input id="lastName" name="lastName" type="text" placeholder="Smith" required />
              </div>
            </div>

            <div className="auth-page__field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" placeholder="casey.smith@example.com" required />
            </div>

            <div className="auth-page__field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" placeholder="••••••••" required />
            </div>

            {/* Lokasi — menggunakan LocationSelector (Provinsi + Kabupaten/Kota) */}
            <div className="auth-page__field">
              <LocationSelector
                value={location}
                onChange={setLocation}
                showDistrict={false}
                showVillage={false}
                label="Lokasi"
                placeholder="Pilih kota / kabupaten..."
              />
            </div>

            {error && <p className="auth-page__error">{error}</p>}

            <label className="auth-page__checkbox">
              <input type="checkbox" required />
              <span>Saya bukan robot</span>
            </label>

            <button type="submit" className="auth-page__submit" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Memproses...' : 'Daftar'}
            </button>
          </form>
        )}

        <p className="auth-page__terms">
          Dengan melanjutkan, kamu menyetujui <a href="#">Ketentuan Layanan</a> dan mengakui{' '}
          <a href="#">Kebijakan Privasi</a> ActiVibe.
        </p>
      </div>
    </main>
  )
}
