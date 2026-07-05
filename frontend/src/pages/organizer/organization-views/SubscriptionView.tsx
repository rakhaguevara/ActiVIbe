import React from 'react'
import { 
  FiCreditCard, FiDownloadCloud, FiCheck, FiStar, FiZap
} from 'react-icons/fi'
import '../OrganizationPage.css'

export default function SubscriptionView() {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          <section className="card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Professional Plan <span className="badge badge--success" style={{ fontSize: '12px' }}>Active</span>
                </h2>
                <div style={{ color: 'var(--color-text-muted)' }}>You are currently on the Professional tier.</div>
              </div>
              <button className="btn btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiZap /> Upgrade Plan
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', paddingBottom: '32px', borderBottom: '1px solid var(--color-border-light)', marginBottom: '32px' }}>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Renewal Date</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>August 12, 2026</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>$49.00 / month</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Payment Method</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiCreditCard size={20} color="var(--color-text-muted)" />
                  <span style={{ fontSize: '16px', fontWeight: 600 }}>Visa ending in 4456</span>
                </div>
                <button className="btn btn--sm btn--outline" style={{ marginTop: '12px' }}>Manage Billing</button>
              </div>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Usage Overview</h3>
            
            <div className="usage-item">
              <div className="usage-item__header">
                <span>Events Created</span>
                <span>18 / Unlimited</span>
              </div>
              <div className="usage-bar">
                <div className="usage-bar__fill" style={{ width: '15%' }}></div>
              </div>
            </div>
            
            <div className="usage-item">
              <div className="usage-item__header">
                <span>Active Volunteers</span>
                <span>1,284 / Unlimited</span>
              </div>
              <div className="usage-bar">
                <div className="usage-bar__fill" style={{ width: '25%' }}></div>
              </div>
            </div>
            
            <div className="usage-item">
              <div className="usage-item__header">
                <span>Storage Space</span>
                <span>28 GB / 100 GB</span>
              </div>
              <div className="usage-bar">
                <div className="usage-bar__fill" style={{ width: '28%' }}></div>
              </div>
            </div>
            
            <div className="usage-item">
              <div className="usage-item__header">
                <span>AI Insights Credits</span>
                <span>6,200 / 10,000</span>
              </div>
              <div className="usage-bar">
                <div className="usage-bar__fill" style={{ width: '62%', background: '#f59e0b' }}></div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Resets on August 12, 2026</div>
            </div>
          </section>

          <section className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Billing History</h2>
            <div className="v-table-wrapper">
              <table className="v-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontFamily: 'monospace' }}>INV-2026-007</td>
                    <td>July 12, 2026</td>
                    <td>$49.00</td>
                    <td><span className="badge badge--success">Paid</span></td>
                    <td><button className="btn btn--sm btn--outline"><FiDownloadCloud /> PDF</button></td>
                  </tr>
                  <tr>
                    <td style={{ fontFamily: 'monospace' }}>INV-2026-006</td>
                    <td>June 12, 2026</td>
                    <td>$49.00</td>
                    <td><span className="badge badge--success">Paid</span></td>
                    <td><button className="btn btn--sm btn--outline"><FiDownloadCloud /> PDF</button></td>
                  </tr>
                  <tr>
                    <td style={{ fontFamily: 'monospace' }}>INV-2026-005</td>
                    <td>May 12, 2026</td>
                    <td>$49.00</td>
                    <td><span className="badge badge--success">Paid</span></td>
                    <td><button className="btn btn--sm btn--outline"><FiDownloadCloud /> PDF</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Side Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card" style={{ padding: '24px', background: 'linear-gradient(145deg, #f0fdf4, #ffffff)', border: '1px solid #bbf7d0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)' }}>
              <FiStar /> Professional Plan
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <FiCheck color="var(--color-success)" /> Unlimited Events
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <FiCheck color="var(--color-success)" /> Unlimited Volunteers
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <FiCheck color="var(--color-success)" /> 100 GB Storage
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <FiCheck color="var(--color-success)" /> 10,000 AI Credits
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <FiCheck color="var(--color-success)" /> Custom Certificate Branding
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <FiCheck color="var(--color-success)" /> Priority Support
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
