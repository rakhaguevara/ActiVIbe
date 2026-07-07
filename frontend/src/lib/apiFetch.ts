import { getSessionSlot } from './sessionSlot'

const API_URL = import.meta.env.VITE_API_URL ?? ''

// Access token cuma hidup 15 menit (lihat backend ACCESS_COOKIE_MAX_AGE) —
// tanpa ini, sesi organizer mati diam-diam di tengah pengisian form panjang
// (mis. CreateEventPage dgn upload dokumen) dan semua request berikutnya 401
// sampai user login ulang manual. Dedupe supaya beberapa request yang 401
// bersamaan cuma memicu satu panggilan /auth/refresh, bukan satu per request.
let refreshPromise: Promise<boolean> | null = null

async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-Session-Slot': getSessionSlot() },
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

function isAuthEndpoint(input: RequestInfo | URL): boolean {
  const url = typeof input === 'string' ? input : input.toString()
  return url.includes('/auth/')
}

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  headers.set('X-Session-Slot', getSessionSlot())
  const request: RequestInit = { ...init, headers }

  const res = await fetch(input, request)
  if (res.status !== 401 || isAuthEndpoint(input)) {
    return res
  }

  // Retry SEKALI setelah refresh berhasil — kalau refresh juga gagal (refresh
  // token invalid/kadaluarsa/sudah dipakai), balikin 401 asli apa adanya
  // supaya pemanggil (parseResponse di masing-masing lib/*Api.ts) tetap
  // menampilkan error seperti biasa, bukan retry tanpa henti.
  const refreshed = await refreshSession()
  if (!refreshed) {
    return res
  }
  return fetch(input, request)
}
