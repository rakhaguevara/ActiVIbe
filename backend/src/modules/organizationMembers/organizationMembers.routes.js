import { Router } from 'express'
import { list, invite, resend, updateRole, remove, getInvite, accept } from './organizationMembers.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.js'
import { requireRole } from '../../middlewares/requireRole.js'

const router = Router()

// Alur accept-invite (AcceptTeamInvitePage, portal organizer) — sengaja TANPA
// requireAuth, token sendiri jadi bukti kepemilikan undangan (pola sama
// organization.routes.js set-password/*). Didaftarkan sebelum
// router.use(requireAuth, ...) di bawah supaya tidak ikut ter-gate.
router.get('/invite/:token', getInvite)
router.post('/invite/:token/accept', accept)

router.use(requireAuth, requireRole('ORGANIZER'))

router.get('/', list)
router.post('/invite', invite)
router.post('/:id/resend', resend)
router.patch('/:id/role', updateRole)
router.delete('/:id', remove)

export default router
