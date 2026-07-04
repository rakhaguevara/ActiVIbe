import { Link, useNavigate } from 'react-router-dom'
import { FiLogOut } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import './AccountSidebar.css'

export type AccountNavKey = 'pengaturan' | 'riwayat' | 'tersimpan' | 'notifikasi' | 'faq'

interface NavItemDef {
  key: AccountNavKey
  label: string
  to?: string
}

// Item tanpa `to` belum jadi halaman nyata — placeholder "Segera Hadir",
// dibangun bertahap satu per satu (keputusan Rakha).
const NAV_ITEMS: NavItemDef[] = [
  { key: 'pengaturan', label: 'Pengaturan', to: '/dashboard/settings' },
  { key: 'riwayat', label: 'Riwayat Pendaftaran', to: '/dashboard/history' },
  { key: 'tersimpan', label: 'Kegiatan Tersimpan', to: '/dashboard/saved' },
  { key: 'notifikasi', label: 'Preferensi Notifikasi' },
  { key: 'faq', label: 'FAQ' },
]

interface AccountSidebarProps {
  active: AccountNavKey
}

export default function AccountSidebar({ active }: AccountSidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const firstName = user?.name.split(' ')[0] ?? 'Volunteer'

  return (
    <aside className="account-sidebar">
      <p className="account-sidebar__greeting">Hi, {firstName}!</p>

      <div className="account-sidebar__nav-group">
        <p className="account-sidebar__nav-heading">Pengaturan Personal</p>
        <nav className="account-sidebar__nav">
          {NAV_ITEMS.map((item) =>
            item.to ? (
              <Link
                key={item.key}
                to={item.to}
                className={'account-sidebar__nav-item' + (active === item.key ? ' is-active' : '')}
              >
                {item.label}
              </Link>
            ) : (
              <span key={item.key} className="account-sidebar__nav-item is-disabled">
                {item.label}
                <span className="account-sidebar__soon-badge">Segera Hadir</span>
              </span>
            ),
          )}
          <button
            type="button"
            className="account-sidebar__nav-item account-sidebar__nav-item--action"
            onClick={handleLogout}
          >
            <FiLogOut /> Logout Sesi
          </button>
        </nav>
      </div>
    </aside>
  )
}
