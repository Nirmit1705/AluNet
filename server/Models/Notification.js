import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientModel'
  },
  recipientModel: {
    type: String,
    required: true,
    enum: ['Student', 'Alumni']
  },
  type: {
    type: String,
    required: true,
    enum: ['message', 'mentorship', 'job']
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel' // Link notifications to mentorships, sessions, jobs, etc.
  },
  relatedModel: {
    type: String,
    enum: ['Mentorship', 'MentorshipSession', 'JobPosting', 'Message'] // Identify the type of entity the notification is related to
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  schemaVersion: {
    type: Number,
    default: 1 // Track schema version
  }
});

// Static method to count unread notifications
notificationSchema.statics.countUnread = async function (recipientId) {
  return await this.countDocuments({ recipient: recipientId, isRead: false });
};

// Add indexes for better performance
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
