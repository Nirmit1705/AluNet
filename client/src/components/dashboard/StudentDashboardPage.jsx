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
    title: "New mentorship opportunity",
    description: "David Wilson is now available for mentoring",
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
    title: "Job opportunity",
    description: "New internship positions available at Google",
    time: "3 hours ago",
    icon: Briefcase,
  },
];

// Sample data for courses
const courses = [
  {
    id: 1,
    title: "Web Development Bootcamp",
    instructor: "Mark Davis",
    progress: 65,
    nextLesson: "Responsive Design Principles"
  },
  {
    id: 2,
    title: "Data Science Fundamentals",
    instructor: "Emily Wong",
    progress: 30,
    nextLesson: "Statistical Analysis"
  }
];

const StudentDashboardPage = () => {
  return (
    <div className="pb-12">
      <div className="container-custom">
        {/* Stats overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card rounded-xl p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Mentors Connected</h3>
              <Users className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">12</p>
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
              +3 from last month
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Job Opportunities</h3>
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">24</p>
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
              8 new postings
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Learning Hours</h3>
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">18</p>
            <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center mt-1">
              This month
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
            {/* My Courses Section */}
            <div className="glass-card rounded-xl p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-lg">My Courses</h3>
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-4">
                {courses.map((course) => (
                  <div key={course.id} className="p-4 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <div>
                      <h4 className="font-medium text-base">{course.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">Instructor: {course.instructor}</p>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-primary h-1.5 rounded-full" 
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <p className="text-xs text-primary mt-2">Next lesson: {course.nextLesson}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center">
                View all courses
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>

            {/* Upcoming Events Section */}
            <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-100">
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
          </div>

          {/* Right sidebar */}
          <div className="space-y-8">
            {/* Find Mentors Section */}
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
                Find more mentors
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

export default StudentDashboardPage; 