// Single source of truth utk ActiVibe Plus — satu produk/harga sama utk akun
// ORGANIZER maupun VOLUNTEER (manfaat menyesuaikan role, lihat komentar di
// masing2 field LIMITS). Semua gating (event quota, sertifikat, AI insight,
// broadcast, QR scan, prioritas admin, Impact Passport, iklan) import angka
// dari sini — supaya tidak ada duplikasi angka yang bisa drift antara backend
// enforcement dan halaman pricing frontend.

export const TIERS = ['FREE', 'PLUS_STARTER', 'PLUS_PRO']

export const PLANS = {
  FREE: {
    tier: 'FREE',
    name: 'Free',
    priceMonthly: 0,
    tagline: 'Mulai jadi organizer atau volunteer di ActiVibe tanpa biaya.',
  },
  PLUS_STARTER: {
    tier: 'PLUS_STARTER',
    name: 'ActiVibe Plus Starter',
    priceMonthly: 150000,
    tagline: 'Kuota event & sertifikat lebih besar utk organizer yang mulai berkembang.',
  },
  PLUS_PRO: {
    tier: 'PLUS_PRO',
    name: 'ActiVibe Plus Pro',
    priceMonthly: 250000,
    tagline: 'Semua fitur tanpa batas — event, sertifikat, AI, broadcast, scan QR, prioritas review.',
  },
}

// Infinity = tanpa batas (unlimited) — diserialisasi jadi `null` di response
// API (lihat serializeLimits di subscription.service.js) supaya frontend
// tidak perlu tahu soal Infinity.
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

export function startOfCurrentMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}
