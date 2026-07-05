export interface Organization {
  id: string
  name: string
  /** URL logo organisasi — kalau kosong, UI menampilkan placeholder */
  logoUrl?: string
  shortProfile: string
  location: string
  address: string
  website?: string
  email: string
  phone: string
  causeAreas: string[]
  isVerified: boolean
  joinedYear: number
  eventsCount: number
  rating: number
  mission: string
  aboutUs: string
}
