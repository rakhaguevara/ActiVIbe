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
  sentAt: string
  sentByName: string | null
}

export interface BroadcastQuota {
  used: number
  limit: number | null
  tier: 'FREE' | 'PLUS_STARTER' | 'PLUS_PRO'
}

async function parseResponse(res: Response) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Terjadi kesalahan, coba lagi.')
  }
  return data
}

export async function listBroadcasts(): Promise<Broadcast[]> {
  const res = await apiFetch(`${API_URL}/communication/broadcast`, { credentials: 'include' })
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
