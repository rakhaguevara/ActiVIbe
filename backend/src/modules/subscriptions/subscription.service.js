import { prisma } from '../../config/prisma.js'
import { AppError } from '../../utils/AppError.js'
import { PLANS, LIMITS, TIERS, isPaidTier, startOfCurrentMonth } from './plans.js'

const SUBSCRIPTION_PERIOD_DAYS = 30

function serializeLimits(tier) {
  const limits = LIMITS[tier]
  const serialized = {}
  for (const [key, value] of Object.entries(limits)) {
    serialized[key] = value === Infinity ? null : value
  }
  return serialized
}

export function serializePlans() {
  return TIERS.map((tier) => ({ ...PLANS[tier], limits: serializeLimits(tier) }))
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

  return {
    tier,
    status: subscription?.status ?? 'ACTIVE',
    currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
    cancelledAt: subscription?.cancelledAt ?? null,
    plan: { ...PLANS[tier], limits: serializeLimits(tier) },
    usage,
    transactions: (subscription?.transactions ?? []).map((t) => ({
      id: t.id,
      tier: t.tier,
      amount: t.amount,
      status: t.status,
      method: t.method,
      paidAt: t.paidAt,
    })),
  }
}

async function activateSubscription(userId, tier, method) {
  const currentPeriodEnd = new Date(Date.now() + SUBSCRIPTION_PERIOD_DAYS * 24 * 60 * 60 * 1000)

  const subscription = await prisma.subscription.upsert({
    where: { userId },
    update: { tier, status: 'ACTIVE', currentPeriodEnd, cancelledAt: null },
    create: { userId, tier, status: 'ACTIVE', currentPeriodEnd },
  })

  await prisma.transaction.create({
    data: {
      subscriptionId: subscription.id,
      userId,
      tier,
      amount: method === 'admin-manual' ? 0 : PLANS[tier].priceMonthly,
      status: 'SUCCESS',
      method,
    },
  })

  return getMySubscription(userId)
}

// Mock checkout — TIDAK ADA payment gateway asli, tier langsung aktif
// (simulasi) begitu dipanggil. Dicatat sbg Transaction method 'simulasi'
// supaya tetap muncul di halaman Admin Revenue.
export async function checkout(userId, tier) {
  if (!isPaidTier(tier)) {
    throw new AppError(400, 'Paket tidak valid untuk checkout')
  }
  return activateSubscription(userId, tier, 'simulasi')
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
// transaksi uang beneran, cuma pencatatan aksi admin).
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
  return activateSubscription(userId, tier, 'admin-manual')
}
