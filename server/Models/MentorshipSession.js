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
            return new Date(`1970-01-01T${value}`) > new Date(`1970-01-01T${this.startTime}`);
        },
        message: 'End time must be greater than start time.'
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
  frequency: { type: String, enum: ['one-time', 'weekly', 'monthly'], 
    default: 'one-time' }
}, {
  timestamps: true
});

// Add indexes for better querying performance
mentorshipSessionSchema.index({ mentorship: 1 });
mentorshipSessionSchema.index({ student: 1 });
mentorshipSessionSchema.index({ alumni: 1 });
mentorshipSessionSchema.index({ date: 1 });
mentorshipSessionSchema.index({ status: 1 });

const MentorshipSession = mongoose.model('MentorshipSession', mentorshipSessionSchema);
export default MentorshipSession;
