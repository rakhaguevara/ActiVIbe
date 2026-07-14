import { Router } from 'express'
import {
  overview,
  getUsers,
  patchUserStatus,
  patchUserPassword,
  removeUser,
  getEvents,
  approve,
  reject,
  remove,
  getParticipation,
  getParticipationCategories,
  getActivityLog,
  getOverviewRegions,
  postAiChat,
  postCampaignIdeas,
  getPrematureClosures,
  postOrganizerWarning,
  getRevenue,
  getSubscriptions,
  patchSubscriptionTier,
  getCertificateTemplates,
  postCertificateTemplate,
  patchCertificateTemplateActive,
  deleteCertificateTemplateRoute,
} from './admin.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.js'
import { requireRole } from '../../middlewares/requireRole.js'
import { validateRequest } from '../../middlewares/validateRequest.js'
import { validateUserStatus, validateEventReject, validateOrganizerWarning } from './admin.validation.js'
import { handleCertificateTemplateUpload } from './certificateTemplateUpload.js'

const router = Router()

router.use(requireAuth, requireRole('ADMIN'))

router.get('/overview', overview)
router.get('/overview/regions', getOverviewRegions)

router.post('/ai/chat', postAiChat)
router.post('/ai/campaign-ideas', postCampaignIdeas)

router.get('/users', getUsers)
router.patch('/users/:id/status', validateRequest(validateUserStatus), patchUserStatus)
router.patch('/users/:id/password', patchUserPassword)
router.delete('/users/:id', removeUser)

router.get('/events', getEvents)
router.patch('/events/:id/approve', approve)
router.patch('/events/:id/reject', validateRequest(validateEventReject), reject)
router.delete('/events/:id', remove)

router.get('/participation', getParticipation)
router.get('/participation/categories', getParticipationCategories)
router.get('/activity-log', getActivityLog)

router.get('/premature-closures', getPrematureClosures)
router.post('/premature-closures/:eventId/warn', validateRequest(validateOrganizerWarning), postOrganizerWarning)

router.get('/revenue', getRevenue)
router.get('/subscriptions', getSubscriptions)
router.patch('/subscriptions/:userId', patchSubscriptionTier)

router.get('/certificate-templates', getCertificateTemplates)
router.post('/certificate-templates', handleCertificateTemplateUpload, postCertificateTemplate)
router.patch('/certificate-templates/:id/activate', patchCertificateTemplateActive)
router.delete('/certificate-templates/:id', deleteCertificateTemplateRoute)

export default router
