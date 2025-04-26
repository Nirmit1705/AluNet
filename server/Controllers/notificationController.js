import Notification from '../Models/Notification.js';
import asyncHandler from 'express-async-handler';

// @desc    Create a notification
// @route   Internal function, not an API endpoint
// @access  Private
const createNotification = async (recipientId, recipientModel, type, title, message, referenceId) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      recipientModel,
      type,
      title,
      message,
      referenceId,
      read: false
    });
    
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
};

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ 
    recipient: req.user._id,
    recipientModel: req.user.registrationNumber ? 'Student' : 'Alumni'
  }).sort('-createdAt');
  
  res.json(notifications);
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id
// @access  Private
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  
  // Check if this notification belongs to the user
  if (!notification.recipient.equals(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to update this notification');
  }
  
  notification.read = true;
  await notification.save();
  
  res.json(notification);
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { 
      recipient: req.user._id,
      recipientModel: req.user.registrationNumber ? 'Student' : 'Alumni',
      read: false
    },
    { read: true }
  );
  
  res.json({ message: 'All notifications marked as read' });
});

export { createNotification, getNotifications, markNotificationAsRead, markAllNotificationsAsRead };