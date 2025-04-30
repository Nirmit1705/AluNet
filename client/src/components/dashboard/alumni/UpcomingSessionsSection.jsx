import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Calendar, Clock, Video, Users, Edit, X } from "lucide-react";

const UpcomingSessionsSection = ({ 
  onEditSession, 
  onCancelSession 
}) => {
  const navigate = useNavigate();
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUpcomingSessions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/mentorship/sessions/mentor-upcoming`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (response.data && Array.isArray(response.data)) {
          // Transform data for display
          const transformedSessions = response.data.map(session => ({
            id: session._id,
            title: session.title || "Mentorship Session",
            menteeName: session.menteeName || "Student",
            menteeId: session.menteeId,
            description: session.description || "Discussion with mentee",
            date: new Date(session.date),
            time: session.time || "TBD",
            duration: session.duration || 30,
            type: session.groupSession ? "Group Workshop" : "One-on-One",
            location: session.location || "Virtual",
            meetingLink: session.meetingLink || null,
            status: session.status || "upcoming",
            topic: session.topic || ""
          }));

          // Sort by date (closest first)
          transformedSessions.sort((a, b) => a.date - b.date);
          
          setUpcomingSessions(transformedSessions);
        } else {
          setUpcomingSessions([]);
        }
      } catch (error) {
        console.error("Error fetching upcoming sessions:", error);
        setError("Failed to load upcoming sessions");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUpcomingSessions();
  }, [navigate]);

  // Function to determine how far away a session is
  const getTimeUntil = (date) => {
    const now = new Date();
    const sessionDate = new Date(date);
    const diffTime = Math.abs(sessionDate - now);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Tomorrow";
    } else if (diffDays < 7) {
      return `${diffDays} days`;
    } else {
      return `${Math.floor(diffDays / 7)} weeks`;
    }
  };

  // Navigate to full schedule
  const viewSchedule = () => {
    navigate("/schedule");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-6 animate-fade-in h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-medium text-lg">Upcoming Sessions</h3>
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="glass-card rounded-xl p-6 animate-fade-in h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-medium text-lg">Upcoming Sessions</h3>
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div className="text-center py-4">
          <p className="text-red-500 mb-2">{error}</p>
          <button 
            className="text-primary hover:underline"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (upcomingSessions.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6 animate-fade-in h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-medium text-lg">Upcoming Sessions</h3>
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div className="text-center py-8 px-4">
          <p className="text-muted-foreground mb-4">
            You don't have any upcoming mentorship sessions scheduled.
          </p>
          <button 
            onClick={() => navigate("/mentees")}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
          >
            Schedule a Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-medium text-lg">Upcoming Sessions</h3>
        <Calendar className="h-5 w-5 text-primary" />
      </div>
      
      <div className="space-y-4">
        {upcomingSessions.slice(0, 3).map((session) => (
          <div key={session.id} className="border border-border/30 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">{session.title}</h4>
              <div className="flex space-x-1">
                <button
                  onClick={() => onEditSession(session)}
                  className="p-1 text-gray-500 hover:text-primary transition-colors"
                  title="Edit session"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onCancelSession(session.id)}
                  className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                  title="Cancel session"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center text-sm mb-2">
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                {getTimeUntil(session.date)}
              </span>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              {session.type === "Group Workshop" ? (
                <Users className="h-3.5 w-3.5 mr-1.5" />
              ) : (
                <Video className="h-3.5 w-3.5 mr-1.5" />
              )}
              <span>{session.type} with {session.menteeName}</span>
            </div>
            
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              <span>{session.date.toLocaleDateString()} • </span>
              <Clock className="h-3.5 w-3.5 mx-1.5" />
              <span>{session.time} ({session.duration} min)</span>
            </div>
            
            {session.topic && (
              <div className="mt-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-md text-xs text-gray-600 dark:text-gray-300">
                Topic: {session.topic}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {upcomingSessions.length > 3 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            +{upcomingSessions.length - 3} more upcoming sessions
          </p>
        </div>
      )}
      
      <button
        onClick={viewSchedule}
        className="w-full mt-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors flex items-center justify-center gap-1"
      >
        View Full Schedule
      </button>
    </div>
  );
};

export default UpcomingSessionsSection;
