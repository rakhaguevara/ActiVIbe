import { useEffect, useState } from 'react'
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  FiGrid,
  FiCalendar,
  FiUsers,
  FiMessageSquare,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiSearch,
  FiHelpCircle,
  FiChevronDown,
  FiAward,
  FiBriefcase
} from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { OrganizerDataProvider } from '../contexts/OrganizerDataContext'
import logo from '../assets/svg/logo.svg'
import './OrganizerLayout.css'

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { to: '/organizer', label: 'Overview', icon: FiGrid, end: true },
    ],
  },
  {
    label: 'Event & Volunteer',
    items: [
      { 
        to: '/organizer/events', 
        label: 'Events', 
        icon: FiCalendar, 
        end: true,
        subItems: [
          { to: '/organizer/events', label: 'All Events', end: true },
          { to: '/organizer/events?status=draft', label: 'Draft' },
          { to: '/organizer/events?status=published', label: 'Published' },
          { to: '/organizer/events?status=ongoing', label: 'Ongoing' },
          { to: '/organizer/events?status=completed', label: 'Completed' },
          { to: '/organizer/events?status=archived', label: 'Archived' },
          { to: '/organizer/events?status=overview', label: 'Events Overview' },
          { to: '/organizer/events?status=sub-organizer', label: 'Sub Organizer' },
        ]
      },
      { 
        to: '/organizer/volunteers', 
        label: 'Volunteers', 
        icon: FiUsers, 
        end: false,
        subItems: [
          { to: '/organizer/volunteers', label: 'All Volunteers', end: true },
          { to: '/organizer/volunteers?status=accepted', label: 'Accepted' },
          { to: '/organizer/volunteers?status=active', label: 'Active' },
          { to: '/organizer/volunteers?status=completed', label: 'Completed' },
          { to: '/organizer/volunteers?status=no_show', label: 'No-show' },
        ]
      },
    ],
  },
  {
    label: 'Manajemen',
    items: [
      { 
        to: '/organizer/communication', 
        label: 'Communication', 
        icon: FiMessageSquare, 
        end: false,
        subItems: [
          { to: '/organizer/communication', label: 'Broadcast', end: true },
          { to: '/organizer/communication?tab=scheduled', label: 'Scheduled Messages' },
          { to: '/organizer/communication?tab=templates', label: 'Templates' },
          { to: '/organizer/communication?tab=log', label: 'Communication Log' },
        ]
      },
      { 
        to: '/organizer/reports', 
        label: 'Reports & Impact', 
        icon: FiBarChart2, 
        end: false,
        subItems: [
          { to: '/organizer/reports', label: 'Dashboard', end: true },
          { to: '/organizer/reports?tab=event', label: 'Event Analytics' },
          { to: '/organizer/reports?tab=volunteer', label: 'Volunteer Analytics' },
          { to: '/organizer/reports?tab=impact', label: 'Impact Analytics' },
          { to: '/organizer/reports?tab=export', label: 'Export' },
        ]
      },
      { 
        to: '/organizer/certificates', 
        label: 'Certificates', 
        icon: FiAward, 
        end: false,
        subItems: [
          { to: '/organizer/certificates', label: 'Generate Queue', end: true },
          { to: '/organizer/certificates?tab=generated', label: 'Generated' },
          { to: '/organizer/certificates?tab=failed', label: 'Failed' },
          { to: '/organizer/certificates?tab=regenerate', label: 'Re-generate' },
        ]
      },
    ],
  },
  {
    label: 'Pengaturan',
    items: [
      { 
        to: '/organizer/organization', 
        label: 'Organization', 
        icon: FiBriefcase, 
        end: false,
        subItems: [
          { to: '/organizer/organization', label: 'Profile', end: true },
          { to: '/organizer/organization?tab=team', label: 'Team Members' },
          { to: '/organizer/organization?tab=subscription', label: 'Subscription' },
          { to: '/organizer/organization?tab=branding', label: 'Branding' },
        ]
      }
    ]
  }
]

/** Inisial 1–2 huruf dari nama user */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function OrganizerLayout() {
  const { user, isLoading, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const searchParams = new URLSearchParams(location.search)
  const currentStatus = searchParams.get('status')
  const currentTab = searchParams.get('tab')
  
  const [expandedNavs, setExpandedNavs] = useState<Record<string, boolean>>({
    'Events': true,
    'Volunteers': false
  })

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ORGANIZER')) {
      navigate('/', { replace: true })
    }
  }, [isLoading, user, navigate])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (isLoading || !user || user.role !== 'ORGANIZER') {
    return null
  }

  return (
    <div className="organizer-layout">
      <aside className="organizer-layout__sidebar" aria-label="Navigasi organizer">

        {/* Brand */}
        <div className="organizer-layout__brand">
          <img src={logo} alt="ActiVibe logo" height="32" style={{ flexShrink: 0 }} />
          <div className="organizer-layout__brand-info">
            <span className="organizer-layout__brand-label">Organizer Panel</span>
          </div>
        </div>

        {/* Search bar — CareDoc style */}
        <div className="organizer-layout__search" role="search">
          <FiSearch className="organizer-layout__search-icon" aria-hidden="true" />
          <input
            type="text"
            placeholder="Cari..."
            aria-label="Cari halaman"
            readOnly
            onFocus={(e) => e.target.blur()} /* placeholder UX saja */
          />
          <div className="organizer-layout__search-shortcut" aria-hidden="true">
            <span className="organizer-layout__search-key">Ctrl</span>
            <span className="organizer-layout__search-key">K</span>
          </div>
        </div>

        {/* Navigasi per section */}
        <nav className="organizer-layout__nav" aria-label="Menu utama">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="organizer-layout__nav-section">{section.label}</p>

              {section.items.map(({ to, label, icon: Icon, end, subItems }) => {
                const hasSub = !!subItems?.length
                const isExpanded = expandedNavs[label]

                return (
                  <div key={to} className="organizer-layout__nav-item-wrapper">
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
                        ['organizer-layout__nav-link', isActive ? 'is-active' : ''].filter(Boolean).join(' ')
                      }
                    >
                      <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '12px' }}>
                        <Icon className="organizer-layout__nav-icon" aria-hidden="true" />
                        <span className="organizer-layout__nav-label">{label}</span>
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
                      <div className="organizer-layout__subnav" style={{ paddingLeft: '44px', marginTop: '4px', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {subItems.map((sub) => {
                          const subUrl = new URL(sub.to, 'http://localhost')
                          const subStatus = subUrl.searchParams.get('status')
                          const subTab = subUrl.searchParams.get('tab')
                          
                          const isSubActive = location.pathname === subUrl.pathname && currentStatus === subStatus && currentTab === subTab
                          
                          return (
                            <Link
                              key={sub.to}
                              to={sub.to}
                              className={['organizer-layout__subnav-link', isSubActive ? 'is-active' : ''].filter(Boolean).join(' ')}
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
        <div className="organizer-layout__footer">
          <a href="#" className="organizer-layout__help-link" onClick={(e) => e.preventDefault()}>
            <FiHelpCircle className="organizer-layout__help-icon" aria-hidden="true" />
            <span className="organizer-layout__help-label">Bantuan &amp; Dukungan</span>
          </a>
          <Link to="/organizer/settings" className="organizer-layout__help-link">
            <FiSettings className="organizer-layout__help-icon" aria-hidden="true" />
            <span className="organizer-layout__help-label">Pengaturan</span>
          </Link>

          <div className="organizer-layout__user-row">
            <div className="organizer-layout__user-avatar" aria-hidden="true">
              {getInitials(user.name)}
            </div>
            <div className="organizer-layout__user-info">
              <p className="organizer-layout__user-name">{user.name}</p>
              <p className="organizer-layout__user-role-label">Organizer</p>
            </div>
            <button
              type="button"
              className="organizer-layout__logout-btn"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
            >
              <FiLogOut aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      <main className="organizer-layout__content">
        <OrganizerDataProvider>
          <Outlet />
        </OrganizerDataProvider>
      </main>
    </div>
  )
}
