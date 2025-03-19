const mongoose = require('mongoose');

const Student = require('./Student');
const Alumni = require('./Alumni');
const Message = require('./Message');
const JobPosting = require('./JobPosting');
const Mentorship = require('./Mentorship');
const MentorshipSession = require('./MentorshipSession');
const MentorshipFeedback = require('./MentorshipFeedback');
const Notification = require('./Notification');

const connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/alumni_platform', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      
      console.log(`Connected to MongoDB: ${conn.connection.host}`);
      
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('Existing Collections:', collections.map(col => col.name));
    } catch (error) {
      console.error(`Error connecting to MongoDB: ${error.message}`);
      process.exit(1);
    }
  };

mongoose.connection.once('open', async () => {
    console.log('✅ Connected to MongoDB');

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📌 Existing Collections:', collections.map(col => col.name));
});

module.exports = { Student, Alumni, Message, JobPosting, Mentorship,MentorshipSession ,MentorshipFeedback,Notification};
