import express from 'express';
import {
  sendMessage,
  getConversation,
  getConversations
} from '../Controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All message routes require authentication
router.use(protect);

// Get all conversations or send a new message
router.route('/')
  .get(getConversations)
  .post(sendMessage);

// Get specific conversation
router.get('/:userId', getConversation);

// Mark message as read
// router.put('/:messageId/read', markMessageAsRead);

export default router; 