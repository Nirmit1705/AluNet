/**
 * Script to fix any inconsistencies between isVerified, status and verificationStatus
 * This is a one-time fix for all alumni records
 * 
 * Run with: node scripts/fixVerificationInconsistencies.js
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
      console.log(`Found ${allAlumni.length} alumni records to check`);
      
      let updatedCount = 0;
      
      // Check each record for inconsistencies
      for (const alumni of allAlumni) {
        let updated = false;
        const originalStatus = {
          isVerified: alumni.isVerified,
          status: alumni.status,
          verificationStatus: alumni.verificationStatus
        };
        
        // CASE 1: If status is 'active', ensure isVerified is true and verificationStatus is 'approved'
        if (alumni.status === 'active') {
          if (alumni.isVerified !== true) {
            alumni.isVerified = true;
            updated = true;
          }
          
          if (alumni.verificationStatus !== 'approved') {
            alumni.verificationStatus = 'approved';
            updated = true;
          }
        }
        
        // CASE 2: If verificationStatus is 'approved', ensure isVerified is true and status is 'active'
        if (alumni.verificationStatus === 'approved') {
          if (alumni.isVerified !== true) {
            alumni.isVerified = true;
            updated = true;
          }
          
          if (alumni.status !== 'active') {
            alumni.status = 'active';
            updated = true;
          }
        }
        
        // CASE 3: If isVerified is true, ensure status is 'active' and verificationStatus is 'approved'
        if (alumni.isVerified === true) {
          if (alumni.status !== 'active') {
            alumni.status = 'active';
            updated = true;
          }
          
          if (alumni.verificationStatus !== 'approved') {
            alumni.verificationStatus = 'approved';
            updated = true;
          }
        }
        
        // Save if changes were made
        if (updated) {
          await alumni.save();
          updatedCount++;
          console.log(`Updated alumni record: ${alumni._id} (${alumni.name})`);
          console.log(`- Before: `, originalStatus);
          console.log(`- After: `, {
            isVerified: alumni.isVerified,
            status: alumni.status,
            verificationStatus: alumni.verificationStatus
          });
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
    console.error('Failed to connect to MongoDB', err);
  });
