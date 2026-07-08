import type {
  Applicant,
  ApplicantStatus,
  AttendanceRecord,
  Certificate,
  EventLegalDocument,
  EventMode,
  EventRequirement,
  EventRole,
  EventSupportingDocuments,
  FeedbackSummary,
  OrganizationEntityType,
  OrganizerEvent,
  TrafficSummary,
  UploadedFile,
} from '../types/organizer'
import type { DeclarationKey } from './organizerDeclarationItems'
import { apiFetch } from './apiFetch'

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
  // Tag matching untuk Predictive Match Score (FR-005) — opsional, tapi tanpa
  // ini event baru selalu skor netral di rekomendasi volunteer (lihat matchScore.js).
  category?: string
  skillIds?: string[]
  interestIds?: string[]
  motivationTags?: ('CAREER' | 'SOCIAL' | 'VALUES' | 'SKILL_GROWTH')[]
  dayType?: 'WEEKDAY' | 'WEEKEND' | 'BOTH'
  // Enhancement: verifikasi organizer, dokumen pendukung, galeri, peta lokasi.
  eventMode?: EventMode
  mapLink?: string
  organizationEntityType?: OrganizationEntityType
  onBehalfOfInstitution?: boolean
  documents?: Partial<EventSupportingDocuments>
  legalDocuments?: EventLegalDocument[]
  galleryImages?: UploadedFile[]
  declarationChecklist?: Record<DeclarationKey, boolean>
}

// Jenis dokumen di endpoint upload orphan (path param docType, kebab-case) —
// harus sinkron dgn DOCUMENT_RULES di backend/src/modules/events/eventUpload.js.
export type EventDocumentType =
  | 'proposal'
  | 'rundown'
  | 'poster'
  | 'responsibility-letter'
  | 'location-permit'
  | 'cooperation-letter'
  | 'assignment-letter'
  | 'legal-nib'
  | 'legal-akta'
  | 'legal-sk-kemenkumham'
  | 'legal-npwp'

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
  const res = await apiFetch(`${API_URL}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  const data = await parseResponse(res)
  return data.event
}

// Upload "orphan" — dipanggil saat organizer memilih file di form Buat Event,
// sebelum event-nya sendiri disubmit (Event belum tentu ada). URL yang
// dikembalikan disertakan di CreateEventPayload saat submit.
export async function uploadEventDocumentRequest(docType: EventDocumentType, file: File): Promise<UploadedFile> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await apiFetch(`${API_URL}/events/uploads/documents/${docType}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  return parseResponse(res)
}

export async function uploadEventGalleryImageRequest(file: File): Promise<UploadedFile> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await apiFetch(`${API_URL}/events/uploads/gallery`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  return parseResponse(res)
}

export async function listMyEventsRequest(): Promise<OrganizerEvent[]> {
  const res = await apiFetch(`${API_URL}/events/mine`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.events
}

export async function getEventRequest(eventId: string): Promise<OrganizerEvent> {
  const res = await apiFetch(`${API_URL}/events/${eventId}`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.event
}

export async function addRoleRequest(eventId: string, payload: CreateEventRolePayload): Promise<EventRole> {
  const res = await apiFetch(`${API_URL}/events/${eventId}/roles`, {
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
  const res = await apiFetch(`${API_URL}/events/${eventId}/requirements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  const data = await parseResponse(res)
  return data.requirement
}

export async function closeEventRequest(eventId: string, payload: CloseEventPayload): Promise<OrganizerEvent> {
  const res = await apiFetch(`${API_URL}/events/${eventId}/close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  const data = await parseResponse(res)
  return data.event
}

export async function listApplicantsRequest(eventId: string): Promise<Applicant[]> {
  const res = await apiFetch(`${API_URL}/applications/event/${eventId}`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.applicants
}

export async function updateApplicantStatusRequest(applicationId: string, status: ApplicantStatus): Promise<Applicant> {
  const res = await apiFetch(`${API_URL}/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status }),
  })
  const data = await parseResponse(res)
  return data.applicant
}

export async function addApplicantNoteRequest(applicationId: string, note: string): Promise<Applicant> {
  const res = await apiFetch(`${API_URL}/applications/${applicationId}/notes`, {
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
  const res = await apiFetch(`${API_URL}/applications/${applicationId}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ eventRoleId, eventShiftId }),
  })
  const data = await parseResponse(res)
  return data.applicant
}

export async function getEventAttendanceRequest(eventId: string): Promise<AttendanceRecord[]> {
  const res = await apiFetch(`${API_URL}/events/${eventId}/attendance`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.records
}

export async function checkInRequest(assignmentId: string, method: 'qr' | 'manual'): Promise<AttendanceRecord> {
  const res = await apiFetch(`${API_URL}/applications/assignments/${assignmentId}/check-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ method }),
  })
  const data = await parseResponse(res)
  return data.record
}

export interface TicketCheckInResult {
  applicationId: string
  eventId: string
  status: 'checked_in'
  checkedInAt: string
  method: 'qr' | 'manual'
}

// FR-044: check-in langsung lewat kode tiket (dari email tiket volunteer) —
// tidak butuh assignment role/shift, beda dari checkInRequest() di atas.
export async function checkInByTicketRequest(ticketCode: string): Promise<TicketCheckInResult> {
  const res = await apiFetch(`${API_URL}/applications/ticket/check-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ ticketCode, method: 'qr' }),
  })
  const data = await parseResponse(res)
  return data.attendance
}

export async function markNoShowRequest(assignmentId: string): Promise<AttendanceRecord> {
  const res = await apiFetch(`${API_URL}/applications/assignments/${assignmentId}/no-show`, {
    method: 'POST',
    credentials: 'include',
  })
  const data = await parseResponse(res)
  return data.record
}

export async function generateCertificatesRequest(eventId: string): Promise<{ issued: number; total: number }> {
  const res = await apiFetch(`${API_URL}/events/${eventId}/certificates/generate`, {
    method: 'POST',
    credentials: 'include',
  })
  return parseResponse(res)
}

export async function listCertificatesRequest(eventId: string): Promise<Certificate[]> {
  const res = await apiFetch(`${API_URL}/events/${eventId}/certificates`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.certificates
}

export async function getFeedbackSummaryRequest(eventId: string): Promise<FeedbackSummary> {
  const res = await apiFetch(`${API_URL}/events/${eventId}/feedback-summary`, { credentials: 'include' })
  return parseResponse(res)
}

export async function getTrafficSummaryRequest(): Promise<TrafficSummary> {
  const res = await apiFetch(`${API_URL}/events/traffic-summary`, { credentials: 'include' })
  return parseResponse(res)
}

export async function archiveEventRequest(eventId: string): Promise<OrganizerEvent> {
  const res = await apiFetch(`${API_URL}/events/${eventId}/archive`, { method: 'POST', credentials: 'include' })
  const data = await parseResponse(res)
  return data.event
}

export async function restoreEventRequest(eventId: string): Promise<OrganizerEvent> {
  const res = await apiFetch(`${API_URL}/events/${eventId}/restore`, { method: 'POST', credentials: 'include' })
  const data = await parseResponse(res)
  return data.event
}
