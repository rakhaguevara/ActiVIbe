// Bentuk data satu "bab" (satu event yang sudah diselesaikan volunteer).
// Field-field ini dipetakan ke model backend yang sudah ada (lihat
// backend/prisma/schema.prisma): Event.category, ImpactLog, EventGalleryImage,
// EventFeedback. Field yang MASIH BELUM ada endpoint/model backend-nya ditandai
// di komentar masing-masing — untuk sekarang diisi mock supaya urutan &
// tampilan halaman bisa diuji.

export type PassportEventCategory = 'Lingkungan' | 'Kemanusiaan' | string

export interface PassportImpactStat {
  metricLabel: string
  value: number
  unit: string
}

export interface PassportBeneficiaryQuote {
  quote: string
  author: string
  photoUrl?: string
}

export interface PassportFeedback {
  rating: number
  comment: string
}

export interface PassportBookChapter {
  id: string
  eventTitle: string
  organizerName: string
  location: string
  date: string // ISO
  category: PassportEventCategory

  // 1. Foto kegiatan (hero) — undefined selama belum ada foto asli
  // (lihat README di src/assets/passport), tampil sebagai slot kosong.
  heroPhotoUrl?: string

  // 2. Tombol share — dibangun dari eventTitle/id, bukan field tersendiri
  shareUrl: string

  // 1(rangkuman kegiatan) — dari deskripsi event / narasi AI ImpactLog.aiHeadline
  summary: string

  // 2. Chart dampak — dari ImpactLog.value/unit/metricLabel. Opsional: kalau
  // organizer belum close event dgn ImpactLog (edge case), backend tidak
  // mengarang angka — halaman ini di-skip di buildPages (PassportBook.tsx).
  impact?: PassportImpactStat

  // 3. Dampak lingkungan tambahan — HANYA event category 'Lingkungan'.
  // Belum ada field backend terpisah untuk ini; sementara pakai catatan
  // deskriptif, bukan angka baru yang dikarang.
  environmentalNote?: string

  // 4. Kata dari yang terdampak — HANYA event category 'Kemanusiaan'.
  // Belum ada model backend (lihat catatan gap di percakapan sebelumnya) —
  // mock dulu.
  beneficiaryQuote?: PassportBeneficiaryQuote

  // 5. Galeri foto milik volunteer sendiri, maks 5 — belum ada model/endpoint
  // backend (EventGalleryImage saat ini milik organizer, bukan per-volunteer).
  // Prototype ini simpan penambahan foto di state lokal komponen saja.
  galleryPhotos: string[]

  // 7. Kesan & pesan dari volunteer — dari EventFeedback.rating/comment
  // (endpoint submit sudah ada di backend, dipakai RatingModal di
  // ApplicationHistoryPage; belum disambungkan ke Impact Passport ini).
  feedback?: PassportFeedback
}

export const MAX_GALLERY_PHOTOS = 5
export const ALLOWED_GALLERY_MIME_TYPES = ['image/png', 'image/jpeg']

// Halaman ringkasan (bio page) di depan buku — dulu ini section terpisah di
// PassportPage.tsx (hero tagline, stats, skill tracker, share card),
// sekarang dipindah jadi bagian dari buku itu sendiri.
export interface PassportStats {
  totalHours: number
  eventsCompleted: number
  ngoCount: number
  points: number
}

export interface PassportSkill {
  name: string
  xp: number
  xpTarget: number
  level: number
}
