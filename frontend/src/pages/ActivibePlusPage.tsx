import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiCheck, FiX, FiChevronLeft, FiChevronRight, FiZap } from 'react-icons/fi'
import Footer from '../components/Footer'
import PaymentSimulationModal from '../components/PaymentSimulationModal'
import { useAuth } from '../contexts/AuthContext'
import {
  getPlans,
  getMySubscription,
  type Plan,
  type SubscriptionTier,
  type SubscriptionAudience,
  type BillingCycle,
} from '../lib/subscriptionApi'
import './ActivibePlusPage.css'

function formatRupiah(amount: number): string {
  if (amount === 0) return 'Gratis'
  return `Rp${new Intl.NumberFormat('id-ID').format(amount)}`
}

function formatLimit(value: number | null, unit: string): string {
  return value === null ? `${unit} tanpa batas` : `${value} ${unit}`
}

const FEATURE_ROWS: Record<SubscriptionAudience, { label: string; get: (l: Plan['limits']) => string }[]> = {
  ORGANIZER: [
    { label: 'Buat event', get: (l) => formatLimit(l.eventsPerMonth, 'event/bulan') },
    { label: 'Sertifikat peserta', get: (l) => (l.certificateEventsPerMonth === 0 ? 'Tidak tersedia' : formatLimit(l.certificateEventsPerMonth, 'event/bulan')) },
    { label: 'AI Management Recommendation', get: (l) => (l.aiRecommendation ? 'Rekomendasi AI penuh' : 'Insight biasa') },
    { label: 'Broadcast pesan', get: (l) => formatLimit(l.broadcastPerMonth, 'x/bulan') },
    { label: 'Check-in peserta', get: (l) => (l.qrScanCheckIn ? 'Kode tiket + Scan QR' : 'Kode tiket manual') },
    { label: 'Prioritas review admin', get: (l) => (l.adminReviewPriority ? 'Diprioritaskan + label Premium' : 'Antrean normal') },
  ],
  VOLUNTEER: [
    { label: 'Impact Passport', get: (l) => formatLimit(l.passportChapterCap, 'kegiatan tersimpan') },
    { label: 'Iklan di halaman Cari Kegiatan', get: (l) => (l.adsEnabled ? 'Tampil' : 'Tidak ada') },
  ],
}

const AUDIENCE_COPY: Record<SubscriptionAudience, { title: string; desc: string }> = {
  ORGANIZER: {
    title: 'Untuk Organizer',
    desc: 'Kuota event & sertifikat lebih besar, AI Management Recommendation, broadcast tanpa batas, dan scan QR check-in.',
  },
  VOLUNTEER: {
    title: 'Untuk Volunteer',
    desc: 'Impact Passport tanpa batas dan bebas iklan di halaman Cari Kegiatan.',
  },
}

function BillingCycleToggle({ cycle, onChange }: { cycle: BillingCycle; onChange: (c: BillingCycle) => void }) {
  return (
    <div className="plus-page__cycle-toggle" role="tablist" aria-label="Siklus penagihan">
      <button
        type="button"
        role="tab"
        aria-selected={cycle === 'MONTHLY'}
        className={`plus-page__cycle-btn${cycle === 'MONTHLY' ? ' is-active' : ''}`}
        onClick={() => onChange('MONTHLY')}
      >
        Bulanan
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={cycle === 'YEARLY'}
        className={`plus-page__cycle-btn${cycle === 'YEARLY' ? ' is-active' : ''}`}
        onClick={() => onChange('YEARLY')}
      >
        Tahunan <span className="plus-page__cycle-badge">Lebih Hemat</span>
      </button>
    </div>
  )
}

/** Mobile comparison table — shows 1 plan at a time with prev/next navigation */
function MobileCompareTable({
  audience,
  plans,
  currentTier,
  currentCycle,
  onUpgrade,
  user,
}: {
  audience: SubscriptionAudience
  plans: Plan[]
  currentTier: SubscriptionTier
  currentCycle: BillingCycle
  onUpgrade: (plan: Plan) => void
  user: any
}) {
  const [col, setCol] = useState(0)
  const plan = plans[col]
  if (!plan) return null

  const rows = FEATURE_ROWS[audience]
  const isCurrent = plan.tier === currentTier && plan.billingCycle === currentCycle

  return (
    <div className="plus-compare-mobile">
      <div className="plus-compare-mobile__nav">
        <button
          className="plus-compare-mobile__arrow"
          onClick={() => setCol((c) => Math.max(0, c - 1))}
          disabled={col === 0}
          aria-label="Sebelumnya"
        >
          <FiChevronLeft />
        </button>

        <div className="plus-compare-mobile__plan-info">
          <span className="plus-compare-mobile__plan-name">{plan.name}</span>
          <span className="plus-compare-mobile__plan-price">
            {formatRupiah(plan.priceMonthly)}
            {plan.priceMonthly > 0 && '/bulan'}
          </span>
          <div className="plus-compare-mobile__dots">
            {plans.map((_, i) => (
              <button
                key={i}
                className={`plus-compare-mobile__dot${i === col ? ' plus-compare-mobile__dot--active' : ''}`}
                onClick={() => setCol(i)}
                aria-label={`Pilih plan ${plans[i].name}`}
              />
            ))}
          </div>
        </div>

        <button
          className="plus-compare-mobile__arrow"
          onClick={() => setCol((c) => Math.min(plans.length - 1, c + 1))}
          disabled={col === plans.length - 1}
          aria-label="Berikutnya"
        >
          <FiChevronRight />
        </button>
      </div>

      <div className="plus-compare-mobile__group">
        <div className="plus-compare-mobile__section-label">{AUDIENCE_COPY[audience].title}</div>
        {rows.map((row) => (
          <div key={row.label} className="plus-compare-mobile__row">
            <span className="plus-compare-mobile__feature">{row.label}</span>
            <span className="plus-compare-mobile__value">{row.get(plan.limits)}</span>
          </div>
        ))}
      </div>

      <div className="plus-compare-mobile__cta">
        {!user ? (
          <Link to="/" className="btn btn--outline plus-page__card-cta">Masuk / Daftar dulu</Link>
        ) : isCurrent ? (
          <button type="button" className="btn btn--outline plus-page__card-cta" disabled>Paket Aktif</button>
        ) : plan.tier === 'FREE' ? (
          <button type="button" className="btn btn--outline plus-page__card-cta" disabled>Paket Dasar</button>
        ) : (
          <button type="button" className="btn btn--primary plus-page__card-cta" onClick={() => onUpgrade(plan)}>
            Upgrade ke {plan.name}
          </button>
        )}
      </div>
    </div>
  )
}

function PricingSection({
  audience,
  user,
  currentTier,
  currentAudience,
  currentCycle,
  onUpgrade,
}: {
  audience: SubscriptionAudience
  user: any
  currentTier: SubscriptionTier
  currentAudience: SubscriptionAudience
  currentCycle: BillingCycle
  onUpgrade: (plan: Plan) => void
}) {
  const [cycle, setCycle] = useState<BillingCycle>('MONTHLY')
  const [plans, setPlans] = useState<Plan[]>([])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    getPlans(audience, cycle).then(setPlans).catch(() => {})
  }, [audience, cycle])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const rows = FEATURE_ROWS[audience]

  return (
    <section className="plus-page__audience-section">
      <div className="plus-page__audience-header">
        <h2>{AUDIENCE_COPY[audience].title}</h2>
        <p>{AUDIENCE_COPY[audience].desc}</p>
        <BillingCycleToggle cycle={cycle} onChange={setCycle} />
      </div>

      <div className="plus-page__cards">
        {plans.map((plan) => {
          const isCurrent = plan.tier === currentTier && currentAudience === audience && currentCycle === cycle
          return (
            <div
              key={plan.tier}
              className={`plus-page__card${plan.tier === 'PLUS_PRO' ? ' plus-page__card--highlight' : ''}`}
            >
              {plan.tier === 'PLUS_PRO' && (
                <span className="plus-page__card-badge">
                  <FiZap size={11} /> Paling Lengkap
                </span>
              )}
              <h3 className="plus-page__card-name">{plan.name}</h3>
              <p className="plus-page__card-price">
                {formatRupiah(plan.priceMonthly)}
                {plan.priceMonthly > 0 && <span className="plus-page__card-price-unit">/bulan</span>}
              </p>
              {cycle === 'YEARLY' && plan.priceTotal > 0 && (
                <p className="plus-page__card-price-total">Ditagih {formatRupiah(plan.priceTotal)}/tahun</p>
              )}
              <p className="plus-page__card-tagline">{plan.tagline}</p>

              <ul className="plus-page__card-features">
                {rows.map((row) => (
                  <li key={row.label}>
                    <FiCheck className="plus-page__card-feature-icon" />
                    <span>
                      {row.label}: <strong>{row.get(plan.limits)}</strong>
                    </span>
                  </li>
                ))}
              </ul>

              {!user ? (
                <Link to="/" className="btn btn--outline plus-page__card-cta">Masuk / Daftar dulu</Link>
              ) : isCurrent ? (
                <button type="button" className="btn btn--outline plus-page__card-cta" disabled>Paket Aktif ✓</button>
              ) : plan.tier === 'FREE' ? (
                <button type="button" className="btn btn--outline plus-page__card-cta" disabled>Paket Dasar</button>
              ) : (
                <button
                  type="button"
                  className="btn btn--primary plus-page__card-cta"
                  onClick={() => onUpgrade(plan)}
                >
                  Upgrade ke {plan.name}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="plus-page__compare">
        <h3 className="plus-page__compare-heading">Perbandingan Lengkap — {AUDIENCE_COPY[audience].title}</h3>
        {isMobile ? (
          <MobileCompareTable
            audience={audience}
            plans={plans}
            currentTier={currentTier}
            currentCycle={cycle}
            onUpgrade={onUpgrade}
            user={user}
          />
        ) : (
          <div className="plus-page__compare-table-wrapper">
            <table className="plus-page__compare-table">
              <thead>
                <tr>
                  <th>Fitur</th>
                  {plans.map((p) => (
                    <th key={p.tier} className={p.tier === 'PLUS_PRO' ? 'plus-page__compare-th--highlight' : ''}>
                      {p.name}
                      {p.tier === currentTier && currentAudience === audience && currentCycle === cycle && (
                        <span className="plus-page__compare-active-badge">Aktif</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label}>
                    <td className="plus-page__compare-feature-label">{row.label}</td>
                    {plans.map((p) => (
                      <td key={p.tier} className={p.tier === 'PLUS_PRO' ? 'plus-page__compare-td--highlight' : ''}>
                        {row.get(p.limits)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default function ActivibePlusPage() {
  const { user } = useAuth()
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('FREE')
  const [currentAudience, setCurrentAudience] = useState<SubscriptionAudience>('VOLUNTEER')
  const [currentCycle, setCurrentCycle] = useState<BillingCycle>('MONTHLY')
  const [message, setMessage] = useState<string | null>(null)
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null)

  useEffect(() => {
    if (!user) return
    getMySubscription().then((sub) => {
      setCurrentTier(sub.tier)
      setCurrentAudience(sub.audience)
      setCurrentCycle(sub.billingCycle)
    }).catch(() => {})
  }, [user])

  return (
    <main className="plus-page">
      {/* ── Hero ── */}
      <section className="plus-page__hero">
        <span className="plus-page__eyebrow">ActiVibe Plus</span>
        <h1 className="plus-page__title">Buka semua fitur ActiVibe — untuk organizer maupun volunteer.</h1>
        <p className="plus-page__desc">
          Satu akun bisa jadi organizer maupun volunteer, jadi paketnya kami pisah: organizer dapat kuota event &amp;
          sertifikat lebih besar, AI Management Recommendation, broadcast tanpa batas, dan scan QR check-in;
          volunteer dapat Impact Passport tanpa batas dan bebas iklan — pilih paket sesuai kebutuhanmu di bawah.
        </p>
      </section>

      {message && (
        <div className="plus-page__message">
          <FiCheck /> {message}
        </div>
      )}

      <PricingSection
        audience="ORGANIZER"
        user={user}
        currentTier={currentTier}
        currentAudience={currentAudience}
        currentCycle={currentCycle}
        onUpgrade={setCheckoutPlan}
      />

      <PricingSection
        audience="VOLUNTEER"
        user={user}
        currentTier={currentTier}
        currentAudience={currentAudience}
        currentCycle={currentCycle}
        onUpgrade={setCheckoutPlan}
      />

      {/* ── Disclaimer ── */}
      <p className="plus-page__disclaimer">
        <FiX size={14} />
        Pembayaran ActiVibe Plus saat ini masih simulasi (belum terhubung payment gateway asli) — upgrade langsung aktif begitu ditekan.
      </p>

      <Footer />

      {checkoutPlan && (
        <PaymentSimulationModal
          tier={checkoutPlan.tier as Exclude<SubscriptionTier, 'FREE'>}
          audience={checkoutPlan.audience}
          billingCycle={checkoutPlan.billingCycle}
          planName={checkoutPlan.name}
          priceTotal={checkoutPlan.priceTotal}
          onClose={() => setCheckoutPlan(null)}
          onSuccess={(sub) => {
            setCurrentTier(sub.tier)
            setCurrentAudience(sub.audience)
            setCurrentCycle(sub.billingCycle)
            setMessage(`Berhasil upgrade ke ${sub.plan.name}!`)
            setCheckoutPlan(null)
          }}
        />
      )}
    </main>
  )
}
