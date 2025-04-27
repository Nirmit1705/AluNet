import express from 'express';
import { 
  adminLogin, 
  getDashboardStats, 
  getUsers, 
  updateUserStatus, 
  getSystemLogs,
  getVerifications,
  getVerificationById,
  updateVerificationRequest // This was incorrectly imported as updateVerificationStatus
} from '../Controllers/adminController.js';
import { adminProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', adminLogin);

// Protected admin-only routes
router.get('/dashboard-stats', adminProtect, getDashboardStats);
router.get('/users', adminProtect, getUsers);
router.put('/users/:id/status', adminProtect, updateUserStatus);
router.get('/logs', adminProtect, getSystemLogs);

// Verification routes
router.get('/verifications', adminProtect, getVerifications);
router.get('/verifications/:id', adminProtect, getVerificationById);
router.put('/verifications/:id', adminProtect, updateVerificationRequest); // Fixed function name here

export default router;
