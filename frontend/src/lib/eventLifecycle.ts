import type { OrganizerEvent } from '../types/organizer'

// Dipakai bareng oleh EventDetailPage.tsx (tombol header "Close Event") dan
// ImpactTab.tsx ("Tutup Event & Input Impact") supaya kedua tempat sepakat
// kapan CloseEventWizard boleh dibuka — event harus sudah published/ongoing
// DAN sudah melewati tanggal selesainya.
export function canCloseEvent(event: OrganizerEvent): boolean {
  const today = new Date().toISOString().slice(0, 10)
  return (event.status === 'published' || event.status === 'ongoing') && event.endDate < today
}

export function canCloseRegistration(event: OrganizerEvent): boolean {
  return (event.status === 'published' || event.status === 'ongoing') && !event.registrationClosedAt
}
