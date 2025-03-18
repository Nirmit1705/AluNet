import mongoose from 'mongoose';

const AlumniSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true }, 
    graduationYear: { type: Number, required: true },
    phone: { type: String }, 
    graduationYear: { type: Number, required: true },
    University: { type: String, required: true },
    College: { type: String, required: true },
    degree: { type: String, required: true },
    specialization: { type: String, required: true },
    currentPosition: { type: String, required: true },
    company: { type: String, required: true },
    linkedin: { type: String, required: true }, 
    experience: { type: Number, required: true },
    skills: [{ type: String, required: true }],
    mentorshipAvailable: { type: Boolean, default: true, required: true }, 
    bio: { type: String }, 
    mentorshipAvailable: { type: Boolean, required: true, default: false }, 
    bio: { type: String },
}, {
    timestamps: true
});

// Add indexes for better search performance
AlumniSchema.index({ name: 'text', degree: 'text', specialization: 'text', company: 'text' });
AlumniSchema.index({ graduationYear: 1 });
AlumniSchema.index({ company: 1 });
AlumniSchema.index({ skills: 1 });
AlumniSchema.index({ mentorshipAvailable: 1 });

const Alumni = mongoose.model('Alumni', AlumniSchema);
export default Alumni;
