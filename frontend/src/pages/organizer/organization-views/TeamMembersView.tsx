import React from 'react'
import { 
  FiUsers, FiUserPlus, FiMoreVertical, FiShield, FiBriefcase, FiUserCheck
} from 'react-icons/fi'
import '../OrganizationPage.css'

export default function TeamMembersView() {
  return (
    <>
      {/* KPI Cards */}
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon"><FiUsers /></div>
          <div className="stat-card__value">12</div>
          <div className="stat-card__label">Total Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-soft)' }}><FiShield /></div>
          <div className="stat-card__value">1</div>
          <div className="stat-card__label">Owners</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-warning)', background: '#fffbeb' }}><FiBriefcase /></div>
          <div className="stat-card__value">3</div>
          <div className="stat-card__label">Administrators</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-success)', background: '#f0fdf4' }}><FiUserCheck /></div>
          <div className="stat-card__value">8</div>
          <div className="stat-card__label">Coordinators</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          <section className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Team Members</h2>
              <button className="btn btn--primary btn--sm" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiUserPlus /> Invite Member
              </button>
            </div>
            
            <div className="v-table-wrapper">
              <table className="v-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Last Active</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)' }}>EJ</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>Emma Johnson</div>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>emma@greenearth.org</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge--primary">Owner</span></td>
                    <td>Executive</td>
                    <td>Today, 10:30</td>
                    <td><span className="badge badge--success">Active</span></td>
                    <td><button className="btn btn--sm btn--outline" style={{ padding: '0 8px' }}><FiMoreVertical /></button></td>
                  </tr>
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#8b5cf6' }}>NS</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>Noah Smith</div>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>noah@greenearth.org</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge" style={{ background: '#fffbeb', color: '#d97706' }}>Administrator</span></td>
                    <td>Operations</td>
                    <td>Yesterday</td>
                    <td><span className="badge badge--success">Active</span></td>
                    <td><button className="btn btn--sm btn--outline" style={{ padding: '0 8px' }}><FiMoreVertical /></button></td>
                  </tr>
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#0369a1' }}>SL</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>Sophia Lee</div>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>sophia@greenearth.org</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge" style={{ background: '#f0fdf4', color: '#15803d' }}>Coordinator</span></td>
                    <td>Volunteer Comm.</td>
                    <td>Today, 09:15</td>
                    <td><span className="badge badge--success">Active</span></td>
                    <td><button className="btn btn--sm btn--outline" style={{ padding: '0 8px' }}><FiMoreVertical /></button></td>
                  </tr>
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#c2410c' }}>MT</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>Michael Tan</div>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>michael@greenearth.org</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge" style={{ background: '#f0fdf4', color: '#15803d' }}>Coordinator</span></td>
                    <td>Program Mgmt</td>
                    <td>3 Hours Ago</td>
                    <td><span className="badge badge--success">Active</span></td>
                    <td><button className="btn btn--sm btn--outline" style={{ padding: '0 8px' }}><FiMoreVertical /></button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Side Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Role Permissions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Owner</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Full access to all modules, billing, and team management.</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Administrator</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Can manage events, volunteers, and reports. Cannot access billing.</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Coordinator</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Can only view and manage specific assigned events.</div>
              </div>
            </div>
            <button className="btn btn--outline btn--sm" style={{ width: '100%', marginTop: '16px' }}>Manage Roles</button>
          </div>
        </div>
      </div>
    </>
  )
}
