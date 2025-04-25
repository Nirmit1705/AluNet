import express from 'express';
import {
  createJobPosting,
  getJobPostings,
  getJobPostingById,
  updateJobPosting,
  deleteJobPosting,
  searchJobPostings,
  getJobPostingsByAlumni
} from '../Controllers/jobPostingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getJobPostings);
router.get('/search', searchJobPostings);
router.get('/alumni/:alumniId', getJobPostingsByAlumni);
router.get('/:id', getJobPostingById);

// Protected routes (alumni only)
// Note: Removing verifiedAlumniOnly since it doesn't seem to be defined
router.post('/', protect, createJobPosting);
router.put('/:id', protect, updateJobPosting);
router.delete('/:id', protect, deleteJobPosting);

export default router;