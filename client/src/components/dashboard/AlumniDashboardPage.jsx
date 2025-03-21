import React from "react";
import { Calendar, Users, Briefcase, MessageSquare, Award, Bell, ChevronRight, BookOpen, GraduationCap, Heart, Star, Clock, Zap, UserPlus } from "lucide-react";

// Sample data for mentee requests
const menteeRequests = [
  {
    id: 1,
    name: "Emily Parker",
    program: "Computer Science",
    year: "3rd Year",
    interests: ["Web Development", "UI/UX"],
    message: "I'm interested in learning more about your experience in the tech industry and would appreciate any guidance on transitioning from academia to workplace."
  },
  {
    id: 2,
    name: "Jason Miller",
    program: "Data Science",
    year: "4th Year",
    interests: ["Machine Learning", "Data Visualization"],
    message: "I'm working on a capstone project related to ML and would love some advice on industry best practices."
  }
];

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

// Sample data for volunteer opportunities
const volunteerOpportunities = [
  {
    id: 1,
    title: "Guest Lecture: Industry Insights",
    date: "June 10, 2023",
    time: "2:00 PM - 4:00 PM",
    location: "Virtual",
    department: "Computer Science"
  },
  {
    id: 2,
    title: "Career Fair Volunteer",
    date: "July 5, 2023",
    time: "10:00 AM - 3:00 PM",
    location: "University Main Hall",
    department: "University-wide"
  },
  {
    id: 3,
    title: "Capstone Project Evaluator",
    date: "May 30, 2023",
    time: "1:00 PM - 5:00 PM",
    location: "Engineering Building",
    department: "Engineering"
  }
];

const notifications = [
  {
    id: 1,
    title: "New mentee request",
    description: "Emily Parker has requested mentorship",
    time: "5 minutes ago",
    icon: UserPlus,
  },
  {
    id: 2,
    title: "New message",
    description: "You have a new message from Sophia Williams",
    time: "1 hour ago",
    icon: MessageSquare,
  },
  {
    id: 3,
    title: "Volunteer opportunity",
    description: "New guest lecture opportunity is available",
    time: "3 hours ago",
    icon: Award,
  },
];

const AlumniDashboardPage = () => {
  return (
    <div className="pb-12">
      <div className="container-custom">
        {/* Stats overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card rounded-xl p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Mentees</h3>
              <Users className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">5</p>
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
              2 new requests
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Volunteer Hours</h3>
              <Award className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">32</p>
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
              This academic year
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Job Referrals</h3>
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">8</p>
            <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center mt-1">
              3 in process
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Upcoming Sessions</h3>
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">4</p>
            <p className="text-sm text-muted-foreground flex items-center mt-1">
              Next: Tomorrow, 2:00 PM
            </p>
          </div>
        </div>

        {/* Main dashboard content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left and center sections */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mentee Requests Section */}
            <div className="glass-card rounded-xl p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-lg">Mentee Requests</h3>
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-4">
                {menteeRequests.map((mentee) => (
                  <div key={mentee.id} className="p-4 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-base">{mentee.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {mentee.program} • {mentee.year}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {mentee.interests.map((interest, idx) => (
                            <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                              {interest}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-3">{mentee.message}</p>
                      </div>
                    </div>
                    <div className="flex mt-4 gap-2">
                      <button className="flex-1 px-3 py-1.5 bg-primary text-white text-sm rounded-lg transition-colors hover:bg-primary/90">
                        Accept
                      </button>
                      <button className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-700 text-sm rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Mentees Section */}
            <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-lg">Current Mentees</h3>
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-4">
                {currentMentees.map((mentee) => (
                  <div key={mentee.id} className="p-4 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-base">{mentee.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {mentee.program} • {mentee.year}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Last contact: {mentee.lastInteraction}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Next session: {mentee.nextSession}
                          </span>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-sm rounded-lg transition-colors">
                        Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center">
                View all mentees
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-8">
            {/* Volunteer Opportunities */}
            <div className="glass-card rounded-xl p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-lg">Volunteer Opportunities</h3>
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-4">
                {volunteerOpportunities.map((opportunity) => (
                  <div key={opportunity.id} className="p-4 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <h4 className="font-medium text-base">{opportunity.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {opportunity.date} • {opportunity.time}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {opportunity.location}
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {opportunity.department}
                      </span>
                      <button className="px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-xs rounded-lg transition-colors">
                        Sign Up
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center">
                View all opportunities
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>

            <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-lg">Notifications</h3>
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                    <div className="bg-primary/10 text-primary p-2 rounded-full">
                      <notification.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center">
                View all notifications
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniDashboardPage; 