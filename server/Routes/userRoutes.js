import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Simple route for testing
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'User API is working'
  });
});

// This route would typically include user authentication that's common to both students and alumni
router.get('/me', protect, (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.userRole
  });
});

export default router;
