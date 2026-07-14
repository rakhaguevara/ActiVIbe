import { prisma } from '../../config/prisma.js'
import { AppError } from '../../utils/AppError.js'
import {
  PLAN_META,
  LIMITS,
  TIERS,
  AUDIENCES,
  BILLING_CYCLES,
  isPaidTier,
  getMonthlyPrice,
  getBillingAmount,
  startOfCurrentMonth,
} from './plans.js'

function serializeLimits(tier) {
  const limits = LIMITS[tier]
  const serialized = {}
  for (const [key, value] of Object.entries(limits)) {
    serialized[key] = value === Infinity ? null : value
  }
  return serialized
}

function serializePlan(tier, audience, cycle) {
  return {
    tier,
    name: PLAN_META[tier].name,
    tagline: PLAN_META[tier].tagline,
    audience,
    billingCycle: cycle,
    priceMonthly: getMonthlyPrice(tier, audience, cycle),
    priceTotal: getBillingAmount(tier, audience, cycle),
    limits: serializeLimits(tier),
  }
}

// Katalog publik halaman pricing — audience/cycle dipilih eksplisit di UI
// (section Organizer/Volunteer x toggle Monthly/Yearly), bukan dari
// User.role, supaya konsisten dgn checkout() di bawah.
export function serializePlans(audience, cycle) {
  return TIERS.map((tier) => serializePlan(tier, audience, cycle))
}

function isExpired(subscription) {
  return Boolean(subscription.currentPeriodEnd && subscription.currentPeriodEnd < new Date())
}

// Dipakai lintas modul (event, passport, organizerOverview, communication,
// admin) utk resolve tier efektif seorang User. TIDAK ADA baris Subscription,
// status CANCELLED, atau currentPeriodEnd sudah lewat -> dianggap FREE (lazy
// expiry, tidak butuh cron job terpisah).
export async function getUserTier(userId) {
  const subscription = await prisma.subscription.findUnique({ where: { userId } })
  if (!subscription) return 'FREE'
  if (subscription.status === 'CANCELLED') return 'FREE'
  if (isExpired(subscription)) return 'FREE'
  return subscription.tier
}

// Batch variant utk daftar (mis. admin.service.js listEvents prioritas review)
// — hindari N+1 query getUserTier() per baris. Return Map<userId, tier>,
// userId yang tidak ada baris Subscription otomatis FREE (lihat getUserTier).
export async function getUserTiers(userIds) {
  const uniqueIds = [...new Set(userIds)]
  if (uniqueIds.length === 0) return new Map()

  const subscriptions = await prisma.subscription.findMany({ where: { userId: { in: uniqueIds } } })
  const now = new Date()
  const map = new Map(uniqueIds.map((id) => [id, 'FREE']))
  for (const sub of subscriptions) {
    if (sub.status !== 'CANCELLED' && !(sub.currentPeriodEnd && sub.currentPeriodEnd < now)) {
      map.set(sub.userId, sub.tier)
    }
  }
  return map
}

// Pemakaian kuota bulan berjalan — dihitung ulang dari sumber data asli
// (Event/Certificate/CommunicationLog, query sama persis dgn gating di
// event.service.js/communication.service.js) supaya angka usage bar di
// SubscriptionView.tsx tidak pernah drift dari enforcement asli.
async function getOrganizerUsage(userId) {
  const start = startOfCurrentMonth()
  const [eventsThisMonth, certEvents, broadcastsThisMonth] = await Promise.all([
    prisma.event.count({ where: { organizerId: userId, status: { not: 'DRAFT' }, createdAt: { gte: start } } }),
    prisma.certificate.findMany({
      where: { event: { organizerId: userId }, issuedAt: { gte: start } },
      distinct: ['eventId'],
      select: { eventId: true },
    }),
    prisma.communicationLog.count({ where: { sentById: userId, sentAt: { gte: start } } }),
  ])
  return { eventsThisMonth, certificateEventsThisMonth: certEvents.length, broadcastsThisMonth }
}

export async function getMySubscription(userId, role) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: { transactions: { orderBy: { paidAt: 'desc' }, take: 12 } },
  })

  const tier = !subscription || subscription.status === 'CANCELLED' || isExpired(subscription) ? 'FREE' : subscription.tier
  const usage = role === 'ORGANIZER' ? await getOrganizerUsage(userId) : null

  // Audience/cycle dari baris Subscription (dipilih saat checkout) kalau ada
  // langganan berbayar; kalau FREE (belum pernah checkout), tebak audience
  // dari role akun saat ini murni utk keperluan tampilan (harga FREE = 0 di
  // audience manapun, jadi tidak memengaruhi angka).
  const audience = subscription?.audience ?? (role === 'ORGANIZER' ? 'ORGANIZER' : 'VOLUNTEER')
  const billingCycle = subscription?.billingCycle ?? 'MONTHLY'

  return {
    tier,
    audience,
    billingCycle,
    status: subscription?.status ?? 'ACTIVE',
    currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
    cancelledAt: subscription?.cancelledAt ?? null,
    plan: serializePlan(tier, audience, billingCycle),
    usage,
    transactions: (subscription?.transactions ?? []).map((t) => ({
      id: t.id,
      tier: t.tier,
      audience: t.audience,
      billingCycle: t.billingCycle,
      amount: t.amount,
      status: t.status,
      method: t.method,
      paidAt: t.paidAt,
    })),
  }
}

const BILLING_PERIOD_DAYS = { MONTHLY: 30, YEARLY: 365 }

async function activateSubscription(userId, tier, audience, cycle, method) {
  const periodDays = BILLING_PERIOD_DAYS[cycle]
  const currentPeriodEnd = new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000)
  const amount = method === 'admin-manual' ? 0 : getBillingAmount(tier, audience, cycle)

  const subscription = await prisma.subscription.upsert({
    where: { userId },
    update: { tier, audience, billingCycle: cycle, status: 'ACTIVE', currentPeriodEnd, cancelledAt: null },
    create: { userId, tier, audience, billingCycle: cycle, status: 'ACTIVE', currentPeriodEnd },
  })

  await prisma.transaction.create({
    data: {
      subscriptionId: subscription.id,
      userId,
      tier,
      audience,
      billingCycle: cycle,
      amount,
      status: 'SUCCESS',
      method,
    },
  })

  return getMySubscription(userId)
}

// Mock checkout — TIDAK ADA payment gateway asli, tier langsung aktif
// (simulasi) begitu dipanggil. audience = "dibeli sebagai" role apa (dipilih
// eksplisit di halaman pricing, lihat plans.js) — ikut menentukan harga.
// Dicatat sbg Transaction method 'simulasi' supaya tetap muncul di halaman
// Admin Revenue.
export async function checkout(userId, tier, audience, cycle) {
  if (!isPaidTier(tier)) {
    throw new AppError(400, 'Paket tidak valid untuk checkout')
  }
  if (!AUDIENCES.includes(audience)) {
    throw new AppError(400, 'Audience tidak valid untuk checkout')
  }
  if (!BILLING_CYCLES.includes(cycle)) {
    throw new AppError(400, 'Siklus penagihan tidak valid untuk checkout')
  }
  return activateSubscription(userId, tier, audience, cycle, 'simulasi')
}

export async function cancel(userId) {
  const subscription = await prisma.subscription.findUnique({ where: { userId } })
  if (!subscription || subscription.status === 'CANCELLED') {
    throw new AppError(400, 'Tidak ada langganan aktif untuk dibatalkan')
  }
  await prisma.subscription.update({
    where: { userId },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
  })
  return getMySubscription(userId)
}

// Dipakai halaman Admin Revenue sbg jalur "approve manual" (fallback dari
// mock checkout self-serve) — method 'admin-manual', amount 0 (bukan
// transaksi uang beneran, cuma pencatatan aksi admin). Audience diambil dari
// role akun target (bukan pilihan admin) krn tidak ada UI utk itu di sana.
export async function adminSetTier(userId, tier) {
  if (!TIERS.includes(tier)) {
    throw new AppError(400, 'Tier tidak valid')
  }
  if (tier === 'FREE') {
    await prisma.subscription.upsert({
      where: { userId },
      update: { status: 'CANCELLED', cancelledAt: new Date() },
      create: { userId, tier: 'FREE', status: 'CANCELLED', cancelledAt: new Date() },
    })
    return getMySubscription(userId)
  }
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
  const audience = user?.role === 'ORGANIZER' ? 'ORGANIZER' : 'VOLUNTEER'
  return activateSubscription(userId, tier, audience, 'MONTHLY', 'admin-manual')
}
