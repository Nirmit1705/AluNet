import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import models
import MentorshipSession from '../Models/MentorshipSession.js';
import Mentorship from '../Models/Mentorship.js';

const testSessionCreation = async () => {
  try {
    // Connect to MongoDB
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student-alumni-platform');
    console.log('MongoDB Connected!');
    
    // Find an existing mentorship
    const mentorship = await Mentorship.findOne({ status: 'accepted' });
    
    if (!mentorship) {
      console.log('No accepted mentorships found. Creating a session requires an accepted mentorship.');
      await mongoose.connection.close();
      return;
    }
    
    console.log('Found mentorship:', mentorship._id);
    
    // Create a test session
    const sessionData = {
      mentorship: mentorship._id,
      student: mentorship.student,
      alumni: mentorship.alumni,
      title: 'Test Session',
      description: 'This is a test session to verify the database connection',
      date: new Date(),
      startTime: '10:00',
      endTime: '11:00',
      status: 'scheduled',
      meetingLink: 'https://example.com/test-meeting'
    };
    
    console.log('Attempting to create session with data:', sessionData);
    
    const session = await MentorshipSession.create(sessionData);
    
    console.log('Session created successfully:', session);
    
    // Clean up the test session
    await MentorshipSession.findByIdAndDelete(session._id);
    console.log('Test session cleaned up');
    
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error during test:', error);
    await mongoose.connection.close();
  }
};

// Run the test
testSessionCreation();
