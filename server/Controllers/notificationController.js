import Notification from '../Models/Notification.js';
import asyncHandler from 'express-async-handler';

// @desc    Create a new notification
// @route   Used internally by other controllers
// @access  Private
const createNotification = async (recipient, recipientModel, type, title, message, relatedId = null) => {
  if (!recipient || !recipientModel || !type || !title || !message) {
    console.error('Missing required fields for notification creation');
    return null;
  }

  try {
    const notification = await Notification.create({
      recipient,
      recipientModel,
      type,
      title,
      message,
      relatedId
    });
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// @desc    Get all notifications for the current user
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    recipient: req.user._id,
    recipientModel: req.user.constructor.modelName
  })
  .sort({ createdAt: -1 })
  .limit(50);
  
  res.json(notifications);
});

// @desc    Get unread notification count for the current user
// @route   GET /api/notifications/unread/count
// @access  Private
const getUnreadNotificationCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    recipientModel: req.user.constructor.modelName,
    isRead: false
  });
  
  res.json({ count });
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  
  // Check if the notification belongs to the current user
  if (notification.recipient.toString() !== req.user._id.toString() || 
      notification.recipientModel !== req.user.constructor.modelName) {
    res.status(403);
    throw new Error('Not authorized to access this notification');
  }
  
  notification.isRead = true;
  await notification.save();
  
  res.json({ message: 'Notification marked as read' });
});

// @desc    Mark all notifications as read for the current user
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    {
      recipient: req.user._id,
      recipientModel: req.user.constructor.modelName,
      isRead: false
    },
    { isRead: true }
  );
  
  res.json({ message: 'All notifications marked as read' });
});

export { 
  createNotification,
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead
};