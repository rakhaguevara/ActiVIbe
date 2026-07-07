import { Router } from 'express'
import { apply, myApplications, listForEvent, updateStatus, addNote, assign, checkIn, noShow } from './application.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.js'
import { requireRole } from '../../middlewares/requireRole.js'
import { validateRequest } from '../../middlewares/validateRequest.js'
import {
  validateApplyInput,
  validateUpdateStatus,
  validateAddNote,
  validateAssign,
  validateCheckIn,
} from './application.validation.js'

const router = Router()

router.post('/', requireAuth, validateRequest(validateApplyInput), apply)
router.get('/me', requireAuth, myApplications)

router.get('/event/:eventId', requireAuth, requireRole('ORGANIZER'), listForEvent)
router.patch('/:id/status', requireAuth, requireRole('ORGANIZER'), validateRequest(validateUpdateStatus), updateStatus)
router.post('/:id/notes', requireAuth, requireRole('ORGANIZER'), validateRequest(validateAddNote), addNote)
router.post('/:id/assign', requireAuth, requireRole('ORGANIZER'), validateRequest(validateAssign), assign)
router.post('/assignments/:assignmentId/check-in', requireAuth, requireRole('ORGANIZER'), validateRequest(validateCheckIn), checkIn)
router.post('/assignments/:assignmentId/no-show', requireAuth, requireRole('ORGANIZER'), noShow)

export default router
