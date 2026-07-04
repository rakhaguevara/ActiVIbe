import { Router } from 'express'
import {
  overview,
  getUsers,
  patchUserStatus,
  getEvents,
  approve,
  reject,
  remove,
  getParticipation,
  getActivityLog,
} from './admin.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.js'
import { requireRole } from '../../middlewares/requireRole.js'
import { validateRequest } from '../../middlewares/validateRequest.js'
import { validateUserStatus, validateEventReject } from './admin.validation.js'

const router = Router()

router.use(requireAuth, requireRole('ADMIN'))

router.get('/overview', overview)

router.get('/users', getUsers)
router.patch('/users/:id/status', validateRequest(validateUserStatus), patchUserStatus)

router.get('/events', getEvents)
router.patch('/events/:id/approve', approve)
router.patch('/events/:id/reject', validateRequest(validateEventReject), reject)
router.delete('/events/:id', remove)

router.get('/participation', getParticipation)
router.get('/activity-log', getActivityLog)

export default router
