import { apiFetch } from './apiFetch'

export const API_URL = import.meta.env.VITE_API_URL ?? ''

export interface TaxonomyItem {
  id: string
  name: string
  category: string
}

export type Availability = 'WEEKDAY' | 'WEEKEND' | 'BOTH'
export type Motivation = 'CAREER' | 'SOCIAL' | 'VALUES' | 'SKILL_GROWTH'
export type Gender = 'MALE' | 'FEMALE'

export interface ProfileData {
  userId: string
  bio: string | null
  location: string | null
  avatarUrl: string | null
  availability: Availability | null
  motivation: Motivation | null
  gender: Gender | null
  education: string | null
  cvUrl: string | null
  cvFileName: string | null
  interests: TaxonomyItem[]
  skills: TaxonomyItem[]
}

export interface ProfileUpdatePayload {
  interestIds?: string[]
  skillIds?: string[]
  availability?: Availability
  bio?: string
  motivation?: Motivation
  gender?: Gender
  customInterests?: string[]
  education?: string
  location?: string
}

async function parseResponse(res: Response) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Terjadi kesalahan, coba lagi.')
  }
  return data
}

export async function getInterests(): Promise<TaxonomyItem[]> {
  const res = await apiFetch(`${API_URL}/profile/interests`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.interests
}

export async function getSkills(): Promise<TaxonomyItem[]> {
  const res = await apiFetch(`${API_URL}/profile/skills`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.skills
}

export async function getMyProfile(): Promise<ProfileData> {
  const res = await apiFetch(`${API_URL}/profile/me`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.profile
}

export async function updateMyProfile(payload: ProfileUpdatePayload): Promise<ProfileData> {
  const res = await apiFetch(`${API_URL}/profile/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  const data = await parseResponse(res)
  return data.profile
}

export const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024

export async function uploadCv(file: File): Promise<ProfileData> {
  const formData = new FormData()
  formData.append('cv', file)
  const res = await apiFetch(`${API_URL}/profile/me/cv`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  const data = await parseResponse(res)
  return data.profile
}

export async function deleteCv(): Promise<ProfileData> {
  const res = await apiFetch(`${API_URL}/profile/me/cv`, { method: 'DELETE', credentials: 'include' })
  const data = await parseResponse(res)
  return data.profile
}
