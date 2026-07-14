import { Router } from 'express'
import { overview, eventBreakdown, search } from './reports.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.js'
import { requireRole } from '../../middlewares/requireRole.js'

const router = Router()

router.use(requireAuth, requireRole('ORGANIZER'))

router.get('/overview', overview)
router.get('/event-breakdown', eventBreakdown)
router.get('/search', search)

export default router
