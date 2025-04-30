import React from "react";
import { Briefcase, Users, Award } from "lucide-react";

const QuickActionsSection = ({ toggleJobPostModal, goToStudents, goToMentorship }) => {
  return (
    <div className="glass-card rounded-xl p-6 mb-8 animate-fade-in relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none"></div>
      <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 pointer-events-none"></div>
      <div className="relative z-10">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-bold">Quick Actions</h2>
          <span className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Alumni Tools</span>
        </div>
        <p className="text-sm text-muted-foreground mb-6">Use these tools to connect with students and share opportunities</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={toggleJobPostModal}
            className="button-primary py-3 px-6 w-full h-full flex flex-col items-center justify-center gap-1 rounded-lg transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]"
          >
            <Briefcase className="h-6 w-6 mb-1" />
            <span className="font-medium">Post a Job</span>
            <span className="text-xs opacity-80">Share opportunities with students</span>
          </button>
          <button 
            onClick={goToStudents}
            className="button-secondary py-3 px-6 w-full h-full flex flex-col items-center justify-center gap-1 rounded-lg transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Users className="h-6 w-6 mb-1" />
            <span className="font-medium">Message Students</span>
            <span className="text-xs opacity-80">Connect with potential mentees</span>
          </button>
          <button 
            onClick={goToMentorship}
            className="button-secondary py-3 px-6 w-full h-full flex flex-col items-center justify-center gap-1 rounded-lg transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Award className="h-6 w-6 mb-1" />
            <span className="font-medium">Mentor a Student</span>
            <span className="text-xs opacity-80">Guide students in their career</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsSection;