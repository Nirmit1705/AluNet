import mongoose from 'mongoose';

const JobPostingSchema = new mongoose.Schema({
    // Add schema version for migration management
    schemaVersion: {
        type: Number,
        default: 1,
        required: true
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
    description: { 
        type: String, 
        required: true 
    },
    requirements: { 
        type: [String],
        required: true,
        default: []
    },
    jobType: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance', 'Full Time', 'Part Time', 'Contract', 'Internship', 'Remote'],
        required: [true, 'Job type is required'],
        default: 'full-time'
    },
    salary: {
        min: Number,
        max: Number,
        currency: {
            type: String,
            default: 'INR'
        },
        isVisible: {
            type: Boolean,
            default: true
        }
    },
    applicationLink: { 
        type: String, 
        required: true,
        validate: {
            validator: function(v) {
                return /^(http|https):\/\/[^ "]+$/.test(v);
            },
            message: props => `${props.value} is not a valid URL`
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
        immutable: true
    },
    applicationDeadline: {
        type: Date,
        required: false,
        validate: {
            validator: function(v) {
                return !v || v > new Date();
            },
            message: 'Application deadline must be in the future'
        }
    },
    // Add skill requirements for skill-based matching
    skillsRequired: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['active', 'closed', 'filled', 'draft', 'expired'],
        default: 'active'
    }
}, { timestamps: true });

// Add text search index for searching jobs
JobPostingSchema.index({ 
    title: 'text', 
    companyName: 'text', 
    description: 'text',
    location: 'text'
});

const JobPosting = mongoose.model('JobPosting', JobPostingSchema);
export default JobPosting;
