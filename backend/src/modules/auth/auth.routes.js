import { Router } from 'express'
import { register, login, me, logout, refresh, verifyOtp, resendOtp } from './auth.controller.js'
import { validateRequest } from '../../middlewares/validateRequest.js'
import { authLimiter } from '../../middlewares/rateLimiter.js'
import { validateRegisterInput, validateLoginInput, validateVerifyOtpInput, validateResendOtpInput } from './auth.validation.js'

const router = Router()

router.post('/register', authLimiter, validateRequest(validateRegisterInput), register)
router.post('/verify-otp', authLimiter, validateRequest(validateVerifyOtpInput), verifyOtp)
router.post('/resend-otp', authLimiter, validateRequest(validateResendOtpInput), resendOtp)
router.post('/login', authLimiter, validateRequest(validateLoginInput), login)
router.get('/me', me)
router.post('/refresh', authLimiter, refresh)
router.post('/logout', logout)

export default router
