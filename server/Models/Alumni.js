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
    emailVerificationToken: {
        type: String,
        select: false
    },
    emailVerificationExpires: {
        type: Date,
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
    }
}, {
    timestamps: true
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

// Add indexes for better search performance
AlumniSchema.index({ name: 'text', degree: 'text', specialization: 'text', company: 'text' });
AlumniSchema.index({ graduationYear: 1 });
AlumniSchema.index({ company: 1 });
AlumniSchema.index({ skills: 1 });
AlumniSchema.index({ mentorshipAvailable: 1 });
AlumniSchema.index({ isActive: 1 });  // IMPORTANT: Optimizes queries for active users

const Alumni = mongoose.model('Alumni', AlumniSchema);
export default Alumni;
