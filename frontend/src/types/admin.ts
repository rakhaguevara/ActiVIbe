export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'VOLUNTEER' | 'ORGANIZER'
  status: 'active' | 'suspended' | 'inactive'
  joinedAt: string
  eventsJoined: number
}

export interface AdminEvent {
  id: string
  title: string
  category?: string
  organizerName: string
  // ActiVibe Plus — organizer PLUS_STARTER/PLUS_PRO dapat prioritas review
  // (backend sudah sortir ke atas) + label "Premium" di daftar.
  organizerTier: 'FREE' | 'PLUS_STARTER' | 'PLUS_PRO'
  location: string
  quota: number
  filledSlots: number
  startDate: string
  endDate: string
  status: 'pending' | 'approved' | 'rejected'
  impactMetricTemplate: string
  createdAt: string
  approvedBy?: string
  approvedAt?: string
}

export interface ParticipationRecord {
  id: string
  userName: string
  eventTitle: string
  attended: boolean
  impactMetricLabel: string
  impactValue: number
  impactUnit: string
  date: string
}

export interface ActivityLogEntry {
  id: string
  actorName: string
  actorRole: 'ADMIN' | 'ORGANIZER' | 'VOLUNTEER'
  action: string
  targetLabel: string
  timestamp: string
}

// Event yang ditutup organizer sebelum endDate lewat (Event.closedBeforeSchedule)
// — panel review admin "Penutupan Dini", lihat admin.service.js listPrematureClosures.
export interface PrematureClosure {
  id: string
  title: string
  organizerName: string
  closedAt: string | null
  endDate: string
  participationRatePercentAtClose: number
  hasWarning: boolean
  lastWarningMessage?: string
  lastWarningAt?: string
}

// ActiVibe Plus — halaman admin "Revenue" (grup Manajemen), lihat
// admin.service.js getRevenueSummary/listSubscriptions.
export type SubscriptionTier = 'FREE' | 'PLUS_STARTER' | 'PLUS_PRO'

export interface RevenueTransaction {
  id: string
  userName: string
  userEmail: string
  userRole: 'VOLUNTEER' | 'ORGANIZER' | 'ADMIN'
  tier: SubscriptionTier
  amount: number
  method: string
  status: 'SUCCESS' | 'FAILED'
  paidAt: string
}

export interface RevenueSummary {
  totalRevenue: number
  mrr: number
  subscriberCounts: Record<SubscriptionTier, number>
  recentTransactions: RevenueTransaction[]
}

export interface AdminSubscription {
  userId: string
  userName: string
  userEmail: string
  userRole: 'VOLUNTEER' | 'ORGANIZER' | 'ADMIN'
  tier: SubscriptionTier
  status: 'ACTIVE' | 'CANCELLED'
  currentPeriodEnd: string | null
}
