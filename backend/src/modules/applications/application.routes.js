import { Router } from 'express'
import { apply, myApplications } from './application.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.js'
import { validateRequest } from '../../middlewares/validateRequest.js'
import { validateApplyInput } from './application.validation.js'

const router = Router()

router.post('/', requireAuth, validateRequest(validateApplyInput), apply)
router.get('/me', requireAuth, myApplications)

export default router
