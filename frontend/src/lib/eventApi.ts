import { apiFetch } from './apiFetch'

const API_URL = import.meta.env.VITE_API_URL ?? ''

async function parseResponse(res: Response) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Terjadi kesalahan, coba lagi.')
  }
  return data
}

export type EventViewSource = 'search' | 'recommendation' | 'direct'

// Sinyal perilaku "buka event" (FR-005 behavioral boost) — dipanggil sekali
// tiap volunteer membuka detail sebuah event, lihat EventListSidebar.tsx.
// `source` dipakai organizer-side utk breakdown traffic (PublishedEventsView).
// Gagal tracking tidak boleh mengganggu UX, dipanggil fire-and-forget oleh caller.
export async function trackEventView(eventId: string, source: EventViewSource = 'direct'): Promise<void> {
  const res = await apiFetch(`${API_URL}/events/${eventId}/view`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ source }),
  })
  await parseResponse(res)
}

export async function submitEventFeedbackRequest(
  eventId: string,
  rating: number,
  comment?: string,
): Promise<void> {
  const res = await apiFetch(`${API_URL}/events/${eventId}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ rating, comment }),
  })
  await parseResponse(res)
}

export async function bookmarkEventRequest(eventId: string): Promise<void> {
  const res = await apiFetch(`${API_URL}/events/${eventId}/bookmark`, { method: 'POST', credentials: 'include' })
  await parseResponse(res)
}

export async function unbookmarkEventRequest(eventId: string): Promise<void> {
  const res = await apiFetch(`${API_URL}/events/${eventId}/bookmark`, { method: 'DELETE', credentials: 'include' })
  await parseResponse(res)
}

export async function getMyBookmarkedEventIds(): Promise<string[]> {
  const res = await apiFetch(`${API_URL}/events/bookmarks/me`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.eventIds
}
