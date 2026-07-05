import React, { useState, useEffect } from 'react'
import { 
  FiSearch, FiFilter, FiDownload, FiUsers, FiCheckCircle, 
  FiClock, FiAlertCircle, FiMoreVertical, FiFileText, FiMapPin
} from 'react-icons/fi'
import VolunteerProfileDrawer from '../../../components/organizer/VolunteerProfileDrawer'
import type { VolunteerProfile } from '../../../components/organizer/VolunteerProfileDrawer'
import '../VolunteersPage.css'

// We create a modified profile for Accepted view
interface AcceptedVolunteer extends VolunteerProfile {
  assignedEvent: string
  assignedRole: string
  shift: string
  requirementsCompleted: number
  requirementsTotal: number
  confirmed: boolean
}

const DUMMY_ACCEPTED: AcceptedVolunteer[] = [
  {
    id: '1', name: 'Ahmad Fauzan', avatarInitials: 'AF', skills: ['Teaching', 'Public Speaking'],
    eventsJoined: 12, hours: 124, attendance: '98%', status: 'Accepted', lastActivity: 'Yesterday',
    rating: 5, email: 'ahmad.fauzan@example.com', phone: '+62 812-3456-7890', location: 'Jakarta Selatan',
    bio: 'Guru honorer yang sangat peduli.', impactTrees: 150,
    assignedEvent: 'Beach Cleanup 2026', assignedRole: 'Team Leader', shift: 'Morning (07:00 - 12:00)',
    requirementsCompleted: 3, requirementsTotal: 3, confirmed: true
  },
  {
    id: '2', name: 'Sarah Wijaya', avatarInitials: 'SW', skills: ['Photography', 'Content Creator'],
    eventsJoined: 8, hours: 72, attendance: '95%', status: 'Accepted', lastActivity: '2 Days Ago',
    rating: 5, email: 'sarah.w@example.com', phone: '+62 813-9876-5432', location: 'Bandung',
    bio: 'Fotografer lepas.', impactTrees: 80,
    assignedEvent: 'Mangrove Planting', assignedRole: 'Documenter', shift: 'Full Day (08:00 - 16:00)',
    requirementsCompleted: 1, requirementsTotal: 3, confirmed: false
  },
  {
    id: '4', name: 'Lisa Amelia', avatarInitials: 'LA', skills: ['Graphic Design'],
    eventsJoined: 6, hours: 54, attendance: '92%', status: 'Accepted', lastActivity: 'Yesterday',
    rating: 4, email: 'lisa.design@example.com', phone: '+62 815-5566-7788', location: 'Yogyakarta',
    bio: 'Desainer grafis.', impactTrees: 20,
    assignedEvent: 'Education Camp', assignedRole: 'Art Mentor', shift: 'Afternoon (13:00 - 17:00)',
    requirementsCompleted: 2, requirementsTotal: 2, confirmed: true
  },
]

export default function AcceptedVolunteersView() {
  const [loading, setLoading] = useState(true)
  const [volunteers, setVolunteers] = useState<AcceptedVolunteer[]>([])
  const [selectedProfile, setSelectedProfile] = useState<VolunteerProfile | null>(null)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVolunteers(DUMMY_ACCEPTED)
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="volunteers-crm">
        <div className="v-kpi-grid">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton sk-card" />)}
        </div>
        <div className="skeleton sk-table" />
      </div>
    )
  }

  return (
    <div className="volunteers-crm">
      {/* Alerts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: '8px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}>
          <FiAlertCircle size={18} /> 12 volunteers have not completed required documents for upcoming events.
        </div>
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '12px 16px', borderRadius: '8px', color: '#d97706', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}>
          <FiAlertCircle size={18} /> 5 volunteers have not confirmed their attendance for tomorrow.
        </div>
      </div>

      {/* KPI Cards */}
      <section className="v-kpi-grid">
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiUsers /> Accepted Volunteers</div>
          <span className="v-kpi-value">145</span>
          <span className="v-kpi-trend neutral">Across 3 upcoming events</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiMapPin /> Upcoming Assignments</div>
          <span className="v-kpi-value">3</span>
          <span className="v-kpi-trend neutral">Events</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header" style={{ color: 'var(--color-danger)' }}><FiFileText /> Pending Requirements</div>
          <span className="v-kpi-value">12</span>
          <span className="v-kpi-trend" style={{ color: 'var(--color-danger)' }}>Action needed</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header" style={{ color: 'var(--color-success)' }}><FiCheckCircle /> Ready for Check-in</div>
          <span className="v-kpi-value">128</span>
          <span className="v-kpi-trend">Fully confirmed</span>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="v-filter-bar">
        <div className="v-filter-input" style={{ flex: 2 }}>
          <FiSearch color="var(--color-text-muted)" />
          <input type="text" placeholder="Search accepted volunteers..." />
        </div>
        <div className="v-filter-input">
          <select defaultValue=""><option value="" disabled>Assigned Event</option></select>
        </div>
        <div className="v-filter-input">
          <select defaultValue=""><option value="" disabled>Confirmation Status</option></select>
        </div>
        <button className="btn btn--outline btn--sm" style={{ border: 'none' }}>Reset</button>
      </section>

      {/* Main Content */}
      <section className="v-section">
        <h2>Operational Preparation</h2>
        <div className="v-table-wrapper">
          <table className="v-table">
            <thead>
              <tr>
                <th>Volunteer Name</th>
                <th>Assigned Event</th>
                <th>Assigned Role</th>
                <th>Shift</th>
                <th>Requirements</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map(vol => (
                <tr key={vol.id}>
                  <td>
                    <div className="v-volunteer-info">
                      <div className="v-avatar">{vol.avatarInitials}</div>
                      <div>
                        <span className="v-volunteer-name">{vol.name}</span>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{vol.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{vol.assignedEvent}</td>
                  <td>{vol.assignedRole}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}><FiClock /> {vol.shift}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Completed</span>
                        <strong>{vol.requirementsCompleted}/{vol.requirementsTotal}</strong>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'var(--color-border-light)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${(vol.requirementsCompleted / vol.requirementsTotal) * 100}%`, height: '100%', background: vol.requirementsCompleted === vol.requirementsTotal ? 'var(--color-success)' : 'var(--color-warning)' }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    {vol.confirmed ? (
                      <span className="badge badge--success">Confirmed</span>
                    ) : (
                      <span className="badge badge--warning">Pending</span>
                    )}
                  </td>
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

      <VolunteerProfileDrawer 
        volunteer={selectedProfile}
        isOpen={selectedProfile !== null}
        onClose={() => setSelectedProfile(null)}
      />
    </div>
  )
}
