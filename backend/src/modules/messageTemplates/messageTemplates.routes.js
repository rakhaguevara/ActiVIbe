import { Router } from 'express'
import { list, create, update, duplicate, remove } from './messageTemplates.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.js'
import { requireRole } from '../../middlewares/requireRole.js'

const router = Router()

router.use(requireAuth, requireRole('ORGANIZER'))

router.get('/', list)
router.post('/', create)
router.patch('/:id', update)
router.delete('/:id', remove)
router.post('/:id/duplicate', duplicate)

export default router
