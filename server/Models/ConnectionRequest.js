import mongoose from 'mongoose';

const ConnectionRequestSchema = new mongoose.Schema({
  // Who initiated the request
  from: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'from.model'
    },
    model: {
      type: String,
      required: true,
      enum: ['Student', 'Alumni']
    }
  },
  // Who is receiving the request
  to: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'to.model'
    },
    model: {
      type: String,
      required: true,
      enum: ['Student', 'Alumni']
    }
  },
  // Status of the request
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  // Message included with the request
  message: {
    type: String,
    default: ''
  },
  // Response message (if any)
  responseMessage: {
    type: String,
    default: ''
  },
  // When the request was responded to
  responseDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Add indexes for efficient querying
ConnectionRequestSchema.index({ 'from.userId': 1, 'from.model': 1 });
ConnectionRequestSchema.index({ 'to.userId': 1, 'to.model': 1 });
ConnectionRequestSchema.index({ status: 1 });

const ConnectionRequest = mongoose.model('ConnectionRequest', ConnectionRequestSchema);
export default ConnectionRequest;
