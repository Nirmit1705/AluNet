import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema({
  // Student is always the sender
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  // Alumni is always the recipient
  alumni: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alumni',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    default: 'I would like to connect with you.'
  },
  responseMessage: {
    type: String,
    default: ''
  },
  responseDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Create a compound index for the student-alumni pair to prevent duplicate connections
connectionSchema.index({ student: 1, alumni: 1 }, { unique: true });

// Remove the old problematic index if it exists
// This line doesn't actually remove the index - you need to do that in MongoDB directly
// but it ensures that Mongoose doesn't recreate it
// connectionSchema.index({ sender: 1, recipient: 1 }, { unique: false, sparse: true });

// Static method to find an existing connection between a student and an alumni
connectionSchema.statics.findExistingConnection = async function(studentId, alumniId) {
  return this.findOne({
    student: studentId,
    alumni: alumniId
  });
};

const Connection = mongoose.model('Connection', connectionSchema);

export default Connection;
