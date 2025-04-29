import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  requestConnection,
  getPendingRequests,
  getConnections,
  respondToRequest,
  getSentRequests,
  getConnectedMentors
} from '../Controllers/connectionController.js';

const router = express.Router();

// Connection request routes
router.post('/request', protect, requestConnection);
router.get('/requests/pending', protect, getPendingRequests);
router.get('/requests/sent', protect, getSentRequests);
router.put('/requests/:id/respond', protect, respondToRequest);
router.get('/', protect, getConnections);

// Add the route for getting connected mentors
router.get('/mentors', protect, getConnectedMentors);

export default router;
