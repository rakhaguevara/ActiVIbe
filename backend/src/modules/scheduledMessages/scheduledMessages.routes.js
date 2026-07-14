import { Router } from 'express'
import { list, create, cancel, sendNow } from './scheduledMessages.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.js'
import { requireRole } from '../../middlewares/requireRole.js'

const router = Router()

router.use(requireAuth, requireRole('ORGANIZER'))

router.get('/', list)
router.post('/', create)
router.post('/:id/cancel', cancel)
router.post('/:id/send-now', sendNow)

export default router
