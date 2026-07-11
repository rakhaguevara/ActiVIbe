import { useEffect, useState } from 'react'
import { FiDollarSign, FiTrendingUp, FiStar, FiZap } from 'react-icons/fi'
import { getRevenueSummary, listSubscriptions, setSubscriptionTier } from '../../lib/adminApi'
import type { RevenueSummary, AdminSubscription, SubscriptionTier } from '../../types/admin'
import '../admin/OverviewPage.css'
import './RevenuePage.css'

const TIER_LABEL: Record<SubscriptionTier, string> = {
  FREE: 'Free',
  PLUS_STARTER: 'ActiVibe Plus Starter',
  PLUS_PRO: 'ActiVibe Plus Pro',
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

export default function RevenuePage() {
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null)
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const loadData = async () => {
    const [revenueData, subscriptionData] = await Promise.all([getRevenueSummary(), listSubscriptions()])
    setRevenue(revenueData)
    setSubscriptions(subscriptionData)
  }

  useEffect(() => {
    setIsLoading(true)
    loadData()
      .catch((err) => window.alert(err instanceof Error ? err.message : 'Gagal memuat data revenue.'))
      .finally(() => setIsLoading(false))
  }, [])

  const handleChangeTier = async (userId: string, tier: SubscriptionTier) => {
    setUpdatingUserId(userId)
    try {
      await setSubscriptionTier(userId, tier)
      await loadData()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal mengubah paket.')
    } finally {
      setUpdatingUserId(null)
    }
  }

  const counts = revenue?.subscriberCounts ?? { FREE: 0, PLUS_STARTER: 0, PLUS_PRO: 0 }
  const totalAccounts = counts.FREE + counts.PLUS_STARTER + counts.PLUS_PRO
  const barPct = (n: number) => (totalAccounts > 0 ? Math.round((n / totalAccounts) * 100) : 0)

  return (
    <div className="revenue-page" style={{ padding: '24px', width: '100%', fontFamily: 'var(--font-body)' }}>
      <header className="admin-global-header">
        <h1>Revenue</h1>
        <div className="admin-breadcrumb">
          <span>Admin</span> <span className="sep">›</span> <span className="current">Revenue</span>
        </div>
      </header>

      <div className="admin-overview__kpi-row">
        <div className="admin-overview__kpi-card">
          <div className="admin-overview__kpi-header">
            <h3 className="admin-overview__kpi-title"><FiDollarSign /> Total Revenue</h3>
          </div>
          <p className="admin-overview__kpi-value">{isLoading ? '—' : formatRupiah(revenue?.totalRevenue ?? 0)}</p>
          <p className="admin-overview__kpi-subtitle">Akumulasi semua transaksi sukses</p>
        </div>

        <div className="admin-overview__kpi-card">
          <div className="admin-overview__kpi-header">
            <h3 className="admin-overview__kpi-title"><FiTrendingUp /> MRR</h3>
          </div>
          <p className="admin-overview__kpi-value">{isLoading ? '—' : formatRupiah(revenue?.mrr ?? 0)}</p>
          <p className="admin-overview__kpi-subtitle">Monthly Recurring Revenue (langganan aktif)</p>
        </div>

        <div className="admin-overview__kpi-card">
          <div className="admin-overview__kpi-header">
            <h3 className="admin-overview__kpi-title"><FiStar /> Starter Subscribers</h3>
          </div>
          <p className="admin-overview__kpi-value">{counts.PLUS_STARTER}</p>
          <p className="admin-overview__kpi-subtitle">ActiVibe Plus Starter — Rp150.000/bln</p>
        </div>

        <div className="admin-overview__kpi-card">
          <div className="admin-overview__kpi-header">
            <h3 className="admin-overview__kpi-title"><FiZap /> Pro Subscribers</h3>
          </div>
          <p className="admin-overview__kpi-value">{counts.PLUS_PRO}</p>
          <p className="admin-overview__kpi-subtitle">ActiVibe Plus Pro — Rp250.000/bln</p>
        </div>
      </div>

      <section className="card revenue-page__section">
        <h2>Sebaran Paket Akun</h2>
        <div className="revenue-page__tier-bars">
          <div className="revenue-page__tier-bar-row">
            <span className="revenue-page__tier-bar-label">Free</span>
            <div className="revenue-page__tier-bar-track">
              <div className="revenue-page__tier-bar-fill revenue-page__tier-bar-fill--free" style={{ width: `${barPct(counts.FREE)}%` }} />
            </div>
            <span className="revenue-page__tier-bar-value">{counts.FREE}</span>
          </div>
          <div className="revenue-page__tier-bar-row">
            <span className="revenue-page__tier-bar-label">Plus Starter</span>
            <div className="revenue-page__tier-bar-track">
              <div className="revenue-page__tier-bar-fill revenue-page__tier-bar-fill--starter" style={{ width: `${barPct(counts.PLUS_STARTER)}%` }} />
            </div>
            <span className="revenue-page__tier-bar-value">{counts.PLUS_STARTER}</span>
          </div>
          <div className="revenue-page__tier-bar-row">
            <span className="revenue-page__tier-bar-label">Plus Pro</span>
            <div className="revenue-page__tier-bar-track">
              <div className="revenue-page__tier-bar-fill revenue-page__tier-bar-fill--pro" style={{ width: `${barPct(counts.PLUS_PRO)}%` }} />
            </div>
            <span className="revenue-page__tier-bar-value">{counts.PLUS_PRO}</span>
          </div>
        </div>
      </section>

      <section className="card revenue-page__section">
        <h2>Transaksi Terbaru</h2>
        <div className="v-table-wrapper">
          <table className="v-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Paket</th>
                <th>Jumlah</th>
                <th>Metode</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && (revenue?.recentTransactions.length ?? 0) === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '24px' }}>Belum ada transaksi.</td></tr>
              )}
              {revenue?.recentTransactions.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{t.userName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{t.userEmail}</div>
                  </td>
                  <td>{TIER_LABEL[t.tier]}</td>
                  <td>{formatRupiah(t.amount)}</td>
                  <td>{t.method === 'admin-manual' ? 'Admin Manual' : 'Checkout (Simulasi)'}</td>
                  <td>{new Date(t.paidAt).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card revenue-page__section">
        <h2>Kelola Langganan</h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
          Ubah paket seorang user secara manual (mis. pembayaran offline di luar sistem) — dicatat sebagai transaksi "Admin Manual".
        </p>
        <div className="v-table-wrapper">
          <table className="v-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Paket Saat Ini</th>
                <th>Berlaku Sampai</th>
                <th>Ubah Paket</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '24px' }}>Belum ada user yang pernah berlangganan.</td></tr>
              )}
              {subscriptions.map((s) => (
                <tr key={s.userId}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.userName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{s.userEmail}</div>
                  </td>
                  <td>{s.userRole}</td>
                  <td>{TIER_LABEL[s.tier]}</td>
                  <td>{s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString('id-ID') : '—'}</td>
                  <td>
                    <select
                      value={s.tier}
                      disabled={updatingUserId === s.userId}
                      onChange={(e) => handleChangeTier(s.userId, e.target.value as SubscriptionTier)}
                      style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}
                    >
                      <option value="FREE">Free</option>
                      <option value="PLUS_STARTER">Plus Starter</option>
                      <option value="PLUS_PRO">Plus Pro</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
