import express from 'express';
import {
  sendMessage,
  getConversation,
  getConversations,
  markMessageAsRead,
  deleteMessage
} from '../Controllers/messageController.js';
import { protect } from '../Middleware/authMiddleware.js';

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
router.put('/:messageId/read', markMessageAsRead);

// Delete message (for current user only)
router.delete('/:messageId', deleteMessage);

export default router;