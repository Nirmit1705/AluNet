import axios from 'axios';

/**
 * Checks if a session's end time has passed
 * @param {string} date - Session date in ISO or string format
 * @param {string} endTime - End time in HH:MM format
 * @returns {boolean} - True if end time has passed
 */
export const hasSessionEnded = (date, endTime) => {
  if (!date || !endTime) return false;
  
  const now = new Date();
  const sessionDate = new Date(date);
  
  // Parse hours and minutes from endTime (format: HH:MM)
  const [hours, minutes] = endTime.split(':').map(num => parseInt(num, 10));
  
  // Set the end time on the session date
  const sessionEndTime = new Date(sessionDate);
  sessionEndTime.setHours(hours, minutes, 0, 0);
  
  // Compare with current time
  return now >= sessionEndTime;
};

/**
 * Checks with the server for any sessions that need to be marked as completed
 * @returns {Promise<{updated: number, failed: number}>}
 */
export const checkCompletedSessions = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No auth token found');
      return { updated: 0, failed: 0 };
    }
    
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/mentorship/sessions/check-completed`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error checking completed sessions:', error);
    return { updated: 0, failed: 0 };
  }
};

/**
 * Manually marks a specific session as completed
 * @param {string} sessionId - The ID of the session to mark as completed
 * @returns {Promise<Object>} The updated session
 */
export const markSessionCompleted = async (sessionId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No auth token found');
    }
    
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/mentorship/sessions/${sessionId}`,
      { status: 'completed' },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error marking session ${sessionId} as completed:`, error);
  }
};
