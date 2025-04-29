import mongoose from 'mongoose';

const mentorshipSessionSchema = new mongoose.Schema({
  mentorship: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Mentorship',
    required: true
  },
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  alumni: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Alumni', 
    required: true 
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        // Basic validation to ensure end time is after start time
        return value !== this.startTime; // Simple check that they're not identical
      },
      message: 'End time must be different from start time.'
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  meetingLink: {
    type: String,
    required: false
  },
  frequency: { 
    type: String, 
    enum: ['one-time', 'weekly', 'monthly'], 
    default: 'one-time' 
  }
}, {
  timestamps: true
});

// Add pre-save middleware to debug session creation
mentorshipSessionSchema.pre('save', function(next) {
  console.log('Saving session with data:', JSON.stringify(this, null, 2));
  next();
});

// Add indexes for better querying performance
mentorshipSessionSchema.index({ mentorship: 1 });
mentorshipSessionSchema.index({ student: 1 });
mentorshipSessionSchema.index({ alumni: 1 });
mentorshipSessionSchema.index({ date: 1 });
mentorshipSessionSchema.index({ status: 1 });

const MentorshipSession = mongoose.model('MentorshipSession', mentorshipSessionSchema);

export default MentorshipSession;
