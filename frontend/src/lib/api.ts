import { apiFetch } from './apiFetch'

const API_URL = import.meta.env.VITE_API_URL ?? ''

export interface AuthUser {
  id: string
  name: string
  email: string | null
  role: 'VOLUNTEER' | 'ORGANIZER' | 'ADMIN'
  firstName?: string
  lastName?: string
  // Dipakai SecuritySettingsView utk tahu status 2FA akun ini tanpa endpoint
  // terpisah — diturunkan dari User.twoFactorEnabledAt di backend.
  twoFactorEnabled?: boolean
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  role?: AuthUser['role']
}

export interface LoginPayload {
  email: string
  password: string
}

export interface VerifyOtpPayload {
  email: string
  code: string
}

export interface ResendOtpPayload {
  email: string
}

export interface ForgotPasswordRequestPayload {
  email: string
}

export interface ResetPasswordPayload {
  email: string
  code: string
  newPassword: string
}

// error.code (mis. 'OTP_RESEND_LIMIT_REACHED') di-attach ke Error supaya
// pemanggil bisa membedakan jenis kegagalan tanpa mencocokkan teks pesan
// (lihat errorHandler.js backend & OtpVerifyForm.tsx).
async function parseResponse(res: Response) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const error = new Error(data?.error?.message ?? 'Terjadi kesalahan, coba lagi.') as Error & { code?: string }
    if (data?.error?.code) error.code = data.error.code
    throw error
  }
  return data
}

// FR-002: registrasi tidak lagi langsung membuat sesi — respons cuma menandai
// OTP sudah dikirim; sesi (cookie) baru terbit setelah verifyOtpRequest().
export async function registerRequest(payload: RegisterPayload): Promise<{ otpRequired: true; email: string }> {
  const res = await apiFetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  return parseResponse(res)
}

export async function verifyOtpRequest(payload: VerifyOtpPayload): Promise<{ user: AuthUser }> {
  const res = await apiFetch(`${API_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  return parseResponse(res)
}

export async function resendOtpRequest(payload: ResendOtpPayload): Promise<{ success: true }> {
  const res = await apiFetch(`${API_URL}/auth/resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  return parseResponse(res)
}

// Dipanggil dari tombol "Lewati verifikasi" — backend cuma mengizinkan ini
// setelah resend mentok limit (lihat auth.service.js bypassRegistrationOtp).
export async function bypassOtpRequest(payload: ResendOtpPayload): Promise<{ user: AuthUser }> {
  const res = await apiFetch(`${API_URL}/auth/bypass-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  return parseResponse(res)
}

// Selalu resolve sukses (200) apa pun status email-nya — backend sengaja
// tidak mengungkap apakah email terdaftar (lihat auth.service.js requestPasswordResetOtp).
export async function forgotPasswordRequestOtpRequest(payload: ForgotPasswordRequestPayload): Promise<{ success: true }> {
  const res = await apiFetch(`${API_URL}/auth/forgot-password/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  return parseResponse(res)
}

// Berhasil = password sudah diganti DAN sesi baru langsung terbit (auto-login,
// lihat auth.service.js resetPasswordWithOtp) — sama pola dgn verifyOtpRequest.
export async function resetPasswordRequest(payload: ResetPasswordPayload): Promise<{ user: AuthUser }> {
  const res = await apiFetch(`${API_URL}/auth/forgot-password/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  return parseResponse(res)
}

// Kalau akun tujuan punya 2FA aktif, backend TIDAK menerbitkan sesi di sini —
// balas { requiresTwoFactor: true, userId } dan pemanggil harus lanjut ke
// verifyTwoFactorLoginRequest() sebelum benar-benar login. Akun tanpa 2FA
// (mayoritas) tetap dapat { user } langsung seperti sebelumnya.
export type LoginResult = { user: AuthUser } | { requiresTwoFactor: true; userId: string }

export async function loginRequest(payload: LoginPayload): Promise<LoginResult> {
  const res = await apiFetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  return parseResponse(res)
}

export async function meRequest(): Promise<{ user: AuthUser }> {
  const res = await apiFetch(`${API_URL}/auth/me`, {
    credentials: 'include',
  })
  return parseResponse(res)
}

export async function logoutRequest(): Promise<void> {
  const res = await apiFetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
  await parseResponse(res)
}

// --- Security settings (SecuritySettingsView, organizer) ---

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export async function changePasswordRequest(payload: ChangePasswordPayload): Promise<{ success: true }> {
  const res = await apiFetch(`${API_URL}/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  return parseResponse(res)
}

export interface AuthSession {
  id: string
  userAgent?: string
  ipAddress?: string
  createdAt: string
  lastUsedAt: string
  isCurrent: boolean
}

export async function listSessionsRequest(): Promise<{ sessions: AuthSession[] }> {
  const res = await apiFetch(`${API_URL}/auth/sessions`, { credentials: 'include' })
  return parseResponse(res)
}

export async function revokeSessionRequest(id: string): Promise<{ success: true }> {
  const res = await apiFetch(`${API_URL}/auth/sessions/${id}`, { method: 'DELETE', credentials: 'include' })
  return parseResponse(res)
}

export async function revokeOtherSessionsRequest(): Promise<{ success: true }> {
  const res = await apiFetch(`${API_URL}/auth/sessions/revoke-others`, { method: 'POST', credentials: 'include' })
  return parseResponse(res)
}

// --- 2FA (TOTP) ---

export interface TwoFactorEnrollResult {
  secret: string
  otpauthUrl: string
  qrDataUrl: string
}

export async function beginTwoFactorEnrollRequest(): Promise<TwoFactorEnrollResult> {
  const res = await apiFetch(`${API_URL}/auth/2fa/enroll`, { method: 'POST', credentials: 'include' })
  return parseResponse(res)
}

export async function confirmTwoFactorEnrollRequest(payload: { secret: string; code: string }): Promise<{ success: true }> {
  const res = await apiFetch(`${API_URL}/auth/2fa/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  return parseResponse(res)
}

export async function disableTwoFactorRequest(payload: { code: string }): Promise<{ success: true }> {
  const res = await apiFetch(`${API_URL}/auth/2fa/disable`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  return parseResponse(res)
}

// Langkah 2 login kalau backend membalas { requiresTwoFactor: true, userId }
// dari loginRequest() di bawah — TIDAK requireAuth (belum ada sesi).
export async function verifyTwoFactorLoginRequest(payload: { userId: string; code: string }): Promise<{ user: AuthUser }> {
  const res = await apiFetch(`${API_URL}/auth/2fa/verify-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  return parseResponse(res)
}
