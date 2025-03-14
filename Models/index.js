const mongoose = require('mongoose');

const Student = require('./Student');
const Alumni = require('./Alumni');
const Message = require('./Message');
const JobPosting = require('./JobPosting');
const Mentorship = require('./Mentorship');

mongoose.connect('mongodb://localhost:27017/alumni_platform', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
});


mongoose.connection.once('open', async () => {
    console.log('✅ Connected to MongoDB');

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📌 Existing Collections:', collections.map(col => col.name));
});

module.exports = { Student, Alumni, Message, JobPosting, Mentorship };
