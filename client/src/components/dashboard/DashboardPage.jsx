import React from "react";
import { Calendar, Users, Briefcase, MessageSquare, Award, Bell, ChevronRight, BookOpen, GraduationCap, Heart, Star, Clock } from "lucide-react";

// Sample data for upcoming events
const upcomingEvents = [
  {
    id: 1,
    title: "Career Workshop",
    date: "May 15, 2023",
    time: "3:00 PM - 5:00 PM",
    host: "Jane Smith",
    category: "Career Development"
  },
  {
    id: 2,
    title: "Tech Talk: AI Innovations",
    date: "May 18, 2023",
    time: "4:00 PM - 6:00 PM",
    host: "Michael Johnson",
    category: "Technology"
  },
  {
    id: 3,
    title: "Resume Review Session",
    date: "May 22, 2023",
    time: "2:00 PM - 4:00 PM", 
    host: "Lisa Rodriguez",
    category: "Career Development"
  }
];

// Sample data for recommended mentors
const recommendedMentors = [
  {
    id: 1,
    name: "David Wilson",
    role: "Senior Software Engineer at Google",
    specialties: ["Web Development", "Career Guidance"],
    availability: "Available this week"
  },
  {
    id: 2,
    name: "Sarah Chen",
    role: "Product Manager at Microsoft",
    specialties: ["Product Strategy", "UX Design"],
    availability: "Available next week"
  }
];

const notifications = [
  {
    id: 1,
    title: "New mentorship request",
    description: "Sarah Johnson has requested mentorship",
    time: "5 minutes ago",
    icon: Award,
  },
  {
    id: 2,
    title: "New message",
    description: "You have a new message from Alex Smith",
    time: "1 hour ago",
    icon: MessageSquare,
  },
  {
    id: 3,
    title: "Job application update",
    description: "Your application status has been updated",
    time: "3 hours ago",
    icon: Briefcase,
  },
];

const DashboardPage = () => {
  return (
    <div className="pt-24 pb-12">
      <div className="container-custom">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening.</p>
        </header>

        {/* Stats overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card rounded-xl p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Total Connections</h3>
              <Users className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">248</p>
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
              +12% from last month
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Job Applications</h3>
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">16</p>
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
              4 awaiting response
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Messages</h3>
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">32</p>
            <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center mt-1">
              8 unread
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Upcoming Sessions</h3>
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">3</p>
            <p className="text-sm text-muted-foreground flex items-center mt-1">
              Next: Tomorrow, 4:00 PM
            </p>
          </div>
        </div>

        {/* Main dashboard content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left and center sections */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Events Section (replaces Platform Activity chart) */}
            <div className="glass-card rounded-xl p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-lg">Upcoming Events</h3>
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="p-4 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-base">{event.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.date} • {event.time}
                        </p>
                        <p className="text-sm text-muted-foreground">Host: {event.host}</p>
                      </div>
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {event.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center">
                View all events
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>

            {/* Recommended Mentors Section (replaces Mentorship Growth chart) */}
            <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-lg">Recommended Mentors</h3>
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-6">
                {recommendedMentors.map((mentor) => (
                  <div key={mentor.id} className="flex items-start p-4 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{mentor.name}</h4>
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
                    <button className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-sm rounded-lg transition-colors">
                      Connect
                    </button>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center">
                Discover more mentors
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-8">
            <div className="glass-card rounded-xl p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-lg">Resource Center</h3>
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-4">
                <div className="p-3 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <h4 className="font-medium">Resume Building Guide</h4>
                  <p className="text-sm text-muted-foreground mt-1">Tips for creating an effective resume</p>
                </div>
                <div className="p-3 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <h4 className="font-medium">Interview Preparation</h4>
                  <p className="text-sm text-muted-foreground mt-1">Common questions and strategies</p>
                </div>
                <div className="p-3 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <h4 className="font-medium">Networking Fundamentals</h4>
                  <p className="text-sm text-muted-foreground mt-1">Building professional connections</p>
                </div>
              </div>
              <button className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center">
                Browse all resources
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>

            <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-lg">Recent Notifications</h3>
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

export default DashboardPage;
