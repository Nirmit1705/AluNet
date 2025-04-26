import mongoose from 'mongoose';

const mentorshipSchema = new mongoose.Schema({
    // Add schema version for migration management
    schemaVersion: {
        type: Number,
        default: 1,
        required: true
        // CRITICAL: Enables schema evolution tracking for future migrations
    },
    student: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Student', 
        required: true,
        index: true // IMPORTANT: Optimizes common lookups by student
    },
    alumni: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Alumni', 
        required: true,
        index: true // IMPORTANT: Optimizes common lookups by alumni
    },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
        default: 'pending',
        required: true 
    },
    requestMessage: { 
        type: String,
        required: true,
        maxlength: [1000, 'Request message cannot exceed 1000 characters']
        // IMPORTANT: Prevents excessively large documents
    },
    responseMessage: { 
        type: String,
        maxlength: [1000, 'Response message cannot exceed 1000 characters']
    },
    requestDate: { 
        type: Date, 
        default: Date.now,
        immutable: true // CRITICAL: Ensures data integrity of record creation time
    },
    responseDate: { 
        type: Date
    },
    mentorshipGoals: { 
        type: String,
        required: true,
        maxlength: [2000, 'Mentorship goals cannot exceed 2000 characters']
    },
    skillsToLearn: [{ 
        type: String,
        trim: true // IMPORTANT: Standardizes data by removing whitespace
        // Skills mentees want to develop
    }],
    timeRequired: { 
        type: String,
        required: true,
        maxlength: [100, 'Time required cannot exceed 100 characters']
        // Preferred session duration
    },
    availability: { 
        type: String,
        required: true,
        maxlength: [200, 'Availability cannot exceed 200 characters']
        // Preferred availability for mentorship sessions
    },
    meetingFrequency: { 
        type: String,
        maxlength: [100, 'Meeting frequency cannot exceed 100 characters']
        // How often mentorship sessions are held
    },
    meetingMode: { 
        type: String,
        enum: ['online', 'in-person', 'hybrid'],
        default: 'online'
        // Preferred mode of mentorship
    },
    // Add start/end dates for proper lifecycle management
    startDate: {
        type: Date
        // CRITICAL: Necessary for relationship lifecycle management
    },
    endDate: {
        type: Date
        // CRITICAL: Necessary for relationship lifecycle management
    },
    isActive: {
        type: Boolean,
        default: true
        // CRITICAL: Enables soft deletion strategy
        // Indicates if the mentorship is active
    },
    // Add status history for audit trail
    statusHistory: [{
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
            required: true
        },
        changedAt: {
            type: Date,
            default: Date.now,
            required: true
        },
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'statusHistoryModel',
            required: true
        },
        statusHistoryModel: {
            type: String,
            enum: ['Student', 'Alumni'],
            required: true
        },
        reason: String
        // CRITICAL: Provides audit trail for compliance and dispute resolution
        // Track changes in mentorship status
    }]
}, {
    timestamps: true
});

// Add a method to update status with history tracking
mentorshipSchema.methods.updateStatus = async function(newStatus, changedBy, model, reason = '') {
    // Record the status change in history
    this.statusHistory.push({
        status: newStatus,
        changedAt: Date.now(),
        changedBy: changedBy,
        statusHistoryModel: model,
        reason: reason
    });
    
    // Update the current status
    this.status = newStatus;
    
    // Set start date if accepting
    if (newStatus === 'accepted' && !this.startDate) {
        this.startDate = Date.now();
    }
    
    // Set end date if completing or cancelling
    if (['completed', 'cancelled'].includes(newStatus) && !this.endDate) {
        this.endDate = Date.now();
    }
    
    return this.save();
    // CRITICAL: Ensures complete and accurate status tracking
};

// Middleware to set initial status history
mentorshipSchema.pre('save', function(next) {
    if (this.isNew) {
        this.statusHistory = [{
            status: this.status,
            changedAt: this.requestDate || Date.now(),
            changedBy: this.student,
            statusHistoryModel: 'Student',
            reason: 'Initial request'
        }];
    }
    next();
    // IMPORTANT: Ensures consistent initialization of audit trail
});

// Static method to find active mentorships
mentorshipSchema.statics.findActive = function(query = {}) {
    return this.find({ ...query, isActive: true, status: { $nin: ['rejected', 'completed', 'cancelled'] } });
    // IMPORTANT: Simplifies common query patterns
};

// Add soft delete method
mentorshipSchema.methods.softDelete = function() {
    this.isActive = false;
    return this.save();
    // CRITICAL: Maintains referential integrity when "deleting" records
};

// Add middleware to prevent querying inactive mentorships
mentorshipSchema.pre(/^find/, function(next) {
    // This excludes queries that explicitly set isActive
    if (this.getQuery().isActive === undefined) {
        this.find({ isActive: true });
    }
    next();
    // CRITICAL: Ensures deleted records aren't accidentally accessed
});

// Add indexes for better search performance
mentorshipSchema.index({ student: 1, alumni: 1 });
mentorshipSchema.index({ status: 1 });
mentorshipSchema.index({ requestDate: 1 });
mentorshipSchema.index({ isActive: 1 });
mentorshipSchema.index({ startDate: 1, endDate: 1 });

const Mentorship = mongoose.model('Mentorship', mentorshipSchema);
export default Mentorship;
