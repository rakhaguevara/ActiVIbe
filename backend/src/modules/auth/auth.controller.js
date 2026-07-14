import {
  registerUser,
  loginUser,
  getUserFromAccessToken,
  logoutUser,
  refreshUserSession,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  bypassRegistrationOtp,
  requestPasswordResetOtp,
  resetPasswordWithOtp,
} from './auth.service.js'
import { env } from '../../config/env.js'
import { accessCookieName, refreshCookieName } from '../../utils/sessionSlot.js'

const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000

function setAuthCookies(res, { accessToken, refreshToken }, slot) {
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
  }

  res.cookie(accessCookieName(slot), accessToken, { ...cookieOptions, maxAge: ACCESS_COOKIE_MAX_AGE })
  res.cookie(refreshCookieName(slot), refreshToken, { ...cookieOptions, maxAge: REFRESH_COOKIE_MAX_AGE })
}

export async function register(req, res, next) {
  try {
    const { email } = await registerUser(req.body)
    res.status(200).json({ otpRequired: true, email })
  } catch (err) {
    next(err)
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await verifyRegistrationOtp(req.body)
    setAuthCookies(res, { accessToken, refreshToken }, req.sessionSlot)
    res.status(200).json({ user })
  } catch (err) {
    next(err)
  }
}

export async function resendOtp(req, res, next) {
  try {
    await resendRegistrationOtp(req.body)
    res.status(200).json({ success: true })
  } catch (err) {
    next(err)
  }
}

// Dipanggil dari tombol "Lewati verifikasi" di OtpVerifyForm.tsx, cuma muncul
// setelah resend mentok limit (lihat bypassRegistrationOtp di auth.service.js).
export async function bypassOtp(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await bypassRegistrationOtp(req.body)
    setAuthCookies(res, { accessToken, refreshToken }, req.sessionSlot)
    res.status(200).json({ user })
  } catch (err) {
    next(err)
  }
}

// Selalu balas sukses generik, apa pun hasil internalnya (lihat
// requestPasswordResetOtp — sengaja tidak mengungkap email terdaftar atau tidak).
export async function forgotPasswordRequestOtp(req, res, next) {
  try {
    await requestPasswordResetOtp(req.body)
    res.status(200).json({ success: true })
  } catch (err) {
    next(err)
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await resetPasswordWithOtp(req.body)
    setAuthCookies(res, { accessToken, refreshToken }, req.sessionSlot)
    res.status(200).json({ user })
  } catch (err) {
    next(err)
  }
}

export async function login(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await loginUser(req.body)
    setAuthCookies(res, { accessToken, refreshToken }, req.sessionSlot)
    res.status(200).json({ user })
  } catch (err) {
    next(err)
  }
}

export async function me(req, res, next) {
  try {
    const accessToken = req.cookies?.[accessCookieName(req.sessionSlot)]
    if (!accessToken) {
      return res.status(401).json({ error: { message: 'Tidak ada sesi aktif' } })
    }

    const user = await getUserFromAccessToken(accessToken)
    if (!user) {
      return res.status(401).json({ error: { message: 'Sesi tidak valid' } })
    }

    res.status(200).json({ user })
  } catch (err) {
    next(err)
  }
}

// Access token berumur pendek (15 menit, lihat ACCESS_COOKIE_MAX_AGE) supaya
// kalau bocor dampaknya terbatas — endpoint ini yang menebus umur pendek itu
// dgn menukar refresh token (7 hari) jadi pasangan access+refresh baru, tanpa
// organizer perlu login ulang di tengah pengisian form yang panjang.
export async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies?.[refreshCookieName(req.sessionSlot)]
    const { user, accessToken, refreshToken: newRefreshToken } = await refreshUserSession(refreshToken)
    setAuthCookies(res, { accessToken, refreshToken: newRefreshToken }, req.sessionSlot)
    res.status(200).json({ user })
  } catch (err) {
    // Refresh token tidak valid/kadaluarsa/sudah dipakai — bersihkan cookie
    // supaya frontend tidak terus-menerus mencoba refresh dgn token yang
    // sudah pasti gagal (lihat apiFetch.ts, cuma retry sekali per request).
    res.clearCookie(accessCookieName(req.sessionSlot), { path: '/' })
    res.clearCookie(refreshCookieName(req.sessionSlot), { path: '/' })
    next(err)
  }
}

export async function logout(req, res, next) {
  try {
    await logoutUser(req.cookies?.[refreshCookieName(req.sessionSlot)])
    res.clearCookie(accessCookieName(req.sessionSlot), { path: '/' })
    res.clearCookie(refreshCookieName(req.sessionSlot), { path: '/' })
    res.status(200).json({ success: true })
  } catch (err) {
    next(err)
  }
}
