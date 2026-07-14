export interface Organization {
  id: string
  name: string
  // Dipakai SecuritySettingsView Danger Zone (Deactivate vs Reactivate).
  status?: 'PENDING_VERIFICATION' | 'ACTIVE' | 'DEACTIVATED'
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
  // Branding (BrandingView.tsx) — semua opsional, organisasi lama belum tentu
  // pernah mengisinya.
  bannerUrl?: string
  primaryColor?: string
  secondaryColor?: string
  signatureUrl?: string
  stampUrl?: string
  emailHeaderImageUrl?: string
  emailFooterText?: string
  // Link sosial media (OrganizationProfileView.tsx) — semua opsional.
  facebookUrl?: string
  instagramUrl?: string
  linkedinUrl?: string
}
