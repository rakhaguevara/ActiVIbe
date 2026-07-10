import { apiFetch } from './apiFetch'
import type { OrganizerWarning } from '../types/organizer'

const API_URL = import.meta.env.VITE_API_URL ?? ''

export interface OrganizerAiInsight {
  tone: 'success' | 'warning' | 'info'
  title: string
  description: string
  actionLabel: string
}

export interface OrganizerAiChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface OrganizerImpactMetric {
  category: string | null
  label: string
  unit: string
  value: number
}

export interface OrganizerImpactTotals {
  eventsCompleted: number
  volunteersReached: number
  contributionHours: number
  impact: OrganizerImpactMetric
}

export interface OrganizerTodayAttendance {
  expected: number
  checkedIn: number
  pct: number
}

export interface OrganizerApplicantsGrowth {
  months: string[]
  counts: number[]
}

export interface OrganizerActivityEntry {
  id: string
  action: string
  targetLabel: string
  timestamp: string
}

export interface OrganizerOverviewStats {
  activeEvents: number
  pendingApplicants: number
  acceptedVolunteers: number
  eventsNeedClosing: number
  todayAttendance: OrganizerTodayAttendance
  applicantsGrowth: OrganizerApplicantsGrowth
  recentActivity: OrganizerActivityEntry[]
  totals: OrganizerImpactTotals
  thisMonth: OrganizerImpactTotals
  warnings: OrganizerWarning[]
  aiInsights: OrganizerAiInsight[]
}

async function parseResponse(res: Response) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Terjadi kesalahan, coba lagi.')
  }
  return data
}

export async function getOrganizerOverviewStats(): Promise<OrganizerOverviewStats> {
  const res = await apiFetch(`${API_URL}/organizer/overview`, { credentials: 'include' })
  return parseResponse(res)
}

export async function sendOrganizerAiChat(messages: OrganizerAiChatMessage[]): Promise<{ reply: string; aiGenerated: boolean }> {
  const res = await apiFetch(`${API_URL}/organizer/overview/ai-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ messages }),
  })
  return parseResponse(res)
}

export async function acknowledgeOrganizerWarning(id: string): Promise<void> {
  const res = await apiFetch(`${API_URL}/organizer/warnings/${id}/acknowledge`, {
    method: 'PATCH',
    credentials: 'include',
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.error?.message ?? 'Terjadi kesalahan, coba lagi.')
  }
}
