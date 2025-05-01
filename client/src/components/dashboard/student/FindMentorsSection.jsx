import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, GraduationCap, Heart, Clock, ChevronRight } from "lucide-react";

// Sample data for recommended mentors
const recommendedMentors = [
  {
    id: 1,
    name: "Jennifer Lee",
    role: "Senior Software Engineer at Google",
    specialties: ["Web Development", "System Design"],
    availability: "Available this week"
  },
  {
    id: 2,
    name: "David Kim",
    role: "Data Scientist at Amazon",
    specialties: ["Machine Learning", "Data Analysis"],
    availability: "Available next week"
  },
  {
    id: 3,
    name: "Michael Torres",
    role: "UX Designer at Apple",
    specialties: ["UI/UX", "Product Design"],
    availability: "Available tomorrow"
  }
];

const FindMentorsSection = () => {
  const navigate = useNavigate();
  const [savedMentors, setSavedMentors] = useState([]);

  // Connect with mentor
  const connectWithMentor = (mentorId) => {
    // Check if already connected/requested
    const mentor = recommendedMentors.find(m => m.id === mentorId);
    if (!mentor) return;
    
    // In a real app, this would send a connection request to the backend
    alert(`Connection request sent to ${mentor.name}`);
    
    // You could also update the UI to show "Request Sent" instead of "Connect"
    // This would require additional state to track pending requests
  };

  // Save/bookmark mentor
  const saveMentor = (mentorId) => {
    if (savedMentors.includes(mentorId)) {
      setSavedMentors(savedMentors.filter(id => id !== mentorId));
    } else {
      setSavedMentors([...savedMentors, mentorId]);
    }
  };

  // Navigate to alumni directory
  const goToMentors = () => {
    navigate("/alumni");
  };

  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-medium text-lg">Find Mentors</h3>
        <Star className="h-5 w-5 text-primary" />
      </div>
      <div className="space-y-4">
        {recommendedMentors.map((mentor) => (
          <div key={mentor.id} className="flex items-start p-4 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <h4 className="font-medium">{mentor.name}</h4>
                <button 
                  className="text-gray-400 hover:text-primary transition-colors"
                  onClick={() => saveMentor(mentor.id)}
                >
                  <Heart className={`h-4 w-4 ${savedMentors.includes(mentor.id) ? "fill-primary text-primary" : ""}`} />
                </button>
              </div>
              <p className="text-sm text-muted-foreground">{mentor.role}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {mentor.specialties.map((specialty, idx) => (
                  <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    {specialty}
                  </span>
                ))}
              </div>
              <div className="flex items-center mt-3">
                <Clock className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-xs text-green-600">{mentor.availability}</span>
              </div>
            </div>
            <button 
              className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-sm rounded-lg transition-colors"
              onClick={() => connectWithMentor(mentor.id)}
            >
              Connect
            </button>
          </div>
        ))}
      </div>
      <button 
        className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center"
        onClick={goToMentors}
      >
        Find more mentors
        <ChevronRight className="h-4 w-4 ml-1" />
      </button>
    </div>
  );
};

export default FindMentorsSection;