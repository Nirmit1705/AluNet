import mongoose from 'mongoose';
import MentorshipSession from '../Models/MentorshipSession.js';
import Mentorship from '../Models/Mentorship.js';

/**
 * Check and update sessions that have passed their end time
 * @returns {Promise<{updated: number, failed: number}>} Count of updated and failed sessions
 */
export const updateCompletedSessions = async () => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Find sessions that are scheduled but should be completed based on date and end time
    const sessionsToUpdate = await MentorshipSession.find({
      status: 'scheduled',
      date: { $lte: today }, // Session date is today or earlier
    });
    
    console.log(`Found ${sessionsToUpdate.length} potential sessions to check for completion`);
    
    let updated = 0;
    let failed = 0;
    
    for (const session of sessionsToUpdate) {
      try {
        // Parse the end time (HH:MM format) from the session
        const [endHours, endMinutes] = session.endTime.split(':').map(Number);
        
        // Create date object for the session's end time
        const sessionDate = new Date(session.date);
        const endTimeDate = new Date(
          sessionDate.getFullYear(),
          sessionDate.getMonth(),
          sessionDate.getDate(),
          endHours,
          endMinutes
        );
        
        // If end time has passed, update the session status
        if (now >= endTimeDate) {
          console.log(`Updating session ${session._id} to completed (end time: ${session.endTime})`);
          
          // Update session status
          session.status = 'completed';
          await session.save();
          
          // Update the mentorship with incremented session count
          const mentorship = await Mentorship.findById(session.mentorship);
          if (mentorship) {
            mentorship.sessionsCompleted = (mentorship.sessionsCompleted || 0) + 1;
            await mentorship.save();
            
            console.log(`Updated mentorship ${mentorship._id} sessions completed to ${mentorship.sessionsCompleted}`);
          }
          
          updated++;
        }
      } catch (err) {
        console.error(`Failed to update session ${session._id}:`, err);
        failed++;
      }
    }
    
    return { updated, failed };
  } catch (error) {
    console.error('Error in updateCompletedSessions:', error);
    throw error;
  }
};
