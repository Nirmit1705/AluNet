import mongoose from 'mongoose';

const mentorshipSchema = new mongoose.Schema({
    student: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Student', 
        required: true 
    },
    alumni: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Alumni', 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'rejected', 'completed'],
        default: 'pending',
        required: true 
    },
    requestMessage: { 
        type: String,
        required: true 
    },
    responseMessage: { 
        type: String
    },
    requestDate: { 
        type: Date, 
        default: Date.now 
    },
    responseDate: { 
        type: Date
    },
    mentorshipGoals: { 
        type: String,
        required: true 
    },
    skillsToLearn: [{ 
        type: String 
    }],
    timeRequired: { 
        type: String,
        required: true 
    },
    availability: { 
        type: String,
        required: true 
    },
    meetingFrequency: { 
        type: String
    },
    meetingMode: { 
        type: String,
        enum: ['online', 'in-person', 'hybrid'],
        default: 'online'
    }
}, {
    timestamps: true
});

// Add indexes for better search performance
mentorshipSchema.index({ student: 1, alumni: 1 });
mentorshipSchema.index({ status: 1 });
mentorshipSchema.index({ requestDate: 1 });

const Mentorship = mongoose.model('Mentorship', mentorshipSchema);
export default Mentorship;
