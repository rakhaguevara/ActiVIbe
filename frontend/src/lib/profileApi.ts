const API_URL = import.meta.env.VITE_API_URL

export interface TaxonomyItem {
  id: string
  name: string
  category: string
}

export type Availability = 'WEEKDAY' | 'WEEKEND' | 'BOTH'

export interface ProfileData {
  userId: string
  bio: string | null
  location: string | null
  avatarUrl: string | null
  availability: Availability | null
  interests: TaxonomyItem[]
  skills: TaxonomyItem[]
}

export interface ProfileUpdatePayload {
  interestIds?: string[]
  skillIds?: string[]
  availability?: Availability
}

async function parseResponse(res: Response) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Terjadi kesalahan, coba lagi.')
  }
  return data
}

export async function getInterests(): Promise<TaxonomyItem[]> {
  const res = await fetch(`${API_URL}/profile/interests`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.interests
}

export async function getSkills(): Promise<TaxonomyItem[]> {
  const res = await fetch(`${API_URL}/profile/skills`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.skills
}

export async function getMyProfile(): Promise<ProfileData> {
  const res = await fetch(`${API_URL}/profile/me`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.profile
}

export async function updateMyProfile(payload: ProfileUpdatePayload): Promise<ProfileData> {
  const res = await fetch(`${API_URL}/profile/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  const data = await parseResponse(res)
  return data.profile
}
