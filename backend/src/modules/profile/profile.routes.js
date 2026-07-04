import { Router } from 'express'
import { getMyProfile, updateMyProfile } from './profile.controller.js'
import { uploadCv, deleteCv } from './cv.controller.js'
import { handleCvUpload } from './cv.upload.js'
import { getInterests, getSkills } from './taxonomy.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.js'
import { validateRequest } from '../../middlewares/validateRequest.js'
import { validateProfileUpdateInput } from './profile.validation.js'

const router = Router()

router.get('/me', requireAuth, getMyProfile)
router.patch('/me', requireAuth, validateRequest(validateProfileUpdateInput), updateMyProfile)
router.post('/me/cv', requireAuth, handleCvUpload, uploadCv)
router.delete('/me/cv', requireAuth, deleteCv)
router.get('/interests', requireAuth, getInterests)
router.get('/skills', requireAuth, getSkills)

export default router
