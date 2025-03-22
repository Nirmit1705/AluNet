import React from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, ChevronRight } from "lucide-react";

// Sample data for student success stories
const successStories = [
  {
    id: 1,
    studentName: "Marcus Johnson",
    achievement: "Secured internship at Google",
    story: "With your mentorship on interview prep and resume building, I was able to secure my dream internship at Google!",
    date: "May 15, 2023"
  },
  {
    id: 2,
    studentName: "Aisha Patel",
    achievement: "Won hackathon first place",
    story: "The project management and technical skills you taught me helped my team win first place at the university hackathon.",
    date: "April 22, 2023"
  },
  {
    id: 3,
    studentName: "Tyler Rodriguez",
    achievement: "Published research paper",
    story: "Thanks to your guidance on research methodologies, my paper was accepted in the International Journal of Computer Science.",
    date: "June 5, 2023"
  }
];

const SuccessStoriesSection = () => {
  const navigate = useNavigate();

  // View all success stories
  const viewAllSuccessStories = () => {
    navigate("/success-stories");
    // In a real app, this would navigate to a success stories page
    alert("Navigating to success stories");
  };

  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-medium text-lg">Student Success Stories</h3>
        <TrendingUp className="h-5 w-5 text-primary" />
      </div>
      <div className="space-y-4">
        {successStories.map((story) => (
          <div key={story.id} className="p-4 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{story.studentName}</h4>
                <p className="text-sm text-green-600 font-medium mt-1">{story.achievement}</p>
                <p className="text-sm text-muted-foreground mt-1 italic">"{story.story}"</p>
                <p className="text-xs text-muted-foreground mt-1">{story.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button 
        className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center"
        onClick={viewAllSuccessStories}
      >
        View all success stories
        <ChevronRight className="h-4 w-4 ml-1" />
      </button>
    </div>
  );
};

export default SuccessStoriesSection; 