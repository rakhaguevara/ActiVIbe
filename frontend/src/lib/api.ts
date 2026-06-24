const API_URL = import.meta.env.VITE_API_URL

export interface AuthUser {
  id: string
  name: string
  email: string | null
  role: 'VOLUNTEER' | 'ORGANIZER' | 'ADMIN'
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

async function parseResponse(res: Response) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Terjadi kesalahan, coba lagi.')
  }
  return data
}

export async function registerRequest(payload: RegisterPayload): Promise<{ user: AuthUser }> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  return parseResponse(res)
}

export async function loginRequest(payload: LoginPayload): Promise<{ user: AuthUser }> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  return parseResponse(res)
}

export async function meRequest(): Promise<{ user: AuthUser }> {
  const res = await fetch(`${API_URL}/auth/me`, {
    credentials: 'include',
  })
  return parseResponse(res)
}

export async function logoutRequest(): Promise<void> {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
  await parseResponse(res)
}
