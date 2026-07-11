import { Router } from 'express'
import { listVolunteers } from './organizerVolunteers.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.js'
import { requireRole } from '../../middlewares/requireRole.js'

const router = Router()

router.use(requireAuth, requireRole('ORGANIZER'))

router.get('/volunteers', listVolunteers)

export default router
