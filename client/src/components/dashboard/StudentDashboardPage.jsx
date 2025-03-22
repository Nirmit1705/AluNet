import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, Briefcase, MessageSquare, Award, Bell, ChevronRight, BookOpen, GraduationCap, Heart, Star, Clock, X } from "lucide-react";

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
  const navigate = useNavigate();
  const [savedMentors, setSavedMentors] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);
  
  // Error handling effect
  useEffect(() => {
    try {
      console.log("StudentDashboardPage mounted successfully");
    } catch (error) {
      setDashboardError(error.message);
      console.error("Error in StudentDashboardPage:", error);
    }
  }, []);

  // If there's an error, show a simple error message
  if (dashboardError) {
    return (
      <div className="container-custom py-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-6 text-center">
          <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Dashboard Error</h3>
          <p className="text-red-600 dark:text-red-300 mb-4">{dashboardError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
  
  // Navigate to courses page
  const goToCourses = () => {
    navigate("/courses");
    // In a real app, this would navigate to a courses page
    alert("Navigating to all courses");
  };
  
  // Navigate to events page
  const goToEvents = () => {
    navigate("/events");
    // In a real app, this would navigate to an events page
    alert("Navigating to all events");
  };
  
  // Connect with mentor
  const connectWithMentor = (mentorId) => {
    // In a real app, this would initiate a connection request
    alert(`Connection request sent to mentor #${mentorId}`);
  };
  
  // Navigate to mentors page
  const goToMentors = () => {
    navigate("/mentors");
    // In a real app, this would navigate to a mentors page
    alert("Navigating to all mentors");
  };
  
  // Register for event
  const registerForEvent = (eventId) => {
    if (registeredEvents.includes(eventId)) {
      setRegisteredEvents(registeredEvents.filter(id => id !== eventId));
    } else {
      setRegisteredEvents([...registeredEvents, eventId]);
    }
  };
  
  // Save/bookmark mentor
  const saveMentor = (mentorId) => {
    if (savedMentors.includes(mentorId)) {
      setSavedMentors(savedMentors.filter(id => id !== mentorId));
    } else {
      setSavedMentors([...savedMentors, mentorId]);
    }
  };
  
  // Continue course
  const continueCourse = (courseId) => {
    // In a real app, this would navigate to the course
    alert(`Continuing course #${courseId}`);
  };
  
  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotificationsPanel(!showNotificationsPanel);
  };
  
  // View job opportunities
  const viewJobOpportunities = () => {
    navigate("/jobs");
  };

  return (
    <div className="pb-12 relative">
      <div className="container-custom">
        {/* Stats overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card rounded-xl p-6 animate-fade-in cursor-pointer" onClick={goToMentors}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Mentors Connected</h3>
              <Users className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">12</p>
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
              +3 from last month
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-100 cursor-pointer" onClick={viewJobOpportunities}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Job Opportunities</h3>
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">24</p>
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
              8 new postings
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-200 cursor-pointer" onClick={goToCourses}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Learning Hours</h3>
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">18</p>
            <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center mt-1">
              This month
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-300 cursor-pointer" onClick={goToEvents}>
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
                      <button 
                        className="mt-3 px-4 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-sm rounded-lg transition-colors"
                        onClick={() => continueCourse(course.id)}
                      >
                        Continue Learning
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center"
                onClick={goToCourses}
              >
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
                    <div className="mt-3 flex justify-end">
                      <button 
                        className={`px-4 py-1.5 ${
                          registeredEvents.includes(event.id) 
                            ? "bg-primary text-white" 
                            : "bg-primary/10 text-primary hover:bg-primary/20"
                        } text-sm rounded-lg transition-colors`}
                        onClick={() => registerForEvent(event.id)}
                      >
                        {registeredEvents.includes(event.id) ? "Registered" : "Register"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center"
                onClick={goToEvents}
              >
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

            {/* Notifications Section */}
            <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-lg">Recent Notifications</h3>
                <button 
                  className="relative group"
                  onClick={toggleNotifications}
                >
                  <Bell className="h-5 w-5 text-primary" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 flex items-center justify-center text-xs rounded-full">
                    {notifications.length}
                  </span>
                </button>
              </div>
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="flex p-3 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <div className="rounded-full bg-primary/10 p-2 mr-3">
                      <notification.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{notification.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center"
                onClick={toggleNotifications}
              >
                View all notifications
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notifications Panel */}
      {showNotificationsPanel && (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md p-6 animate-slide-in-right">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Notifications</h3>
              <button 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={toggleNotifications}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex p-4 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <div className="rounded-full bg-primary/10 p-2 mr-4">
                    <notification.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Debug message (can be removed in production) */}
      <div className="text-center text-muted-foreground mt-8">
        StudentDashboardPage is rendering correctly! If you're seeing this, the component is working.
      </div>
    </div>
  );
};

export default StudentDashboardPage; 