import { apiFetch } from './apiFetch'

const API_URL = import.meta.env.VITE_API_URL ?? ''

export interface Broadcast {
  id: string
  eventId: string
  eventTitle: string | null
  title: string
  message: string
  targetSegment: string
  deliveryChannel: string
  recipientCount: number
  sentAt: string
  sentByName: string | null
}

export interface BroadcastQuota {
  used: number
  limit: number | null
  tier: 'FREE' | 'PLUS_STARTER' | 'PLUS_PRO'
}

export interface MessageTemplate {
  id: string
  name: string
  category?: string
  subject?: string
  body: string
  createdByName: string | null
  createdAt: string
  updatedAt: string
}

export interface ScheduledMessage {
  id: string
  eventId: string
  eventTitle: string | null
  title: string
  message: string
  targetSegment: string
  sendAt: string
  status: 'SCHEDULED' | 'SENT' | 'CANCELLED' | 'FAILED'
  sentCommunicationLogId: string | null
  createdByName: string | null
  createdAt: string
}

async function parseResponse(res: Response) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Terjadi kesalahan, coba lagi.')
  }
  return data
}

export async function listBroadcasts(filter?: { eventId?: string; from?: string; to?: string }): Promise<Broadcast[]> {
  const params = new URLSearchParams()
  if (filter?.eventId) params.set('eventId', filter.eventId)
  if (filter?.from) params.set('from', filter.from)
  if (filter?.to) params.set('to', filter.to)
  const qs = params.toString()
  const res = await apiFetch(`${API_URL}/communication/broadcast${qs ? `?${qs}` : ''}`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.broadcasts
}

export async function getBroadcastQuota(): Promise<BroadcastQuota> {
  const res = await apiFetch(`${API_URL}/communication/broadcast/quota`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.quota
}

export async function sendBroadcast(payload: {
  eventId: string
  title: string
  message: string
  targetSegment: string
}): Promise<Broadcast> {
  const res = await apiFetch(`${API_URL}/communication/broadcast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  const data = await parseResponse(res)
  return data.broadcast
}

// ---- Message Templates (TemplatesView) ----

export async function listMessageTemplates(): Promise<MessageTemplate[]> {
  const res = await apiFetch(`${API_URL}/message-templates`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.templates
}

export async function createMessageTemplate(payload: {
  name: string
  category?: string
  subject?: string
  body: string
}): Promise<MessageTemplate> {
  const res = await apiFetch(`${API_URL}/message-templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  const data = await parseResponse(res)
  return data.template
}

export async function updateMessageTemplate(
  id: string,
  payload: { name: string; category?: string; subject?: string; body: string },
): Promise<MessageTemplate> {
  const res = await apiFetch(`${API_URL}/message-templates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  const data = await parseResponse(res)
  return data.template
}

export async function duplicateMessageTemplate(id: string): Promise<MessageTemplate> {
  const res = await apiFetch(`${API_URL}/message-templates/${id}/duplicate`, {
    method: 'POST',
    credentials: 'include',
  })
  const data = await parseResponse(res)
  return data.template
}

export async function deleteMessageTemplate(id: string): Promise<void> {
  const res = await apiFetch(`${API_URL}/message-templates/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.error?.message ?? 'Gagal menghapus template.')
  }
}

// ---- Scheduled Messages (ScheduledMessagesView) ----

export async function listScheduledMessages(): Promise<ScheduledMessage[]> {
  const res = await apiFetch(`${API_URL}/scheduled-messages`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.scheduledMessages
}

export async function createScheduledMessage(payload: {
  eventId: string
  title: string
  message: string
  targetSegment: string
  sendAt: string
}): Promise<ScheduledMessage> {
  const res = await apiFetch(`${API_URL}/scheduled-messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  const data = await parseResponse(res)
  return data.scheduledMessage
}

export async function cancelScheduledMessage(id: string): Promise<ScheduledMessage> {
  const res = await apiFetch(`${API_URL}/scheduled-messages/${id}/cancel`, {
    method: 'POST',
    credentials: 'include',
  })
  const data = await parseResponse(res)
  return data.scheduledMessage
}

export async function sendScheduledMessageNow(id: string): Promise<ScheduledMessage> {
  const res = await apiFetch(`${API_URL}/scheduled-messages/${id}/send-now`, {
    method: 'POST',
    credentials: 'include',
  })
  const data = await parseResponse(res)
  return data.scheduledMessage
}
