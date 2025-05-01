import express from 'express';
import { 
  verifyEmail, 
  resendVerification,
  googleOAuthCallback, 
  googleOAuthRedirect,
  verifyToken
} from '../controllers/authController.js';
import { authLimiter, accountLimiter } from '../middleware/rateLimitMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Email verification routes
router.get('/verify-email/:userType/:token', verifyEmail);
router.post('/resend-verification/:userType', authLimiter, resendVerification);

// Google OAuth2 routes
router.get('/google', googleOAuthRedirect);
router.get('/google/callback', googleOAuthCallback);

// Add token verification endpoint
router.get('/verify', protect, verifyToken);

export default router;