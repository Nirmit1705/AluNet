import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Users, Calendar, Clock, ArrowRight } from "lucide-react";

const CurrentMentorshipsSection = () => {
  const navigate = useNavigate();
  const [mentorships, setMentorships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMentorships = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        // Check expired sessions first
        try {
          await axios.get(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/mentorship/sessions/check-expired`
          );
        } catch (err) {
          console.warn("Failed to check expired sessions", err);
          // Continue anyway
        }
        
        // Fetch mentorships
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/mentorship/student`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        console.log("Fetched mentorships:", response.data);
        
        // Filter to only show accepted mentorships
        const activeMentorships = response.data.filter(m => m.status === 'accepted');
        
        // Transform data for display
        const transformedMentorships = activeMentorships.map(mentorship => {
          // Process nextSession - ensure it's not showing past dates
          let nextSession = "Not scheduled";
          
          if (mentorship.nextSessionDate) {
            const nextSessionDate = new Date(mentorship.nextSessionDate);
            const now = new Date();
            
            if (nextSessionDate > now) {
              // Only display sessions in the future
              nextSession = nextSessionDate.toLocaleDateString();
              
              // If we have more specific time info
              if (mentorship.nextSession && mentorship.nextSession.includes("at")) {
                nextSession = mentorship.nextSession;
              }
            }
          }
          
          // Parse sessions data and calculate progress properly
          const sessionsCompleted = parseInt(mentorship.sessionsCompleted || 0, 10);
          const totalPlannedSessions = parseInt(mentorship.totalPlannedSessions || 5, 10);
          
          // Calculate progress percentage
          const progress = totalPlannedSessions > 0 
            ? Math.floor((sessionsCompleted / totalPlannedSessions) * 100) 
            : 0;
          
          // Log for debugging
          console.log(`Mentorship for ${mentorship.alumni?.name || 'Unknown'}: ${sessionsCompleted}/${totalPlannedSessions} sessions (${progress}%)`);
          
          return {
            id: mentorship._id,
            mentorName: mentorship.alumni?.name || "Unnamed Mentor",
            mentorRole: mentorship.alumni?.position 
              ? `${mentorship.alumni.position} at ${mentorship.alumni.company || 'Company'}`
              : "Mentor",
            avatar: mentorship.alumni?.profilePicture?.url || null,
            focusAreas: mentorship.skillsToLearn || ["General mentorship"],
            startDate: new Date(mentorship.startDate || mentorship.createdAt).toLocaleDateString(),
            nextSession: nextSession,
            progress: progress,
            sessionsCompleted: sessionsCompleted,
            totalSessions: totalPlannedSessions
          };
        });
        
        setMentorships(transformedMentorships);
      } catch (err) {
        console.error("Error fetching mentorships:", err);
        setError(err.response?.data?.message || err.message || "Failed to load mentorships");
        // Keep any existing mentorships in state
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMentorships();
    
    // Refresh data every 5 minutes and check for expired sessions
    const intervalId = setInterval(() => {
      fetchMentorships();
      // Also trigger a check for expired sessions
      axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/mentorship/sessions/check-expired`
      ).catch(err => console.warn("Background session check failed", err));
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [navigate]);

  const goToMentorships = () => {
    navigate("/mentorships");
  };

  // Loading state
  if (isLoading && mentorships.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6 animate-fade-in h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-medium text-lg">Current Mentorships</h3>
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && mentorships.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6 animate-fade-in h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-medium text-lg">Current Mentorships</h3>
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div className="text-center py-4">
          <p className="text-red-500 mb-2">Error loading mentorships</p>
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
  if (mentorships.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6 animate-fade-in h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-medium text-lg">Current Mentorships</h3>
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div className="text-center py-8">
          <Users className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="font-medium mb-2">No active mentorships</p>
          <p className="text-muted-foreground text-sm mb-4">
            Connect with mentors to start your mentorship journey
          </p>
          <button
            onClick={() => navigate("/connected-mentors")}
            className="px-4 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
          >
            Find Mentors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-medium text-lg">Current Mentorships</h3>
        <Users className="h-5 w-5 text-primary" />
      </div>
      <div className="space-y-5">
        {mentorships.slice(0, 3).map((mentorship) => (
          <div key={mentorship.id} className="flex items-start border-b border-gray-100 dark:border-gray-700 pb-5 last:border-0 last:pb-0">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 flex-shrink-0">
              {mentorship.avatar ? (
                <img 
                  src={mentorship.avatar} 
                  alt={mentorship.mentorName} 
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <Users className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-base truncate">{mentorship.mentorName}</h4>
              <p className="text-sm text-muted-foreground truncate">{mentorship.mentorRole}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {mentorship.focusAreas.slice(0, 2).map((area, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                    {area}
                  </span>
                ))}
                {mentorship.focusAreas.length > 2 && (
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-full">
                    +{mentorship.focusAreas.length - 2}
                  </span>
                )}
              </div>
              <div className="flex items-center mt-2">
                <div className="flex items-center text-xs text-muted-foreground mr-4">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Next: {mentorship.nextSession}</span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Progress: {mentorship.progress}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {mentorships.length > 3 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            +{mentorships.length - 3} more mentorships
          </p>
        </div>
      )}
      <button
        onClick={goToMentorships}
        className="w-full mt-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors flex items-center justify-center gap-1"
      >
        View All Mentorships
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default CurrentMentorshipsSection;
