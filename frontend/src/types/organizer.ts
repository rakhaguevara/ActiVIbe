export type OrganizerEventStatus =
  | 'draft'
  | 'pending_approval'
  | 'published'
  | 'ongoing'
  | 'completed'
  | 'rejected'
  | 'archived'

export interface EventShift {
  id: string
  eventRoleId: string
  shiftDate: string
  startTime: string
  endTime: string
  quota: number
  locationPoint: string
}

export interface EventRole {
  id: string
  eventId: string
  roleName: string
  roleDescription: string
  maxVolunteers: number
  shifts: EventShift[]
}

export interface UploadedFile {
  url: string
  fileName: string
}

export type EventMode = 'ONLINE' | 'OFFLINE'
export type OrganizationEntityType = 'INDIVIDU' | 'PT' | 'CV' | 'YAYASAN' | 'ORGANISASI'
export type LegalDocType = 'NIB' | 'AKTA' | 'SK_KEMENKUMHAM' | 'NPWP'

export interface EventSupportingDocuments {
  proposal: UploadedFile | null
  rundown: UploadedFile | null
  poster: UploadedFile | null
  responsibilityLetter: UploadedFile | null
  locationPermit: UploadedFile | null
  cooperationLetter: UploadedFile | null
  assignmentLetter: UploadedFile | null
}

export interface EventLegalDocument extends UploadedFile {
  docType: LegalDocType
}

// Business rule 1b: laporan penutupan kegiatan (arsip resmi ActiVibe +
// sumber data yang diarsipkan ke Impact Passport tiap volunteer). Bentuk
// categoryMetrics fleksibel per Event.category — lihat CATEGORY_OPTIONS di
// CreateEventPage.tsx dan komentar EventCloseReport di schema.prisma.
export interface EventCloseReport {
  narrativeSummary: string
  volunteersPresentCount: number
  totalContributionHours: number
  photoUrls: string[]
  constraintsNotes?: string
  impactSummary?: string
  categoryMetrics?: Record<string, number>
}

export interface OrganizerEvent {
  id: string
  title: string
  description: string
  location: string
  quota: number
  startDate: string
  endDate: string
  status: OrganizerEventStatus
  impactMetricLabel: string
  impactMetricUnit: string
  impactValue?: number
  category?: string
  motivationTags?: ('CAREER' | 'SOCIAL' | 'VALUES' | 'SKILL_GROWTH')[]
  dayType?: 'WEEKDAY' | 'WEEKEND' | 'BOTH'
  archivedAt?: string
  updatedAt: string
  roles: EventRole[]
  requirements: EventRequirement[]
  // Enhancement: verifikasi organizer, dokumen pendukung, galeri, peta lokasi.
  eventMode?: EventMode
  mapLink?: string
  organizationEntityType?: OrganizationEntityType
  onBehalfOfInstitution?: boolean
  documents?: EventSupportingDocuments
  legalDocuments?: EventLegalDocument[]
  galleryImages?: string[]
  declarationAcceptedAt?: string
  skills?: string[]
  interests?: string[]
  // Business rule 1: PIC/pengurus penanggung jawab lapangan per event.
  picName?: string
  picContact?: string
  // Email PIC (wajib bareng picContact sejak fitur Sub Organizer) — dikirim
  // ke volunteer di email tiket.
  picEmail?: string
  // Terisi kalau PIC dipilih/dibuat dari daftar Sub Organizer reusable (lihat
  // SubOrganizer di bawah) — cuma bookkeeping, picName/picContact/picEmail
  // di atas tetap sumber tampilan (snapshot).
  picSubOrganizerId?: string
  // "Close Pendaftaran" — beda dari status completed penuh, lihat
  // eventLifecycle.ts.
  registrationClosedAt?: string
  closeReport?: EventCloseReport
  // Diisi closeEvent() — true kalau ditutup sebelum endDate lewat (penutupan
  // dini krn partisipasi rendah, lihat eventLifecycle.ts isEarlyLowParticipationClose).
  closedBeforeSchedule: boolean
  participationRatePercentAtClose?: number
  // Pesan peringatan admin terakhir (kalau ada) — cuma diisi di detail
  // single-event, lihat backend getEventForOrganizer.
  lastWarningMessage?: string
  lastWarningAt?: string
}

// Peringatan admin ke organizer krn menutup event sebelum jadwal dgn
// partisipasi rendah — dipakai banner Dashboard Home (OverviewPage.tsx),
// beda dari OrganizerEvent.lastWarningMessage yang cuma utk 1 event spesifik.
export interface OrganizerWarning {
  id: string
  eventId: string
  eventTitle: string
  message: string
  participationRatePercent: number
  createdAt: string
}

// Kontak koordinator/PIC reusable milik satu Organization — orangnya tidak
// harus punya akun ActiVibe, cuma record kontak supaya organizer tidak perlu
// ketik ulang nama+email+WA PIC tiap bikin event baru (lihat halaman "Sub
// Organizer" di bagian Events).
export interface SubOrganizer {
  id: string
  name: string
  email: string
  whatsapp: string
  title?: string
}

export interface Certificate {
  id: string
  applicationId: string
  eventId: string
  volunteerName: string
  issuedAt: string
}

export interface FeedbackSummary {
  average: number | null
  count: number
}

export interface TrafficSummary {
  total: number
  bySource: Record<string, number>
}

export type ApplicantStatus =
  | 'applied'
  | 'under_review'
  | 'accepted'
  | 'rejected'
  | 'waitlisted'
  | 'checked_in'
  | 'completed'
  | 'no_show'
  | 'cancelled_by_organizer'
  | 'cancelled_by_volunteer'

export type RequirementStatus = 'not_started' | 'in_progress' | 'completed'

export interface Applicant {
  id: string
  eventId: string
  volunteerName: string
  email: string
  matchScore?: number
  matchReasoning?: string
  skills: string[]
  interests: string[]
  availability: string[]
  previousEventsCompleted: number
  status: ApplicantStatus
  assignedRoleId?: string
  assignedShiftId?: string
  requirementStatus: RequirementStatus
  notes: string[]
  appliedAt: string
}

export interface AttendanceRecord {
  id: string
  applicantId: string
  eventId: string
  shiftId: string
  status: 'expected' | 'checked_in' | 'no_show'
  checkedInAt?: string
  method?: 'qr' | 'manual'
}

export interface CommunicationLogEntry {
  id: string
  eventId: string
  title: string
  message: string
  targetSegment: string
  sentAt: string
}

export interface EventRequirement {
  id: string
  eventId: string
  title: string
  type: 'read_acknowledge' | 'checklist' | 'upload_proof'
  isMandatory: boolean
}
