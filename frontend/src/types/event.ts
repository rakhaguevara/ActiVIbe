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
}
