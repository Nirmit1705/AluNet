import mongoose from 'mongoose';

const JobPostingSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    companyName: { 
        type: String, 
        required: true 
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
        type: String, 
        required: true 
    },
    applicationLink: { 
        type: String, 
        required: true 
    },
    postedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Alumni',
        required: true 
    },
    postedAt: { 
        type: Date, 
        default: Date.now 
    }
}, {
    timestamps: true
});

// Add text search index for searching jobs
JobPostingSchema.index({ 
    title: 'text', 
    companyName: 'text', 
    description: 'text' 
});

const JobPosting = mongoose.model('JobPosting', JobPostingSchema);
export default JobPosting;
