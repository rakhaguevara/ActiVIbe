import type { Organization } from '../types/organization'
import { apiFetch } from './apiFetch'
import { resolveAssetUrl } from './assetUrl'

const API_URL = import.meta.env.VITE_API_URL ?? ''

async function parseResponse(res: Response) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Terjadi kesalahan, coba lagi.')
  }
  return data
}

// logoUrl dari backend berupa path relatif ("/uploads/...") — perlu di-resolve
// ke origin backend (bukan origin dev server frontend), sama seperti pola
// resolveAssetUrl di EventGalleryUploader/CreateEventPage.
function resolveOrganization(org: Organization): Organization {
  return { ...org, logoUrl: org.logoUrl ? resolveAssetUrl(org.logoUrl) : org.logoUrl }
}

export async function listOrganizations(): Promise<Organization[]> {
  const res = await apiFetch(`${API_URL}/organizations`, { credentials: 'include' })
  const data = await parseResponse(res)
  return (data.organizations as Organization[]).map(resolveOrganization)
}

export async function getOrganization(id: string): Promise<Organization> {
  const res = await apiFetch(`${API_URL}/organizations/${id}`, { credentials: 'include' })
  const data = await parseResponse(res)
  return resolveOrganization(data.organization)
}

export interface OrganizationRegistrationPayload {
  name: string
  shortProfile: string
  location: string
  address?: string
  website?: string
  email: string
  phone: string
  causeAreas: string[]
}

export async function registerOrganization(payload: OrganizationRegistrationPayload): Promise<{ organizationId: string }> {
  const res = await apiFetch(`${API_URL}/organizations/register`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return parseResponse(res)
}
