import mongoose from 'mongoose';

const mentorshipFeedbackSchema = new mongoose.Schema({
  mentorship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentorship',
    required: true
  },
  fromStudent: {
    type: Boolean,
    required: true
  }, // Differentiate feedback from students vs. alumni
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }, // Rating out of 5
  feedback: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 500
  }, // Detailed feedback content
  createdAt: {
    type: Date,
    default: Date.now
  },
  meetingLink: {
    type: String // Link for online mentorship sessions
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  }, // Track session progress
  feedbackGiven: {
    type: Boolean,
    default: false
  }, // Check if feedback is provided
  isActive: {
    type: Boolean,
    default: true
  },
  schemaVersion: {
    type: Number,
    default: 1
  } // Schema version for tracking changes
}, {
  timestamps: true
});

// Ensure one feedback per user per mentorship
mentorshipFeedbackSchema.index({ mentorship: 1, fromStudent: 1 }, { unique: true });

const MentorshipFeedback = mongoose.model('MentorshipFeedback', mentorshipFeedbackSchema);
export default MentorshipFeedback;
