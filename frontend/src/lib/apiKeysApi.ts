import { apiFetch } from './apiFetch'

const API_URL = import.meta.env.VITE_API_URL ?? ''

async function parseResponse(res: Response) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Terjadi kesalahan, coba lagi.')
  }
  return data
}

export interface ApiKey {
  id: string
  label: string
  keyPrefix: string
  lastUsedAt?: string
  revokedAt?: string
  createdAt: string
}

// plaintextKey cuma ada di respons createApiKey — TIDAK PERNAH dikembalikan
// lagi setelahnya (backend cuma menyimpan hash-nya).
export interface CreatedApiKey extends ApiKey {
  plaintextKey: string
}

export async function listApiKeys(): Promise<ApiKey[]> {
  const res = await apiFetch(`${API_URL}/api-keys`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.apiKeys
}

export async function createApiKey(label: string): Promise<CreatedApiKey> {
  const res = await apiFetch(`${API_URL}/api-keys`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label }),
  })
  const data = await parseResponse(res)
  return data.apiKey
}

export async function revokeApiKey(id: string): Promise<ApiKey> {
  const res = await apiFetch(`${API_URL}/api-keys/${id}/revoke`, {
    method: 'POST',
    credentials: 'include',
  })
  const data = await parseResponse(res)
  return data.apiKey
}
