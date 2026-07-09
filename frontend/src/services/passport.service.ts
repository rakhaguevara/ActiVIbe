// Client untuk endpoint Impact Passport (backend GET /passport/me, auth via
// httpOnly cookie — pola sama dgn recommendation.service.ts/lib/api.ts).

import { apiFetch } from '../lib/apiFetch'
import type { PassportBookChapter, PassportSkill, PassportStats } from '../components/passport-book/passportBook.types'

const API_URL = import.meta.env.VITE_API_URL ?? ''

// Bentuk mentah dari backend — chapter di sini belum punya `shareUrl`
// (dibangun di hook dari `eventId`, backend cuma tahu path relatif, bukan
// origin frontend) dan `galleryPhotos`/`heroPhotoUrl` sudah path relatif
// (`/uploads/...`) yg butuh resolveAssetUrl di hook.
export interface PassportChapterResponse extends Omit<PassportBookChapter, 'shareUrl'> {
  eventId: string
}

export interface PassportResponse {
  stats: PassportStats
  skills: PassportSkill[]
  chapters: PassportChapterResponse[]
}

export async function fetchMyPassport(): Promise<PassportResponse> {
  const res = await apiFetch(`${API_URL}/passport/me`, { credentials: 'include' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Gagal memuat Impact Passport, coba lagi.')
  }
  return data.passport as PassportResponse
}
