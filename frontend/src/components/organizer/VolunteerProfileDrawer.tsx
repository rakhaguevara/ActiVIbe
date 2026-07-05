import React from 'react'
import { FiX, FiMail, FiPhone, FiMapPin, FiStar, FiAward, FiMessageSquare, FiUserPlus, FiDownload } from 'react-icons/fi'

export interface VolunteerProfile {
  id: string
  name: string
  avatarInitials: string
  skills: string[]
  eventsJoined: number
  hours: number
  attendance: string
  status: string
  lastActivity: string
  rating: number
  email: string
  phone: string
  location: string
  bio: string
  impactTrees: number
}

interface VolunteerProfileDrawerProps {
  volunteer: VolunteerProfile | null
  isOpen: boolean
  onClose: () => void
}

export default function VolunteerProfileDrawer({ volunteer, isOpen, onClose }: VolunteerProfileDrawerProps) {
  if (!isOpen || !volunteer) return null

  return (
    <div className="v-drawer-overlay" onClick={onClose}>
      <div className="v-drawer" onClick={e => e.stopPropagation()}>
        <div className="v-drawer-header">
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div className="v-avatar" style={{ width: '64px', height: '64px', fontSize: '24px' }}>
              {volunteer.avatarInitials}
            </div>
            <div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>{volunteer.name}</h2>
              <div className="v-rating" style={{ fontSize: '14px' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} style={{ color: i < volunteer.rating ? '#f59e0b' : '#e5e7eb' }}>★</span>
                ))}
              </div>
            </div>
          </div>
          <button className="btn btn--sm" style={{ border: 'none', background: 'transparent', padding: '8px' }} onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <div className="v-drawer-content">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'var(--color-text-body)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiMail /> {volunteer.email}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiPhone /> {volunteer.phone}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiMapPin /> {volunteer.location}</div>
          </div>

          <div>
            <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>About</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>{volunteer.bio}</p>
          </div>

          <div>
            <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>Skills</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {volunteer.skills.map(skill => (
                <span key={skill} className="v-skill-tag" style={{ fontSize: '12px', padding: '4px 8px' }}>{skill}</span>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>Impact Passport Summary</h3>
            <div className="v-kpi-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="v-kpi-card" style={{ padding: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Hours</span>
                <span style={{ fontSize: '20px', fontWeight: 600 }}>{volunteer.hours}</span>
              </div>
              <div className="v-kpi-card" style={{ padding: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Events</span>
                <span style={{ fontSize: '20px', fontWeight: 600 }}>{volunteer.eventsJoined}</span>
              </div>
              <div className="v-kpi-card" style={{ padding: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Attendance</span>
                <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-success)' }}>{volunteer.attendance}</span>
              </div>
              <div className="v-kpi-card" style={{ padding: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Trees</span>
                <span style={{ fontSize: '20px', fontWeight: 600 }}>{volunteer.impactTrees}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>Recent Feedback</h3>
            <div style={{ background: '#fdfbf7', border: '1px solid #f0e6d2', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
              "Sangat membantu saat acara penanaman mangrove. Aktif dan inisiatif tinggi!" - Event Leader
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>Achievements</h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--color-primary)' }}>
              <FiAward size={24} title="Top Volunteer" />
              <FiStar size={24} title="5-Star Member" />
            </div>
          </div>
        </div>

        <div className="v-drawer-footer">
          <button className="btn btn--primary" style={{ flex: 1 }}><FiUserPlus /> Invite</button>
          <button className="btn btn--outline" style={{ flex: 1 }}><FiMessageSquare /> Message</button>
          <button className="btn btn--outline" style={{ padding: '0 12px' }} title="Download Profile"><FiDownload /></button>
        </div>
      </div>
    </div>
  )
}
