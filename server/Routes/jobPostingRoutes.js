import express from 'express';
import { 
  createJobPosting, 
  getJobPostings, 
  getJobPostingById, 
  updateJobPosting, 
  deleteJobPosting, 
  searchJobPostings, 
  getJobPostingsByAlumni,
  getMyJobPostings
} from '../Controllers/jobPostingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getJobPostings);
router.get('/search', searchJobPostings);
router.get('/alumni/:alumniId', getJobPostingsByAlumni);

// Protected routes
router.post('/', protect, createJobPosting);
// IMPORTANT: This route must come before the /:id route
router.get('/my-jobs', protect, getMyJobPostings);
router.put('/:id', protect, updateJobPosting);
router.delete('/:id', protect, deleteJobPosting);

// ID-specific routes must be last to avoid conflict with named routes
router.get('/:id', getJobPostingById);

export default router;