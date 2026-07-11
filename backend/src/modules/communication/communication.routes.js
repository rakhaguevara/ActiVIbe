import { Router } from 'express'
import { postBroadcast, getBroadcasts, getQuota } from './communication.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.js'
import { requireRole } from '../../middlewares/requireRole.js'

const router = Router()

router.use(requireAuth, requireRole('ORGANIZER'))

router.get('/broadcast', getBroadcasts)
router.get('/broadcast/quota', getQuota)
router.post('/broadcast', postBroadcast)

export default router
