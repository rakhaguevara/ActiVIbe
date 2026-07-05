const API_URL = import.meta.env.VITE_API_URL ?? ''

export type ApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WAITLISTED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'CANCELLED_BY_ORGANIZER'
  | 'CANCELLED_BY_VOLUNTEER'

export interface ApplyPayload {
  eventId: string
  whatsapp: string
  motivation: string
  availability: string[]
}

export interface ApplicationEventSummary {
  id: string
  title: string
  location: string
  category: string
  organizerName: string
  startDate: string
  endDate: string
}

export interface ApplicationRecord {
  eventId: string
  status: ApplicationStatus
  appliedAt: string
  event: ApplicationEventSummary
}

async function parseResponse(res: Response) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Terjadi kesalahan, coba lagi.')
  }
  return data
}

export async function applyToEvent(payload: ApplyPayload): Promise<ApplicationRecord> {
  const res = await fetch(`${API_URL}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  const data = await parseResponse(res)
  return data.application
}

export async function getMyApplications(): Promise<ApplicationRecord[]> {
  const res = await fetch(`${API_URL}/applications/me`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.applications
}
