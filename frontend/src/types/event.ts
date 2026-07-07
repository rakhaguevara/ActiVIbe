export interface RatingBreakdownItem {
  label: string
  score: number
}

export interface ReviewEntry {
  reviewerName: string
  timeAgo: string
  rating: number
  text: string
}

export interface Event {
  id: string
  title: string
  imageUrl: string
  description: string
  category: string
  location: string
  organizerName: string
  quota: number
  filledSlots: number
  startDate: string
  endDate: string
  skills: string[]
  matchScore: number
  matchReasoning: string
  fitBadgeLabel: string
  /** Emoji simbol kecocokan dari sistem rekomendasi FR-005 (opsional — hanya ada di hasil personalisasi) */
  symbol?: string
  /** true = skor/reasoning dari AI, false/undefined = rule-based atau mock */
  aiGenerated?: boolean
  /** Label tier kecocokan dari backend: "Kurang Cocok" | "Sedikit Relevan" | "Sangat Relevan & Cocok" */
  relevanceLabel?: string
  rating: number
  reviewCount: number
  ratingBreakdown: RatingBreakdownItem[]
  reviews: ReviewEntry[]
  provisions: string[]
  organizerBio: string
  organizerEventsCount: number
  organizerRating: number
  organizerYearsActive: number
  cancellationPolicy: string
  eventRules: string
  safetyInfo: string
  /** Foto galeri dokumentasi event (1-6), index 0 = thumbnail utama — lihat EventGalleryGrid */
  photos?: string[]
  /** Link share Google Maps atau alamat/koordinat teks — lihat lib/mapsEmbed.ts */
  mapLink?: string
  eventMode?: 'ONLINE' | 'OFFLINE'
}
