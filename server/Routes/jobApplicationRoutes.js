import express from 'express';
import {
  submitApplication,
  getJobApplications,
  getMyApplications,
  updateApplicationStatus
} from '../Controllers/jobApplicationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Job application routes
router.post('/:jobId/apply', protect, submitApplication);
router.get('/:jobId/applications', protect, getJobApplications);
router.get('/applications/my-applications', protect, getMyApplications);
router.put('/applications/:id', protect, updateApplicationStatus);

export default router;
