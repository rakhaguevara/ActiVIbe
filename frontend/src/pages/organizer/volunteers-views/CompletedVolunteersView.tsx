import React, { useState, useEffect } from 'react'
import { 
  FiSearch, FiUsers, FiAward, FiClock, FiFileText, FiStar, FiMoreVertical, FiDownload
} from 'react-icons/fi'
import VolunteerProfileDrawer from '../../../components/organizer/VolunteerProfileDrawer'
import type { VolunteerProfile } from '../../../components/organizer/VolunteerProfileDrawer'
import '../VolunteersPage.css'

interface CompletedVolunteer extends VolunteerProfile {
  completedEvent: string
  completionDate: string
  earnedHours: number
  certificateStatus: 'Generated' | 'Pending'
  eventFeedbackScore: number
}

const DUMMY_COMPLETED: CompletedVolunteer[] = [
  {
    id: '3', name: 'Daniel Pratama', avatarInitials: 'DP', skills: ['First Aid'],
    eventsJoined: 15, hours: 201, attendance: '100%', status: 'Completed', lastActivity: 'Last Week',
    rating: 5, email: 'daniel.p@example.com', phone: '+62 821-1122-3344', location: 'Surabaya',
    bio: 'Tenaga medis.', impactTrees: 400,
    completedEvent: 'Blood Donation Drive', completionDate: '2026-06-10', earnedHours: 8, certificateStatus: 'Generated', eventFeedbackScore: 5
  },
  {
    id: '5', name: 'Michael Tan', avatarInitials: 'MT', skills: ['Logistics'],
    eventsJoined: 18, hours: 312, attendance: '96%', status: 'Volunteer Leader', lastActivity: 'Today',
    rating: 5, email: 'michael.t@example.com', phone: '+62 811-9988-7766', location: 'Jakarta Pusat',
    bio: 'Ahli logistik.', impactTrees: 2450,
    completedEvent: 'Disaster Relief Fund', completionDate: '2026-05-22', earnedHours: 12, certificateStatus: 'Generated', eventFeedbackScore: 5
  },
  {
    id: '6', name: 'Nabila Putri', avatarInitials: 'NP', skills: ['Administration'],
    eventsJoined: 5, hours: 42, attendance: '89%', status: 'Inactive', lastActivity: '2 Months Ago',
    rating: 4, email: 'nabila.p@example.com', phone: '+62 819-2233-4455', location: 'Tangerang',
    bio: 'Mahasiswi administrasi.', impactTrees: 15,
    completedEvent: 'Orphanage Visit', completionDate: '2026-04-10', earnedHours: 5, certificateStatus: 'Pending', eventFeedbackScore: 4
  }
]

export default function CompletedVolunteersView() {
  const [loading, setLoading] = useState(true)
  const [volunteers, setVolunteers] = useState<CompletedVolunteer[]>([])
  const [selectedProfile, setSelectedProfile] = useState<VolunteerProfile | null>(null)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVolunteers(DUMMY_COMPLETED)
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
      {/* KPI Cards */}
      <section className="v-kpi-grid">
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiUsers /> Completed Volunteers</div>
          <span className="v-kpi-value">942</span>
          <span className="v-kpi-trend neutral">All time</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiFileText /> Certificates Generated</div>
          <span className="v-kpi-value">915</span>
          <span className="v-kpi-trend">27 Pending</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header" style={{ color: 'var(--color-primary)' }}><FiAward /> Impact Passport Updated</div>
          <span className="v-kpi-value">942</span>
          <span className="v-kpi-trend" style={{ color: 'var(--color-primary)' }}>100% Synced</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiClock /> Total Volunteer Hours</div>
          <span className="v-kpi-value">8,450</span>
          <span className="v-kpi-trend">+120 this month</span>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="v-filter-bar">
        <div className="v-filter-input" style={{ flex: 2 }}>
          <FiSearch color="var(--color-text-muted)" />
          <input type="text" placeholder="Search alumni..." />
        </div>
        <div className="v-filter-input">
          <select defaultValue=""><option value="" disabled>Completed Event</option></select>
        </div>
        <button className="btn btn--outline btn--sm" style={{ border: 'none' }}>Reset</button>
      </section>

      {/* Main Content */}
      <section className="v-section">
        <h2>Post-Event History & Recognition</h2>
        <div className="v-table-wrapper">
          <table className="v-table">
            <thead>
              <tr>
                <th>Volunteer Name</th>
                <th>Completed Event</th>
                <th>Completion Date</th>
                <th>Hours Earned</th>
                <th>Certificate</th>
                <th>Event Feedback</th>
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
                        {vol.hours > 200 && <span style={{ marginLeft: '8px', color: '#d4af37' }} title="Veteran Volunteer"><FiAward /></span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{vol.completedEvent}</td>
                  <td>{vol.completionDate}</td>
                  <td><span className="badge" style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>+{vol.earnedHours}H</span></td>
                  <td>
                    {vol.certificateStatus === 'Generated' ? (
                      <span className="badge badge--success"><FiFileText /> Ready</span>
                    ) : (
                      <span className="badge badge--warning">Pending</span>
                    )}
                  </td>
                  <td className="v-rating">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} style={{ color: i < vol.eventFeedbackScore ? '#f59e0b' : '#e5e7eb' }}>★</span>
                    ))}
                  </td>
                  <td>
                    <div className="v-table-actions">
                      <button className="btn btn--sm btn--outline" onClick={() => setSelectedProfile(vol)}>Profile</button>
                      <button className="btn btn--sm btn--outline" style={{ padding: '0 8px' }} title="Download Certificate" disabled={vol.certificateStatus !== 'Generated'}><FiDownload/></button>
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
