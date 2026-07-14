import { Router } from 'express'
import {
  register,
  login,
  verifyTwoFactorLoginController,
  me,
  logout,
  refresh,
  verifyOtp,
  resendOtp,
  bypassOtp,
  forgotPasswordRequestOtp,
  resetPassword,
  changePasswordController,
  getSessions,
  deleteSession,
  postRevokeOtherSessions,
  postTwoFactorEnroll,
  postTwoFactorConfirm,
  postTwoFactorDisable,
} from './auth.controller.js'
import { validateRequest } from '../../middlewares/validateRequest.js'
import { authLimiter } from '../../middlewares/rateLimiter.js'
import { requireAuth } from '../../middlewares/requireAuth.js'
import {
  validateRegisterInput,
  validateLoginInput,
  validateVerifyOtpInput,
  validateResendOtpInput,
  validateForgotPasswordRequestInput,
  validateResetPasswordInput,
} from './auth.validation.js'

const router = Router()

router.post('/register', authLimiter, validateRequest(validateRegisterInput), register)
router.post('/verify-otp', authLimiter, validateRequest(validateVerifyOtpInput), verifyOtp)
router.post('/resend-otp', authLimiter, validateRequest(validateResendOtpInput), resendOtp)
// Body sama persis dgn resend (cuma email) — reuse validator yang sama.
router.post('/bypass-otp', authLimiter, validateRequest(validateResendOtpInput), bypassOtp)
router.post('/forgot-password/request-otp', authLimiter, validateRequest(validateForgotPasswordRequestInput), forgotPasswordRequestOtp)
router.post('/forgot-password/reset', authLimiter, validateRequest(validateResetPasswordInput), resetPassword)
router.post('/login', authLimiter, validateRequest(validateLoginInput), login)
// Langkah 2 login kalau akun ini 2FA aktif — TANPA requireAuth (belum ada
// sesi sama sekali di titik ini, userId dari respons requiresTwoFactor login
// di atas jadi bukti "sudah lolos password").
router.post('/2fa/verify-login', authLimiter, verifyTwoFactorLoginController)
router.get('/me', me)
router.post('/refresh', authLimiter, refresh)
router.post('/logout', logout)

// Security settings (organizer, tapi generik utk role manapun) — semua butuh
// sesi aktif.
router.post('/change-password', requireAuth, changePasswordController)
router.get('/sessions', requireAuth, getSessions)
router.delete('/sessions/:id', requireAuth, deleteSession)
router.post('/sessions/revoke-others', requireAuth, postRevokeOtherSessions)
router.post('/2fa/enroll', requireAuth, postTwoFactorEnroll)
router.post('/2fa/confirm', requireAuth, postTwoFactorConfirm)
router.post('/2fa/disable', requireAuth, postTwoFactorDisable)

export default router
