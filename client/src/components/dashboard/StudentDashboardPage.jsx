import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Calendar, Users, Briefcase, MessageSquare, Award, Bell, ChevronRight, Book, GraduationCap, School, Clock, CheckCircle, Heart, Search, ExternalLink, X, Lightbulb, Star, Code, Plus, Edit, User, Info, Mail, Linkedin } from "lucide-react";
import { useUniversity } from "../../context/UniversityContext";
import Footer from "../layout/Footer"; 
import axios from "axios";
import CurrentMentorshipsSection from './student/CurrentMentorshipsSection';

// Example reference job recommendation (keeping one as reference)
const jobRecommendationExample = {
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
};

// Example reference mentor (keeping one as reference)
const recommendedMentorExample = {
  id: 1,
  name: "David Wilson",
  role: "Senior Software Engineer at Google",
  specialties: ["Web Development", "Career Guidance"],
  availability: "Available this week"
};

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
  
  // New states for dynamic data
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [jobRecommendations, setJobRecommendations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);

  useEffect(() => {
    const hasSkippedPrompt = localStorage.getItem('skipUniversityPrompt') === 'true';
    setShowUniversityPrompt(!userUniversity && !hasSkippedPrompt);
  }, [userUniversity]);
  
  // Fetch alumni data for mentors
  const fetchAlumniData = async () => {
    try {
      setIsLoading(true);
      // Replace with your actual API endpoint
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/alumni`);
      
      if (response.data && Array.isArray(response.data)) {
        // Transform alumni data to the mentor format
        const transformedMentors = response.data.map(alumni => ({
          id: alumni._id,
          name: alumni.name,
          role: `${alumni.jobTitle || 'Professional'} at ${alumni.company || 'Company'}`,
          specialties: alumni.expertise || [],
          availability: alumni.availability || "Available for mentorship",
          profilePicture: alumni.profilePicture?.url || null,
          email: alumni.email
        }));
        
        setRecommendedMentors(transformedMentors);
      } else {
        // Keep the example as fallback
        setRecommendedMentors([recommendedMentorExample]);
        console.warn("Unexpected alumni data format", response.data);
      }
    } catch (error) {
      console.error("Error fetching alumni data:", error);
      setLoadingError("Failed to fetch alumni data. Using sample data instead.");
      // Fall back to the example data in case of error
      setRecommendedMentors([recommendedMentorExample]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch job data
  const fetchJobData = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/jobs`);
      
      if (response.data && Array.isArray(response.data)) {
        setJobRecommendations(response.data);
      } else {
        // Keep the example as fallback
        setJobRecommendations([jobRecommendationExample]);
        console.warn("Unexpected job data format", response.data);
      }
    } catch (error) {
      console.error("Error fetching job data:", error);
      // Fall back to the example data in case of error
      setJobRecommendations([jobRecommendationExample]);
    }
  };
  
  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/students/notifications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        setNotifications(response.data);
      } else {
        // Set empty array as fallback
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchAlumniData(),
          fetchJobData(),
          fetchNotifications()
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setDashboardError("Failed to load some dashboard data");
      }
    };
    
    fetchData();
  }, []);

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
  const connectWithMentor = async (mentorId) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/connections/request`,
        { 
          alumniId: mentorId, // Change to alumniId instead of mentorId
          message: "I would like to connect with you for mentorship guidance." 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 201) {
        alert("Connection request sent successfully");
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      alert(`Error: ${error.response?.data?.message || "Failed to send connection request"}`);
    }
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
  };
  
  // ... existing functions ...

  // Loading indicator
  if (isLoading) {
    return (
      <div className="container-custom py-10">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // The rest of your component with now dynamic data
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
            <CurrentMentorshipsSection />

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
              <div className="mb-4 ">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search mentors & alumni by name, role, or skills..."
                    className="pl-10 pr-4 py-2 w-full border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-inherit"
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
                      
                      {/* First display mentorship areas if available */}
                      {Array.isArray(mentor.mentorshipAreas) && mentor.mentorshipAreas.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {mentor.mentorshipAreas.slice(0, 3).map((area, idx) => (
                            <span key={idx} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                              {area}
                            </span>
                          ))}
                          {mentor.mentorshipAreas.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                              +{mentor.mentorshipAreas.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Then display specialties if available */}
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