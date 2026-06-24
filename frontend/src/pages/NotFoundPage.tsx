import { Link } from 'react-router-dom'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <main className="not-found-page">
      <p className="not-found-page__code">404</p>
      <h1 className="not-found-page__title">Halaman tidak ditemukan</h1>
      <Link to="/" className="not-found-page__link">Kembali ke beranda</Link>
    </main>
  )
}
