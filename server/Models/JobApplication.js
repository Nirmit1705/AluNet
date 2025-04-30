import mongoose from 'mongoose';

const JobApplicationSchema = new mongoose.Schema({
    // Add schema version for migration management
    schemaVersion: {
        type: Number,
        default: 1,
        required: true
    },
    
    // Basic application information
    jobPosting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobPosting',
        required: true,
        index: true
    },
    
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        index: true
    },
    
    // Application status
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
        default: 'pending',
        index: true
    },
    
    // Application details
    coverLetter: {
        type: String,
        required: true
    },
    
    resume: {
        url: String,
        filename: String,
        public_id: String
    },
    
    // Referral information
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Alumni',
        index: true
    },
    
    referredAt: {
        type: Date
    },
    
    // Tracking dates
    appliedAt: {
        type: Date,
        default: Date.now,
        required: true,
        index: true
    },
    
    reviewedAt: {
        type: Date
    },
    
    // Added by alumni/employer
    feedback: {
        type: String
    },
    
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    
    // Timestamps and audit
    notesInternal: {
        type: String
    }
}, { timestamps: true });

// Add compound indices for efficient querying
JobApplicationSchema.index({ jobPosting: 1, applicant: 1 }, { unique: true });
JobApplicationSchema.index({ jobPosting: 1, status: 1 });
JobApplicationSchema.index({ applicant: 1, status: 1 });

// Set up virtual for the application age
JobApplicationSchema.virtual('applicationAge').get(function() {
    return Math.floor((Date.now() - this.appliedAt) / (1000 * 60 * 60 * 24));
});

// Method to update application status
JobApplicationSchema.methods.updateStatus = async function(newStatus, notes) {
    // Update status
    this.status = newStatus;
    
    // Update timestamp based on status
    if (newStatus === 'reviewed' || newStatus === 'shortlisted' || newStatus === 'rejected') {
        this.reviewedAt = new Date();
    }
    
    // Add notes if provided
    if (notes) {
        this.notesInternal = this.notesInternal 
            ? `${this.notesInternal}\n\n${new Date().toISOString()}: ${notes}`
            : `${new Date().toISOString()}: ${notes}`;
    }
    
    return this.save();
};

// Add method for alumni to add referral
JobApplicationSchema.methods.addReferral = async function(alumniId) {
    this.referredBy = alumniId;
    this.referredAt = new Date();
    return this.save();
};

const JobApplication = mongoose.model('JobApplication', JobApplicationSchema);
export default JobApplication;
