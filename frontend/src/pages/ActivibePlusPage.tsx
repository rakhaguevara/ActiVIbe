import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiCheck, FiX } from 'react-icons/fi'
import Footer from '../components/Footer'
import PaymentSimulationModal from '../components/PaymentSimulationModal'
import { useAuth } from '../contexts/AuthContext'
import { getPlans, getMySubscription, type Plan, type SubscriptionTier } from '../lib/subscriptionApi'
import './ActivibePlusPage.css'

function formatRupiah(amount: number): string {
  if (amount === 0) return 'Gratis'
  return `Rp${new Intl.NumberFormat('id-ID').format(amount)}/bulan`
}

function formatLimit(value: number | null, unit: string): string {
  return value === null ? `${unit} tanpa batas` : `${value} ${unit}`
}

const ORGANIZER_FEATURE_ROWS: { label: string; get: (l: Plan['limits']) => string }[] = [
  { label: 'Buat event', get: (l) => formatLimit(l.eventsPerMonth, 'event/bulan') },
  { label: 'Sertifikat peserta', get: (l) => (l.certificateEventsPerMonth === 0 ? 'Tidak tersedia' : formatLimit(l.certificateEventsPerMonth, 'event/bulan')) },
  { label: 'AI Management Recommendation', get: (l) => (l.aiRecommendation ? 'Rekomendasi AI penuh' : 'Insight biasa') },
  { label: 'Broadcast pesan', get: (l) => formatLimit(l.broadcastPerMonth, 'x/bulan') },
  { label: 'Check-in peserta', get: (l) => (l.qrScanCheckIn ? 'Kode tiket + Scan QR' : 'Kode tiket manual') },
  { label: 'Prioritas review admin', get: (l) => (l.adminReviewPriority ? 'Diprioritaskan + label Premium' : 'Antrean normal') },
]

const VOLUNTEER_FEATURE_ROWS: { label: string; get: (l: Plan['limits']) => string }[] = [
  { label: 'Impact Passport', get: (l) => formatLimit(l.passportChapterCap, 'kegiatan tersimpan') },
  { label: 'Iklan di halaman Cari Kegiatan', get: (l) => (l.adsEnabled ? 'Tampil' : 'Tidak ada') },
]

export default function ActivibePlusPage() {
  const { user } = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('FREE')
  const [message, setMessage] = useState<string | null>(null)
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null)

  useEffect(() => {
    getPlans().then(setPlans).catch(() => {})
  }, [])

  useEffect(() => {
    if (!user) return
    getMySubscription().then((sub) => setCurrentTier(sub.tier)).catch(() => {})
  }, [user])

  const featureRows = user?.role === 'ORGANIZER' ? ORGANIZER_FEATURE_ROWS : VOLUNTEER_FEATURE_ROWS

  return (
    <main className="plus-page">
      <section className="plus-page__hero">
        <p className="plus-page__eyebrow">ActiVibe Plus</p>
        <h1 className="plus-page__title">Buka semua fitur ActiVibe — untuk organizer maupun volunteer.</h1>
        <p className="plus-page__desc">
          Satu paket langganan yang sama, manfaatnya menyesuaikan akunmu: organizer dapat kuota event &
          sertifikat lebih besar, AI Management Recommendation, broadcast tanpa batas, dan scan QR check-in;
          volunteer dapat Impact Passport tanpa batas dan bebas iklan.
        </p>
      </section>

      {message && <div className="plus-page__message">{message}</div>}

      <section className="plus-page__cards">
        {plans.map((plan) => {
          const isCurrent = plan.tier === currentTier
          return (
            <div key={plan.tier} className={`plus-page__card${plan.tier === 'PLUS_PRO' ? ' plus-page__card--highlight' : ''}`}>
              {plan.tier === 'PLUS_PRO' && <span className="plus-page__card-badge">Paling Lengkap</span>}
              <h2 className="plus-page__card-name">{plan.name}</h2>
              <p className="plus-page__card-price">{formatRupiah(plan.priceMonthly)}</p>
              <p className="plus-page__card-tagline">{plan.tagline}</p>

              <ul className="plus-page__card-features">
                {featureRows.map((row) => (
                  <li key={row.label}>
                    <FiCheck className="plus-page__card-feature-icon" /> {row.label}: <strong>{row.get(plan.limits)}</strong>
                  </li>
                ))}
              </ul>

              {!user ? (
                <Link to="/" className="btn btn--outline plus-page__card-cta">Masuk / Daftar dulu</Link>
              ) : isCurrent ? (
                <button type="button" className="btn btn--outline plus-page__card-cta" disabled>Paket Aktif</button>
              ) : plan.tier === 'FREE' ? (
                <button type="button" className="btn btn--outline plus-page__card-cta" disabled>Paket Dasar</button>
              ) : (
                <button
                  type="button"
                  className="btn btn--primary plus-page__card-cta"
                  onClick={() => setCheckoutPlan(plan)}
                >
                  Upgrade ke {plan.name}
                </button>
              )}
            </div>
          )
        })}
      </section>

      <section className="plus-page__compare">
        <h2>Perbandingan Lengkap</h2>
        <div className="plus-page__compare-table-wrapper">
          <table className="plus-page__compare-table">
            <thead>
              <tr>
                <th>Fitur</th>
                {plans.map((p) => <th key={p.tier}>{p.name}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr><td colSpan={plans.length + 1} className="plus-page__compare-section">Untuk Organizer</td></tr>
              {ORGANIZER_FEATURE_ROWS.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  {plans.map((p) => <td key={p.tier}>{row.get(p.limits)}</td>)}
                </tr>
              ))}
              <tr><td colSpan={plans.length + 1} className="plus-page__compare-section">Untuk Volunteer</td></tr>
              {VOLUNTEER_FEATURE_ROWS.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  {plans.map((p) => <td key={p.tier}>{row.get(p.limits)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="plus-page__disclaimer">
        <FiX /> Pembayaran ActiVibe Plus saat ini masih simulasi (belum terhubung payment gateway asli) — upgrade langsung aktif begitu ditekan.
      </p>

      <Footer />

      {checkoutPlan && (
        <PaymentSimulationModal
          tier={checkoutPlan.tier as Exclude<SubscriptionTier, 'FREE'>}
          planName={checkoutPlan.name}
          priceMonthly={checkoutPlan.priceMonthly}
          onClose={() => setCheckoutPlan(null)}
          onSuccess={(sub) => {
            setCurrentTier(sub.tier)
            setMessage(`Berhasil upgrade ke ${sub.plan.name}!`)
            setCheckoutPlan(null)
          }}
        />
      )}
    </main>
  )
}
