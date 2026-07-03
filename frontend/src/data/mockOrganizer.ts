import type { AttendanceRecord, CommunicationLogEntry } from '../types/organizer'

// Events/applicants/requirements sekarang datang dari database sungguhan
// (lihat OrganizerDataContext.tsx + lib/organizerApi.ts) — tidak ada lagi
// mock di sini untuk itu. Attendance & Communication masih mock (belum
// diwire ke backend di iterasi ini), jadi tetap mulai kosong: ID event/shift
// mock lama sudah tidak match dengan event sungguhan mana pun.
export const mockAttendanceRecords: AttendanceRecord[] = []

export const mockCommunicationLogs: CommunicationLogEntry[] = []
