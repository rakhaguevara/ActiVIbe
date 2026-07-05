const API_URL = import.meta.env.VITE_API_URL ?? ''

async function parseResponse(res: Response) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Terjadi kesalahan, coba lagi.')
  }
  return data
}

// Sinyal perilaku "buka event" (FR-005 behavioral boost) — dipanggil sekali
// tiap volunteer membuka detail sebuah event, lihat EventListSidebar.tsx.
// Gagal tracking tidak boleh mengganggu UX, dipanggil fire-and-forget oleh caller.
export async function trackEventView(eventId: string): Promise<void> {
  const res = await fetch(`${API_URL}/events/${eventId}/view`, { method: 'POST', credentials: 'include' })
  await parseResponse(res)
}

export async function bookmarkEventRequest(eventId: string): Promise<void> {
  const res = await fetch(`${API_URL}/events/${eventId}/bookmark`, { method: 'POST', credentials: 'include' })
  await parseResponse(res)
}

export async function unbookmarkEventRequest(eventId: string): Promise<void> {
  const res = await fetch(`${API_URL}/events/${eventId}/bookmark`, { method: 'DELETE', credentials: 'include' })
  await parseResponse(res)
}

export async function getMyBookmarkedEventIds(): Promise<string[]> {
  const res = await fetch(`${API_URL}/events/bookmarks/me`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.eventIds
}
