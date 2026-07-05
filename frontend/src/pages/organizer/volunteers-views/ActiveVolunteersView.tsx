import React, { useState, useEffect } from 'react'
import { 
  FiSearch, FiUsers, FiActivity, FiClock, FiCoffee, FiMoreVertical, FiMapPin, FiPlayCircle
} from 'react-icons/fi'
import VolunteerProfileDrawer from '../../../components/organizer/VolunteerProfileDrawer'
import type { VolunteerProfile } from '../../../components/organizer/VolunteerProfileDrawer'
import '../VolunteersPage.css'

interface ActiveVolunteer extends VolunteerProfile {
  assignedEvent: string
  assignedRole: string
  currentStatus: 'On Duty' | 'Late Arrival' | 'Break'
  checkInTime: string
  activeHours: string
}

const DUMMY_ACTIVE: ActiveVolunteer[] = [
  {
    id: '5', name: 'Michael Tan', avatarInitials: 'MT', skills: ['Logistics'],
    eventsJoined: 18, hours: 312, attendance: '96%', status: 'Volunteer Leader', lastActivity: 'Today',
    rating: 5, email: 'michael.t@example.com', phone: '+62 811-9988-7766', location: 'Jakarta Pusat',
    bio: 'Ahli logistik.', impactTrees: 2450,
    assignedEvent: 'Mangrove Planting', assignedRole: 'Logistics Coordinator', currentStatus: 'On Duty', checkInTime: '07:45 AM', activeHours: '3h 15m'
  },
  {
    id: '6', name: 'Nabila Putri', avatarInitials: 'NP', skills: ['Administration'],
    eventsJoined: 5, hours: 42, attendance: '89%', status: 'Active', lastActivity: 'Today',
    rating: 4, email: 'nabila.p@example.com', phone: '+62 819-2233-4455', location: 'Tangerang',
    bio: 'Mahasiswi administrasi.', impactTrees: 15,
    assignedEvent: 'Mangrove Planting', assignedRole: 'Registration Desk', currentStatus: 'Break', checkInTime: '08:00 AM', activeHours: '3h 00m'
  },
  {
    id: '1', name: 'Ahmad Fauzan', avatarInitials: 'AF', skills: ['Teaching'],
    eventsJoined: 12, hours: 124, attendance: '98%', status: 'Active', lastActivity: 'Today',
    rating: 5, email: 'ahmad@example.com', phone: '+62 812-3456-7890', location: 'Jakarta Selatan',
    bio: 'Guru.', impactTrees: 150,
    assignedEvent: 'Mangrove Planting', assignedRole: 'Planter', currentStatus: 'Late Arrival', checkInTime: '08:45 AM', activeHours: '2h 15m'
  }
]

export default function ActiveVolunteersView() {
  const [loading, setLoading] = useState(true)
  const [volunteers, setVolunteers] = useState<ActiveVolunteer[]>([])
  const [selectedProfile, setSelectedProfile] = useState<VolunteerProfile | null>(null)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVolunteers(DUMMY_ACTIVE)
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="volunteers-crm">
        <div className="v-kpi-grid">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton sk-card" />)}
        </div>
        <div className="skeleton sk-table" />
      </div>
    )
  }

  const getStatusBadge = (status: ActiveVolunteer['currentStatus']) => {
    switch (status) {
      case 'On Duty': return <span className="badge badge--success"><FiPlayCircle /> On Duty</span>
      case 'Break': return <span className="badge badge--info"><FiCoffee /> Break</span>
      case 'Late Arrival': return <span className="badge badge--warning"><FiClock /> Late</span>
    }
  }

  return (
    <div className="volunteers-crm">
      {/* KPI Cards */}
      <section className="v-kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiUsers /> Checked In</div>
          <span className="v-kpi-value">280</span>
          <span className="v-kpi-trend neutral">of 300 expected</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiActivity /> On Duty</div>
          <span className="v-kpi-value">245</span>
          <span className="v-kpi-trend neutral">Actively volunteering</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header" style={{ color: 'var(--color-warning)' }}><FiClock /> Late Arrival</div>
          <span className="v-kpi-value">12</span>
          <span className="v-kpi-trend" style={{ color: 'var(--color-warning)' }}>Past 08:00 AM</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiCoffee /> On Break</div>
          <span className="v-kpi-value">35</span>
          <span className="v-kpi-trend neutral">Resting</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiActivity /> Current Attendance</div>
          <span className="v-kpi-value">93%</span>
          <span className="v-kpi-trend">+2% vs last hour</span>
        </div>
      </section>

      <div className="v-grid-main" style={{ gridTemplateColumns: '3fr 1fr' }}>
        <div className="v-section-col">
          {/* Main Content */}
          <section className="v-section">
            <h2>Live Attendance & Status</h2>
            <div className="v-table-wrapper">
              <table className="v-table">
                <thead>
                  <tr>
                    <th>Volunteer Name</th>
                    <th>Assigned Event</th>
                    <th>Role</th>
                    <th>Check-in Time</th>
                    <th>Active Hours</th>
                    <th>Live Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map(vol => (
                    <tr key={vol.id}>
                      <td>
                        <div className="v-volunteer-info">
                          <div className="v-avatar">{vol.avatarInitials}</div>
                          <span className="v-volunteer-name">{vol.name}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{vol.assignedEvent}</td>
                      <td>{vol.assignedRole}</td>
                      <td>{vol.checkInTime}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 600 }}>{vol.activeHours}</td>
                      <td>{getStatusBadge(vol.currentStatus)}</td>
                      <td>
                        <div className="v-table-actions">
                          <button className="btn btn--sm btn--outline" onClick={() => setSelectedProfile(vol)}>Profile</button>
                          <button className="btn btn--sm btn--outline" style={{ padding: '0 8px' }}><FiMoreVertical/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="v-section-col">
          {/* Side Widgets */}
          <section className="v-section card">
            <h2>Active Events</h2>
            <div style={{ background: 'var(--color-bg-subtle)', padding: '12px', borderRadius: '8px', borderLeft: '4px solid var(--color-success)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)' }} />
                Mangrove Planting
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}><FiMapPin /> Teluk Naga, Tangerang</div>
            </div>
          </section>
          
          <section className="v-section card">
            <h2>Recent Check-ins</h2>
            <div className="v-timeline">
              <div className="v-timeline-item">
                <div className="v-timeline-dot" style={{ background: 'var(--color-success)' }} />
                <div style={{ fontSize: '13px' }}><strong>Ahmad</strong> checked in at Registration Desk.</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>08:45 AM</div>
              </div>
              <div className="v-timeline-item">
                <div className="v-timeline-dot" />
                <div style={{ fontSize: '13px' }}><strong>Nabila</strong> checked in at Registration Desk.</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>08:00 AM</div>
              </div>
              <div className="v-timeline-item">
                <div className="v-timeline-dot" />
                <div style={{ fontSize: '13px' }}><strong>Michael</strong> checked in at Loading Bay.</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>07:45 AM</div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <VolunteerProfileDrawer 
        volunteer={selectedProfile}
        isOpen={selectedProfile !== null}
        onClose={() => setSelectedProfile(null)}
      />
    </div>
  )
}
