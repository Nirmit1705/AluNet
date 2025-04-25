/**
 * Script to fix Alumni records that may have missing verification fields
 * Run with: node scripts/fixAlumniVerification.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Alumni from '../Models/Alumni.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    
    try {
      // Find all alumni records
      const allAlumni = await Alumni.find({});
      console.log(`Found ${allAlumni.length} alumni records`);
      
      // Check and fix each record
      for (const alumni of allAlumni) {
        let updated = false;
        
        // Ensure isVerified field exists
        if (alumni.isVerified === undefined) {
          alumni.isVerified = false;
          updated = true;
        }
        
        // Ensure verificationStatus field exists
        if (alumni.verificationStatus === undefined) {
          alumni.verificationStatus = 'pending';
          updated = true;
        }
        
        // Ensure status field exists
        if (alumni.status === undefined) {
          alumni.status = 'pending';
          updated = true;
        }
        
        // Synchronize status fields
        if (alumni.verificationStatus === 'approved' && !alumni.isVerified) {
          alumni.isVerified = true;
          updated = true;
        }
        
        if (alumni.status === 'active' && !alumni.isVerified) {
          alumni.isVerified = true;
          updated = true;
        }
        
        // Save if changes were made
        if (updated) {
          await alumni.save();
          console.log(`Updated alumni record: ${alumni._id} (${alumni.name})`);
        }
      }
      
      console.log('Completed fixing alumni verification fields');
    } catch (error) {
      console.error('Error updating alumni records:', error);
    } finally {
      mongoose.disconnect();
      console.log('MongoDB Disconnected');
    }
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
