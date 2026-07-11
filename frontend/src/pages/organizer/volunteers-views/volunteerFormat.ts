import type { OrganizerVolunteer } from '../../../types/organizer'

// Dipakai bareng oleh 5 sub-view Volunteers CRM + VolunteerProfileDrawer —
// satu tempat drpd duplikasi format tanggal relatif/status di tiap view.

export function formatRelativeTime(iso: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diffMinutes < 1) return 'Baru saja'
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} jam lalu`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Kemarin'
  if (diffDays < 7) return `${diffDays} hari lalu`
  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 5) return `${diffWeeks} minggu lalu`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) return `${diffMonths} bulan lalu`
  return date.toLocaleDateString('id-ID')
}

export type VolunteerDisplayStatus = 'Active' | 'Completed' | 'Inactive'

// Satu label representatif per volunteer (dipakai badge status tabel) —
// beda dari status per-application (yang dipakai filter per-view di bawah).
export function volunteerDisplayStatus(v: OrganizerVolunteer): VolunteerDisplayStatus {
  const hasActive = v.applications.some(
    (a) => ['accepted', 'checked_in'].includes(a.status) && ['published', 'ongoing'].includes(a.eventStatus),
  )
  if (hasActive) return 'Active'
  if (v.applications.some((a) => a.status === 'completed')) return 'Completed'
  return 'Inactive'
}

export function attendanceLabel(pct: number | null): string {
  return pct === null ? '—' : `${pct}%`
}
