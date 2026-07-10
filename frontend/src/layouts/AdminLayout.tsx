import { useEffect, useState } from 'react'
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  FiGrid,
  FiUsers,
  FiCalendar,
  FiDownload,
  FiClipboard,
  FiLogOut,
  FiSearch,
  FiHelpCircle,
  FiChevronDown,
  FiAlertTriangle,
} from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/svg/Admin-logo.svg'
import './AdminLayout.css'

/** Struktur navigasi — dikelompokkan per section sesuai PRD */
const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
    ],
  },
  {
    label: 'Manajemen',
    items: [
      { 
        to: '/admin/users', 
        label: 'Pengguna', 
        icon: FiUsers, 
        end: true,
        subItems: [
          { to: '/admin/users', label: 'Keseluruhan', end: true },
          { to: '/admin/users?role=VOLUNTEER', label: 'Relawan' },
          { to: '/admin/users?role=ORGANIZER', label: 'Organizer' }
        ]
      },
      { to: '/admin/events', label: 'Kegiatan', icon: FiCalendar, end: false },
    ],
  },
  {
    label: 'Laporan',
    items: [
      { to: '/admin/participation', label: 'Ekspor Partisipasi', icon: FiDownload, end: false },
      { to: '/admin/activity-log', label: 'Log Aktivitas', icon: FiClipboard, end: false },
      { to: '/admin/premature-closures', label: 'Penutupan Dini', icon: FiAlertTriangle, end: false },
    ],
  },
]

/** Inisial 1–2 huruf dari nama user */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function AdminLayout() {
  const { user, isLoading, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const currentRole = searchParams.get('role')
  const [expandedNavs, setExpandedNavs] = useState<Record<string, boolean>>({
    'Pengguna': true
  })

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      navigate('/', { replace: true })
    }
  }, [isLoading, user, navigate])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (isLoading || !user || user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar" aria-label="Navigasi admin">

        {/* Brand */}
        <div className="admin-layout__brand">
          <img src={logo} alt="ActiVibe logo" height="32" style={{ flexShrink: 0 }} />
        </div>

        {/* Search bar — CareDoc style */}
        <div className="admin-layout__search" role="search">
          <FiSearch className="admin-layout__search-icon" aria-hidden="true" />
          <input
            type="text"
            placeholder="Cari..."
            aria-label="Cari halaman"
            readOnly
            onFocus={(e) => e.target.blur()} /* placeholder UX saja */
          />
          <div className="admin-layout__search-shortcut" aria-hidden="true">
            <span className="admin-layout__search-key">Ctrl</span>
            <span className="admin-layout__search-key">K</span>
          </div>
        </div>

        {/* Navigasi per section */}
        <nav className="admin-layout__nav" aria-label="Menu utama">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              {/* Section label — OVERVIEW / MANAJEMEN / LAPORAN */}
              <p className="admin-layout__nav-section">{section.label}</p>

              {section.items.map(({ to, label, icon: Icon, end, subItems }) => {
                const hasSub = !!subItems?.length
                const isExpanded = expandedNavs[label]

                return (
                  <div key={to} className="admin-layout__nav-item-wrapper">
                    <NavLink
                      to={to}
                      end={end}
                      data-label={label}
                      onClick={() => {
                        if (hasSub) {
                          setExpandedNavs(prev => ({ ...prev, [label]: !prev[label] }))
                        }
                      }}
                      className={({ isActive }) =>
                        ['admin-layout__nav-link', isActive ? 'is-active' : ''].filter(Boolean).join(' ')
                      }
                    >
                      <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '12px' }}>
                        <Icon className="admin-layout__nav-icon" aria-hidden="true" />
                        <span className="admin-layout__nav-label">{label}</span>
                      </div>
                      {hasSub && (
                        <FiChevronDown 
                          style={{ 
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', 
                            transition: 'transform 0.2s',
                            opacity: 0.6
                          }} 
                        />
                      )}
                    </NavLink>
                    {hasSub && isExpanded && (
                      <div className="admin-layout__subnav" style={{ paddingLeft: '44px', marginTop: '4px', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {subItems.map((sub) => {
                          const subUrl = new URL(sub.to, 'http://localhost')
                          const subRole = subUrl.searchParams.get('role')
                          const isSubActive = location.pathname === subUrl.pathname && currentRole === subRole
                          
                          return (
                            <Link
                              key={sub.to}
                              to={sub.to}
                              className={['admin-layout__subnav-link', isSubActive ? 'is-active' : ''].filter(Boolean).join(' ')}
                              style={{
                                textDecoration: 'none',
                                fontSize: '14px',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                color: isSubActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                background: isSubActive ? 'var(--color-primary-soft)' : 'transparent',
                                fontWeight: isSubActive ? 600 : 400,
                                display: 'block'
                              }}
                            >
                              {sub.label}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer — Help & Support + user row */}
        <div className="admin-layout__footer">
          {/* Help & Support */}
          <a href="#" className="admin-layout__help-link" onClick={(e) => e.preventDefault()}>
            <FiHelpCircle className="admin-layout__help-icon" aria-hidden="true" />
            <span className="admin-layout__help-label">Bantuan &amp; Dukungan</span>
          </a>

          {/* User row dengan logout */}
          <div className="admin-layout__user-row">
            <div className="admin-layout__user-avatar" aria-hidden="true">
              {getInitials(user.name)}
            </div>
            <div className="admin-layout__user-info">
              <p className="admin-layout__user-name">{user.name}</p>
              <p className="admin-layout__user-role-label">Administrator</p>
            </div>
            <button
              type="button"
              className="admin-layout__logout-btn"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
            >
              <FiLogOut aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      {/* Content — satu-satunya yang scroll */}
      <main className="admin-layout__content">
        <Outlet />
      </main>
    </div>
  )
}
