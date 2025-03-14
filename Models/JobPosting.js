const mongoose = require('mongoose');

const JobPostingSchema = new mongoose.Schema({
    companyName: { type: String, required: true }, // Fixed key name
    location: { type: String, required: true },
    typeOfWork: { type: String, required: true },
    expectedCTC: { type: String, required: true },
    role: { type: String, required: true },
    skillsRequired: [{ type: String, required: true }],
    experienceLevel: { type: String, required: true }, // Changed from Number to String
    jobDescription: { type: String, required: true },
    applicationDeadline: { type: Date, required: true }, // Changed from String to Date
    applicationLink: { type: String, required: true }
});

module.exports = mongoose.model('JobPosting', JobPostingSchema);
