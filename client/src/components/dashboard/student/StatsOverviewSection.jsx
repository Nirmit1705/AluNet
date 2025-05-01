import React from "react";
import { Users, Briefcase, Award, Lightbulb } from "lucide-react";

const StatsOverviewSection = ({ stats, goToMentors, viewJobOpportunities, goToSkillsAssessment }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="glass-card rounded-xl p-6 animate-fade-in cursor-pointer" onClick={goToMentors}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-lg">Mentors Connected</h3>
          <Users className="h-6 w-6 text-primary" />
        </div>
        <p className="text-3xl font-bold">{stats?.connectedMentors || 0}</p>
        <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
          {stats?.newMentors > 0 ? `+${stats.newMentors} new connections` : "Connect with mentors"}
        </p>
      </div>

      <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-100 cursor-pointer" onClick={viewJobOpportunities}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-lg">Job Opportunities</h3>
          <Briefcase className="h-6 w-6 text-primary" />
        </div>
        <p className="text-3xl font-bold">{stats?.jobOpportunities || 0}</p>
        <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
          {stats?.newJobs > 0 ? `${stats.newJobs} new postings` : "Browse opportunities"}
        </p>
      </div>

      <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-200 cursor-pointer" onClick={goToSkillsAssessment}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-lg">Completed Assessments</h3>
          <Award className="h-6 w-6 text-primary" />
        </div>
        <p className="text-3xl font-bold">{stats?.completedAssessments || 0}</p>
        <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
          {stats?.assessmentProgress ? `${stats.assessmentProgress}% progress` : "Start assessment"}
        </p>
      </div>

      <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-300 cursor-pointer" onClick={() => window.location.href = "/sessions"}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-lg">Upcoming Sessions</h3>
          <Lightbulb className="h-6 w-6 text-primary" />
        </div>
        <p className="text-3xl font-bold">{stats?.upcomingSessions || 0}</p>
        <p className="text-sm text-muted-foreground flex items-center mt-1">
          {stats?.nextSession || "No upcoming sessions"}
        </p>
      </div>
    </div>
  );
};

export default StatsOverviewSection;