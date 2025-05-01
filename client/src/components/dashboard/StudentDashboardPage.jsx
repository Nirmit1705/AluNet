import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Calendar, Users, Briefcase, MessageSquare, Award, Bell, ChevronRight, Book, GraduationCap, School, Clock, CheckCircle, Heart, Search, ExternalLink, X, Lightbulb, Star, Code, Plus, Edit, User, Info, Mail, Linkedin } from "lucide-react";
import { useUniversity } from "../../context/UniversityContext";
import Footer from "../layout/Footer"; 
import axios from "axios";
import CurrentMentorshipsSection from './student/CurrentMentorshipsSection';
import StatsOverviewSection from './student/StatsOverviewSection';

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
  
  // New state for alumni count
  const [alumniCount, setAlumniCount] = useState(0);
  
  // New states for dynamic data
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [jobRecommendations, setJobRecommendations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [stats, setStats] = useState({
    connectedMentors: 0,
    newMentors: 0,
    jobOpportunities: 0,
    newJobs: 0,
    upcomingSessions: 0,
    nextSession: "",
    completedAssessments: 0,
    assessmentProgress: 0
  });

  // New state for tracking connections
  const [connectedAlumniIds, setConnectedAlumniIds] = useState([]);

  useEffect(() => {
    const hasSkippedPrompt = localStorage.getItem('skipUniversityPrompt') === 'true';
    setShowUniversityPrompt(!userUniversity && !hasSkippedPrompt);
    
    // Load connected alumni IDs from localStorage
    const savedConnections = localStorage.getItem('connectedAlumni');
    if (savedConnections) {
      try {
        const connections = JSON.parse(savedConnections);
        setConnectedAlumniIds(connections);
        console.log('Loaded connected alumni from localStorage:', connections);
      } catch (e) {
        console.error('Error parsing saved connections:', e);
      }
    }
  }, [userUniversity]);
  
  // Fetch alumni data - improved and more robust version
  const fetchAlumniData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }
      
      // First try to get connected mentors specifically
      try {
        const connectionsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/connections/mentors`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        console.log("Connected mentors data:", connectionsResponse.data);
        
        if (connectionsResponse.data && Array.isArray(connectionsResponse.data)) {
          // Update stats with actual connection count
          setStats(prevStats => ({
            ...prevStats,
            connectedMentors: connectionsResponse.data.length
          }));
        }
      } catch (connError) {
        console.error("Error fetching connections:", connError);
      }
      
      // Then get recommended mentors for display
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/alumni`,
        {
          params: {
            limit: 10, // Request more than needed to account for filtering
            mentorshipAvailable: true
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data && Array.isArray(response.data)) {
        // Better data transformation with proper error handling
        const transformedMentors = response.data.map(alumni => ({
          id: alumni._id || alumni.id || `mentor-${Date.now()}`,
          name: alumni.name || 'Unknown Mentor',
          role: alumni.position || alumni.jobTitle || alumni.role || 'Professional',
          company: alumni.company || 'Unknown Company',
          specialties: alumni.skills || alumni.specialties || [],
          mentorshipAreas: alumni.areasOfExpertise || alumni.mentorshipAreas || [],
          availability: alumni.availability || 'Available for mentoring',
          bio: alumni.bio || alumni.about || '',
          profileImage: getProfilePictureUrl(alumni),
          connections: alumni.connections || alumni.connectionCount || 0,
          email: alumni.email,
          linkedIn: alumni.linkedIn || alumni.linkedin || '#',
          rating: alumni.rating || 4.5,
        }));
        
        console.log("Fetched mentors data:", transformedMentors);
        
        // Filter out mentors that are already connected
        const filteredMentors = transformedMentors.filter(mentor => {
          const mentorId = mentor.id || mentor._id;
          return !isAlumniConnected(mentorId);
        });
        
        if (filteredMentors.length > 0) {
          setRecommendedMentors(filteredMentors);
          
          // Update stats with actual data
          setStats(prevStats => ({
            ...prevStats,
            newMentors: filteredMentors.filter(mentor => {
              return mentor.joinedDate && new Date(mentor.joinedDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            }).length || Math.min(2, filteredMentors.length)
          }));
        } else {
          console.warn("No unconnected mentors found");
          setRecommendedMentors([recommendedMentorExample]);
        }
      } else {
        console.warn("Unexpected alumni data format", response.data);
        setRecommendedMentors([recommendedMentorExample]);
      }
    } catch (error) {
      console.error("Error fetching alumni data:", error);
      setRecommendedMentors([recommendedMentorExample]);
    }
  };

  // Helper function to check if an alumni is already connected
  const isAlumniConnected = (alumniId) => {
    if (!alumniId || !connectedAlumniIds || !connectedAlumniIds.length) return false;
    
    // Convert to string for comparison
    const alumIdStr = String(alumniId);
    
    // Check each connection
    return connectedAlumniIds.some(connId => {
      const connIdStr = String(connId);
      
      // Try exact match or substring match
      return alumIdStr === connIdStr || 
        connIdStr.includes(alumIdStr) || 
        alumIdStr.includes(connIdStr);
    });
  };
  
  // Helper function to get profile picture URL from various data structures
  const getProfilePictureUrl = (alumni) => {
    if (!alumni) return null;
    
    // Check if profilePicture exists as an object with url property
    if (alumni.profilePicture && alumni.profilePicture.url) {
      return alumni.profilePicture.url;
    }
    
    // Check if profilePicture exists as a string
    if (alumni.profilePicture && typeof alumni.profilePicture === 'string') {
      return alumni.profilePicture;
    }
    
    // Check if avatar exists
    if (alumni.avatar) {
      return alumni.avatar;
    }
    
    // No profile picture available
    return null;
  };
  
  // Fetch job data - improved version
  const fetchJobData = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // First try the jobs endpoint
      let response;
      try {
        response = await axios.get(
          `${apiUrl}/api/jobs`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } catch (jobsError) {
        // If jobs endpoint fails, try job-postings as fallback
        console.log("Trying fallback job-postings endpoint");
        response = await axios.get(
          `${apiUrl}/api/job-postings`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }
      
      if (response.data && Array.isArray(response.data)) {
        console.log("Fetched jobs data:", response.data);
        
        const transformedJobs = response.data.map(job => ({
          id: job._id || job.id || `job-${Date.now()}`,
          title: job.title || job.jobTitle || 'Job Opportunity',
          company: job.company || 'Unknown Company',
          location: job.location || "Remote",
          type: job.type || job.jobType || "Full Time",
          description: job.description || job.jobDescription || '',
          skills: job.skills || job.requiredSkills || [],
          postedDate: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently posted',
          companyUrl: job.companyUrl || job.companyWebsite || null,
          applicationUrl: job.applicationUrl || job.applicationLink || null,
          logoUrl: job.logoUrl || job.companyLogo || null,
          salary: job.salary || job.compensationRange || 'Competitive'
        }));
        
        if (transformedJobs.length > 0) {
          setJobRecommendations(transformedJobs);
          
          // Update stats with actual data
          setStats(prevStats => ({
            ...prevStats,
            jobOpportunities: transformedJobs.length,
            newJobs: transformedJobs.filter(j => {
              if (!j.createdAt && !j.postedDate) return false;
              const postedDate = j.createdAt ? new Date(j.createdAt) : new Date(j.postedDate);
              const oneWeekAgo = new Date();
              oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
              return postedDate > oneWeekAgo;
            }).length || Math.min(2, transformedJobs.length)
          }));
        } else {
          console.warn("Empty jobs data array returned");
          setJobRecommendations([jobRecommendationExample]);
        }
      } else {
        console.warn("Unexpected job data format", response.data);
        setJobRecommendations([jobRecommendationExample]);
      }
    } catch (error) {
      console.error("Error fetching job data:", error);
      setJobRecommendations([jobRecommendationExample]);
    }
  };
  
  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data && Array.isArray(response.data)) {
        const transformedNotifications = response.data.map(notification => {
          // Determine icon based on notification type
          let icon;
          switch (notification.type) {
            case 'connection':
              icon = Users;
              break;
            case 'job':
              icon = Briefcase;
              break;
            case 'message':
              icon = MessageSquare;
              break;
            case 'session':
              icon = Calendar;
              break;
            default:
              icon = Bell;
          }
          
          return {
            id: notification._id,
            title: notification.title || 'New Notification',
            description: notification.message || notification.content || 'You have a new notification',
            time: formatTimeAgo(new Date(notification.createdAt || Date.now())),
            icon,
            read: notification.read || false
          };
        });
        
        setNotifications(transformedNotifications);
      } else {
        // Set empty array as fallback
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    }
  };
  
  // Fetch upcoming sessions
  const fetchUpcomingSessions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/mentorship/sessions/my-upcoming`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data && Array.isArray(response.data)) {
        // Transform data for display
        const transformedSessions = response.data.map(session => ({
          id: session._id,
          title: session.title || "Mentorship Session",
          description: session.description || "Discussion with mentor",
          date: new Date(session.date),
          time: session.time || "TBD",
          endTime: session.endTime,
          duration: session.duration || 30,
          type: session.type || "One-on-One",
          mentor: {
            id: session.mentorId,
            name: session.mentorName || "Your Mentor",
            role: session.mentorRole || "Professional"
          },
          location: session.location || "Virtual",
          meetingLink: session.meetingLink || null,
          status: session.status || "upcoming",
          notes: session.notes || ""
        }));
        
        // Count upcoming sessions
        const upcomingCount = transformedSessions.length;
        
        // Find the next session date if available
        let nextSession = "";
        if (upcomingCount > 0) {
          // Sort sessions by date
          transformedSessions.sort((a, b) => a.date - b.date);
          const nextSessionData = transformedSessions[0]; // Get closest upcoming session
          nextSession = `${nextSessionData.date.toLocaleDateString()} at ${nextSessionData.time}`;
        }
        
        // Update stats with session information
        setStats(prevStats => ({
          ...prevStats,
          upcomingSessions: upcomingCount,
          nextSession
        }));
      } else {
        console.warn("Unexpected session data format", response.data);
        setStats(prevStats => ({
          ...prevStats,
          upcomingSessions: 0,
          nextSession: "No upcoming sessions"
        }));
      }
    } catch (error) {
      console.error("Error fetching upcoming sessions:", error);
      // Keep existing stats if there's an error
      setStats(prevStats => ({
        ...prevStats,
        upcomingSessions: 0,
        nextSession: "No upcoming sessions"
      }));
    }
  };
  
  // Fetch completed assessments
  const fetchAssessments = async () => {
    try {
      // Check if the assessments endpoint exists
      const token = localStorage.getItem("token");
      
      // Since we don't have a real endpoint yet, let's use mock data
      console.log("Using mock assessment data until endpoint is created");
      
      // Get or set mock assessment data from localStorage to persist between sessions
      const mockAssessmentData = JSON.parse(localStorage.getItem('mockAssessmentData')) || {
        completedAssessments: 1,
        assessmentProgress: 60,
        assessments: [
          {
            id: 1,
            title: "Technical Skills Assessment",
            description: "Evaluate your programming skills across multiple languages and frameworks.",
            estimatedTime: "45 mins",
            completed: true,
            progress: 100
          },
          {
            id: 2,
            title: "Soft Skills Evaluation",
            description: "Assess your communication, teamwork, and problem-solving abilities.",
            estimatedTime: "30 mins",
            completed: false,
            progress: 60
          },
          {
            id: 3,
            title: "Industry Knowledge Test",
            description: "Test your knowledge of current industry trends and best practices.",
            estimatedTime: "25 mins",
            completed: false,
            progress: 0
          }
        ]
      };
      
      // Store mock data in localStorage if it doesn't exist yet
      if (!localStorage.getItem('mockAssessmentData')) {
        localStorage.setItem('mockAssessmentData', JSON.stringify(mockAssessmentData));
      }
      
      // Update stats with mock data
      setStats(prevStats => ({
        ...prevStats,
        completedAssessments: mockAssessmentData.completedAssessments,
        assessmentProgress: mockAssessmentData.assessmentProgress
      }));
      
      // Important: Set loading state to false here instead of in the useEffect
      setIsLoading(false);
      
    } catch (error) {
      console.error("Error fetching assessments:", error);
      // Provide fallback mock data in case of error
      setStats(prevStats => ({
        ...prevStats,
        completedAssessments: 1,
        assessmentProgress: 60
      }));
      
      // Make sure loading state is set to false even when there's an error
      setIsLoading(false);
    }
  };
  
  // Helper function to format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };
  
  // Fetch alumni count
  const fetchAlumniCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Try to get the total count from the alumni endpoint
      const response = await axios.get(`${apiUrl}/api/alumni`, {
        params: { 
          count: true,  // Just get the count if the API supports it
          limit: 1      // Otherwise, minimize data transfer
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      // If the API returns a total count property
      if (response.data && response.data.totalCount) {
        setAlumniCount(response.data.totalCount);
      } 
      // Otherwise count the array length
      else if (Array.isArray(response.data)) {
        setAlumniCount(response.data.length);
      }
    } catch (error) {
      console.error("Error fetching alumni count:", error);
      // Keep current count if there's an error
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Set loading state first
        setIsLoading(true);
        
        // Execute all data fetching in parallel
        await Promise.all([
          fetchAlumniData(),
          fetchJobData(),
          fetchNotifications(),
          fetchUpcomingSessions(),
          fetchAssessments(),
          fetchAlumniCount() // Add the new function to fetch alumni count
        ]);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setDashboardError("Failed to load dashboard data. Please try again.");
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Simple debugging timeout to ensure loading gets set to false eventually
    const loadingTimer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        console.warn("Loading state forcibly reset by safety timeout");
      }
    }, 5000); // 5 second safety timeout
    
    return () => clearTimeout(loadingTimer);
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
  
  // Connect with mentor - update to handle connection state properly
  const connectWithMentor = async (mentorId) => {
    // Check if already connected first
    if (isAlumniConnected(mentorId)) {
      alert("You are already connected with this mentor");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/connections/request`,
        { 
          alumniId: mentorId,
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
        // Update local state
        const newConnections = [...connectedAlumniIds, mentorId];
        setConnectedAlumniIds(newConnections);
        
        // Update localStorage
        localStorage.setItem('connectedAlumni', JSON.stringify(newConnections));
        
        // Remove this mentor from recommended mentors
        setRecommendedMentors(prevMentors => 
          prevMentors.filter(mentor => mentor.id !== mentorId)
        );
        
        alert("Connection request sent successfully");
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      const errorMessage = error.response?.data?.message || "Failed to send connection request";
      
      // Handle already connected error specially
      if (errorMessage.includes("already connected")) {
        // Add to connections list to prevent future attempts
        const newConnections = [...connectedAlumniIds, mentorId];
        setConnectedAlumniIds(newConnections);
        localStorage.setItem('connectedAlumni', JSON.stringify(newConnections));
      }
      
      alert(`Error: ${errorMessage}`);
    }
  };
  
  // Navigate to mentors page
  const goToMentors = () => {
    navigate("/connected-mentors");
  };

  // Navigate to job board
  const viewJobOpportunities = () => {
    navigate("/student-job-board");
  };

  // Navigate to skills assessment
  const goToSkillsAssessment = () => {
    navigate("/skills-assessment");
  };

  // Navigate to all professionals (Alumni Directory)
  const goToAllProfessionals = () => {
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
        <StatsOverviewSection 
          stats={stats}
          goToMentors={goToMentors}
          viewJobOpportunities={viewJobOpportunities}
          goToSkillsAssessment={goToSkillsAssessment}
        />

        {/* Main dashboard content - Fix: Add proper spacing */}
        <div className="space-y-8 mb-8">
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
                {recommendedMentors.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <GraduationCap className="h-12 w-12 mx-auto mb-2 text-gray-400 dark:text-gray-600" />
                    <p>No available mentors found. Check back later!</p>
                  </div>
                ) : (
                  recommendedMentors.slice(0, 3).map((mentor) => (
                    <div key={mentor.id} className="flex items-start p-4 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4">
                        {mentor.profileImage ? (
                          <img 
                            src={mentor.profileImage}
                            alt={mentor.name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <GraduationCap className="h-6 w-6" />
                        )}
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
                        <p className="text-sm text-muted-foreground">{mentor.role}{mentor.company ? ` at ${mentor.company}` : ''}</p>
                        
                        {/* Display mentorship areas if available */}
                        {Array.isArray(mentor.mentorshipAreas) && mentor.mentorshipAreas.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {mentor.mentorshipAreas.slice(0, 2).map((area, idx) => (
                              <span key={idx} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                                {area}
                              </span>
                            ))}
                            {mentor.mentorshipAreas.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                                +{mentor.mentorshipAreas.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Display specialties */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {mentor.specialties.slice(0, 2).map((specialty, idx) => (
                            <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                              {specialty}
                            </span>
                          ))}
                          {mentor.specialties.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-full">
                              +{mentor.specialties.length - 2}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center mt-3">
                          <Clock className="h-3 w-3 text-green-600 mr-1" />
                          <span className="text-xs text-green-600">{mentor.availability}</span>
                        </div>
                      </div>
                      {isAlumniConnected(mentor.id) ? (
                        <button 
                          className="px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-sm rounded-lg"
                          disabled
                        >
                          Connected
                        </button>
                      ) : (
                        <button 
                          className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-sm rounded-lg transition-colors"
                          onClick={() => connectWithMentor(mentor.id)}
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex justify-end mt-4">
                <button 
                  className="text-sm text-primary font-medium flex items-center"
                  onClick={goToAllProfessionals}
                >
                  View all professionals
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Job Recommendations Section - Fixed spacing by adding it outside previous grid */}
        <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-300 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-medium text-lg">Job Recommendations</h3>
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          
          {jobRecommendations.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Briefcase className="h-12 w-12 mx-auto mb-2 text-gray-400 dark:text-gray-600" />
              <p>No job recommendations available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobRecommendations.slice(0, 3).map((job) => (
                <div key={job.id} className="border border-border/30 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <div className="flex justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-primary truncate">{job.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">{job.company}</p>
                    </div>
                    <button 
                      onClick={() => setSavedJobs(prev => 
                        prev.includes(job.id) ? prev.filter(id => id !== job.id) : [...prev, job.id]
                      )}
                      className="text-gray-400 hover:text-primary ml-2"
                    >
                      <Heart className={`h-4 w-4 ${savedJobs.includes(job.id) ? "fill-primary text-primary" : ""}`} />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 my-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {job.type}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                      {job.location}
                    </span>
                  </div>
                  
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 my-2">
                      {job.skills.slice(0, 2).map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                          +{job.skills.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-muted-foreground">Posted: {job.postedDate}</span>
                    <a 
                      href={job.applicationUrl || "#"} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center"
                    >
                      View Details
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <button 
            className="w-full mt-6 text-sm text-primary font-medium flex items-center justify-center"
            onClick={viewJobOpportunities}
          >
            View all job opportunities
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
      
      {/* Add proper styling to Footer - making sure it's outside the main content div but inside the page wrapper */}
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default StudentDashboardPage;