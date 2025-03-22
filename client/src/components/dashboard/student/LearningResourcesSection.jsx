import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ExternalLink, ChevronRight, Clock, Check } from "lucide-react";

// Sample learning resources data
const learningResources = [
  {
    id: 1,
    title: "Introduction to Web Development",
    source: "Online Course",
    duration: "4 hours",
    completed: false,
    progress: 25, // Percentage
    url: "https://example.com/course/web-dev"
  },
  {
    id: 2,
    title: "Advanced JavaScript Techniques",
    source: "Workshop Recording",
    duration: "2.5 hours",
    completed: false,
    progress: 75,
    url: "https://example.com/workshop/javascript"
  },
  {
    id: 3,
    title: "Resume Building for Tech Jobs",
    source: "Alumni Guide",
    duration: "1 hour",
    completed: true,
    progress: 100,
    url: "https://example.com/guide/resume"
  }
];

const LearningResourcesSection = () => {
  const navigate = useNavigate();

  // Continue learning
  const continueResource = (resourceId) => {
    const resource = learningResources.find(r => r.id === resourceId);
    if (!resource) return;
    
    // In a real app, this would navigate to the learning platform or open resource
    window.open(resource.url, "_blank");
  };

  // View all resources
  const viewAllResources = () => {
    navigate("/learning-resources");
  };

  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-medium text-lg">Learning Resources</h3>
        <BookOpen className="h-5 w-5 text-primary" />
      </div>
      
      <div className="space-y-4">
        {learningResources.map((resource) => (
          <div key={resource.id} className="border border-border/30 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">{resource.title}</h4>
              <a 
                href={resource.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">{resource.source}</p>
            
            <div className="flex items-center text-xs text-muted-foreground mb-3">
              <Clock className="h-3 w-3 mr-1" />
              <span>{resource.duration}</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-3">
              <div 
                className="h-full bg-primary rounded-full"
                style={{ width: `${resource.progress}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium">
                {resource.completed ? (
                  <span className="flex items-center text-green-600">
                    <Check className="h-3 w-3 mr-1" />
                    Completed
                  </span>
                ) : (
                  `${resource.progress}% complete`
                )}
              </span>
              
              <button
                onClick={() => continueResource(resource.id)}
                className="px-3 py-1.5 text-xs rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                {resource.completed ? "Review" : "Continue"}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center"
        onClick={viewAllResources}
      >
        View all resources
        <ChevronRight className="h-4 w-4 ml-1" />
      </button>
    </div>
  );
};

export default LearningResourcesSection; 