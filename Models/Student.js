const mongoose = require('mongoose');

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
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true, enum: ['student', 'alumni'] },
    graduationYear: { type: Number, required: true },
    specialization: { type: String, required: true },
    skills: [{ type: String }], // Array of skills
    internships: [internshipSchema], // Embedded array of internships
    projects: [projectSchema], // Embedded array of projects
    linkedin: { type: String },
    goal: { type: String }
}, { collection: 'Students' });

// ✅ Export the model properly
const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
