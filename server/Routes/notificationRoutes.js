import express from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../Controllers/notificationController.js';
import { protect } from '../Middleware/authMiddleware.js';

const router = express.Router();

// All notification routes require authentication
router.use(protect);

// Get notifications
router.get('/', getNotifications);

// Mark a notification as read
router.put('/:id', markNotificationAsRead);

// Mark all notifications as read
router.put('/read-all', markAllNotificationsAsRead);

export default router;