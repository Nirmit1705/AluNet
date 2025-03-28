import mongoose from 'mongoose';

const JobPostingSchema = new mongoose.Schema({
    // Add schema version for migration management
    schemaVersion: {
        type: Number,
        default: 1,
        required: true
        // CRITICAL: Enables schema evolution tracking for future migrations
    },
    title: { 
        type: String, 
        required: true,
        trim: true
    },
    companyName: { 
        type: String, 
        required: true,
        trim: true
    },
    location: { 
        type: String, 
        required: true 
    },
    // Add structured location data
    locationData: {
        city: String,
        state: String,
        country: String,
        remote: {
            type: Boolean,
            default: false
        }
        // IMPORTANT: Enables location-based filtering and search
    },
    description: { 
        type: String, 
        required: true 
    },
    requirements: { 
        type: String, 
        required: true 
    },
    // Add structured requirements
    requiredSkills: [{
        type: String,
        trim: true
        // IMPORTANT: Enables skills-based matching
    }],
    // Add job type classification
    jobType: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
        required: [true, 'Job type is required']
        // CRITICAL: Enables proper job classification and filtering
    },
    // Add experience level
    experienceLevel: {
        type: String,
        enum: ['entry', 'junior', 'mid-level', 'senior', 'executive'],
        required: [true, 'Experience level is required']
        // IMPORTANT: Enables appropriate targeting for different career stages
    },
    // Add salary information
    salary: {
        min: Number,
        max: Number,
        currency: {
            type: String,
            default: 'USD'
        },
        isVisible: {
            type: Boolean,
            default: true
        }
        // CRITICAL: Provides essential compensation information
    },
    applicationLink: { 
        type: String, 
        required: true,
        validate: {
            validator: function(v) {
                return /^(http|https):\/\/[^ "]+$/.test(v);
            },
            message: props => `${props.value} is not a valid URL`
            // IMPORTANT: Ensures valid external links
        }
    },
    postedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Alumni',
        required: true,
        index: true
    },
    postedAt: { 
        type: Date, 
        default: Date.now,
        immutable: true // CRITICAL: Ensures data integrity
    },
    // Add expiration date
    expiresAt: {
        type: Date,
        required: [true, 'Job posting expiration date is required'],
        validate: {
            validator: function(v) {
                return v > this.postedAt;
            },
            message: 'Expiration date must be after posting date'
            // CRITICAL: Prevents displaying outdated job postings
        }
    },
    // Add job post status
    status: {
        type: String,
        enum: ['active', 'closed', 'filled', 'draft', 'expired'],
        default: 'active',
        index: true
        // CRITICAL: Enables lifecycle management of job postings
    },
    // Track statistics
    views: {
        type: Number,
        default: 0
        // IMPORTANT: Provides engagement metrics
    },
    clicks: {
        type: Number,
        default: 0
        // IMPORTANT: Provides conversion metrics
    },
    // Add industry classification
    industry: {
        type: String,
        required: [true, 'Industry is required']
        // IMPORTANT: Enables industry-based filtering
    },

    // NEW ADDITIONS (As Per Your Request) 👇👇👇

    // Add remote work classification
    remoteWork: {
        type: String,
        enum: ['remote', 'hybrid', 'onsite'],
        required: true,
        default: 'onsite'
        // IMPORTANT: Allows filtering based on work location preference
    },

    // Add recruiter contact information
    recruiterContact: {
        name: { type: String, required: true, trim: true },
        email: { 
            type: String, 
            required: true,
            validate: {
                validator: function(v) {
                    return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
                },
                message: props => `${props.value} is not a valid email`
            }
        },
        phone: { type: String, trim: true }
        // CRITICAL: Enables direct communication with recruiters
    },

    // Add application deadline
    applicationDeadline: {
        type: Date,
        required: [true, 'Application deadline is required'],
        validate: {
            validator: function(v) {
                return v > new Date();
            },
            message: 'Application deadline must be in the future'
        }
        // IMPORTANT: Helps candidates apply within valid time
    },

    // Track number of applications
    applicationsReceived: {
        type: Number,
        default: 0
        // CRITICAL: Provides insights on job engagement
    },

    // Store alumni referrals for job posting
    alumniReferrals: [{
        alumniId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Alumni'
        },
        referredAt: { type: Date, default: Date.now }
        // IMPORTANT: Tracks referrals and recommendations
    }]
}, { timestamps: true });

// Add text search index for searching jobs
JobPostingSchema.index({ 
    title: 'text', 
    companyName: 'text', 
    description: 'text',
    industry: 'text',
    location: 'text'
});

// Add compound index for filtering
JobPostingSchema.index({ 
    status: 1, 
    jobType: 1, 
    experienceLevel: 1, 
    industry: 1 
});

// Add index for optimized queries on applicationDeadline & remoteWork
JobPostingSchema.index({ applicationDeadline: 1, remoteWork: 1 });

// Add method to track views
JobPostingSchema.methods.incrementViews = function() {
    this.views += 1;
    return this.save();
    // IMPORTANT: Tracks engagement metrics
};

// Add method to track application clicks
JobPostingSchema.methods.incrementClicks = function() {
    this.clicks += 1;
    return this.save();
    // IMPORTANT: Tracks conversion metrics
};

// Add method to track applications
JobPostingSchema.methods.incrementApplications = function() {
    this.applicationsReceived += 1;
    return this.save();
    // CRITICAL: Tracks how many candidates applied
};

// Add method to close a job posting
JobPostingSchema.methods.closeJob = function(reason = 'filled') {
    this.status = reason === 'filled' ? 'filled' : 'closed';
    return this.save();
    // CRITICAL: Proper lifecycle management
};

// Add middleware to check and update expired jobs
JobPostingSchema.pre(/^find/, function(next) {
    // Update expired jobs
    this.model.updateMany(
        { 
            status: 'active', 
            expiresAt: { $lt: new Date() }
        },
        { 
            status: 'expired' 
        }
    ).exec();
    
    // Continue with the query
    next();
    // CRITICAL: Ensures users don't see expired job listings
});

const JobPosting = mongoose.model('JobPosting', JobPostingSchema);
export default JobPosting;
