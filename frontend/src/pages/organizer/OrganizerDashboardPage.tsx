import { FiClock } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import './OrganizerDashboardPage.css'

export default function OrganizerDashboardPage() {
  const { user } = useAuth()

  return (
    <div className="organizer-dashboard">
      <header className="organizer-dashboard__header">
        <h1>Halo, {user?.name}!</h1>
        <p>Ini portal khusus Organizer, terpisah dari portal Volunteer dan Admin.</p>
      </header>

      <div className="card organizer-dashboard__placeholder">
        <FiClock className="organizer-dashboard__placeholder-icon" />
        <h2>Fitur Organizer Segera Hadir</h2>
        <p>
          Buat kegiatan, kelola pendaftar, dan tutup event (FR-011&ndash;FR-017b) akan tersedia di sini
          setelah dibangun pada task terpisah.
        </p>
      </div>
    </div>
  )
}
