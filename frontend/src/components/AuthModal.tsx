import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiX, FiChevronDown } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { FaFacebookF, FaApple } from 'react-icons/fa'
import logo from '../assets/svg/logo.svg'
import { useAuth } from '../contexts/AuthContext'
import './AuthModal.css'

export type AuthMode = 'login' | 'signup'

interface AuthModalProps {
  mode: AuthMode
  onClose: () => void
  onModeChange: (mode: AuthMode) => void
}

export default function AuthModal({ mode, onClose, onModeChange }: AuthModalProps) {
  const isLogin = mode === 'login'
  const bodyRef = useRef<HTMLDivElement>(null)
  const [canScrollDown, setCanScrollDown] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')
  const navigate = useNavigate()
  const { login, register } = useAuth()

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  useEffect(() => {
    const el = bodyRef.current
    if (!el) return

    const updateScrollHint = () => {
      const hasOverflow = el.scrollHeight > el.clientHeight + 1
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1
      setCanScrollDown(hasOverflow && !atBottom)
    }

    updateScrollHint()
    el.addEventListener('scroll', updateScrollHint)
    const resizeObserver = new ResizeObserver(updateScrollHint)
    resizeObserver.observe(el)

    return () => {
      el.removeEventListener('scroll', updateScrollHint)
      resizeObserver.disconnect()
    }
  }, [mode])

  useEffect(() => {
    setError(null)
    setStatus('idle')
  }, [mode])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setStatus('submitting')

    const formData = new FormData(e.currentTarget)

    try {
      if (isLogin) {
        await login({
          email: String(formData.get('email')),
          password: String(formData.get('password')),
        })
      } else {
        await register({
          firstName: String(formData.get('firstName')),
          lastName: String(formData.get('lastName')),
          email: String(formData.get('email')),
          password: String(formData.get('password')),
        })
      }

      setStatus('success')
      setTimeout(() => {
        onClose()
        navigate('/dashboard')
      }, 1200)
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi.')
    }
  }

  return (
    <div className="auth-modal__backdrop" onMouseDown={onClose}>
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-label={isLogin ? 'Masuk ke ActiVibe' : 'Daftar ke ActiVibe'}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button type="button" className="auth-modal__close" aria-label="Tutup" onClick={onClose}>
          <FiX />
        </button>

        <div className="auth-modal__body" ref={bodyRef}>
          <img src={logo} alt="ActiVibe" className="auth-modal__logo" />

          <h2 className="auth-modal__title">
            {isLogin ? 'Masuk ke akunmu' : 'Buat akun barumu'}
          </h2>

          <p className="auth-modal__subtitle">
            {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <button
              type="button"
              className="auth-modal__switch"
              onClick={() => onModeChange(isLogin ? 'signup' : 'login')}
            >
              {isLogin ? 'Daftar' : 'Masuk'}
            </button>
          </p>

          <div className="auth-modal__social">
            <button type="button" className="auth-modal__social-btn">
              <FcGoogle className="auth-modal__social-icon" aria-hidden="true" />
              Lanjutkan dengan Google
            </button>
            <button type="button" className="auth-modal__social-btn">
              <FaFacebookF className="auth-modal__social-icon" aria-hidden="true" />
              Lanjutkan dengan Facebook
            </button>
            <button type="button" className="auth-modal__social-btn">
              <FaApple className="auth-modal__social-icon" aria-hidden="true" />
              Lanjutkan dengan Apple
            </button>
          </div>

          <div className="auth-modal__divider">
            <span>atau</span>
          </div>

          {status === 'success' ? (
            <p className="auth-modal__success">
              {isLogin ? 'Berhasil masuk!' : 'Berhasil daftar!'}
            </p>
          ) : (
            <form className="auth-modal__form" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="auth-modal__row">
                  <div className="auth-modal__field">
                    <label htmlFor="firstName">Nama Depan</label>
                    <input id="firstName" name="firstName" type="text" placeholder="Casey" required />
                  </div>
                  <div className="auth-modal__field">
                    <label htmlFor="lastName">Nama Belakang</label>
                    <input id="lastName" name="lastName" type="text" placeholder="Smith" required />
                  </div>
                </div>
              )}

              <div className="auth-modal__field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" placeholder="casey.smith@example.com" required />
              </div>

              <div className="auth-modal__field">
                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" placeholder="••••••••" required />
              </div>

              {!isLogin && (
                <div className="auth-modal__field">
                  <label htmlFor="location">Lokasi</label>
                  <input id="location" name="location" type="text" placeholder="Yogyakarta, Indonesia" required />
                </div>
              )}

              {error && <p className="auth-modal__error">{error}</p>}

              {isLogin ? (
                <a href="#" className="auth-modal__forgot">Lupa password?</a>
              ) : (
                <label className="auth-modal__checkbox">
                  <input type="checkbox" required />
                  <span>Saya bukan robot</span>
                </label>
              )}

              <button type="submit" className="auth-modal__submit" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Memproses...' : (isLogin ? 'Masuk' : 'Daftar')}
              </button>
            </form>
          )}

          <p className="auth-modal__terms">
            Dengan melanjutkan, kamu menyetujui{' '}
            <a href="#">Ketentuan Layanan</a> dan mengakui{' '}
            <a href="#">Kebijakan Privasi</a> ActiVibe.
          </p>
        </div>

        <button
          type="button"
          className={`auth-modal__scroll-hint${canScrollDown ? ' auth-modal__scroll-hint--visible' : ''}`}
          aria-label="Scroll ke bawah"
          tabIndex={canScrollDown ? 0 : -1}
          onClick={() => bodyRef.current?.scrollBy({ top: 160, behavior: 'smooth' })}
        >
          <FiChevronDown />
        </button>
      </div>
    </div>
  )
}
