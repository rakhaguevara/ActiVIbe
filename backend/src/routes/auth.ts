import { Router } from 'express';
import {
  register,
  verifyOTP,
  login,
  refreshAccessToken,
} from '../controllers/auth';

const router = Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/refresh-token', refreshAccessToken);

export default router;
