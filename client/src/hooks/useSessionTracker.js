import { useEffect, useState } from 'react';
import { checkCompletedSessions } from '../utils/sessionHelper';

/**
 * Hook to periodically check for and update completed sessions
 * @param {number} interval - Check interval in milliseconds (default: 5 minutes)
 * @returns {Object} - Contains lastCheck timestamp and result of last check
 */
const useSessionTracker = (interval = 300000) => {
  const [lastCheck, setLastCheck] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Function to check for completed sessions
    const checkSessions = async () => {
      if (isLoading) return;
      
      try {
        setIsLoading(true);
        const result = await checkCompletedSessions();
        setLastResult(result);
        setLastCheck(new Date());
        console.log('Session check completed:', result);
      } catch (error) {
        console.error('Error in session tracker:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial check when component mounts
    checkSessions();

    // Set up interval for periodic checks
    const intervalId = setInterval(checkSessions, interval);

    // Clean up interval when component unmounts
    return () => clearInterval(intervalId);
  }, [interval]);

  return { lastCheck, lastResult, isLoading };
};

export default useSessionTracker;
