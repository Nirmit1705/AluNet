import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AlumniSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    graduationYear: {
        type: Number,
        required: [true, 'Please add graduation year']
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
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    skills: [{
        type: String
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
    }]
}, {
    timestamps: true
});

// Encrypt password using bcrypt
AlumniSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    next();
});

// Match user entered password to hashed password in database
AlumniSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Add indexes for better search performance
AlumniSchema.index({ name: 'text', degree: 'text', specialization: 'text', company: 'text' });
AlumniSchema.index({ graduationYear: 1 });
AlumniSchema.index({ company: 1 });
AlumniSchema.index({ skills: 1 });
AlumniSchema.index({ mentorshipAvailable: 1 });

const Alumni = mongoose.model('Alumni', AlumniSchema);
export default Alumni;
