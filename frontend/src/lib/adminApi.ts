import type { AdminUser, AdminEvent, ParticipationRecord, ActivityLogEntry } from '../types/admin'

const API_URL = import.meta.env.VITE_API_URL

export interface AdminOverviewStats {
  totalUsers: number
  pendingEvents: number
  approvedEvents: number
  ongoingEvents: number
  rejectedEvents: number
  recentActivity: ActivityLogEntry[]
}

async function parseResponse(res: Response) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Terjadi kesalahan, coba lagi.')
  }
  return data
}

export async function getOverviewStats(): Promise<AdminOverviewStats> {
  const res = await fetch(`${API_URL}/admin/overview`, { credentials: 'include' })
  return parseResponse(res)
}

export async function listUsers(role?: 'VOLUNTEER' | 'ORGANIZER'): Promise<AdminUser[]> {
  const query = role ? `?role=${role}` : ''
  const res = await fetch(`${API_URL}/admin/users${query}`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.users
}

export async function updateUserStatus(userId: string, status: AdminUser['status']): Promise<AdminUser> {
  const res = await fetch(`${API_URL}/admin/users/${userId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status }),
  })
  const data = await parseResponse(res)
  return data.user
}

export async function listEvents(status?: AdminEvent['status']): Promise<AdminEvent[]> {
  const query = status ? `?status=${status}` : ''
  const res = await fetch(`${API_URL}/admin/events${query}`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.events
}

export async function approveEvent(eventId: string, reviewNote?: string): Promise<AdminEvent> {
  const res = await fetch(`${API_URL}/admin/events/${eventId}/approve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ reviewNote }),
  })
  const data = await parseResponse(res)
  return data.event
}

export async function rejectEvent(eventId: string, reviewNote: string): Promise<AdminEvent> {
  const res = await fetch(`${API_URL}/admin/events/${eventId}/reject`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ reviewNote }),
  })
  const data = await parseResponse(res)
  return data.event
}

export async function deleteEvent(eventId: string): Promise<void> {
  const res = await fetch(`${API_URL}/admin/events/${eventId}`, {
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
  const res = await fetch(`${API_URL}/admin/participation${query}`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.records
}

export async function listActivityLog(): Promise<ActivityLogEntry[]> {
  const res = await fetch(`${API_URL}/admin/activity-log`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.entries
}
