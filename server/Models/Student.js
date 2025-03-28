const mongoose = require("mongoose");
const bcrypt = require('bcryptjs'); // ✅ Converted from ES Modules to CommonJS

// Internship Schema (Embedded)
const internshipSchema = new mongoose.Schema({
    company: { type: String, required: true },  
    duration: { type: String, required: true },
    role: { type: String, required: true }
});

// Project Schema (Embedded)
const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true }
});

// Student Schema
const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please add a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    phone: { type: String },
    registrationNumber: {
        type: String,
        required: [true, 'Please add a registration number'],
        unique: true
    },
    currentYear: {
        type: Number,
        required: [true, 'Please add current year']
    },
    branch: {
        type: String,
        required: [true, 'Please add a branch']
    },
    cgpa: { type: Number },
    skills: [{ type: String }],
    interests: [{ type: String }],
    bio: { type: String },
    linkedin: { type: String, match: /^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/ },
    github: { type: String },
    resume: { type: String },
    assignedMentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Alumni' },
    mentorRequests: [{
        mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Alumni' },
        status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
        requestDate: { type: Date, default: Date.now }
    }],
    internships: [internshipSchema], // Embedded array of internships
    projects: [projectSchema], // Embedded array of projects
    graduationYear: { type: Number, required: true },
    university: { type: String, required: true },
    college: { type: String, required: true },
    goal: { type: String },
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
    careerGoals: {
        type: String,
        default: ''
    },
    isActive: { type: Boolean, default: true },
    mentorshipInterests: [{
        type: String // Areas of interest for mentorship
    }],
    assignedMentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Alumni'
    },
    mentorRequests: [{
        mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alumni' },
        status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
    }],
    internships: [{
        company: String,
        role: String,
        duration: String,
        description: String
    }],
    projects: [{
        title: String,
        description: String,
        technologies: [String],
        link: String
    }],
    careerGoals: String,
    isActive: {
        type: Boolean,
        default: true
    },
    schemaVersion: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true,
    collection: 'Students'
});

// Encrypt password using bcrypt
studentSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    next();
});

// Match user entered password to hashed password in database
studentSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Add indexes for better search performance
studentSchema.index({ name: 'text', branch: 'text' });
studentSchema.index({ registrationNumber: 1 });
studentSchema.index({ branch: 1 });
studentSchema.index({ currentYear: 1 });
studentSchema.index({ skills: 1 });
studentSchema.index({ interests: 1 });
studentSchema.index({ assignedMentor: 1 });
studentSchema.index({ skills: 1, graduationYear: -1 });

const Student = mongoose.model('Student', studentSchema);
module.exports = Student; // ✅ Use CommonJS instead of ES Module
