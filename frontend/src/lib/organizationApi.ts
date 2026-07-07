import type { Organization } from '../types/organization'
import { apiFetch } from './apiFetch'

const API_URL = import.meta.env.VITE_API_URL ?? ''

async function parseResponse(res: Response) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Terjadi kesalahan, coba lagi.')
  }
  return data
}

export async function listOrganizations(): Promise<Organization[]> {
  const res = await apiFetch(`${API_URL}/organizations`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.organizations
}

export async function getOrganization(id: string): Promise<Organization> {
  const res = await apiFetch(`${API_URL}/organizations/${id}`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.organization
}
