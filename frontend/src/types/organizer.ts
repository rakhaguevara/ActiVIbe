export type OrganizerEventStatus = 'draft' | 'pending_approval' | 'published' | 'ongoing' | 'completed' | 'rejected'

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
  roles: EventRole[]
  requirements: EventRequirement[]
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
