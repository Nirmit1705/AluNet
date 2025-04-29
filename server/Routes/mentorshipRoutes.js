import express from 'express';
import {
  createMentorshipRequest,
  getStudentMentorshipRequests,
  getAlumniMentorshipRequests,
  respondToMentorshipRequest,
  getAllMentorships,
  getMentees
} from '../Controllers/mentorshipController.js';
import {
  scheduleSession,
  getSessionsByMentorship,
  getSessionById,
  updateSession,
  cancelSession,
  getMyUpcomingSessions,
  checkCompletedSessions
} from '../Controllers/mentorshipSessionController.js';
import {
  submitFeedback,
  getFeedback,
  getReceivedFeedback,
  getFeedbackStats
} from '../Controllers/mentorshipFeedbackController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllMentorships);

// Protected routes for mentorship requests
router.post('/', protect, createMentorshipRequest);
router.get('/student', protect, getStudentMentorshipRequests);
router.get('/alumni', protect, getAlumniMentorshipRequests);
router.put('/:id/respond', protect, respondToMentorshipRequest);

// Important: Route order matters! Put specific routes before parameterized ones
router.get('/sessions/my-upcoming', protect, getMyUpcomingSessions);
router.get('/mentees', protect, getMentees);

// Mentorship Session Routes
router.post('/:mentorshipId/sessions', protect, scheduleSession);
router.get('/:mentorshipId/sessions', protect, getSessionsByMentorship);
router.get('/sessions/:sessionId', protect, getSessionById);
router.put('/sessions/:sessionId', protect, updateSession);
router.put('/sessions/:sessionId/cancel', protect, cancelSession);
router.get('/sessions/check-completed', protect, checkCompletedSessions);

// Mentorship Feedback Routes
router.post('/:mentorshipId/feedback', protect, submitFeedback);
router.get('/:mentorshipId/feedback', protect, getFeedback);
router.get('/feedback/received', protect, getReceivedFeedback);
router.get('/feedback/stats', protect, getFeedbackStats);

export default router;