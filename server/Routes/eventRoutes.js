import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Placeholder route for events
router.get('/', (req, res) => {
  res.json({
    message: 'Events API is under development',
    events: []
  });
});

export default router;
