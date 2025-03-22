import React, { useState } from "react";
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
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
              +5 from last month
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-100 cursor-pointer" onClick={goToJobs}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Job Postings</h3>
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">{myPostedJobs.length}</p>
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
              {myPostedJobs.reduce((sum, job) => sum + job.applicants, 0)} total applicants
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-200 cursor-pointer" onClick={goToCourses}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Courses Created</h3>
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">3</p>
            <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center mt-1">
              142 students enrolled
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-300 cursor-pointer" onClick={goToEvents}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Events Hosted</h3>
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">5</p>
            <p className="text-sm text-muted-foreground flex items-center mt-1">
              Next: Tomorrow, 5:00 PM
            </p>
          </div>
        </div>

        {/* Main dashboard content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left and center sections */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Job Postings Section */}
            <div className="glass-card rounded-xl p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-lg">My Job Postings</h3>
                <div className="flex space-x-2">
                  <button 
                    className="px-4 py-1.5 bg-primary text-white rounded-lg flex items-center text-sm"
                    onClick={toggleJobPostModal}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Post New Job
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {myPostedJobs.map((job) => (
                  <div key={job.id} className="p-4 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium text-base">{job.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {job.company} • {job.location} • {job.type}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {job.skills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm text-muted-foreground">Posted {job.datePosted}</span>
                        <div className="flex space-x-2 mt-3">
                          <button 
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                            onClick={() => viewApplicants(job.id)}
                          >
                            <CheckCircle className="h-5 w-5 text-primary" title="View applicants" />
                          </button>
                          <button 
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                            onClick={() => editJobPost(job.id)}
                          >
                            <Edit className="h-5 w-5 text-primary" title="Edit job posting" />
                          </button>
                          <button 
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                            onClick={() => deleteJobPost(job.id)}
                          >
                            <Trash className="h-5 w-5 text-red-500" title="Delete job posting" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-primary mr-1" />
                        <span className="text-sm font-medium">{job.applicants} applicants</span>
                      </div>
                    </div>
                  </div>
                ))}
                {myPostedJobs.length === 0 && (
                  <div className="p-8 text-center">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="text-lg font-medium">No job postings yet</h4>
                    <p className="text-muted-foreground mt-2">
                      Create your first job posting to reach potential candidates
                    </p>
                    <button 
                      className="mt-4 px-6 py-2 bg-primary text-white rounded-lg flex items-center mx-auto"
                      onClick={toggleJobPostModal}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Post a Job
                    </button>
                  </div>
                )}
              </div>
              <button 
                className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center"
                onClick={goToJobs}
              >
                Manage all job postings
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>

            {/* Upcoming Events Section */}
            <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-lg">My Upcoming Events</h3>
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
                        <div className="mt-2 flex items-center">
                          <Users className="h-4 w-4 text-primary mr-1" />
                          <span className="text-sm">{event.attendees} registered attendees</span>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {event.category}
                      </span>
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
            {/* Suggested Students Section */}
            <div className="glass-card rounded-xl p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-lg">Suggested Students</h3>
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-4">
                {suggestedStudents.map((student) => (
                  <div key={student.id} className="flex items-start p-4 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4">
                      <Users className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{student.name}</h4>
                      <p className="text-sm text-muted-foreground">{student.program}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {student.skills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button 
                      className={`${
                        endorsedStudents.includes(student.id)
                          ? "bg-primary text-white"
                          : "bg-primary/10 text-primary hover:bg-primary/20"
                      } px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center`}
                      onClick={() => endorseStudent(student.id)}
                    >
                      {endorsedStudents.includes(student.id) ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Endorsed
                        </>
                      ) : (
                        "Endorse"
                      )}
                    </button>
                  </div>
                ))}
              </div>
              <button 
                className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center"
                onClick={goToStudents}
              >
                View all students
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>

            {/* Notifications Section */}
            <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-lg">Recent Notifications</h3>
                <button 
                  className="relative"
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
      
      {/* Job Post Modal */}
      {jobPostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl p-6 rounded-xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Post a New Job</h3>
              <button 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={toggleJobPostModal}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Job Title</label>
                <input type="text" className="w-full p-2 border border-border rounded-lg" placeholder="e.g. Frontend Developer" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <input type="text" className="w-full p-2 border border-border rounded-lg" placeholder="e.g. Tech Solutions Inc." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input type="text" className="w-full p-2 border border-border rounded-lg" placeholder="e.g. New York or Remote" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Job Type</label>
                  <select className="w-full p-2 border border-border rounded-lg">
                    <option>Full Time</option>
                    <option>Part Time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Job Description</label>
                <textarea className="w-full p-2 border border-border rounded-lg min-h-[100px]" placeholder="Describe the job role and responsibilities..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Requirements</label>
                <textarea className="w-full p-2 border border-border rounded-lg min-h-[80px]" placeholder="List the requirements and qualifications..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
                <input type="text" className="w-full p-2 border border-border rounded-lg" placeholder="e.g. React, JavaScript, CSS" />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={toggleJobPostModal}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  onClick={() => {
                    alert("Job posted successfully!");
                    toggleJobPostModal();
                  }}
                >
                  Post Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniDashboardPage; 