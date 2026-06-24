import { Router } from 'express'
import { register, login, me, logout } from './auth.controller.js'
import { validateRequest } from '../../middlewares/validateRequest.js'
import { authLimiter } from '../../middlewares/rateLimiter.js'
import { validateRegisterInput, validateLoginInput } from './auth.validation.js'

const router = Router()

router.post('/register', authLimiter, validateRequest(validateRegisterInput), register)
router.post('/login', authLimiter, validateRequest(validateLoginInput), login)
router.get('/me', me)
router.post('/logout', logout)

export default router
