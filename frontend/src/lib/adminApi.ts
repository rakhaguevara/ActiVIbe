import type { AdminUser, AdminEvent, ParticipationRecord, ActivityLogEntry, PrematureClosure } from '../types/admin'
import type { RegionDistributionResponse } from '../types/region'
import { apiFetch } from './apiFetch'

const API_URL = import.meta.env.VITE_API_URL

export interface UserGrowthSeries {
  months: string[]
  volunteer: number[]
  organizer: number[]
}

export interface ParticipationSummary {
  totalActive: number
  attendancePct: number
  impactFilledPct: number
}

export interface AiInsight {
  tone: 'success' | 'warning' | 'info'
  title: string
  description: string
  actionLabel: string
}

export interface AdminOverviewStats {
  totalUsers: number
  pendingEvents: number
  approvedEvents: number
  ongoingEvents: number
  rejectedEvents: number
  recentActivity: ActivityLogEntry[]
  userGrowth: UserGrowthSeries
  participation: ParticipationSummary
  aiInsights: AiInsight[]
}

export interface AiChatMessage {
  role: 'user' | 'assistant'
  content: string
}

async function parseResponse(res: Response) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Terjadi kesalahan, coba lagi.')
  }
  return data
}

export async function getOverviewStats(): Promise<AdminOverviewStats> {
  const res = await apiFetch(`${API_URL}/admin/overview`, { credentials: 'include' })
  return parseResponse(res)
}

export async function listUsers(role?: 'VOLUNTEER' | 'ORGANIZER'): Promise<AdminUser[]> {
  const query = role ? `?role=${role}` : ''
  const res = await apiFetch(`${API_URL}/admin/users${query}`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.users
}

export async function updateUserStatus(userId: string, status: AdminUser['status']): Promise<AdminUser> {
  const res = await apiFetch(`${API_URL}/admin/users/${userId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status }),
  })
  const data = await parseResponse(res)
  return data.user
}

export async function updateUserPassword(userId: string, password: string): Promise<AdminUser> {
  const res = await apiFetch(`${API_URL}/admin/users/${userId}/password`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ password }),
  })
  const data = await parseResponse(res)
  return data.user
}

export async function deleteUser(userId: string): Promise<void> {
  const res = await apiFetch(`${API_URL}/admin/users/${userId}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.error?.message ?? 'Terjadi kesalahan, coba lagi.')
  }
}

export async function listEvents(status?: AdminEvent['status']): Promise<AdminEvent[]> {
  const query = status ? `?status=${status}` : ''
  const res = await apiFetch(`${API_URL}/admin/events${query}`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.events
}

export async function approveEvent(eventId: string, reviewNote?: string): Promise<AdminEvent> {
  const res = await apiFetch(`${API_URL}/admin/events/${eventId}/approve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ reviewNote }),
  })
  const data = await parseResponse(res)
  return data.event
}

export async function rejectEvent(eventId: string, reviewNote: string): Promise<AdminEvent> {
  const res = await apiFetch(`${API_URL}/admin/events/${eventId}/reject`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ reviewNote }),
  })
  const data = await parseResponse(res)
  return data.event
}

export async function deleteEvent(eventId: string): Promise<void> {
  const res = await apiFetch(`${API_URL}/admin/events/${eventId}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.error?.message ?? 'Terjadi kesalahan, coba lagi.')
  }
}

export async function listParticipation(from?: string, to?: string): Promise<ParticipationRecord[]> {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const query = params.toString() ? `?${params.toString()}` : ''
  const res = await apiFetch(`${API_URL}/admin/participation${query}`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.records
}

export async function listActivityLog(): Promise<ActivityLogEntry[]> {
  const res = await apiFetch(`${API_URL}/admin/activity-log`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.entries
}

export async function getRegionDistribution(): Promise<RegionDistributionResponse> {
  const res = await apiFetch(`${API_URL}/admin/overview/regions`, { credentials: 'include' })
  return parseResponse(res)
}

export async function listPrematureClosures(): Promise<PrematureClosure[]> {
  const res = await apiFetch(`${API_URL}/admin/premature-closures`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.events
}

export async function sendOrganizerWarning(eventId: string, message: string): Promise<PrematureClosure> {
  const res = await apiFetch(`${API_URL}/admin/premature-closures/${eventId}/warn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ message }),
  })
  const data = await parseResponse(res)
  return data.event
}

export async function sendAdminAiChat(messages: AiChatMessage[]): Promise<{ reply: string; aiGenerated: boolean }> {
  const res = await apiFetch(`${API_URL}/admin/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ messages }),
  })
  return parseResponse(res)
}
