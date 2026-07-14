import { Router } from 'express'
import { list, create, revoke } from './apiKeys.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.js'
import { requireRole } from '../../middlewares/requireRole.js'

const router = Router()

router.use(requireAuth, requireRole('ORGANIZER'))

router.get('/', list)
router.post('/', create)
router.post('/:id/revoke', revoke)

export default router
