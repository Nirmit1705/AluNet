import mongoose from 'mongoose';
import MentorshipSession from '../Models/MentorshipSession.js';
import Mentorship from '../Models/Mentorship.js';

/**
 * Checks for sessions that have passed their end time and updates their status to 'completed'
 * Also updates the associated mentorship progress
 */
export const updateExpiredSessions = async () => {
  try {
    const currentDate = new Date();
    
    // Find all scheduled sessions that have ended
    const expiredSessions = await MentorshipSession.find({
      status: 'scheduled',
      date: { $lte: currentDate },
    });
    
    if (!expiredSessions.length) {
      return { updated: 0 };
    }
    
    const sessionIdsToUpdate = [];
    const mentorshipIdsToUpdate = new Set();
    
    // Filter sessions whose end time has passed
    for (const session of expiredSessions) {
      const sessionDate = new Date(session.date);
      const [hours, minutes] = session.endTime.split(':').map(Number);
      
      sessionDate.setHours(hours, minutes, 0, 0);
      
      if (currentDate >= sessionDate) {
        sessionIdsToUpdate.push(session._id);
        mentorshipIdsToUpdate.add(session.mentorship.toString());
      }
    }
    
    if (sessionIdsToUpdate.length === 0) {
      return { updated: 0 };
    }
    
    // Update all expired sessions to 'completed'
    await MentorshipSession.updateMany(
      { _id: { $in: sessionIdsToUpdate } },
      { $set: { status: 'completed' } }
    );
    
    // Update mentorship statistics for each affected mentorship
    for (const mentorshipId of mentorshipIdsToUpdate) {
      await updateMentorshipProgress(mentorshipId);
    }
    
    return { 
      updated: sessionIdsToUpdate.length,
      mentorships: mentorshipIdsToUpdate.size
    };
  } catch (error) {
    console.error('Error updating expired sessions:', error);
    return { error: error.message };
  }
};

/**
 * Updates the progress and session stats for a specific mentorship
 */
export const updateMentorshipProgress = async (mentorshipId) => {
  try {
    const mentorship = await Mentorship.findById(mentorshipId);
    if (!mentorship) {
      return { error: 'Mentorship not found' };
    }
    
    // Count completed and total sessions
    const sessions = await MentorshipSession.find({ mentorship: mentorshipId });
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const totalSessions = mentorship.totalPlannedSessions || sessions.length || 5;
    
    // Get last interaction date
    const lastInteractionDate = sessions.length > 0 
      ? sessions.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0].updatedAt
      : mentorship.lastInteractionDate || mentorship.updatedAt;
    
    // Get next scheduled session
    const upcomingSessions = sessions
      .filter(s => s.status === 'scheduled' && new Date(s.date) >= new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date));
      
    // Calculate progress percentage
    const progress = Math.floor((completedSessions / totalSessions) * 100);
    
    // Update mentorship with new stats
    mentorship.sessionsCompleted = completedSessions;
    
    // Set next session date if available
    if (upcomingSessions.length > 0) {
      mentorship.nextSessionDate = upcomingSessions[0].date;
    } else {
      mentorship.nextSessionDate = null;
    }
    
    mentorship.lastInteractionDate = lastInteractionDate;
    
    // If all sessions are completed and we've reached target, mark mentorship as completed
    if (completedSessions >= totalSessions && mentorship.status === 'accepted') {
      await mentorship.updateStatus(
        'completed',
        mentorship.alumni,
        'Alumni',
        'All mentorship sessions completed'
      );
    } else {
      await mentorship.save();
    }
    
    return { success: true, progress, completedSessions, totalSessions };
  } catch (error) {
    console.error(`Error updating mentorship progress for ID ${mentorshipId}:`, error);
    return { error: error.message };
  }
};
