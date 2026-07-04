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
