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