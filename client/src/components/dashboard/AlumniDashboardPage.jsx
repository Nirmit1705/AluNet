import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, Briefcase, MessageSquare, Award, Bell, ChevronRight, BookOpen, GraduationCap, Heart, Star, Clock, Zap, UserPlus, Plus, CheckCircle, Edit, Trash, X } from "lucide-react";

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
  const navigate = useNavigate();
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [endorsedStudents, setEndorsedStudents] = useState([]);
  const [jobPostModal, setJobPostModal] = useState(false);
  const [myPostedJobs, setMyPostedJobs] = useState([
    {
      id: 1,
      title: "Frontend Developer",
      company: "Tech Solutions Inc.",
      applicants: 5,
      datePosted: "2 days ago",
      type: "Full Time",
      location: "Remote",
      description: "Looking for a talented frontend developer with React experience...",
      requirements: ["3+ years React experience", "JavaScript/TypeScript", "CSS/SCSS"],
      skills: ["React", "TypeScript", "CSS"],
    },
    {
      id: 2,
      title: "UX Designer",
      company: "Creative Designs Co.",
      applicants: 8,
      datePosted: "1 week ago",
      type: "Contract",
      location: "Chicago, IL",
      description: "Seeking a UX designer to help create intuitive user experiences...",
      requirements: ["Portfolio of design work", "Figma expertise", "User research"],
      skills: ["UI/UX", "Figma", "User Research"],
    }
  ]);
  
  // Add an error state
  const [renderError, setRenderError] = useState(null);
  
  // Add error boundary effect
  useEffect(() => {
    try {
      // Just a test to see if there are any initialization errors
      console.log("AlumniDashboardPage initialized successfully");
    } catch (err) {
      setRenderError(err.message);
      console.error("Error initializing AlumniDashboardPage:", err);
    }
  }, []);
  
  // If there's a render error, show error message
  if (renderError) {
    return (
      <div className="container-custom py-8">
        <div className="glass-card rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold text-red-500 mb-4">Error Loading Dashboard</h3>
          <p className="mb-4">{renderError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Reload Page
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
  
  // Navigate to jobs page
  const goToJobs = () => {
    navigate("/jobs");
  };
  
  // Navigate to students page
  const goToStudents = () => {
    navigate("/students");
    // In a real app, this would navigate to students page
    alert("Navigating to student profiles");
  };
  
  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotificationsPanel(!showNotificationsPanel);
  };
  
  // Toggle job post modal
  const toggleJobPostModal = () => {
    setJobPostModal(!jobPostModal);
  };
  
  // Endorse a student
  const endorseStudent = (studentId) => {
    if (endorsedStudents.includes(studentId)) {
      setEndorsedStudents(endorsedStudents.filter(id => id !== studentId));
    } else {
      setEndorsedStudents([...endorsedStudents, studentId]);
    }
  };
  
  // Delete a job post
  const deleteJobPost = (jobId) => {
    // Confirm deletion with user
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      setMyPostedJobs(myPostedJobs.filter(job => job.id !== jobId));
    }
  };
  
  // Edit a job post
  const editJobPost = (jobId) => {
    // In a real app, this would open a form with the job details
    alert(`Editing job post #${jobId}`);
  };
  
  // View applicants for a job
  const viewApplicants = (jobId) => {
    // In a real app, this would navigate to applicants view
    alert(`Viewing applicants for job #${jobId}`);
  };

  return (
    <div className="pb-12 relative">
      <div className="container-custom">
        {/* Stats overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card rounded-xl p-6 animate-fade-in cursor-pointer" onClick={goToStudents}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Students Following</h3>
              <Users className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">28</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              +5 from last month
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-100 cursor-pointer" onClick={goToJobs}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Job Postings</h3>
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">2</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              13 total applicants
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-200 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Messages</h3>
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">8</p>
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
              3 unread messages
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-300 cursor-pointer" onClick={goToEvents}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Events</h3>
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">5</p>
            <p className="text-sm text-muted-foreground mt-1">
              Next: Tomorrow, 5:00 PM
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="glass-card rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={toggleJobPostModal}
              className="button-primary py-2 w-full flex items-center justify-center gap-2"
            >
              <Briefcase className="h-5 w-5" />
              Post a Job
            </button>
            <button 
              onClick={goToStudents}
              className="button-secondary py-2 w-full flex items-center justify-center gap-2"
            >
              <Users className="h-5 w-5" />
              Message Students
            </button>
            <button 
              className="button-secondary py-2 w-full flex items-center justify-center gap-2"
            >
              <Award className="h-5 w-5" />
              Mentor a Student
            </button>
            <button 
              onClick={goToEvents}
              className="button-secondary py-2 w-full flex items-center justify-center gap-2"
            >
              <Calendar className="h-5 w-5" />
              Create Event
            </button>
          </div>
        </div>

        {/* Main dashboard content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left and center sections - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Job Postings Section */}
            <div className="glass-card rounded-xl p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-lg">My Job Postings</h3>
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-4">
                {myPostedJobs.length > 0 ? (
                  myPostedJobs.map((job) => (
                    <div key={job.id} className="p-4 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{job.title}</h4>
                          <p className="text-sm text-muted-foreground">{job.company} • {job.location}</p>
                          <p className="text-xs text-muted-foreground mt-1">Posted {job.datePosted}</p>
                          <div className="flex items-center mt-2">
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                              {job.type}
                            </span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              {job.applicants} applicant{job.applicants !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex">
                          <button 
                            onClick={() => editJobPost(job.id)}
                            className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                            aria-label="Edit job"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => deleteJobPost(job.id)}
                            className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                            aria-label="Delete job"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3">
                        <button 
                          onClick={() => viewApplicants(job.id)}
                          className="w-full px-3 py-1.5 border border-primary/30 text-primary text-sm rounded-lg hover:bg-primary/5 transition-colors"
                        >
                          View Applicants
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-4">You haven't posted any jobs yet.</p>
                )}
              </div>
              <button 
                className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center"
                onClick={goToJobs}
              >
                View all job postings
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>

            {/* Volunteer Opportunities Section */}
            <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-lg">Volunteer Opportunities</h3>
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-4">
                {volunteerOpportunities.map((opportunity) => (
                  <div key={opportunity.id} className="p-4 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{opportunity.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {opportunity.date} • {opportunity.time}
                        </p>
                        <p className="text-sm text-muted-foreground">Location: {opportunity.location}</p>
                      </div>
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {opportunity.department}
                      </span>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button 
                        className="px-4 py-1.5 bg-primary/10 text-primary text-sm rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center"
                onClick={goToEvents}
              >
                View all opportunities
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>

          {/* Right sidebar - 1/3 width */}
          <div className="space-y-8">
            {/* Current Mentees Section */}
            <div className="glass-card rounded-xl p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-lg">Current Mentees</h3>
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-4">
                {currentMentees.map((mentee) => (
                  <div key={mentee.id} className="flex items-start p-4 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4">
                      <Users className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{mentee.name}</h4>
                      <p className="text-sm text-muted-foreground">{mentee.program} • {mentee.year}</p>
                      <div className="flex items-center mt-2">
                        <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                        <span className="text-xs text-muted-foreground">Last contact: {mentee.lastInteraction}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <Calendar className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-xs text-green-600">Next: {mentee.nextSession}</span>
                      </div>
                    </div>
                    <button 
                      className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-sm rounded-lg transition-colors"
                    >
                      Message
                    </button>
                  </div>
                ))}
              </div>
              <button 
                className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center"
              >
                View all mentees
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
      
      {/* Job Post Modal */}
      {jobPostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-xl p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Post a New Job</h3>
              <button 
                onClick={toggleJobPostModal}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label htmlFor="jobTitle" className="block text-sm font-medium mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  placeholder="e.g. Frontend Developer"
                />
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium mb-1">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  placeholder="e.g. Tech Solutions Inc."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
                <div>
                  <label htmlFor="jobType" className="block text-sm font-medium mb-1">
                    Job Type
                  </label>
                  <select
                    id="jobType"
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  placeholder="Describe the job role, responsibilities, etc."
                ></textarea>
              </div>
              <div>
                <label htmlFor="requirements" className="block text-sm font-medium mb-1">
                  Requirements (one per line)
                </label>
                <textarea
                  id="requirements"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  placeholder="e.g. 3+ years of experience with React"
                ></textarea>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button 
                  type="button"
                  onClick={toggleJobPostModal}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Post Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
        AlumniDashboardPage is rendering correctly! If you're seeing this, the component is working.
      </div>
    </div>
  );
};

export default AlumniDashboardPage; 