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
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure one feedback per user per mentorship
mentorshipFeedbackSchema.index({ mentorship: 1, fromStudent: 1 }, { unique: true });

const MentorshipFeedback = mongoose.model('MentorshipFeedback', mentorshipFeedbackSchema);
export default MentorshipFeedback;