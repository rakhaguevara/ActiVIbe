import {
  registerUser,
  loginUser,
  verifyTwoFactorLogin,
  getUserFromAccessToken,
  logoutUser,
  refreshUserSession,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  bypassRegistrationOtp,
  requestPasswordResetOtp,
  resetPasswordWithOtp,
  changePassword,
  listSessions,
  revokeSession,
  revokeOtherSessions,
  beginTwoFactorEnroll,
  confirmTwoFactorEnroll,
  disableTwoFactor,
} from './auth.service.js'
import { env } from '../../config/env.js'
import { accessCookieName, refreshCookieName } from '../../utils/sessionSlot.js'
import { hashToken } from '../../utils/hash.js'

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

// req.ip butuh Express utk sudah tahu alamat client asli — app ini tidak
// men-set `trust proxy` (lihat app.js, tidak ada baris itu), jadi di balik
// reverse proxy req.ip bisa saja alamat proxy itu sendiri. Cukup utk tampilan
// "Kelola Sesi" (bukan security-critical), tidak diandalkan utk rate limiting.
function requestMeta(req) {
  return { userAgent: req.headers['user-agent'], ipAddress: req.ip }
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
    const { user, accessToken, refreshToken } = await verifyRegistrationOtp(req.body, requestMeta(req))
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
    const { user, accessToken, refreshToken } = await bypassRegistrationOtp(req.body, requestMeta(req))
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
    const { user, accessToken, refreshToken } = await resetPasswordWithOtp(req.body, requestMeta(req))
    setAuthCookies(res, { accessToken, refreshToken }, req.sessionSlot)
    res.status(200).json({ user })
  } catch (err) {
    next(err)
  }
}

// Kalau akun ini punya 2FA aktif, loginUser() TIDAK mengembalikan tokens —
// balas { requiresTwoFactor, userId } dan frontend lanjut ke langkah kode TOTP
// (POST /auth/2fa/verify-login) sebelum sesi betulan terbit & cookie di-set.
export async function login(req, res, next) {
  try {
    const result = await loginUser(req.body, requestMeta(req))
    if (result.requiresTwoFactor) {
      return res.status(200).json({ requiresTwoFactor: true, userId: result.userId })
    }
    const { user, accessToken, refreshToken } = result
    setAuthCookies(res, { accessToken, refreshToken }, req.sessionSlot)
    res.status(200).json({ user })
  } catch (err) {
    next(err)
  }
}

export async function verifyTwoFactorLoginController(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await verifyTwoFactorLogin(req.body, requestMeta(req))
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
    const { user, accessToken, refreshToken: newRefreshToken } = await refreshUserSession(refreshToken, requestMeta(req))
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

// SecuritySettingsView "Update Password" — butuh tokenHash sesi yang lagi
// dipakai request ini (dibaca dari cookie refresh token yang sama dgn
// requireAuth pakai access token-nya) supaya changePassword() tahu sesi mana
// yang TIDAK boleh ikut dicabut.
export async function changePasswordController(req, res, next) {
  try {
    const currentRefreshToken = req.cookies?.[refreshCookieName(req.sessionSlot)]
    const currentRefreshTokenHash = currentRefreshToken ? hashToken(currentRefreshToken) : null
    await changePassword(req.user.id, currentRefreshTokenHash, req.body)
    res.status(200).json({ success: true })
  } catch (err) {
    next(err)
  }
}

export async function getSessions(req, res, next) {
  try {
    const currentRefreshToken = req.cookies?.[refreshCookieName(req.sessionSlot)]
    const currentTokenHash = currentRefreshToken ? hashToken(currentRefreshToken) : null
    const sessions = await listSessions(req.user.id, currentTokenHash)
    res.status(200).json({ sessions })
  } catch (err) {
    next(err)
  }
}

export async function deleteSession(req, res, next) {
  try {
    await revokeSession(req.user.id, req.params.id)
    res.status(200).json({ success: true })
  } catch (err) {
    next(err)
  }
}

export async function postRevokeOtherSessions(req, res, next) {
  try {
    const currentRefreshToken = req.cookies?.[refreshCookieName(req.sessionSlot)]
    const currentTokenHash = currentRefreshToken ? hashToken(currentRefreshToken) : null
    await revokeOtherSessions(req.user.id, currentTokenHash)
    res.status(200).json({ success: true })
  } catch (err) {
    next(err)
  }
}

export async function postTwoFactorEnroll(req, res, next) {
  try {
    const result = await beginTwoFactorEnroll(req.user.id)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

export async function postTwoFactorConfirm(req, res, next) {
  try {
    await confirmTwoFactorEnroll(req.user.id, req.body)
    res.status(200).json({ success: true })
  } catch (err) {
    next(err)
  }
}

export async function postTwoFactorDisable(req, res, next) {
  try {
    await disableTwoFactor(req.user.id, req.body)
    res.status(200).json({ success: true })
  } catch (err) {
    next(err)
  }
}
