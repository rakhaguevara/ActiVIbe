import { Router } from 'express'
import { requireAuth } from '../../middlewares/requireAuth.js'
import { requireRole } from '../../middlewares/requireRole.js'
import { getQueue, generate, generateBulk, regenerate, getGenerated, getVersions, getFailed, getActiveTemplate } from './certificate.controller.js'

const router = Router()

router.use(requireAuth, requireRole('ORGANIZER'))

router.get('/queue', getQueue)
router.get('/generated', getGenerated)
router.get('/failed', getFailed)
router.get('/active-template', getActiveTemplate)
router.get('/:certificateId/versions', getVersions)
router.post('/generate', generate)
router.post('/generate-bulk', generateBulk)
router.post('/:certificateId/regenerate', regenerate)

export default router
