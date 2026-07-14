import { Router } from 'express'
import { register, login, me, logout, refresh, verifyOtp, resendOtp, bypassOtp, forgotPasswordRequestOtp, resetPassword } from './auth.controller.js'
import { validateRequest } from '../../middlewares/validateRequest.js'
import { authLimiter } from '../../middlewares/rateLimiter.js'
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
router.get('/me', me)
router.post('/refresh', authLimiter, refresh)
router.post('/logout', logout)

export default router
