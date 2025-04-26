import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Video, ChevronRight, Users, Link } from "lucide-react";

// Sample upcoming sessions data
const upcomingSessions = [
  {
    id: 1,
    title: "Mock Interview Practice",
    type: "One-on-One",
    with: "Jennifer Lee",
    date: "Tomorrow",
    time: "3:00 PM - 4:00 PM",
    meetingLink: "https://example.com/meeting/123"
  },
  {
    id: 2,
    title: "Resume Review Session",
    type: "One-on-One",
    with: "David Kim",
    date: "Friday, Aug 12",
    time: "2:00 PM - 3:00 PM",
    meetingLink: "https://example.com/meeting/456"
  },
  {
    id: 3,
    title: "Tech Industry Insights",
    type: "Group Workshop",
    with: "Alumni Panel",
    date: "Monday, Aug 15",
    time: "5:00 PM - 6:30 PM",
    meetingLink: "https://example.com/meeting/789"
  }
];

const UpcomingSessionsSection = () => {
  const navigate = useNavigate();

  // Join session
  const joinSession = (sessionLink) => {
    window.open(sessionLink, "_blank");
  };

  // View schedule
  const viewSchedule = () => {
    navigate("/schedule");
  };

  // Get time until session
  const getTimeUntil = (dateStr) => {
    if (dateStr === "Tomorrow") return "1 day";
    if (dateStr === "Today") return "Today";
    
    // In a real app, calculate this based on actual dates
    return "Coming soon";
  };

  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-medium text-lg">Upcoming Sessions</h3>
        <Calendar className="h-5 w-5 text-primary" />
      </div>
      
      <div className="space-y-4">
        {upcomingSessions.map((session) => (
          <div key={session.id} className="border border-border/30 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">{session.title}</h4>
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
              <span>{session.type} with {session.with}</span>
            </div>
            
            <div className="flex items-center text-xs text-muted-foreground mb-3">
              <Clock className="h-3 w-3 mr-1.5" />
              <span>{session.date}, {session.time}</span>
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <button
                onClick={() => joinSession(session.meetingLink)}
                className="flex items-center text-primary text-sm"
              >
                <Link className="h-3.5 w-3.5 mr-1" />
                Meeting link
              </button>
              
              <button
                onClick={() => joinSession(session.meetingLink)}
                className="px-3 py-1.5 text-xs rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                Join Now
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center"
        onClick={viewSchedule}
      >
        View full schedule
        <ChevronRight className="h-4 w-4 ml-1" />
      </button>
    </div>
  );
};

export default UpcomingSessionsSection; 