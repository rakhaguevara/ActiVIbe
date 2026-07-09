import { Router } from 'express'
import { myPassport } from './passport.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.js'

const router = Router()

router.get('/me', requireAuth, myPassport)

export default router
