import { apiFetch } from './apiFetch'

const API_URL = import.meta.env.VITE_API_URL ?? ''

async function parseResponse(res: Response) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Terjadi kesalahan, coba lagi.')
  }
  return data
}

export interface OrganizationSettings {
  id: string
  organizationId: string
  language: string
  country?: string
  timezone: string
  currency: string
  dateFormat: string
  timeFormat: string
  weekStart: string
  units?: string
  defaultEventDurationHours?: number
  notifyEmailNewApplicant: boolean
  notifyEmailEventReminder: boolean
  notifyEmailBroadcastReceipts: boolean
  notifyEmailWeeklyDigest: boolean
  notificationFrequency: 'INSTANT' | 'DAILY' | 'WEEKLY'
  webhookUrl?: string
  updatedAt: string
}

export async function getOrganizationSettings(): Promise<OrganizationSettings> {
  const res = await apiFetch(`${API_URL}/organization-settings`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.settings
}

export interface GeneralSettingsPayload {
  language?: string
  country?: string
  timezone?: string
  currency?: string
  dateFormat?: string
  timeFormat?: string
  weekStart?: string
  units?: string
  defaultEventDurationHours?: number | null
}

export async function updateGeneralSettings(payload: GeneralSettingsPayload): Promise<OrganizationSettings> {
  const res = await apiFetch(`${API_URL}/organization-settings/general`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await parseResponse(res)
  return data.settings
}

export interface NotificationSettingsPayload {
  notifyEmailNewApplicant?: boolean
  notifyEmailEventReminder?: boolean
  notifyEmailBroadcastReceipts?: boolean
  notifyEmailWeeklyDigest?: boolean
  notificationFrequency?: 'INSTANT' | 'DAILY' | 'WEEKLY'
}

export async function updateNotificationSettings(payload: NotificationSettingsPayload): Promise<OrganizationSettings> {
  const res = await apiFetch(`${API_URL}/organization-settings/notifications`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await parseResponse(res)
  return data.settings
}

export async function updateWebhookUrl(webhookUrl: string): Promise<OrganizationSettings> {
  const res = await apiFetch(`${API_URL}/organization-settings/webhook`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ webhookUrl }),
  })
  const data = await parseResponse(res)
  return data.settings
}
