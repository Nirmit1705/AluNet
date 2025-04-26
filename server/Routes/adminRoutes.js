import express from 'express';
import {
  adminLogin,
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getVerifications,
  updateVerificationStatus,
  getSystemLogs
} from '../Controllers/adminController.js';
import { adminProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', adminLogin);

// Debug route to check token validity
router.get('/verify-token', adminProtect, (req, res) => {
  res.status(200).json({ 
    valid: true, 
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: 'admin'
    }
  });
});

// Protected routes
router.get('/dashboard-stats', adminProtect, getDashboardStats);
router.get('/users', adminProtect, getUsers);
router.put('/users/:id/status', adminProtect, updateUserStatus);
router.get('/verifications', adminProtect, getVerifications);
router.put('/verifications/:id', adminProtect, updateVerificationStatus);
router.get('/logs', adminProtect, getSystemLogs);

export default router;
