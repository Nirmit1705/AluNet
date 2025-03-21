import express from 'express';
import { 
  verifyEmail, 
  forgotPassword, 
  resetPassword, 
  resendVerification 
} from '../Controllers/authController.js';
import { authLimiter, accountLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// Email verification routes
router.get('/verify-email/:userType/:token', verifyEmail);
router.post('/resend-verification/:userType', authLimiter, resendVerification);

// Password reset routes
router.post('/forgot-password/:userType', authLimiter, forgotPassword);
router.post('/reset-password/:userType/:token', accountLimiter, resetPassword);

export default router;