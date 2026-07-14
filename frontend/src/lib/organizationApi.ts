import type { Organization } from '../types/organization'
import { apiFetch } from './apiFetch'
import { resolveAssetUrl } from './assetUrl'

const API_URL = import.meta.env.VITE_API_URL ?? ''

async function parseResponse(res: Response) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Terjadi kesalahan, coba lagi.')
  }
  return data
}

// logoUrl dari backend berupa path relatif ("/uploads/...") — perlu di-resolve
// ke origin backend (bukan origin dev server frontend), sama seperti pola
// resolveAssetUrl di EventGalleryUploader/CreateEventPage.
function resolveOrganization(org: Organization): Organization {
  return {
    ...org,
    logoUrl: org.logoUrl ? resolveAssetUrl(org.logoUrl) : org.logoUrl,
    bannerUrl: org.bannerUrl ? resolveAssetUrl(org.bannerUrl) : org.bannerUrl,
    signatureUrl: org.signatureUrl ? resolveAssetUrl(org.signatureUrl) : org.signatureUrl,
    stampUrl: org.stampUrl ? resolveAssetUrl(org.stampUrl) : org.stampUrl,
    emailHeaderImageUrl: org.emailHeaderImageUrl ? resolveAssetUrl(org.emailHeaderImageUrl) : org.emailHeaderImageUrl,
  }
}

export async function listOrganizations(): Promise<Organization[]> {
  const res = await apiFetch(`${API_URL}/organizations`, { credentials: 'include' })
  const data = await parseResponse(res)
  return (data.organizations as Organization[]).map(resolveOrganization)
}

export async function getOrganization(id: string): Promise<Organization> {
  const res = await apiFetch(`${API_URL}/organizations/${id}`, { credentials: 'include' })
  const data = await parseResponse(res)
  return resolveOrganization(data.organization)
}

// "Organisasi milik saya sendiri" (BrandingView.tsx) — auto-provision di
// backend kalau organizer belum pernah bikin event/organisasi sama sekali.
export async function getMyOrganization(): Promise<Organization> {
  const res = await apiFetch(`${API_URL}/organizations/me`, { credentials: 'include' })
  const data = await parseResponse(res)
  return resolveOrganization(data.organization)
}

export async function uploadMyOrganizationLogo(file: File): Promise<Organization> {
  const formData = new FormData()
  formData.append('logo', file)
  const res = await apiFetch(`${API_URL}/organizations/me/logo`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  const data = await parseResponse(res)
  return resolveOrganization(data.organization)
}

// 4 upload aset branding (BrandingView.tsx) — pola sama persis logo di atas,
// cuma field name & endpoint yang beda.
async function uploadBrandingAsset(fieldName: string, endpoint: string, file: File): Promise<Organization> {
  const formData = new FormData()
  formData.append(fieldName, file)
  const res = await apiFetch(`${API_URL}/organizations/me/${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  const data = await parseResponse(res)
  return resolveOrganization(data.organization)
}

export function uploadMyOrganizationBanner(file: File): Promise<Organization> {
  return uploadBrandingAsset('banner', 'banner', file)
}

export function uploadMyOrganizationSignature(file: File): Promise<Organization> {
  return uploadBrandingAsset('signature', 'signature', file)
}

export function uploadMyOrganizationStamp(file: File): Promise<Organization> {
  return uploadBrandingAsset('stamp', 'stamp', file)
}

export function uploadMyOrganizationEmailHeader(file: File): Promise<Organization> {
  return uploadBrandingAsset('emailHeader', 'email-header', file)
}

export async function updateVisualIdentity(payload: { primaryColor?: string; secondaryColor?: string }): Promise<Organization> {
  const res = await apiFetch(`${API_URL}/organizations/me/visual-identity`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await parseResponse(res)
  return resolveOrganization(data.organization)
}

export async function updateEmailIdentity(payload: { emailFooterText: string }): Promise<Organization> {
  const res = await apiFetch(`${API_URL}/organizations/me/email-identity`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await parseResponse(res)
  return resolveOrganization(data.organization)
}

export interface OrganizationProfilePayload {
  name?: string
  location?: string
  phone?: string
  mission?: string
  aboutUs?: string
  website?: string
  facebookUrl?: string
  instagramUrl?: string
  linkedinUrl?: string
}

// "Edit Profile" di OrganizationProfileView.tsx — beda dari updateVisualIdentity/
// updateEmailIdentity di atas (dipakai BrandingView.tsx).
export async function updateMyOrganizationProfile(payload: OrganizationProfilePayload): Promise<Organization> {
  const res = await apiFetch(`${API_URL}/organizations/me/profile`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await parseResponse(res)
  return resolveOrganization(data.organization)
}

export async function sendBrandingTestEmail(): Promise<{ sentTo: string }> {
  const res = await apiFetch(`${API_URL}/organizations/me/branding/test-email`, {
    method: 'POST',
    credentials: 'include',
  })
  return parseResponse(res)
}

export interface OrganizationRegistrationPayload {
  name: string
  shortProfile: string
  location: string
  address?: string
  website?: string
  email: string
  phone: string
  causeAreas: string[]
  // Dipakai backend sbg nama owner organisasi (User baru dibuat/dipakai ulang
  // dari email organisasi ini) — selalu wajib, login state tidak relevan lagi.
  contactName: string
}

export async function registerOrganization(
  payload: OrganizationRegistrationPayload,
): Promise<{ organizationId: string }> {
  const res = await apiFetch(`${API_URL}/organizations/register`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return parseResponse(res)
}

// Dipanggil saat SetOrganizationPasswordPage dibuka — read-only, dipakai utk
// menampilkan warning "email ini sudah terhubung ke akun yang aktif" SEBELUM
// user submit password sama sekali.
export async function getOrganizationSetPasswordInfo(
  token: string,
): Promise<{ organizationName: string; existingAccount: boolean }> {
  const res = await apiFetch(`${API_URL}/organizations/set-password/info?token=${encodeURIComponent(token)}`, {
    credentials: 'include',
  })
  return parseResponse(res)
}

// Langkah 1 di SetOrganizationPasswordPage — trigger kirim OTP ke email
// organisasi begitu user submit password+konfirmasi (password sendiri belum
// dikirim di sini, cuma divalidasi client-side; baru dikirim di langkah 2).
export async function requestOrganizationSetPasswordOtp(payload: {
  token: string
}): Promise<{ organizationName: string }> {
  const res = await apiFetch(`${API_URL}/organizations/set-password/request-otp`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return parseResponse(res)
}

// Langkah 2 — verifikasi kode OTP + simpan password + aktivasi organisasi.
export async function setOrganizationPassword(payload: {
  token: string
  password: string
  code: string
}): Promise<{ organizationName: string; email: string }> {
  const res = await apiFetch(`${API_URL}/organizations/set-password`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return parseResponse(res)
}
