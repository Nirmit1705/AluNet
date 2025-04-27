import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadVerificationDocument, uploadProfilePictureHandler } from '../Controllers/uploadController.js';

const router = express.Router();

// Public route for verification document uploads
router.post('/verification', uploadVerificationDocument);

// Protected route for profile picture uploads (requires authentication)
router.post('/profile-picture', protect, uploadProfilePictureHandler);

export default router;
