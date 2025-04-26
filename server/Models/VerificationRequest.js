import mongoose from 'mongoose';

const verificationRequestSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name']
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      // Don't enforce uniqueness at the schema level to allow updates
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    phone: {
      type: String
    },
    university: {
      type: String,
      required: [true, 'Please add your university']
    },
    degree: {
      type: String,
      required: [true, 'Please add your degree']
    },
    branch: {
      type: String
    },
    graduationYear: {
      type: Number,
      required: [true, 'Please add your graduation year']
    },
    currentCompany: {
      type: String
    },
    currentRole: {
      type: String
    },
    documentURL: {
      type: String,
      required: [true, 'Please upload a verification document']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alumni'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    rejectionReason: {
      type: String
    },
    workExperience: {
      type: Number
    },
    dateOfBirth: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Create an index with a unique constraint but remove it from the schema validation
verificationRequestSchema.index({ email: 1 }, { 
  unique: false, // Change to false to allow updates for the same email
  background: true 
});

const VerificationRequest = mongoose.model('VerificationRequest', verificationRequestSchema);

export default VerificationRequest;
