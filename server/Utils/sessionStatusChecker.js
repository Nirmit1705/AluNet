import mongoose from 'mongoose';

/**
 * Updates the progress and session stats for a specific mentorship
 */
export const updateMentorshipProgress = async (mentorshipId) => {
  try {
    // Import models
    const Mentorship = mongoose.model('Mentorship');
    const MentorshipSession = mongoose.model('MentorshipSession');
    
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

/**
 * Update mentorship records when session status changes
 */
export const updateMentorshipNextSession = async (mentorshipId) => {
  try {
    // Import models
    const Mentorship = mongoose.model('Mentorship');
    const MentorshipSession = mongoose.model('MentorshipSession');
    
    // Find the mentorship
    const mentorship = await Mentorship.findById(mentorshipId);
    if (!mentorship) {
      console.log(`Mentorship not found with ID: ${mentorshipId}`);
      return false;
    }
    
    // Find upcoming sessions for this mentorship
    const now = new Date();
    const upcomingSessions = await MentorshipSession.find({
      mentorship: mentorshipId,
      status: 'scheduled',
      date: { $gt: now }
    }).sort({ date: 1 });
    
    // Update the mentorship's nextSessionDate
    if (upcomingSessions.length > 0) {
      // Set to the earliest upcoming session
      mentorship.nextSessionDate = upcomingSessions[0].date;
      console.log(`Updated mentorship ${mentorshipId} with next session date: ${mentorship.nextSessionDate}`);
    } else {
      // No upcoming sessions, clear the next session date
      mentorship.nextSessionDate = null;
      console.log(`Cleared next session date for mentorship ${mentorshipId}`);
    }
    
    await mentorship.save();
    return true;
  } catch (error) {
    console.error('Error updating mentorship next session:', error);
    return false;
  }
};

/**
 * Checks for sessions that have passed their end time and updates their status to 'completed'
 * Also updates the associated mentorship progress
 */
export const updateExpiredSessions = async () => {
  try {
    // Import models if needed
    const MentorshipSession = mongoose.model('MentorshipSession');
    
    // Find sessions that have passed but are still marked as scheduled
    const now = new Date();
    const expiredSessions = await MentorshipSession.find({
      status: 'scheduled',
      date: { $lt: now } // Sessions with dates in the past
    });
    
    console.log(`Found ${expiredSessions.length} expired sessions to update`);
    
    // Track mentorships that need next session updates
    const mentorshipsToUpdate = new Set();
    
    // Update each expired session
    for (const session of expiredSessions) {
      session.status = 'completed';
      await session.save();
      
      // Add to list of mentorships to update
      mentorshipsToUpdate.add(session.mentorship.toString());
    }
    
    // Update next session date for each affected mentorship
    for (const mentorshipId of mentorshipsToUpdate) {
      await updateMentorshipNextSession(mentorshipId);
    }
    
    return {
      updated: expiredSessions.length,
      mentorshipsUpdated: mentorshipsToUpdate.size
    };
  } catch (error) {
    console.error('Error updating expired sessions:', error);
    return { updated: 0, failed: 1, error: error.message };
  }
};
