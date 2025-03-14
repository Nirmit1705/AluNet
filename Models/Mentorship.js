const mongoose = require('mongoose');

const MentorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    expertiseArea: { type: String, required: true },
    skillsOffered: [{ type: String, required: true }],
    furtherSkillsRequired: [{ type: String, required: true }],
    timeRequired: { type: String, required: true },
    availability: { type: String, required: true },
    modeOfMentorship: { type: String, required: true },
    contact: { type: String, required: true },
    linkedin: { type: String, required: true }
});

module.exports = mongoose.model('Mentor', MentorSchema);
