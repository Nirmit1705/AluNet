import React from "react";
import { Users, Briefcase, MessageSquare, UserPlus } from "lucide-react";

const StatsOverviewSection = ({ goToStudents, goToJobs, goToConnections }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      <div 
        onClick={goToStudents}
        className="glass-card rounded-xl p-4 flex items-center cursor-pointer hover:bg-primary/5 transition-colors"
      >
        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Students Mentored</p>
          <p className="text-2xl font-semibold">24</p>
          <p className="text-xs text-green-600">+3 new this month</p>
        </div>
      </div>

      <div 
        onClick={goToJobs}
        className="glass-card rounded-xl p-4 flex items-center cursor-pointer hover:bg-primary/5 transition-colors"
      >
        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4">
          <Briefcase className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Job Posts</p>
          <p className="text-2xl font-semibold">8</p>
          <p className="text-xs text-muted-foreground">3 active listings</p>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 flex items-center">
        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4">
          <MessageSquare className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Messages</p>
          <p className="text-2xl font-semibold">56</p>
          <p className="text-xs text-muted-foreground">12 unread messages</p>
        </div>
      </div>

      <div 
        onClick={goToConnections}
        className="glass-card rounded-xl p-4 flex items-center cursor-pointer hover:bg-primary/5 transition-colors"
      >
        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4">
          <UserPlus className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Connections</p>
          <p className="text-2xl font-semibold">32</p>
          <p className="text-xs text-green-600">+5 from last month</p>
        </div>
      </div>
    </div>
  );
};

export default StatsOverviewSection; 