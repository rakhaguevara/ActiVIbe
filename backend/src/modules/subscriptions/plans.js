// Single source of truth utk ActiVibe Plus. Beda dari revisi awal (1
// harga sama lintas role): karena 1 akun bisa jadi ORGANIZER *dan*
// VOLUNTEER, harga sekarang dipecah per audience ("dibeli sebagai" role
// apa, dipilih eksplisit di halaman pricing — BUKAN dari User.role saat
// checkout) x billing cycle (MONTHLY/YEARLY). Manfaat (LIMITS) TETAP SAMA
// lintas audience — cuma harga & label yang beda, supaya tidak ada 2 sumber
// kebenaran fitur. Semua gating (event quota, sertifikat, AI insight,
// broadcast, QR scan, prioritas admin, Impact Passport, iklan) tetap import
// LIMITS dari sini — tidak berubah.

export const TIERS = ['FREE', 'PLUS_STARTER', 'PLUS_PRO']
export const AUDIENCES = ['ORGANIZER', 'VOLUNTEER']
export const BILLING_CYCLES = ['MONTHLY', 'YEARLY']

export const PLAN_META = {
  FREE: {
    name: 'Free',
    tagline: 'Mulai jadi organizer atau volunteer di ActiVibe tanpa biaya.',
  },
  PLUS_STARTER: {
    name: 'ActiVibe Plus Starter',
    tagline: 'Kuota event & sertifikat lebih besar utk organizer yang mulai berkembang.',
  },
  PLUS_PRO: {
    name: 'ActiVibe Plus Pro',
    tagline: 'Semua fitur tanpa batas — event, sertifikat, AI, broadcast, scan QR, prioritas review.',
  },
}

// Harga per bulan (dalam Rupiah) per audience x billing cycle. Utk YEARLY,
// angka ini adalah "harga efektif per bulan" (dipakai jg utk label
// "Rp.../bulan, ditagih tahunan") — total yg beneran ditagih di checkout()
// adalah angka ini × 12 (lihat getBillingAmount di bawah). Organizer sengaja
// jauh lebih mahal dari volunteer (skala manfaat: kuota event/sertifikat
// org, bukan cuma Impact Passport) — dikonfirmasi user. Yearly SENGAJA
// dipatok murah rata (sama nominal lintas audience) sbg insentif komit
// tahunan, bukan proporsional dari harga monthly masing2 audience.
export const PRICING = {
  ORGANIZER: {
    PLUS_STARTER: { MONTHLY: 1500000, YEARLY: 100000 },
    PLUS_PRO: { MONTHLY: 2500000, YEARLY: 150000 },
  },
  VOLUNTEER: {
    PLUS_STARTER: { MONTHLY: 150000, YEARLY: 100000 },
    PLUS_PRO: { MONTHLY: 250000, YEARLY: 150000 },
  },
}

// Infinity = tanpa batas (unlimited) — diserialisasi jadi `null` di response
// API (lihat serializeLimits di subscription.service.js) supaya frontend
// tidak perlu tahu soal Infinity. Identik lintas audience — beda role cuma
// beda label fitur di frontend (ORGANIZER_FEATURE_ROWS/VOLUNTEER_FEATURE_ROWS
// di ActivibePlusPage.tsx), bukan beda angka.
export const LIMITS = {
  FREE: {
    eventsPerMonth: 4,
    certificateEventsPerMonth: 0,
    broadcastPerMonth: 1,
    passportChapterCap: 2,
    aiRecommendation: false,
    qrScanCheckIn: false,
    adminReviewPriority: false,
    adsEnabled: true,
  },
  PLUS_STARTER: {
    eventsPerMonth: 10,
    certificateEventsPerMonth: 2,
    broadcastPerMonth: 1,
    passportChapterCap: 5,
    aiRecommendation: false,
    qrScanCheckIn: false,
    adminReviewPriority: false,
    adsEnabled: true,
  },
  PLUS_PRO: {
    eventsPerMonth: Infinity,
    certificateEventsPerMonth: Infinity,
    broadcastPerMonth: Infinity,
    passportChapterCap: Infinity,
    aiRecommendation: true,
    qrScanCheckIn: true,
    adminReviewPriority: true,
    adsEnabled: false,
  },
}

export function isPaidTier(tier) {
  return tier === 'PLUS_STARTER' || tier === 'PLUS_PRO'
}

// Harga "per bulan" utk ditampilkan (efektif, sudah didiskon kalau YEARLY).
export function getMonthlyPrice(tier, audience, cycle) {
  if (!isPaidTier(tier)) return 0
  return PRICING[audience][tier][cycle]
}

// Total yg beneran ditagih sekali checkout — MONTHLY: sama dgn harga/bulan;
// YEARLY: harga/bulan × 12 (ditagih di muka utk 1 tahun).
export function getBillingAmount(tier, audience, cycle) {
  const monthly = getMonthlyPrice(tier, audience, cycle)
  return cycle === 'YEARLY' ? monthly * 12 : monthly
}

export function startOfCurrentMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}
