import { FiUsers, FiArrowLeft } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import './OrganizersPage.css'

export default function OrganizersPage() {
  return (
    <div className="organizers-page" style={{ padding: '24px', width: '100%', fontFamily: 'var(--font-body)' }}>
      <header className="admin-global-header">
        <h1>Manajemen Organizer</h1>
        <div className="admin-breadcrumb">
          <span>Admin</span> <span className="sep">›</span> <span>Pengguna</span> <span className="sep">›</span> <span className="current">Organizer</span>
        </div>
      </header>

      <div className="organizers-page__coming-soon">
        <div className="organizers-page__icon-wrap">
          <FiUsers />
        </div>
        <h2>Segera Hadir</h2>
        <p>
          Halaman manajemen organizer sedang dalam tahap pengembangan.<br />
          Kamu bisa mengelola organizer melalui halaman <strong>Pengguna</strong> untuk sementara.
        </p>
        <div className="organizers-page__actions">
          <Link to="/admin/users" className="btn btn--primary btn--sm">
            Buka Halaman Pengguna
          </Link>
          <Link to="/admin/events" className="organizers-page__back-link">
            <FiArrowLeft aria-hidden="true" />
            Kembali ke Kegiatan
          </Link>
        </div>
      </div>
    </div>
  )
}
