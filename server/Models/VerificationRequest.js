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
  unique: false, // Set to false to allow multiple verification requests with the same email
  background: true 
});

// Add pre-save middleware to handle duplicates
verificationRequestSchema.pre('save', async function(next) {
  try {
    // If this is an existing document being updated, just continue
    if (!this.isNew) {
      return next();
    }

    // If creating a new document, check for duplicates
    const existingRequest = await this.constructor.findOne({ email: this.email });
    if (existingRequest) {
      console.log(`Found existing verification request for email ${this.email}, updating instead of creating new`);
      
      // Copy fields from this document to the existing one
      Object.assign(existingRequest, {
        name: this.name,
        branch: this.branch,
        graduationYear: this.graduationYear,
        university: this.university,
        currentCompany: this.currentCompany,
        currentRole: this.currentRole,
        documentURL: this.documentURL,
        userId: this.userId,
        status: 'pending', // Reset to pending
        rejectionReason: null, // Clear any rejection reason
      });
      
      // Save the updated document
      await existingRequest.save();
      
      // Skip creating a new document
      return next(new Error('Duplicate email - updated existing document instead'));
    }
    
    // No duplicate found, continue with save
    next();
  } catch (error) {
    next(error);
  }
});

const VerificationRequest = mongoose.model('VerificationRequest', verificationRequestSchema);

export default VerificationRequest;
