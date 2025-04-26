import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AlumniSchema = new mongoose.Schema({
    // Add schema version for migration management
    schemaVersion: {
        type: Number,
        default: 1,
        required: true
        // CRITICAL: Enables schema evolution tracking for future migrations
    },
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
        lowercase: true, // IMPORTANT: Ensures email consistency regardless of input case
        trim: true // IMPORTANT: Removes accidental whitespace
    },
    password: {
        type: String,
        required: function() {
            // Password is only required if there's no googleId
            return !this.googleId;
        },
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    graduationYear: {
        type: Number,
        required: [true, 'Please add graduation year'],
        validate: {
            validator: function(v) {
                return v >= 1950 && v <= new Date().getFullYear();
            },
            message: props => `${props.value} is not a valid graduation year!`
            // CRITICAL: Domain-specific validation prevents data inconsistencies
        }
    },
    branch: {
        type: String,
        required: [true, 'Please add branch']
    },
    // Email verification fields
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    // Verification status fields
    verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    verificationDocument: {
        url: String,
        public_id: String,
        filename: String
    },
    verificationSubmittedAt: {
        type: Date,
        default: null
    },
    verificationApprovedAt: {
        type: Date,
        default: null
    },
    verificationApprovedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    verificationRejectedAt: {
        type: Date,
        default: null
    },
    verificationRejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    verificationRejectionReason: {
        type: String,
        default: ''
    },
    emailVerificationToken: {
        type: String,
        select: false
    },
    // Password reset fields
    resetPasswordToken: {
        type: String,
        select: false
    },
    resetPasswordExpires: {
        type: Date,
        select: false
    },
    // Profile fields
    profilePicture: {
        type: String,
        default: ''
    },
    cloudinaryId: {
        type: String,
        default: ''
    },
    company: {
        type: String,
        default: ''
    },
    position: {
        type: String,
        default: ''
    },
    linkedInProfile: {
        type: String,
        default: '',
        validate: {
            validator: function(v) {
                // Allow empty string or valid LinkedIn URL
                return v === '' || /^https:\/\/(www\.)?linkedin\.com\/in\/[\w-]{5,30}[\/]?$/.test(v);
            },
            message: props => `${props.value} is not a valid LinkedIn profile URL`
            // IMPORTANT: Validates external links to prevent invalid data
        }
    },
    bio: {
        type: String,
        default: '',
        maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    skills: [{
        type: String,
        trim: true // IMPORTANT: Standardizes data by removing whitespace
    }],
    industry: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    mentorshipAvailable: {
        type: Boolean,
        default: false
    },
    mentorshipAreas: [{
        type: String
    }],
    // Add soft deletion support
    isActive: {
        type: Boolean,
        default: true
        // CRITICAL: Enables soft deletion strategy to maintain referential integrity
    },
    lastActive: {
        type: Date,
        default: Date.now
        // IMPORTANT: Provides user engagement metrics for analytics
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    // Add role field
    role: {
        type: String,
        default: 'alumni',
        immutable: true // Prevents role from being changed
    }
}, {
    timestamps: true
});

// Set default status for any alumni document
AlumniSchema.pre('validate', function(next) {
  console.log(`Alumni pre-validate hook running for ${this._id}`);
  
  // If status is undefined or null, set a default status
  if (!this.status) {
    this.status = this.isVerified ? 'active' : 'pending';
    console.log(`Setting default status '${this.status}' for alumni ${this._id}`);
  }
  
  // Ensure isVerified field exists and is consistent with status
  if (this.status === 'active' && !this.isVerified) {
    this.isVerified = true;
    console.log(`Setting isVerified to true for active alumni ${this._id}`);
  }
  
  // Also check verificationStatus for consistency 
  if (this.verificationStatus === 'approved' && !this.isVerified) {
    this.isVerified = true;
    console.log(`Setting isVerified to true based on verificationStatus for alumni ${this._id}`);
  }
  
  // If verified, ensure status is active
  if (this.isVerified && this.status !== 'active') {
    this.status = 'active';
    console.log(`Setting status to active for verified alumni ${this._id}`);
  }
  
  next();
});

// Encrypt password using bcrypt
AlumniSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(new Error('Password encryption failed: ' + error.message));
        // CRITICAL: Error handling prevents silent failures in authentication flow
    }
});

// Match user entered password to hashed password in database
AlumniSchema.methods.matchPassword = async function(enteredPassword) {
    try {
        return await bcrypt.compare(enteredPassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed: ' + error.message);
        // CRITICAL: Proper error handling for authentication failures
    }
};

// Update lastActive timestamp
AlumniSchema.methods.updateActivity = function() {
    this.lastActive = Date.now();
    return this.save();
    // IMPORTANT: Enables user engagement tracking
};

// Add soft delete method
AlumniSchema.methods.softDelete = function() {
    this.isActive = false;
    return this.save();
    // CRITICAL: Maintains referential integrity when "deleting" records
};

// Add static method to find active users only
AlumniSchema.statics.findActive = function(query = {}) {
    return this.find({ ...query, isActive: true });
    // IMPORTANT: Simplifies queries to automatically filter deleted records
};

// Add middleware to prevent querying inactive records
AlumniSchema.pre(/^find/, function(next) {
    // This excludes queries that explicitly set isActive
    if (this.getQuery().isActive === undefined) {
        this.find({ isActive: true });
    }
    next();
    // CRITICAL: Ensures deleted records aren't accidentally accessed
});

// Add this logging middleware to see exactly what's being validated
AlumniSchema.pre('validate', function(next) {
  console.log('Validating alumni with data:', this.toObject());
  next();
});

// Add indexes for better search performance
AlumniSchema.index({ name: 'text', degree: 'text', specialization: 'text', company: 'text' });
AlumniSchema.index({ graduationYear: 1 });
AlumniSchema.index({ company: 1 });
AlumniSchema.index({ skills: 1 });
AlumniSchema.index({ mentorshipAvailable: 1 });
AlumniSchema.index({ isActive: 1 });  // IMPORTANT: Optimizes queries for active users

const Alumni = mongoose.model('Alumni', AlumniSchema);
export default Alumni;
