import express from 'express';
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../Controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All notification routes are protected
router.use(protect);

// Get all notifications for the current user
router.get('/', getUserNotifications);

// Get unread notification count
router.get('/unread/count', getUnreadNotificationCount);

// Mark a notification as read
router.put('/:id/read', markNotificationAsRead);

// Mark all notifications as read
router.put('/read-all', markAllNotificationsAsRead);

export default router;