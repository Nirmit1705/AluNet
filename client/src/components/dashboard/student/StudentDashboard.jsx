import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Video, ExternalLink } from 'lucide-react';

const UpcomingSessions = ({ sessions }) => {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-medium mb-2 flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-primary" />
          Upcoming Sessions
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          You have no upcoming mentorship sessions scheduled.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <Calendar className="mr-2 h-5 w-5 text-primary" />
        Upcoming Sessions
      </h3>
      
      <div className="space-y-4">
        {sessions.map((session) => {
          // Parse the date
          const sessionDate = new Date(session.date);
          
          // Format date nicely
          const formattedDate = sessionDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          });
          
          return (
            <div 
              key={session._id} 
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-primary">{session.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{session.description.substring(0, 100)}{session.description.length > 100 ? '...' : ''}</p>
                </div>
                <div className="text-right">
                  <div className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {session.status}
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  {formattedDate}
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4 mr-1.5" />
                  {session.startTime} - {session.endTime}
                </div>
                {session.meetingLink && (
                  <a 
                    href={session.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-primary hover:underline"
                  >
                    <Video className="h-4 w-4 mr-1.5" />
                    Join Meeting
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUpcomingSessions = async () => {
      try {
        setIsLoading(true);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }
        
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/mentorship/sessions/my-upcoming`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setUpcomingSessions(response.data);
      } catch (err) {
        console.error('Error fetching upcoming sessions:', err);
        setError('Failed to load upcoming sessions');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUpcomingSessions();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Student Dashboard</h2>
      
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-6">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : (
        <UpcomingSessions sessions={upcomingSessions} />
      )}
      
      {/* Other dashboard components would go here */}
    </div>
  );
};

export default StudentDashboard;
