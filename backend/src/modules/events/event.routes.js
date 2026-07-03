import { Router } from 'express'
import { create, listMine, getOne, addRoleToEvent, addRequirementToEvent, close } from './event.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.js'
import { requireRole } from '../../middlewares/requireRole.js'
import { validateRequest } from '../../middlewares/validateRequest.js'
import { validateCreateEvent, validateAddRole, validateAddRequirement, validateCloseEvent } from './event.validation.js'

const router = Router()

router.use(requireAuth, requireRole('ORGANIZER'))

router.post('/', validateRequest(validateCreateEvent), create)
router.get('/mine', listMine)
router.get('/:id', getOne)
router.post('/:id/roles', validateRequest(validateAddRole), addRoleToEvent)
router.post('/:id/requirements', validateRequest(validateAddRequirement), addRequirementToEvent)
router.post('/:id/close', validateRequest(validateCloseEvent), close)

export default router
