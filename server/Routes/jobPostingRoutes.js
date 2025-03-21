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
import { protect, isAlumni } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getJobPostings);
router.get('/search', searchJobPostings);
router.get('/alumni/:alumniId', getJobPostingsByAlumni);
router.get('/:id', getJobPostingById);

// Protected routes (alumni only)
router.post('/', protect, isAlumni, createJobPosting);
router.put('/:id', protect, updateJobPosting);
router.delete('/:id', protect, deleteJobPosting);

export default router; 