import type { OrganizerEvent } from '../types/organizer'

// Partisipasi dianggap "belum cukup" kalau accepted volunteer < 50% kuota —
// satu konstanta, dipakai jadi threshold penutupan dini di sini DAN
// (independen) di backend event.service.js closeEvent(). Gate frontend ini
// murni UX (munculkan tombol + ConfirmDialog lebih awal); server yang tetap
// jadi sumber kebenaran soal closedBeforeSchedule.
const LOW_PARTICIPATION_THRESHOLD = 0.5

// Dipakai bareng oleh EventDetailPage.tsx (tombol header "Close Event") dan
// ImpactTab.tsx ("Tutup Event & Input Impact") supaya kedua tempat sepakat
// kapan CloseEventWizard boleh dibuka — event harus sudah published/ongoing
// DAN (sudah melewati tanggal selesainya ATAU partisipasi belum cukup, utk
// alur penutupan dini — lihat isEarlyLowParticipationClose).
export function canCloseEvent(event: OrganizerEvent, acceptedCount: number): boolean {
  const today = new Date().toISOString().slice(0, 10)
  const afterEnd = event.endDate < today
  const lowParticipation = event.quota > 0 && acceptedCount / event.quota < LOW_PARTICIPATION_THRESHOLD
  return (event.status === 'published' || event.status === 'ongoing') && (afterEnd || lowParticipation)
}

// true kalau organizer mencoba menutup SEBELUM endDate lewat krn partisipasi
// belum cukup — skenario yang wajib melalui ConfirmDialog peringatan dulu
// (lihat EventDetailPage.tsx handleCloseEventClick) sebelum CloseEventWizard
// dibuka, krn ini yang di backend akan tercatat sbg closedBeforeSchedule.
export function isEarlyLowParticipationClose(event: OrganizerEvent, acceptedCount: number): boolean {
  const today = new Date().toISOString().slice(0, 10)
  const afterEnd = event.endDate < today
  const lowParticipation = event.quota > 0 && acceptedCount / event.quota < LOW_PARTICIPATION_THRESHOLD
  return !afterEnd && lowParticipation
}

export function canCloseRegistration(event: OrganizerEvent): boolean {
  return (event.status === 'published' || event.status === 'ongoing') && !event.registrationClosedAt
}
