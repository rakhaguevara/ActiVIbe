import { Router } from 'express'
import {
  overview,
  getUsers,
  patchUserStatus,
  patchUserPassword,
  getEvents,
  approve,
  reject,
  remove,
  getParticipation,
  getActivityLog,
  getOverviewRegions,
  postAiChat,
  getPrematureClosures,
  postOrganizerWarning,
} from './admin.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.js'
import { requireRole } from '../../middlewares/requireRole.js'
import { validateRequest } from '../../middlewares/validateRequest.js'
import { validateUserStatus, validateEventReject, validateOrganizerWarning } from './admin.validation.js'

const router = Router()

router.use(requireAuth, requireRole('ADMIN'))

router.get('/overview', overview)
router.get('/overview/regions', getOverviewRegions)

router.post('/ai/chat', postAiChat)

router.get('/users', getUsers)
router.patch('/users/:id/status', validateRequest(validateUserStatus), patchUserStatus)
router.patch('/users/:id/password', patchUserPassword)

router.get('/events', getEvents)
router.patch('/events/:id/approve', approve)
router.patch('/events/:id/reject', validateRequest(validateEventReject), reject)
router.delete('/events/:id', remove)

router.get('/participation', getParticipation)
router.get('/activity-log', getActivityLog)

router.get('/premature-closures', getPrematureClosures)
router.post('/premature-closures/:eventId/warn', validateRequest(validateOrganizerWarning), postOrganizerWarning)

export default router
