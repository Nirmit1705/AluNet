/**
 * Script to migrate alumni education data to properly structure university fields
 * Run with: node scripts/migrateEducationData.js
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
      let errorCount = 0;
      
      // Check and fix each record
      for (const alumni of allAlumni) {
        try {
          let updated = false;
          
          // Fix profilePicture if it's invalid
          if (alumni.profilePicture === '' || alumni.profilePicture === null) {
            alumni.profilePicture = {
              url: '',
              public_id: ''
            };
            updated = true;
            console.log(`Fixed invalid profilePicture for alumni: ${alumni._id}`);
          }
          
          // Case 1: Alumni has education array but items don't have university field
          if (alumni.education && Array.isArray(alumni.education) && alumni.education.length > 0) {
            let hasModifiedEducation = false;
            
            // Update each education entry
            alumni.education.forEach(edu => {
              if (typeof edu === 'object') {
                // If institution exists but university doesn't, copy institution to university
                if (edu.institution && !edu.university) {
                  edu.university = edu.institution;
                  hasModifiedEducation = true;
                }
                // If university exists but institution doesn't, copy university to institution
                else if (edu.university && !edu.institution) {
                  edu.institution = edu.university;
                  hasModifiedEducation = true;
                }
                // If neither exists but we have a root-level university
                else if (!edu.institution && !edu.university && alumni.university) {
                  edu.university = alumni.university;
                  edu.institution = alumni.university;
                  hasModifiedEducation = true;
                }
              }
            });
            
            if (hasModifiedEducation) {
              updated = true;
            }
          }
          // Case 2: Alumni has no education array but has university at root level
          else if ((!alumni.education || !Array.isArray(alumni.education) || alumni.education.length === 0) && alumni.university) {
            // Create a new education entry with the university field
            alumni.education = [{
              university: alumni.university,
              institution: alumni.university,
              degree: alumni.degree || "Not specified",
              fieldOfStudy: alumni.specialization || "Not specified"
            }];
            updated = true;
          }
          
          // Save if changes were made
          if (updated) {
            // Use validateBeforeSave: false to bypass validation issues
            await alumni.save({ validateBeforeSave: false });
            updatedCount++;
            console.log(`Updated alumni record: ${alumni._id} (${alumni.name})`);
          }
        } catch (recordError) {
          errorCount++;
          console.error(`Error updating alumni ${alumni._id}:`, recordError.message);
        }
      }
      
      console.log(`Completed migration. Updated ${updatedCount} of ${allAlumni.length} records. Errors: ${errorCount}`);
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
