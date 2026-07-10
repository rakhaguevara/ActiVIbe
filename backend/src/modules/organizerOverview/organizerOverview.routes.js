import { Router } from 'express'
import { overview, postAiChat, acknowledgeWarning } from './organizerOverview.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.js'
import { requireRole } from '../../middlewares/requireRole.js'

const router = Router()

router.use(requireAuth, requireRole('ORGANIZER'))

router.get('/overview', overview)
router.post('/overview/ai-chat', postAiChat)
router.patch('/warnings/:id/acknowledge', acknowledgeWarning)

export default router
