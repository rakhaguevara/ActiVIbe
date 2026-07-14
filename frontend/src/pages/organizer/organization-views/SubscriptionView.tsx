import { useEffect, useState } from 'react'
import {
  FiCheck, FiStar, FiZap,
} from 'react-icons/fi'
import {
  getMySubscription,
  getPlans,
  cancelSubscription,
  type MySubscription,
  type Plan,
  type SubscriptionTier,
  type BillingCycle,
} from '../../../lib/subscriptionApi'
import PaymentSimulationModal from '../../../components/PaymentSimulationModal'
import '../OrganizationPage.css'

function formatRupiah(amount: number): string {
  return amount === 0 ? 'Gratis' : `Rp${new Intl.NumberFormat('id-ID').format(amount)}`
}

function usageLabel(used: number, limit: number | null, unit: string) {
  return `${used} / ${limit === null ? `Unlimited` : `${limit} ${unit}`}`
}

function usagePct(used: number, limit: number | null) {
  if (limit === null) return 8
  if (limit === 0) return 100
  return Math.min(100, Math.round((used / limit) * 100))
}

export default function SubscriptionView() {
  const [subscription, setSubscription] = useState<MySubscription | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [cycle, setCycle] = useState<BillingCycle>('MONTHLY')
  const [isLoading, setIsLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null)

  const load = () => {
    setIsLoading(true)
    getMySubscription()
      .then(setSubscription)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    getPlans('ORGANIZER', cycle).then(setPlans).catch(() => {})
  }, [cycle])

  const handleCancel = async () => {
    if (!window.confirm('Batalkan langganan ActiVibe Plus? Fitur premium akan langsung nonaktif.')) return
    setBusy(true)
    try {
      await cancelSubscription()
      load()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal membatalkan langganan.')
    } finally {
      setBusy(false)
    }
  }

  if (isLoading || !subscription) {
    return <p style={{ padding: '24px', color: 'var(--color-text-muted)' }}>Memuat data langganan...</p>
  }

  const { plan, usage } = subscription
  const isFree = subscription.tier === 'FREE'
  const isPro = subscription.tier === 'PLUS_PRO'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
        <section className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {plan.name} <span className="badge badge--success" style={{ fontSize: '12px' }}>Active</span>
              </h2>
              <div style={{ color: 'var(--color-text-muted)' }}>{plan.tagline}</div>
            </div>
            {!isPro && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '4px', background: 'var(--color-bg-surface)', borderRadius: '999px', padding: '3px' }}>
                  <button
                    type="button"
                    className={`btn btn--sm ${cycle === 'MONTHLY' ? 'btn--primary' : 'btn--outline'}`}
                    style={{ borderRadius: '999px' }}
                    onClick={() => setCycle('MONTHLY')}
                  >
                    Bulanan
                  </button>
                  <button
                    type="button"
                    className={`btn btn--sm ${cycle === 'YEARLY' ? 'btn--primary' : 'btn--outline'}`}
                    style={{ borderRadius: '999px' }}
                    onClick={() => setCycle('YEARLY')}
                  >
                    Tahunan
                  </button>
                </div>
                <button
                  className="btn btn--primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  disabled={busy}
                  onClick={() => {
                    const targetTier: SubscriptionTier = isFree ? 'PLUS_STARTER' : 'PLUS_PRO'
                    const targetPlan = plans.find((p) => p.tier === targetTier)
                    if (targetPlan) setCheckoutPlan(targetPlan)
                  }}
                >
                  <FiZap /> Upgrade ke {isFree ? 'ActiVibe Plus Starter' : 'ActiVibe Plus Pro'}
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', paddingBottom: '32px', borderBottom: '1px solid var(--color-border-light)', marginBottom: '32px' }}>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Harga</div>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>
                {formatRupiah(plan.priceMonthly)}{plan.priceMonthly > 0 ? '/bulan' : ''}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Berlaku Sampai</div>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>
                {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString('id-ID') : '—'}
              </div>
              {!isFree && (
                <button className="btn btn--sm btn--outline" style={{ marginTop: '12px' }} disabled={busy} onClick={handleCancel}>
                  Batalkan Langganan
                </button>
              )}
            </div>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Pemakaian Bulan Ini</h3>

          <div className="usage-item">
            <div className="usage-item__header">
              <span>Event Dibuat</span>
              <span>{usageLabel(usage?.eventsThisMonth ?? 0, plan.limits.eventsPerMonth, 'event')}</span>
            </div>
            <div className="usage-bar">
              <div className="usage-bar__fill" style={{ width: `${usagePct(usage?.eventsThisMonth ?? 0, plan.limits.eventsPerMonth)}%` }} />
            </div>
          </div>

          <div className="usage-item">
            <div className="usage-item__header">
              <span>Event Bersertifikat</span>
              <span>{usageLabel(usage?.certificateEventsThisMonth ?? 0, plan.limits.certificateEventsPerMonth, 'event')}</span>
            </div>
            <div className="usage-bar">
              <div className="usage-bar__fill" style={{ width: `${usagePct(usage?.certificateEventsThisMonth ?? 0, plan.limits.certificateEventsPerMonth)}%` }} />
            </div>
          </div>

          <div className="usage-item">
            <div className="usage-item__header">
              <span>Broadcast Terkirim</span>
              <span>{usageLabel(usage?.broadcastsThisMonth ?? 0, plan.limits.broadcastPerMonth, 'x')}</span>
            </div>
            <div className="usage-bar">
              <div className="usage-bar__fill" style={{ width: `${usagePct(usage?.broadcastsThisMonth ?? 0, plan.limits.broadcastPerMonth)}%` }} />
            </div>
          </div>
        </section>

        <section className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Riwayat Transaksi</h2>
          <div className="v-table-wrapper">
            <table className="v-table">
              <thead>
                <tr>
                  <th>Paket</th>
                  <th>Tanggal</th>
                  <th>Jumlah</th>
                  <th>Metode</th>
                </tr>
              </thead>
              <tbody>
                {subscription.transactions.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '24px' }}>Belum ada transaksi.</td></tr>
                )}
                {subscription.transactions.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600 }}>{t.tier}</td>
                    <td>{new Date(t.paidAt).toLocaleDateString('id-ID')}</td>
                    <td>{formatRupiah(t.amount)}</td>
                    <td><span className="badge badge--success">{t.method === 'admin-manual' ? 'Admin Manual' : 'Simulasi'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div className="card" style={{ padding: '24px', background: 'linear-gradient(145deg, #f0fdf4, #ffffff)', border: '1px solid #bbf7d0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)' }}>
            <FiStar /> {plan.name}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <FiCheck color="var(--color-success)" /> {plan.limits.eventsPerMonth === null ? 'Event tanpa batas' : `${plan.limits.eventsPerMonth} event/bulan`}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <FiCheck color="var(--color-success)" /> {plan.limits.certificateEventsPerMonth === 0 ? 'Sertifikat tidak tersedia' : plan.limits.certificateEventsPerMonth === null ? 'Sertifikat tanpa batas' : `Sertifikat ${plan.limits.certificateEventsPerMonth} event/bulan`}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <FiCheck color="var(--color-success)" /> {plan.limits.aiRecommendation ? 'AI Management Recommendation' : 'Insight biasa'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <FiCheck color="var(--color-success)" /> {plan.limits.broadcastPerMonth === null ? 'Broadcast tanpa batas' : `Broadcast ${plan.limits.broadcastPerMonth}x/bulan`}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <FiCheck color="var(--color-success)" /> {plan.limits.qrScanCheckIn ? 'Check-in kode + Scan QR' : 'Check-in kode manual'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <FiCheck color="var(--color-success)" /> {plan.limits.adminReviewPriority ? 'Prioritas review admin' : 'Antrean review normal'}
            </div>
          </div>
        </div>
      </div>

      {checkoutPlan && (
        <PaymentSimulationModal
          tier={checkoutPlan.tier as Exclude<SubscriptionTier, 'FREE'>}
          audience={checkoutPlan.audience}
          billingCycle={checkoutPlan.billingCycle}
          planName={checkoutPlan.name}
          priceTotal={checkoutPlan.priceTotal}
          onClose={() => setCheckoutPlan(null)}
          onSuccess={() => {
            setCheckoutPlan(null)
            load()
          }}
        />
      )}
    </div>
  )
}
