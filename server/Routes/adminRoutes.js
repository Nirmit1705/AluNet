import express from 'express';
import { 
  adminLogin, 
  getDashboardStats, 
  getVerifications,
  getVerificationById,
  updateVerificationStatus,
  getUsers,
  updateUserStatus,
  getSystemLogs
} from '../Controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', adminLogin);

// Protected routes (admin only)
router.get('/dashboard-stats', protect, adminOnly, getDashboardStats);
router.get('/verifications', protect, adminOnly, getVerifications);
router.get('/verifications/:id', protect, adminOnly, getVerificationById);
router.put('/verifications/:id', protect, adminOnly, updateVerificationStatus);
router.get('/users', protect, adminOnly, getUsers);
router.put('/users/:id/status', protect, adminOnly, updateUserStatus);
router.get('/logs', protect, adminOnly, getSystemLogs);

export default router;
