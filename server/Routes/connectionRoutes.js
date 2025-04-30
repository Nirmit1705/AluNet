import express from 'express';
import {
  requestConnection,
  getPendingRequests,
  getConnections,
  respondToRequest,
  getSentRequests,
  getConnectedMentors,
  getConnectedStudents
} from '../Controllers/connectionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Request a connection
router.post('/request', requestConnection);

// Get all pending connection requests
router.get('/requests/pending', getPendingRequests);

// Get all sent connection requests for students
router.get('/requests/sent', getSentRequests);

// Respond to a connection request (accept/reject)
router.put('/requests/:id/respond', respondToRequest);

// Get all connections
router.get('/', getConnections);

// Get connected mentors (for students)
router.get('/mentors', getConnectedMentors);

// Get connected students (for alumni)
router.get('/students', getConnectedStudents);

// Add a verification endpoint for messaging
router.get('/verify/:connectionId', protect, async (req, res) => {
  try {
    const { connectionId } = req.params;
    const userModel = req.user.constructor.modelName;
    let query = {};
    
    if (userModel === 'Student') {
      query = { _id: connectionId, student: req.user._id, status: 'accepted' };
    } else if (userModel === 'Alumni') {
      query = { _id: connectionId, alumni: req.user._id, status: 'accepted' };
    }
    
    const connection = await mongoose.model('Connection').findOne(query);
    res.json({ connected: !!connection });
  } catch (error) {
    console.error("Connection verification error:", error);
    res.status(500).json({ connected: false, error: error.message });
  }
});

export default router;
