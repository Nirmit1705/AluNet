import mongoose from "mongoose"; // ✅ Converted from ES Modules to CommonJS
import bcrypt from "bcryptjs"; // ✅ Converted from ES Modules to CommonJS

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
        required: function() {
            // Password is only required if there's no googleId
            return !this.googleId;
        },
        minlength: [6, 'Password must be at least 6 characters'],
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
    location: { type: String }, // Add location field
    // Previous education field
    previousEducation: [{
        institution: {
            type: String,
            trim: true
        },
        degree: {
            type: String,
            trim: true
        },
        fieldOfStudy: {
            type: String,
            trim: true
        },
        startYear: {
            type: Number,
            validate: {
                validator: function(v) {
                    return v >= 1950 && v <= new Date().getFullYear();
                },
                message: props => `${props.value} is not a valid year!`
            }
        },
        endYear: {
            type: Number,
            validate: {
                validator: function(v) {
                    return v >= 1950 && v <= new Date().getFullYear();
                },
                message: props => `${props.value} is not a valid year!`
            }
        },
        description: {
            type: String,
            trim: true,
            maxlength: [300, 'Description cannot be more than 300 characters']
        }
    }],
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
        type: {
            url: String,
            public_id: String
        },
        default: {
            url: '',
            public_id: ''
        }
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
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    // Add status field if it doesn't exist
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'active'
    },
    // Add role field
    role: {
        type: String,
        default: 'student',
        immutable: true // Prevents role from being changed
    }
}, {
    timestamps: true,
    collection: 'Students'
});

// Fix: Make sure we're using studentSchema (lowercase 's')
studentSchema.pre('validate', function(next) {
  // If status is undefined or null, set a default status
  if (!this.status) {
    this.status = 'active'; // Students are generally active by default
    console.log(`Setting default status 'active' for student ${this._id}`);
  }
  next();
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
// studentSchema.index({ registrationNumber: 1 });
studentSchema.index({ branch: 1 });
studentSchema.index({ currentYear: 1 });
studentSchema.index({ skills: 1 });
studentSchema.index({ interests: 1 });
studentSchema.index({ assignedMentor: 1 });
studentSchema.index({ skills: 1, graduationYear: -1 });

const Student = mongoose.model('Student', studentSchema);
export default Student; // ✅ Use CommonJS instead of ES Module
