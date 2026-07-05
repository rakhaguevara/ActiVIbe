import React from 'react'
import { 
  FiSend, FiUsers, FiClock, FiCheckCircle, FiXCircle, FiMoreVertical, 
  FiBold, FiItalic, FiUnderline, FiLink, FiList, FiPaperclip
} from 'react-icons/fi'
import '../CommunicationPage.css'

export default function BroadcastView() {
  return (
    <>
      {/* KPI Cards */}
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__value" style={{ fontSize: '20px' }}>248</div>
          <div className="stat-card__label">Total Broadcasts</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-soft)' }}><FiSend /></div>
          <div className="stat-card__value" style={{ fontSize: '20px' }}>12</div>
          <div className="stat-card__label">Sent Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-warning)', background: '#fffbeb' }}><FiClock /></div>
          <div className="stat-card__value" style={{ fontSize: '20px' }}>8</div>
          <div className="stat-card__label">Scheduled</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-success)', background: '#f0fdf4' }}><FiCheckCircle /></div>
          <div className="stat-card__value" style={{ fontSize: '20px' }}>98%</div>
          <div className="stat-card__label">Delivery Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value" style={{ fontSize: '20px' }}>87%</div>
          <div className="stat-card__label">Open Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-danger)', background: '#fef2f2' }}><FiXCircle /></div>
          <div className="stat-card__value" style={{ fontSize: '20px' }}>3</div>
          <div className="stat-card__label">Failed Deliveries</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Broadcast Composer */}
        <section className="comm-composer">
          <div className="comm-composer__header">
            <span>Compose Broadcast</span>
            <button className="btn btn--sm btn--outline" style={{ border: 'none', color: 'var(--color-primary)' }}>Use Template</button>
          </div>
          <div className="comm-composer__body">
            <div className="v-filter-input" style={{ width: '100%' }}>
              <input type="text" placeholder="Broadcast Title (e.g. Schedule Update)" style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontWeight: 600 }} />
            </div>

            <div>
              <div className="comm-composer__toolbar">
                <button className="comm-composer__btn" title="Bold"><FiBold /></button>
                <button className="comm-composer__btn" title="Italic"><FiItalic /></button>
                <button className="comm-composer__btn" title="Underline"><FiUnderline /></button>
                <div style={{ width: '1px', background: 'var(--color-border-light)', margin: '0 8px' }} />
                <button className="comm-composer__btn" title="List"><FiList /></button>
                <button className="comm-composer__btn" title="Link"><FiLink /></button>
                <button className="comm-composer__btn" title="Attachment"><FiPaperclip /></button>
              </div>
              <textarea 
                className="comm-composer__textarea" 
                placeholder="Write your message here... You can use variables like {{VolunteerName}}"
              ></textarea>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Target Event</label>
                <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}>
                  <option>Beach Cleanup</option>
                  <option>Education Camp</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Target Roles</label>
                <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}>
                  <option>All Accepted Volunteers</option>
                  <option>Logistics Only</option>
                  <option>Medical Only</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Delivery Method</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}><input type="checkbox" defaultChecked /> Email</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}><input type="checkbox" defaultChecked /> Push Notification</label>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Schedule</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}><input type="radio" name="sched" defaultChecked /> Send Now</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}><input type="radio" name="sched" /> Schedule Later</label>
                </div>
              </div>
            </div>
          </div>
          <div className="comm-composer__footer">
            <button className="btn btn--outline">Save Draft</button>
            <button className="btn btn--outline">Preview</button>
            <button className="btn btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiSend /> Send Broadcast</button>
          </div>
        </section>

        {/* Side Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiUsers color="var(--color-primary)" /> Audience Summary
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Recipients</div>
                <div style={{ fontSize: '24px', fontWeight: 700 }}>245 <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--color-text-muted)' }}>Volunteers</span></div>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Expected Delivery</span>
                <strong style={{ color: 'var(--color-success)' }}>Immediately</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Estimated Read Rate</span>
                <strong>91%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Broadcasts Table */}
      <section className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Recent Broadcasts</h2>
        <div className="v-table-wrapper">
          <table className="v-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Target Event</th>
                <th>Status</th>
                <th>Recipients</th>
                <th>Sent By</th>
                <th>Sent Time</th>
                <th>Open Rate</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>Schedule Updated</td>
                <td>Beach Cleanup</td>
                <td><span className="badge badge--success">Delivered</span></td>
                <td>125</td>
                <td>Emma</td>
                <td>09:30 AM</td>
                <td><strong>92%</strong></td>
                <td><button className="btn btn--sm btn--outline" style={{ padding: '0 8px' }}><FiMoreVertical/></button></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Equipment Reminder</td>
                <td>Education Camp</td>
                <td><span className="badge badge--success">Delivered</span></td>
                <td>82</td>
                <td>Noah</td>
                <td>Yesterday</td>
                <td><strong>88%</strong></td>
                <td><button className="btn btn--sm btn--outline" style={{ padding: '0 8px' }}><FiMoreVertical/></button></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Volunteer Confirmation</td>
                <td>Blood Donation</td>
                <td><span className="badge badge--warning">Scheduled</span></td>
                <td>240</td>
                <td>Sophia</td>
                <td>Tomorrow</td>
                <td style={{ color: 'var(--color-text-muted)' }}>—</td>
                <td><button className="btn btn--sm btn--outline" style={{ padding: '0 8px' }}><FiMoreVertical/></button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
