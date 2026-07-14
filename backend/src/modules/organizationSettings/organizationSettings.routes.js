import { Router } from 'express'
import { get, patchGeneral, patchNotifications, patchWebhook } from './organizationSettings.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.js'
import { requireRole } from '../../middlewares/requireRole.js'

const router = Router()

router.use(requireAuth, requireRole('ORGANIZER'))

router.get('/', get)
router.patch('/general', patchGeneral)
router.patch('/notifications', patchNotifications)
router.patch('/webhook', patchWebhook)

export default router
