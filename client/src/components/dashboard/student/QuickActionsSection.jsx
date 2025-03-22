import React from "react";
import { 
  Search, 
  MessageCircle, 
  FileText, 
  Calendar 
} from "lucide-react";

const QuickActionsSection = ({ 
  goToMentors, 
  goToMessages, 
  goToSkillsAssessment, 
  goToSchedule 
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in">
      <button
        onClick={goToMentors}
        className="flex flex-col items-center justify-center p-4 glass-card rounded-xl transition-all hover:shadow-md hover:bg-primary/5"
      >
        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
          <Search className="h-6 w-6" />
        </div>
        <span className="text-sm font-medium">Find Mentors</span>
      </button>

      <button
        onClick={goToMessages}
        className="flex flex-col items-center justify-center p-4 glass-card rounded-xl transition-all hover:shadow-md hover:bg-primary/5"
      >
        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
          <MessageCircle className="h-6 w-6" />
        </div>
        <span className="text-sm font-medium">Messages</span>
      </button>

      <button
        onClick={goToSkillsAssessment}
        className="flex flex-col items-center justify-center p-4 glass-card rounded-xl transition-all hover:shadow-md hover:bg-primary/5"
      >
        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
          <FileText className="h-6 w-6" />
        </div>
        <span className="text-sm font-medium">Assessment</span>
      </button>

      <button
        onClick={goToSchedule}
        className="flex flex-col items-center justify-center p-4 glass-card rounded-xl transition-all hover:shadow-md hover:bg-primary/5"
      >
        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
          <Calendar className="h-6 w-6" />
        </div>
        <span className="text-sm font-medium">Schedule</span>
      </button>
    </div>
  );
};

export default QuickActionsSection; 