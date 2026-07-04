import type { Applicant, ApplicantStatus, EventRequirement, EventRole, OrganizerEvent } from '../types/organizer'

const API_URL = import.meta.env.VITE_API_URL ?? ''

export interface CreateEventShiftPayload {
  shiftDate: string
  startTime: string
  endTime: string
  quota: number
  locationPoint: string
}

export interface CreateEventRolePayload {
  roleName: string
  roleDescription: string
  maxVolunteers: number
  shifts: CreateEventShiftPayload[]
}

export interface CreateEventPayload {
  title: string
  description: string
  location: string
  quota: number
  startDate: string
  endDate: string
  status: 'draft' | 'pending_approval'
  impactMetricLabel: string
  impactMetricUnit: string
  roles: CreateEventRolePayload[]
}

export interface CloseEventPayload {
  finalStatuses: Record<string, ApplicantStatus>
  impactValue: number
}

async function parseResponse(res: Response) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Terjadi kesalahan, coba lagi.')
  }
  return data
}

export async function createEventRequest(payload: CreateEventPayload): Promise<OrganizerEvent> {
  const res = await fetch(`${API_URL}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  const data = await parseResponse(res)
  return data.event
}

export async function listMyEventsRequest(): Promise<OrganizerEvent[]> {
  const res = await fetch(`${API_URL}/events/mine`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.events
}

export async function getEventRequest(eventId: string): Promise<OrganizerEvent> {
  const res = await fetch(`${API_URL}/events/${eventId}`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.event
}

export async function addRoleRequest(eventId: string, payload: CreateEventRolePayload): Promise<EventRole> {
  const res = await fetch(`${API_URL}/events/${eventId}/roles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  const data = await parseResponse(res)
  return data.role
}

export async function addRequirementRequest(
  eventId: string,
  payload: { title: string; type: EventRequirement['type']; isMandatory: boolean },
): Promise<EventRequirement> {
  const res = await fetch(`${API_URL}/events/${eventId}/requirements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  const data = await parseResponse(res)
  return data.requirement
}

export async function closeEventRequest(eventId: string, payload: CloseEventPayload): Promise<OrganizerEvent> {
  const res = await fetch(`${API_URL}/events/${eventId}/close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  const data = await parseResponse(res)
  return data.event
}

export async function listApplicantsRequest(eventId: string): Promise<Applicant[]> {
  const res = await fetch(`${API_URL}/applications/event/${eventId}`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.applicants
}

export async function updateApplicantStatusRequest(applicationId: string, status: ApplicantStatus): Promise<Applicant> {
  const res = await fetch(`${API_URL}/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status }),
  })
  const data = await parseResponse(res)
  return data.applicant
}

export async function addApplicantNoteRequest(applicationId: string, note: string): Promise<Applicant> {
  const res = await fetch(`${API_URL}/applications/${applicationId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ note }),
  })
  const data = await parseResponse(res)
  return data.applicant
}

export async function assignApplicantRequest(
  applicationId: string,
  eventRoleId: string,
  eventShiftId: string,
): Promise<Applicant> {
  const res = await fetch(`${API_URL}/applications/${applicationId}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ eventRoleId, eventShiftId }),
  })
  const data = await parseResponse(res)
  return data.applicant
}
