import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, GraduationCap, Clock, Calendar, ChevronRight } from "lucide-react";

// Sample data for mentees
const currentMentees = [
  {
    id: 1,
    name: "Sophia Williams",
    program: "Computer Engineering",
    year: "4th Year",
    lastInteraction: "2 days ago",
    nextSession: "May 20, 2023"
  },
  {
    id: 2,
    name: "Michael Chen",
    program: "Information Systems",
    year: "3rd Year",
    lastInteraction: "1 week ago",
    nextSession: "May 18, 2023"
  },
  {
    id: 3,
    name: "Olivia Johnson",
    program: "Software Engineering",
    year: "2nd Year",
    lastInteraction: "Yesterday",
    nextSession: "May 25, 2023"
  }
];

const MenteesSection = () => {
  const navigate = useNavigate();

  // Message a mentee
  const messageMentee = (menteeId) => {
    navigate(`/messages?mentee=${menteeId}`);
    // In a real app, this would navigate to the messaging interface with the specific mentee selected
  };
  
  // View all mentees
  const viewAllMentees = () => {
    navigate("/mentees");
    // In a real app, this would navigate to a page listing all mentees
    alert("Navigating to all mentees");
  };

  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-medium text-lg">Current Mentees</h3>
        <GraduationCap className="h-5 w-5 text-primary" />
      </div>
      <div className="space-y-4">
        {currentMentees.map((mentee) => (
          <div key={mentee.id} className="flex items-start p-4 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4">
              <Users className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{mentee.name}</h4>
              <p className="text-sm text-muted-foreground">{mentee.program} • {mentee.year}</p>
              <div className="flex items-center mt-2">
                <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                <span className="text-xs text-muted-foreground">Last contact: {mentee.lastInteraction}</span>
              </div>
              <div className="flex items-center mt-1">
                <Calendar className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-xs text-green-600">Next: {mentee.nextSession}</span>
              </div>
            </div>
            <button 
              onClick={() => messageMentee(mentee.id)}
              className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-sm rounded-lg transition-colors"
            >
              Message
            </button>
          </div>
        ))}
      </div>
      <button 
        onClick={viewAllMentees}
        className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center"
      >
        View all mentees
        <ChevronRight className="h-4 w-4 ml-1" />
      </button>
    </div>
  );
};

export default MenteesSection; 