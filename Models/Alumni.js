const mongoose = require('mongoose');

const AlumniSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true }, 
    graduationYear: { type: Number, required: true },
    degree: { type: String, required: true },
    specialization: { type: String, required: true },
    currentPosition: { type: String, required: true },
    company: { type: String, required: true },
    linkedin: { type: String, required: true }, 
    experience: { type: Number, required: true },
    skills: [{ type: String, required: true }],
    mentorshipAvailable: { type: Boolean, default: true, required: true }, 
    bio: { type: String }
}, { timestamps: true }); 

module.exports = mongoose.model('Alumni', AlumniSchema);
