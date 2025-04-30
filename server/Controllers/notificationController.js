import asyncHandler from 'express-async-handler';
import Notification from '../Models/Notification.js';

/**
 * @desc    Create a notification
 * @access  Private (internal)
 */
const createNotification = async (recipientId, recipientModel, type, title, message, relatedId) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      recipientModel,
      type,
      title,
      message,
      relatedId,
      isRead: false
    });
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * @desc    Get notifications for current user
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userModel = req.user.registrationNumber ? 'Student' : 'Alumni';
  
  const notifications = await Notification.find({
    recipient: userId,
    recipientModel: userModel
  })
  .sort({ createdAt: -1 })
  .limit(50);
  
  res.json(notifications);
});

/**
 * @desc    Mark a notification as read
 * @route   PUT /api/notifications/:id
 * @access  Private
 */
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notificationId = req.params.id;
  const userId = req.user._id;
  
  const notification = await Notification.findById(notificationId);
  
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  
  // Check if this notification belongs to the user
  if (notification.recipient.toString() !== userId.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this notification');
  }
  
  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();
  
  res.json(notification);
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userModel = req.user.registrationNumber ? 'Student' : 'Alumni';
  
  await Notification.updateMany(
    { 
      recipient: userId, 
      recipientModel: userModel,
      isRead: false
    },
    { 
      isRead: true,
      readAt: new Date()
    }
  );
  
  res.json({ success: true, message: 'All notifications marked as read' });
});

export {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
};