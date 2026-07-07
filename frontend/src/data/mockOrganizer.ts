import type { CommunicationLogEntry } from '../types/organizer'

// Events/applicants/requirements/attendance/certificates/feedback sekarang
// datang dari database sungguhan (lihat OrganizerDataContext.tsx +
// lib/organizerApi.ts). Cuma Communication yang masih mock (belum diwire ke
// backend di iterasi ini).
export const mockCommunicationLogs: CommunicationLogEntry[] = []
