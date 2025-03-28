import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Calendar, Users, Briefcase, MessageSquare, Award, Bell, ChevronRight, Book, GraduationCap, School, Clock, CheckCircle, Heart, Search, ExternalLink, X, Lightbulb, Star, Code, Plus, Edit, User, Info, Mail, Linkedin } from "lucide-react";
import { useUniversity } from "../../context/UniversityContext";
import Footer from "../layout/Footer"; // Import the Footer component

// Sample data for job recommendations
const jobRecommendations = [
  {
    id: 1,
    title: "Software Engineer Intern",
    company: "Tech Innovations Inc.",
    location: "Remote",
    type: "Internship",
    salary: "$20-25/hr",
    postedDate: "2023-12-15",
    deadline: "2024-01-31",
    description: "Join our team to work on cutting-edge web applications using React and Node.js...",
    skills: ["React", "JavaScript", "Node.js"],
    logoUrl: "https://randomuser.me/api/portraits/men/1.jpg",
    companyUrl: "https://example.com",
    applicationUrl: "https://example.com/apply"
  },
  {
    id: 2,
    title: "UI/UX Design Intern",
    company: "Creative Solutions Co.",
    location: "Hybrid",
    type: "Internship",
    salary: "$18-22/hr",
    postedDate: "2023-12-20",
    deadline: "2024-02-10",
    description: "Help design beautiful and intuitive user interfaces for our products...",
    skills: ["Figma", "UI Design", "Prototyping"],
    logoUrl: "https://randomuser.me/api/portraits/women/2.jpg",
    companyUrl: "https://example.com",
    applicationUrl: "https://example.com/apply"
  },
  {
    id: 3,
    title: "Data Science Intern",
    company: "DataSmart Analytics",
    location: "On-site",
    type: "Summer Internship",
    salary: "$22-28/hr",
    postedDate: "2023-12-18",
    deadline: "2024-02-15",
    description: "Work with our data science team to analyze large datasets and build predictive models...",
    skills: ["Python", "Machine Learning", "SQL"],
    logoUrl: "https://randomuser.me/api/portraits/men/3.jpg",
    companyUrl: "https://example.com",
    applicationUrl: "https://example.com/apply"
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
    progress: 42,
    nextLesson: "Statistical Analysis"
  },
  {
    id: 3,
    title: "UI/UX Design Principles",
    instructor: "Jessica Thompson",
    progress: 87,
    nextLesson: "User Testing"
  }
];

// Sample data for skill assessments
const skillAssessments = [
  {
    id: 1,
    title: "Web Development Skills",
    description: "Assess your knowledge in HTML, CSS, JavaScript and related technologies.",
    estimatedTime: "45 mins",
    progress: 75,
    completed: false
  },
  {
    id: 2,
    title: "Python Programming",
    description: "Test your Python coding skills with practical exercises.",
    estimatedTime: "60 mins",
    progress: 100,
    completed: true
  },
  {
    id: 3,
    title: "Data Structures & Algorithms",
    description: "Evaluate your problem-solving abilities with common CS problems.",
    estimatedTime: "90 mins",
    progress: 30,
    completed: false
  }
];

// Sample data - Current Mentorships
const sampleMentorships = [
  {
    id: 1,
    mentorName: "Dr. Sarah Chen",
    mentorTitle: "Senior Data Scientist at Google",
    mentorAvatar: "https://randomuser.me/api/portraits/women/32.jpg",
    startDate: "2023-12-15",
    nextSession: "2024-04-10",
    totalSessions: 8,
    completedSessions: 5,
    focusAreas: ["Machine Learning", "Career Guidance", "Technical Interview Prep"],
    status: "active",
    progress: 62,
    notes: "Working on a recommendation system project. Next session will focus on model optimization techniques.",
    contact: {
      email: "sarah.chen@example.com",
      linkedin: "linkedin.com/in/sarahchen"
    }
  },
  {
    id: 2,
    mentorName: "Michael Rodriguez",
    mentorTitle: "Frontend Engineering Manager at Netflix",
    mentorAvatar: "https://randomuser.me/api/portraits/men/45.jpg",
    startDate: "2024-01-20",
    nextSession: "2024-04-08",
    totalSessions: 6,
    completedSessions: 2,
    focusAreas: ["React", "System Design", "Leadership Skills"],
    status: "active",
    progress: 33,
    notes: "Building a portfolio project with React and TypeScript. Discussed component architecture and state management.",
    contact: {
      email: "m.rodriguez@example.com",
      linkedin: "linkedin.com/in/michaelrodriguez"
    }
  },
  {
    id: 3,
    mentorName: "Aisha Johnson",
    mentorTitle: "Product Manager at Microsoft",
    mentorAvatar: "https://randomuser.me/api/portraits/women/22.jpg",
    startDate: "2023-11-05",
    nextSession: "2024-04-15",
    totalSessions: 10,
    completedSessions: 10,
    focusAreas: ["Product Strategy", "UX Research", "Stakeholder Management"],
    status: "completed",
    progress: 100,
    notes: "Final session will focus on preparing for product management interviews and creating a case study portfolio.",
    contact: {
      email: "aisha.j@example.com",
      linkedin: "linkedin.com/in/aishajohnson"
    }
  },
  {
    id: 4,
    mentorName: "David Park",
    mentorTitle: "Mobile Developer at Spotify",
    mentorAvatar: "https://randomuser.me/api/portraits/men/57.jpg",
    startDate: "2024-02-10",
    nextSession: "2024-04-12",
    totalSessions: 6,
    completedSessions: 1,
    focusAreas: ["Mobile Development", "React Native", "App Publishing"],
    status: "active",
    progress: 16,
    notes: "Setting up development environment and creating wireframes for a music player app.",
    contact: {
      email: "david.park@example.com",
      linkedin: "linkedin.com/in/davidpark"
    }
  }
];

// Sample data - Projects & Internships
const userProjects = [
  {
    id: 1,
    name: "E-commerce Platform",
    description: "Developed a full-stack e-commerce platform with React, Node.js, and MongoDB",
    technologies: ["React", "Node.js", "MongoDB", "Express"],
    isHighlighted: true
  },
  {
    id: 2,
    name: "Machine Learning Classifier",
    description: "Created a machine learning model to classify customer feedback sentiment",
    technologies: ["Python", "TensorFlow", "NLP", "Pandas"],
    isHighlighted: false
  },
  {
    id: 3,
    name: "Mobile Fitness App",
    description: "Built a cross-platform fitness tracking application with workout plans and nutrition tracking",
    technologies: ["React Native", "Firebase", "Redux", "Maps API"],
    isHighlighted: false
  }
];

const userInternships = [
  {
    id: 1,
    company: "Google",
    duration: "3 months",
    role: "Software Engineering Intern",
    description: "Worked on cloud infrastructure team developing monitoring tools",
    current: false
  },
  {
    id: 2,
    company: "Microsoft",
    duration: "6 months",
    role: "Frontend Developer Intern",
    description: "Implementing UI features for Microsoft Teams application",
    current: true
  }
];

// Sample data - Job recommendations
const jobs = [
  {
    id: 1,
    title: "Software Developer Intern",
    company: "Tech Solutions Inc.",
    location: "Remote",
    posted: "2 days ago",
    skills: ["React", "JavaScript", "Node.js"],
    description: "Great opportunity for students to gain real-world experience in software development.",
    tag: "New"
  },
  {
    id: 2,
    title: "Data Science Co-op",
    company: "DataMinds Analytics",
    location: "Hybrid",
    posted: "1 week ago",
    skills: ["Python", "SQL", "Machine Learning"],
    description: "Join our team to work on real-world data science problems.",
    tag: "Featured"
  },
  {
    id: 3,
    title: "UX/UI Design Intern",
    company: "Creative Designs",
    location: "On-site",
    posted: "3 days ago",
    skills: ["Figma", "Adobe XD", "UI/UX"],
    description: "Help design beautiful and functional user interfaces for our clients.",
    tag: "Hot"
  }
];

const StudentDashboardPage = () => {
  const navigate = useNavigate();
  const { userUniversity, setUserUniversity } = useUniversity();
  const [savedMentors, setSavedMentors] = useState([]);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [showUniversityPrompt, setShowUniversityPrompt] = useState(!userUniversity);
  const [currentMentorships, setCurrentMentorships] = useState([]);
  const [showMentorshipModal, setShowMentorshipModal] = useState(false);
  const [selectedMentorship, setSelectedMentorship] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    feedback: "",
  });

  useEffect(() => {
    // Check both if university is not set AND if user hasn't chosen to skip the prompt
    const hasSkippedPrompt = localStorage.getItem('skipUniversityPrompt') === 'true';
    setShowUniversityPrompt(!userUniversity && !hasSkippedPrompt);
  }, [userUniversity]);
  
  // Load mentorship data
  useEffect(() => {
    // In a real app, this would fetch from an API
    setCurrentMentorships(sampleMentorships);
  }, []);
  
  // Function to navigate to university setting page
  const goToSetUniversity = () => {
    navigate("/settings/university");
  };
  
  // Function to view mentorship details
  const viewMentorshipDetails = (mentorship) => {
    setSelectedMentorship(mentorship);
    setShowMentorshipModal(true);
  };
  
  // Function to view all mentorships
  const viewAllMentorships = () => {
    navigate("/mentorships");
  };
  
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
  
  // Connect with mentor
  const connectWithMentor = (mentorId) => {
    // Check if already connected/requested
    const mentor = recommendedMentors.find(m => m.id === mentorId);
    if (!mentor) return;
    
    // In a real app, this would send a connection request to the backend
    alert(`Connection request sent to ${mentor.name}`);
    
    // You could also update the UI to show "Request Sent" instead of "Connect"
    // This would require additional state to track pending requests
  };
  
  // Navigate to mentors page
  const goToMentors = () => {
    navigate("/connected-mentors");
  };

  // Navigate to Alumni Directory
  const goToAlumniDirectory = () => {
    navigate("/alumni-directory");
  };
  
  // Save/bookmark mentor
  const saveMentor = (mentorId) => {
    if (savedMentors.includes(mentorId)) {
      setSavedMentors(savedMentors.filter(id => id !== mentorId));
    } else {
      setSavedMentors([...savedMentors, mentorId]);
    }
  };
  
  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotificationsPanel(!showNotificationsPanel);
  };
  
  // View job opportunities
  const viewJobOpportunities = () => {
    navigate("/jobs");
    // In a real app, this would navigate to a jobs page
    alert("Navigating to job opportunities");
  };

  // Mark notification as read (new function)
  const markNotificationAsRead = (notificationId) => {
    // In a real app, this would update the notification status in the backend
    // For now, we'll just log it
    console.log(`Marking notification ${notificationId} as read`);
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    // In a real app, this would update all notifications status in the backend
    console.log("Marking all notifications as read");
    
    // You could also update a local state to visually indicate they're read
    alert("All notifications marked as read");
  };

  // Save/bookmark a job
  const saveJob = (jobId) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId));
      alert(`Job removed from saved jobs`);
    } else {
      setSavedJobs([...savedJobs, jobId]);
      alert(`Job saved for later reference`);
    }
  };


  // Handle rating change
  const handleRatingChange = (mentorshipId, rating) => {
    setFeedbackData((prev) =>
      prev.map((data) =>
        data.id === mentorshipId ? { ...data, rating } : data
      )
    );
  };

  // Handle feedback change
  const handleFeedbackChange = (mentorshipId, feedback) => {
    setFeedbackData((prev) =>
      prev.map((data) =>
        data.id === mentorshipId ? { ...data, feedback } : data
      )
    );
  };

  // Submit feedback
  const submitFeedback = (mentorshipId) => {
    if (!feedbackData.rating) {
      alert("Please provide a rating before submitting feedback.");
      return;
    }
    if (!feedbackData.feedback.trim()) {
      alert("Please provide feedback before submitting.");
      return;
    }

    // Simulate API call
    console.log("Submitting feedback:", { mentorshipId, ...feedbackData });
    alert("Thank you for your feedback!");

    // Close modal after submission
    closeFeedbackModal();
  };

  // Open feedback modal
  const openFeedbackModal = (mentorship) => {
    setSelectedMentorship(mentorship);
    setFeedbackData({ rating: 0, feedback: "" }); // Reset feedback data
    setShowFeedbackModal(true);
  };

  useEffect(() => {
    setFeedbackData(
      currentMentorships.map((mentorship) => ({
        id: mentorship.id,
        rating: 0,
        feedback: "",
      }))
    );
  }, [currentMentorships]);

  const feedbackPlaceholder = "Write your feedback here...";

  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setFeedbackData({
      rating: 0,
      feedback: "",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content container - Adjusted padding and width */}
      <div className="pt-20 py-8 container-custom mx-auto w-full bg-background text-foreground flex-grow">
        {/* University prompt banner */}
        {showUniversityPrompt && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <School className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Set Your University for a Personalized Experience
                </h3>
                <div className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                  <p>
                    To connect with alumni and mentors from your university, please set your university information.
                    This will help you build a more relevant professional network.
                  </p>
                </div>
                <div className="mt-3 flex space-x-3">
                  <button
                    type="button"
                    onClick={goToSetUniversity}
                    className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                  >
                    <GraduationCap className="h-4 w-4 mr-1.5" />
                    Set My University
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUniversityPrompt(false);
                      localStorage.setItem('skipUniversityPrompt', 'true');
                    }}
                    className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/30 px-3 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300 shadow-sm hover:bg-blue-100 dark:hover:bg-blue-900/40"
                  >
                    I'll Do This Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
  
        {/* Welcome Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {localStorage.getItem("userName") || "Student"}
            </p>
          </div>
          
          {/* Notification Button */}
          <div className="relative">
            <button 
              className="relative p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={toggleNotifications}
              aria-label="View notifications"
            >
              <Bell className="h-5 w-5 text-primary" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>
            
            {/* Notification Panel (shows when toggled) */}
            {showNotificationsPanel && (
              <div className="absolute right-0 mt-2 z-50 w-80 md:w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium">Notifications</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-primary hover:underline"
                    >
                      Mark all as read
                    </button>
                    <button 
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      onClick={toggleNotifications}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div className="p-3 space-y-2">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className="flex p-3 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <div className="rounded-full bg-primary/10 p-2 mr-3 flex-shrink-0">
                            {React.createElement(notification.icon, { className: "h-4 w-4 text-primary" })}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">{notification.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <Bell className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <h4 className="font-medium text-gray-500 dark:text-gray-400 mb-1">No New Notifications</h4>
                      <p className="text-xs text-gray-400 dark:text-gray-500 px-4">
                        You're all caught up! We'll notify you when there's new activity.
                      </p>
                    </div>
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <button 
                      className="w-full text-sm text-primary font-medium flex items-center justify-center"
                      onClick={() => navigate("/notifications")}
                    >
                      View all notifications
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Stats overview - 3 cards with equal spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
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

          <div className="glass-card rounded-xl p-6 animate-fade-in cursor-pointer" onClick={viewJobOpportunities}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Job Opportunities</h3>
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">24</p>
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
              8 new postings
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in cursor-pointer" onClick={goToAlumniDirectory}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Alumni Directory</h3>
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">87</p>
            <p className="text-sm text-muted-foreground flex items-center mt-1">
              Find and connect with alumni
            </p>
          </div>
        </div>

        {/* Main dashboard content - new grid layout */}
        <div className="space-y-8">
          {/* Two equal columns for Mentorships and Professionals sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Current Mentorships Section */}
            <div className="glass-card rounded-xl p-6 animate-fade-in h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-lg">Current Mentorships</h3>
                <Users className="h-5 w-5 text-primary" />
              </div>
              
              <div className="space-y-4">
                {currentMentorships
                  .filter((mentorship) => mentorship.progress < 100)
                  .slice(0, 2)
                  .map((mentorship) => (
                    <div 
                      key={mentorship.id} 
                      className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                      onClick={() => viewMentorshipDetails(mentorship)}
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12 border border-primary/20">
                          <AvatarImage src={mentorship.mentorAvatar} alt={mentorship.mentorName} />
                          <AvatarFallback>{mentorship.mentorName.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-primary">{mentorship.mentorName}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{mentorship.mentorTitle}</p>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Next Session</div>
                          <div className="text-sm font-medium">
                            {new Date(mentorship.nextSession).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{mentorship.completedSessions}/{mentorship.totalSessions} Sessions</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${mentorship.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-1">
                        {mentorship.focusAreas.map((area, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                          >
                            {area}
                          </span>
                        ))}
                        {mentorship.focusAreas.length > 2 && (
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                            +{mentorship.focusAreas.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
              
              {/* Show "View All Mentorships" button if there are more than 2 mentorships */}
              {currentMentorships.filter((mentorship) => mentorship.progress < 100).length > 2 && (
                <button
                  onClick={viewAllMentorships}
                  className="w-full mt-4 py-2 bg-white dark:bg-slate-800 text-primary hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  View All Mentorships
                </button>
              )}
              
              {/* Show message if there are no active mentorships */}
              {currentMentorships.filter((mentorship) => mentorship.progress < 100).length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <h4 className="font-medium text-gray-500 dark:text-gray-400 mb-2">No Active Mentorships</h4>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                    You don't have any active mentorships at the moment.
                  </p>
                  <button
                    onClick={() => navigate("/connected-mentors")}
                    className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors"
                  >
                    Find a Mentor
                  </button>
                </div>
              )}
            </div>

            {/* Connect with Professionals Section */}
            <div className="glass-card rounded-xl p-6 animate-fade-in h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-lg">Connect with Professionals</h3>
                <div className="flex space-x-1">
                  <Star className="h-5 w-5 text-primary" />
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search mentors & alumni by name, role, or skills..."
                    className="pl-10 pr-4 py-2 w-full border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex border-b border-border mb-4">
                <button className="px-4 py-2 text-sm font-medium text-primary border-b-2 border-primary">
                  Mentors
                </button>
              </div>
              
              {/* Mentors List */}
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
              
              <div className="flex justify-end mt-4">
                <button 
                  className="text-sm text-primary font-medium flex items-center"
                  onClick={goToAlumniDirectory}
                >
                  Alumni Directory
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mentorship Detail Modal */}
        {showMentorshipModal && selectedMentorship && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-start p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4 border border-primary/20">
                    <AvatarImage src={selectedMentorship.mentorAvatar} alt={selectedMentorship.mentorName} />
                    <AvatarFallback>{selectedMentorship.mentorName.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{selectedMentorship.mentorName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedMentorship.mentorTitle}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowMentorshipModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Mentorship Started</h4>
                    <p className="font-medium">{new Date(selectedMentorship.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Next Session</h4>
                    <p className="font-medium">{new Date(selectedMentorship.nextSession).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Completed Sessions</h4>
                    <p className="font-medium">{selectedMentorship.completedSessions} of {selectedMentorship.totalSessions}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</h4>
                    <p className="font-medium capitalize">{selectedMentorship.status}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Focus Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMentorship.focusAreas.map((area, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Progress</h4>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${selectedMentorship.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                    {selectedMentorship.progress}% Complete
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Notes</h4>
                  <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-sm">
                    {selectedMentorship.notes}
                  </p>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a 
                      href={`mailto:${selectedMentorship.contact.email}`}
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
                    >
                      <Mail className="h-4 w-4" />
                      {selectedMentorship.contact.email}
                    </a>
                    <a 
                      href={`https://${selectedMentorship.contact.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn Profile
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowMentorshipModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowMentorshipModal(false);
                    navigate(`/messages/${selectedMentorship.id}`);
                  }}
                  className="px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg text-sm font-medium transition-colors"
                >
                  Message Mentor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer with proper spacing */}
      <Footer />
    </div>
  );
};

export default StudentDashboardPage;