import { apiFetch } from './apiFetch'

const API_URL = import.meta.env.VITE_API_URL ?? ''

export type SubscriptionTier = 'FREE' | 'PLUS_STARTER' | 'PLUS_PRO'

export interface PlanLimits {
  eventsPerMonth: number | null
  certificateEventsPerMonth: number | null
  broadcastPerMonth: number | null
  passportChapterCap: number | null
  aiRecommendation: boolean
  qrScanCheckIn: boolean
  adminReviewPriority: boolean
  adsEnabled: boolean
}

export interface Plan {
  tier: SubscriptionTier
  name: string
  priceMonthly: number
  tagline: string
  limits: PlanLimits
}

export interface SubscriptionTransaction {
  id: string
  tier: SubscriptionTier
  amount: number
  status: 'SUCCESS' | 'FAILED'
  method: string
  paidAt: string
}

export interface SubscriptionUsage {
  eventsThisMonth: number
  certificateEventsThisMonth: number
  broadcastsThisMonth: number
}

export interface MySubscription {
  tier: SubscriptionTier
  status: 'ACTIVE' | 'CANCELLED'
  currentPeriodEnd: string | null
  cancelledAt: string | null
  plan: Plan
  /** Cuma terisi utk akun ORGANIZER (lihat subscription.service.js getMySubscription) */
  usage: SubscriptionUsage | null
  transactions: SubscriptionTransaction[]
}

async function parseResponse(res: Response) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Terjadi kesalahan, coba lagi.')
  }
  return data
}

export async function getPlans(): Promise<Plan[]> {
  const res = await fetch(`${API_URL}/subscriptions/plans`)
  const data = await parseResponse(res)
  return data.plans
}

export async function getMySubscription(): Promise<MySubscription> {
  const res = await apiFetch(`${API_URL}/subscriptions/me`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.subscription
}

export async function checkoutSubscription(tier: 'PLUS_STARTER' | 'PLUS_PRO'): Promise<MySubscription> {
  const res = await apiFetch(`${API_URL}/subscriptions/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ tier }),
  })
  const data = await parseResponse(res)
  return data.subscription
}

export async function cancelSubscription(): Promise<MySubscription> {
  const res = await apiFetch(`${API_URL}/subscriptions/cancel`, { method: 'POST', credentials: 'include' })
  const data = await parseResponse(res)
  return data.subscription
}
