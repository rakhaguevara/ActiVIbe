import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiCheckCircle } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { getInviteInfo, acceptInvite } from '../../lib/organizationMembersApi'
import './AcceptTeamInvitePage.css'

type Step = 'loading' | 'password' | 'done' | 'invalid'

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Owner',
  ADMINISTRATOR: 'Administrator',
  COORDINATOR: 'Coordinator',
}

// Halaman publik (TANPA login) — dibuka dari email undangan tim organisasi
// (lihat organizationMembers.service.js inviteMember/sendOrganizationMemberInviteEmail).
// Beda dari SetOrganizationPasswordPage (portal volunteer, 3 langkah dgn OTP):
// di sini cuma 2 langkah (password -> selesai), TANPA OTP terpisah, krn
// pengiriman link undangan ke email organisasi ITU SENDIRI sudah jadi
// pembuktian pemilik email (organizer yang mengundang sudah tahu emailnya,
// beda dari self-registrasi publik yang butuh OTP tambahan). Halaman ini
// sengaja live di portal organizer (origin yang sama dgn LoginPage-nya,
// bukan portal volunteer) krn org yang diundang jelas menuju ke sini.
export default function AcceptTeamInvitePage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [step, setStep] = useState<Step>('loading')
  const [organizationName, setOrganizationName] = useState('')
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle')

  useEffect(() => {
    if (!token) {
      setStep('invalid')
      setError('Link undangan tidak valid.')
      return
    }
    getInviteInfo(token)
      .then((data) => {
        setOrganizationName(data.organizationName)
        setRole(data.role)
        setEmail(data.email)
        setStep('password')
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Link undangan tidak valid atau sudah kedaluwarsa.')
        setStep('invalid')
      })
  }, [token])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

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
      await acceptInvite(token, { password })
      setStep('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi.')
    } finally {
      setStatus('idle')
    }
  }

  return (
    <main className="accept-invite-page">
      <motion.div
        className="accept-invite-page__panel card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {step === 'loading' && <p>Memuat undangan...</p>}

        {step === 'invalid' && (
          <div className="accept-invite-page__confirmation">
            <h1>Undangan Tidak Valid</h1>
            <p>{error ?? 'Link undangan tidak valid atau sudah kedaluwarsa. Minta organizer mengirim ulang undangan.'}</p>
          </div>
        )}

        {step === 'password' && (
          <>
            <h1 className="accept-invite-page__title">Terima Undangan Tim</h1>
            <p className="accept-invite-page__subtitle">
              Kamu diundang bergabung sebagai <strong>{ROLE_LABELS[role] ?? role}</strong> di tim organisasi{' '}
              <strong>{organizationName}</strong> menggunakan email <strong>{email}</strong>. Atur password untuk
              mengaktifkan akses.
            </p>

            <form className="accept-invite-page__form" onSubmit={handleSubmit}>
              <label className="accept-invite-page__field">
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  autoComplete="new-password"
                  required
                />
              </label>

              <label className="accept-invite-page__field">
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

              {error && <p className="accept-invite-page__error">{error}</p>}

              <button type="submit" className="btn btn--primary" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Memproses...' : 'Aktifkan & Terima Undangan'}
              </button>
            </form>
          </>
        )}

        {step === 'done' && (
          <div className="accept-invite-page__confirmation">
            <FiCheckCircle className="accept-invite-page__confirmation-icon" />
            <h1>Selesai!</h1>
            <p>
              Kamu sekarang jadi bagian dari tim <strong>{organizationName}</strong>. Silakan masuk memakai email{' '}
              <strong>{email}</strong> dan password yang baru kamu atur.
            </p>
            <Link className="btn btn--primary" to="/">
              Masuk ke Portal Organizer
            </Link>
          </div>
        )}
      </motion.div>
    </main>
  )
}
