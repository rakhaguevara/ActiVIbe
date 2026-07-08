import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PORTAL, type Portal } from '../config/portal'
import './NotFoundPage.css'

// "/" render beda arti per portal saat sudah login: di volunteer portal "/"
// tetap HomePage marketing (bukan dashboard-nya), di organizer/admin portal
// "/" malah LoginPage — jadi utk user yang sudah login, "beranda" harus
// diarahkan ke home dashboard sesuai portal, bukan hardcode "/".
const HOME_ROUTE_WHEN_LOGGED_IN: Record<Portal, string> = {
  volunteer: '/dashboard',
  organizer: '/organizer',
  admin: '/admin',
}

export default function NotFoundPage() {
  const { user } = useAuth()
  const homeRoute = user ? HOME_ROUTE_WHEN_LOGGED_IN[PORTAL] : '/'

  return (
    <main className="not-found-page">
      <p className="not-found-page__code">404</p>
      <h1 className="not-found-page__title">Halaman tidak ditemukan</h1>
      <Link to={homeRoute} className="not-found-page__link">Kembali ke beranda</Link>
    </main>
  )
}
