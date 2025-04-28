/**
 * Script to synchronize alumni verification and status fields
 * Run with: node scripts/syncAlumniStatus.js
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
      
      let updatedCount = 0;
      
      // Check and fix each record
      for (const alumni of allAlumni) {
        let updated = false;
        
        // Ensure university field exists
        if (alumni.university === undefined) {
          alumni.university = alumni.University || '';
          updated = true;
        }
        
        // Ensure education field exists (from previousEducation)
        if (alumni.education === undefined && alumni.previousEducation) {
          alumni.education = alumni.previousEducation;
          updated = true;
        }
        
        // Ensure isVerified field exists
        if (alumni.isVerified === undefined) {
          alumni.isVerified = alumni.status === 'active' || alumni.verificationStatus === 'approved';
          updated = true;
        }
        
        // Ensure verificationStatus field exists
        if (alumni.verificationStatus === undefined) {
          alumni.verificationStatus = alumni.isVerified ? 'approved' : 'pending';
          updated = true;
        }
        
        // Ensure status field exists
        if (alumni.status === undefined) {
          alumni.status = alumni.isVerified ? 'active' : 'pending';
          updated = true;
        }
        
        // Ensure consistency between fields
        if (alumni.isVerified && alumni.status !== 'active') {
          alumni.status = 'active';
          updated = true;
        }
        
        if (alumni.status === 'active' && !alumni.isVerified) {
          alumni.isVerified = true;
          updated = true;
        }
        
        if (alumni.verificationStatus === 'approved' && !alumni.isVerified) {
          alumni.isVerified = true;
          updated = true;
        }
        
        if (alumni.isVerified && alumni.verificationStatus !== 'approved') {
          alumni.verificationStatus = 'approved';
          updated = true;
        }
        
        // Save if changes were made
        if (updated) {
          await alumni.save();
          updatedCount++;
          console.log(`Updated alumni record: ${alumni._id} (${alumni.name})`);
          console.log(`- Status: ${alumni.status}`);
          console.log(`- isVerified: ${alumni.isVerified}`);
          console.log(`- verificationStatus: ${alumni.verificationStatus}`);
        }
      }
      
      console.log(`Completed fixing alumni records. Updated ${updatedCount} of ${allAlumni.length} records.`);
    } catch (error) {
      console.error('Error updating alumni records:', error);
    } finally {
      mongoose.disconnect();
      console.log('MongoDB Disconnected');
    }
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });
