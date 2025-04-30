import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, Briefcase, MessageSquare, Award, Bell, ChevronRight, GraduationCap, Clock, X, Edit, Trash, UserPlus, Star } from "lucide-react";
import MenteeDetailsModal from './MenteeDetailsModal';
import ScheduleSessionModal from './ScheduleSessionModal';
import Footer from "../layout/Footer"; 
import axios from "axios";

// Sample data for student success stories
const successStories = [
  {
    id: 1,
    studentName: "Marcus Johnson",
    achievement: "Secured internship at Google",
    story: "With your mentorship on interview prep and resume building, I was able to secure my dream internship at Google!",
    date: "May 15, 2023"
  },
  {
    id: 2,
    studentName: "Aisha Patel",
    achievement: "Won hackathon first place",
    story: "The project management and technical skills you taught me helped my team win first place at the university hackathon.",
    date: "April 22, 2023"
  },
  {
    id: 3,
    studentName: "Tyler Rodriguez",
    achievement: "Published research paper",
    story: "Thanks to your guidance on research methodologies, my paper was accepted in the International Journal of Computer Science.",
    date: "June 5, 2023"
  }
];

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

const AlumniDashboardPage = () => {
  const navigate = useNavigate();
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [endorsedStudents, setEndorsedStudents] = useState([]);
  const [jobPostModal, setJobPostModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  // Add new state for dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    connections: {
      total: 0,
      increase: 0
    },
    jobPostings: {
      total: 0,
      active: 0,
      applicants: 0
    },
    messages: {
      total: 0,
      unread: 0
    },
    mentored: {
      total: 0,
      recent: 0
    }
  });
  const [newJobPost, setNewJobPost] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full Time',
    description: '',
    requirements: '',
    applicationLink: ''
  });
  // Add new state for mentee details modal
  const [selectedMentee, setSelectedMentee] = useState(null);
  
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
      applicationLink: "https://example.com/frontend-developer"
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
      applicationLink: "https://example.com/ux-designer"
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
  
  // Sample data for mentees
  const [currentMentees, setCurrentMentees] = useState([
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
  ]);

  // Function to fetch mentee data - moved inside the component
  const fetchCurrentMentees = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        return; // Keep using sample data
      }
      
      // Fetch mentees data from API
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/mentorship/mentees`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        console.log('Fetched mentee data:', response.data);
        
        // Transform API data to match component's expected format
        const transformedMentees = response.data.map(mentee => {
          // Get next session data
          let nextSession = "Not scheduled";
          if (mentee.nextSessionDate) {
            const nextSessionDate = new Date(mentee.nextSessionDate);
            if (nextSessionDate > new Date()) {
              nextSession = nextSessionDate.toLocaleDateString();
              if (mentee.nextSessionTime) {
                nextSession += ` at ${mentee.nextSessionTime}`;
              }
            }
          }
          
          // Get last interaction time
          const lastInteraction = mentee.lastInteraction || '2 days ago';
          
          return {
            id: mentee._id,
            name: mentee.name || 'Unknown Mentee',
            program: mentee.branch || 'Unknown Program',
            year: mentee.currentYear ? `${mentee.currentYear} Year` : 'Unknown Year',
            lastInteraction,
            nextSession,
            sessionsCompleted: parseInt(mentee.sessionsCompleted || 0, 10),
            totalSessions: parseInt(mentee.totalPlannedSessions || 5, 10)
          };
        });
        
        console.log('Transformed mentee data:', transformedMentees);
        
        // Update state with actual mentee data
        if (transformedMentees.length > 0) {
          setCurrentMentees(transformedMentees);
        }
      }
    } catch (error) {
      console.error('Error fetching current mentees:', error);
      // Keep the default mentees data if there's an error
    }
  };

  // Add this function to fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        return;
      }
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/alumni/dashboard-stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data) {
        console.log('Fetched dashboard stats:', response.data);
        
        // Transform API data to match our state structure
        setDashboardStats({
          connections: {
            total: response.data.connections?.total || 0,
            increase: response.data.connections?.increase || 0
          },
          jobPostings: {
            total: response.data.jobPostings?.total || 0,
            active: response.data.jobPostings?.active || 0,
            applicants: response.data.jobPostings?.applicants || 0
          },
          messages: {
            total: response.data.messages?.total || 0,
            unread: response.data.messages?.unread || 0
          },
          mentored: {
            total: response.data.mentored?.total || 0,
            recent: response.data.mentored?.recent || 0
          }
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Keep default values if fetch fails
    }
  };

  // Call this function when component mounts
  useEffect(() => {
    fetchDashboardStats();
    fetchCurrentMentees();
  }, []);

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

  // Function to handle connections page navigation
  const goToConnections = () => {
    navigate('/connections');
  };

  // Add missing navigation functions
  const goToStudents = () => {
    navigate("/student-connections");
  };
  
  const goToJobs = () => {
    navigate("/job-board");
  };
  
  const goToMentorship = () => {
    navigate("/mentorship-requests");
  };
  
  const viewAllMentees = () => {
    navigate("/mentees");
  };
  
  const goToJobBoard = () => {
    navigate("/job-board");
  };
  
  const messageMentee = (menteeId) => {
    navigate(`/messages/${menteeId}`);
  };
  
  const toggleJobPostModal = (isEdit = false) => {
    setJobPostModal(!jobPostModal);
    setEditMode(isEdit);
    
    if (!jobPostModal && !isEdit) {
      // Reset form when opening in create mode
      setNewJobPost({
        title: '',
        company: '',
        location: '',
        type: 'Full Time',
        description: '',
        requirements: '',
        applicationLink: ''
      });
    }
  };
  
  const handleJobFormChange = (e) => {
    const { id, value } = e.target;
    setNewJobPost(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const submitJobPosting = () => {
    // Implementation for job posting submission
    console.log("Submitting job posting:", newJobPost);
    // Close modal after submission
    setJobPostModal(false);
  };
  
  const markAllNotificationsAsRead = () => {
    // Implementation for marking all notifications as read
    console.log("Marking all notifications as read");
  };
  
  const toggleNotifications = () => {
    setShowNotificationsPanel(!showNotificationsPanel);
  };
  
  const markNotificationAsRead = (notificationId) => {
    // Implementation for marking a single notification as read
    console.log("Marking notification as read:", notificationId);
  };
  
  const editJobPost = (jobId) => {
    // Find the job to edit
    const jobToEdit = myPostedJobs.find(job => job.id === jobId);
    if (jobToEdit) {
      // Set job data to form
      setNewJobPost({
        ...jobToEdit,
        requirements: Array.isArray(jobToEdit.requirements) 
          ? jobToEdit.requirements.join('\n') 
          : jobToEdit.requirements
      });
      // Open modal in edit mode
      toggleJobPostModal(true);
    }
  };
  
  const deleteJobPost = (jobId) => {
    // Implementation for deleting a job post
    console.log("Deleting job post:", jobId);
    setMyPostedJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
  };
  
  const viewMenteeDetails = (mentee) => {
    setSelectedMentee(mentee);
  };
  
  // Additional function references that might be needed
  const [scheduledSessions, setScheduledSessions] = useState([]);
  const [showDirectScheduleModal, setShowDirectScheduleModal] = useState(false);
  const [selectedMenteeForScheduling, setSelectedMenteeForScheduling] = useState(null);
  const [showEditSessionModal, setShowEditSessionModal] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState(null);
  const [showConnectionRequestsModal, setShowConnectionRequestsModal] = useState(false);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [currentJobApplicants, setCurrentJobApplicants] = useState([]);
  const [showApplicantDetailModal, setShowApplicantDetailModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [pendingConnectionRequests, setPendingConnectionRequests] = useState([]);
  
  const openScheduleModal = (mentee, e) => {
    if (e) e.stopPropagation();
    setSelectedMenteeForScheduling(mentee);
    setShowDirectScheduleModal(true);
  };
  
  const handleCloseScheduleModal = () => {
    setShowDirectScheduleModal(false);
    setSelectedMenteeForScheduling(null);
  };
  
  const handleSessionScheduled = (mentee, sessionDetails) => {
    console.log("Scheduling session:", mentee, sessionDetails);
    // Implementation for scheduling a session
  };
  
  const openEditSessionModal = (session) => {
    setSessionToEdit(session);
    setShowEditSessionModal(true);
  };
  
  const handleSessionUpdate = (session) => {
    console.log("Updating session:", session);
    // Implementation for updating a session
    setShowEditSessionModal(false);
    setSessionToEdit(null);
  };
  
  const cancelSession = (sessionId) => {
    console.log("Canceling session:", sessionId);
    // Implementation for canceling a session
  };
  
  const closeApplicantsModal = () => {
    setShowApplicantsModal(false);
    setCurrentJobId(null);
    setCurrentJobApplicants([]);
  };
  
  const viewApplicantDetails = (applicant) => {
    setSelectedApplicant(applicant);
    setShowApplicantDetailModal(true);
  };
  
  const closeApplicantDetailModal = () => {
    setShowApplicantDetailModal(false);
    setSelectedApplicant(null);
  };
  
  const handleReferralDecision = (applicantId, decision) => {
    console.log(`${decision} referral for applicant:`, applicantId);
    // Implementation for referral decision
  };
  
  const ConnectionRequestsModal = () => {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-xl p-6 animate-fade-in">
          <h2 className="text-xl font-bold mb-4">Connection Requests</h2>
          <div className="max-h-[60vh] overflow-y-auto">
            {pendingConnectionRequests.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No pending connection requests</p>
            ) : (
              <div className="space-y-4">
                {/* Connection requests would be rendered here */}
                <p>Connection requests would appear here</p>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <button 
              onClick={() => setShowConnectionRequestsModal(false)}
              className="px-4 py-2 bg-primary text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Update the Stats overview section to use dynamic data
  return (
    <div className="pb-12 relative min-h-screen flex flex-col">
      <div className="container-custom pt-20 flex-grow">
        {/* Stats overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card rounded-xl p-6 animate-fade-in cursor-pointer" onClick={goToStudents}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Student Connections</h3>
              <Users className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">{dashboardStats.connections.total}</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              +{dashboardStats.connections.increase} from last month
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-100 cursor-pointer" onClick={goToJobs}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Job Postings</h3>
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">{dashboardStats.jobPostings.total}</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              {dashboardStats.jobPostings.applicants} total applicants
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-200 cursor-pointer" onClick={() => navigate("/messages")}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Messages</h3>
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">{dashboardStats.messages.total}</p>
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
              {dashboardStats.messages.unread} unread messages
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-300 cursor-pointer" onClick={goToConnections}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Students Mentored</h3>
              <Award className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">{dashboardStats.mentored.total}</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              +{dashboardStats.mentored.recent} this semester
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="glass-card rounded-xl p-6 mb-8 animate-fade-in relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-bold">Quick Actions</h2>
              <span className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Alumni Tools</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Use these tools to connect with students and share opportunities</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button 
                onClick={toggleJobPostModal}
                className="button-primary py-3 px-6 w-full h-full flex flex-col items-center justify-center gap-1 rounded-lg transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]"
              >
                <Briefcase className="h-6 w-6 mb-1" />
                <span className="font-medium">Post a Job</span>
                <span className="text-xs opacity-80">Share opportunities with students</span>
              </button>
              <button 
                onClick={goToStudents}
                className="button-secondary py-3 px-6 w-full h-full flex flex-col items-center justify-center gap-1 rounded-lg transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Users className="h-6 w-6 mb-1" />
                <span className="font-medium">Message Students</span>
                <span className="text-xs opacity-80">Connect with potential mentees</span>
              </button>
              <button 
                onClick={goToMentorship}
                className="button-secondary py-3 px-6 w-full h-full flex flex-col items-center justify-center gap-1 rounded-lg transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Award className="h-6 w-6 mb-1" />
                <span className="font-medium">Mentor a Student</span>
                <span className="text-xs opacity-80">Guide students in their career</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main dashboard content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left and center sections - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Mentees Section - Replacing Success Stories Section */}
            <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-lg">Current Mentees</h3>
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              {/* Update your Current Mentees section to include edit/cancel buttons */}
              <div className="space-y-4">
                {currentMentees.slice(0, 3).map((mentee) => {
                  // Find active session for this mentee
                  const activeSession = scheduledSessions.find(
                    session => session.menteeId === mentee.id && session.status === "upcoming"
                  );
                  
                  return (
                    <div 
                      key={mentee.id} 
                      className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          <Users className="h-6 w-6" />
                        </div>
                        
                        <div className="flex-1 cursor-pointer" onClick={() => viewMenteeDetails(mentee)}>
                          <h4 className="font-medium text-primary">{mentee.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{mentee.program} • {mentee.year}</p>
                          
                          {/* Add sessions count display */}
                          {mentee.totalSessions && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Sessions: {mentee.sessionsCompleted || 0}/{mentee.totalSessions}
                            </p>
                          )}
                        </div>
                        
                        <div className="text-right">
                          {activeSession ? (
                            <div className="flex flex-col items-end">
                              <div className="flex space-x-1">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditSessionModal(activeSession);
                                  }}
                                  className="px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium rounded-lg transition-colors"
                                  title="Edit session"
                                >
                                  <Edit className="h-3 w-3" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    cancelSession(activeSession.id);
                                  }}
                                  className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 text-xs font-medium rounded-lg transition-colors"
                                  title="Cancel session"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                Scheduled: {activeSession.date} at {activeSession.time}
                              </div>
                            </div>
                          ) : (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation(); 
                                openScheduleModal(mentee);
                              }}
                              className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-600 text-xs font-medium rounded-lg transition-colors"
                            >
                              Schedule
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex items-center mt-2">
                          <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                          <span className="text-xs text-muted-foreground">Last contact: {mentee.lastInteraction}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-3 w-3 text-green-600 mr-1" />
                          <span className="text-xs text-green-600">Next: {mentee.nextSession}</span>
                        </div>
                        {activeSession && activeSession.topic && (
                          <div className="mt-2 px-2 py-1 bg-gray-100 dark:bg-gray-700/50 rounded text-xs">
                            Topic: {activeSession.topic}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button 
                className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center"
                onClick={viewAllMentees}
              >
                View all mentees
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>

            {/* My Job Postings Section */}
            <div className="glass-card rounded-xl p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-lg">My Job Postings</h3>
                <Briefcase className="h-5 w-5 text-primary" />
                <div className="flex space-x-2">
                  <button
                    onClick={goToJobBoard}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Manage Job Postings
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {myPostedJobs.length > 0 ? (
                  myPostedJobs.slice(0, 2).map((job) => (
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
                          <a
                            href={job.applicationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline mt-2 block"
                          >
                            View Job Posting
                          </a>
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
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-4">You haven't posted any jobs yet.</p>
                )}
              </div>
              {myPostedJobs.length > 2 && (
                <button 
                  onClick={goToJobBoard}
                  className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center"
                >
                  View all job postings
                </button>
              )}
              {myPostedJobs.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">You haven't posted any jobs yet.</p>
                  <button
                    onClick={goToJobBoard}
                    className="mt-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    Post Your First Job
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar - 1/3 width */}
          <div className="space-y-8">
            {/* Replace Notifications Section with Connection Requests Section */}
            <div className="glass-card rounded-xl p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-medium text-lg">Connection Requests</h3>
                <Users className="h-5 w-5 text-primary" />
              </div>
              
              {pendingConnectionRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No pending connection requests</p>
              ) : (
                <div className="space-y-3">
                  {pendingConnectionRequests.slice(0, 2).map((request) => (
                    <div key={request._id} className="flex p-3 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <div className="rounded-full bg-primary/10 p-2 mr-3">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{request.from?.details?.name || "Unknown user"} wants to connect</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {request.from?.model === 'Student' ? 'Student' : 'Alumni'} - {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <button 
                className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center"
                onClick={() => setShowConnectionRequestsModal(true)}
              >
                View all connection requests
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>

            {/* Current Mentees Section */}
            <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-100">
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
                      onClick={() => messageMentee(mentee.id)}
                      className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-sm rounded-lg transition-colors"
                    >
                      Message
                    </button>
                  </div>
                ))}
              </div>
              <button 
                onClick={viewAllMentees}
                className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center"
              >
                View all mentees
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
              <h3 className="text-xl font-bold">
                {editMode ? "Edit Job Posting" : "Post a New Job"}
              </h3>
              <button
                onClick={toggleJobPostModal}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={newJobPost.title}
                  onChange={handleJobFormChange}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  placeholder="e.g. Software Engineer"
                  required
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="company"
                  value={newJobPost.company}
                  onChange={handleJobFormChange}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  placeholder="e.g. Google"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={newJobPost.location}
                    onChange={handleJobFormChange}
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    placeholder="e.g. San Francisco, CA or Remote"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium mb-1">
                    Job Type *
                  </label>
                  <select
                    id="type"
                    value={newJobPost.type}
                    onChange={handleJobFormChange}
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    required
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Job Description *
                </label>
                <textarea
                  id="description"
                  value={newJobPost.description}
                  onChange={handleJobFormChange}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  rows="4"
                  placeholder="Describe the job role, responsibilities, etc."
                  required
                ></textarea>
              </div>

              <div>
                <label htmlFor="requirements" className="block text-sm font-medium mb-1">
                  Requirements (Optional)
                </label>
                <textarea
                  id="requirements"
                  value={newJobPost.requirements}
                  onChange={handleJobFormChange}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  rows="3"
                  placeholder="Enter each requirement on a new line"
                ></textarea>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter each requirement on a new line
                </p>
              </div>

              <div>
                <label htmlFor="applicationLink" className="block text-sm font-medium mb-1">
                  Application Link *
                </label>
                <input
                  type="url"
                  id="applicationLink"
                  value={newJobPost.applicationLink}
                  onChange={handleJobFormChange}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  placeholder="https://example.com/apply"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  External link where students can apply
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={toggleJobPostModal}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitJobPosting}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {editMode ? "Update Job" : "Post Job"}
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
              <div className="flex items-center gap-3">
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-sm text-primary hover:underline"
                >
                  Mark all as read
                </button>
                <button 
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={toggleNotifications}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className="flex p-4 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                  onClick={() => markNotificationAsRead(notification.id)}
                >
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

      {/* Mentee Details Modal */}
      <MenteeDetailsModal
        selectedMentee={selectedMentee}
        setSelectedMentee={setSelectedMentee}
        messageMentee={messageMentee}
      />

      {/* Add this at the end of your component, before the closing div */}
      <ScheduleSessionModal 
        isOpen={showDirectScheduleModal}
        onClose={handleCloseScheduleModal}
        mentee={selectedMenteeForScheduling}
        onSchedule={handleSessionScheduled}
      />

      {/* Applicants Modal */}
      {showApplicantsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-3xl rounded-xl p-6 animate-fade-in max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                Referral Requests
                {currentJobId && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {myPostedJobs.find(job => job.id === currentJobId)?.title}
                  </span>
                )}
              </h3>
              <button 
                onClick={closeApplicantsModal}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {currentJobApplicants.length > 0 ? (
              <div className="space-y-4">
                {currentJobApplicants.map(applicant => (
                  <div 
                    key={applicant.id} 
                    className="p-4 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                    onClick={() => viewApplicantDetails(applicant)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4">
                          <Users className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-medium">{applicant.name}</h4>
                          <p className="text-sm text-muted-foreground">{applicant.program} • {applicant.year}</p>
                          <p className="text-xs text-muted-foreground mt-1">Applied {applicant.appliedDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {applicant.status === 'pending' ? (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 text-xs rounded-full">
                            Pending
                          </span>
                        ) : applicant.status === 'referred' ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs rounded-full">
                            Referred
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 text-xs rounded-full">
                            Declined
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No referral requests for this opportunity yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Applicant Detail Modal */}
      {showApplicantDetailModal && selectedApplicant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-xl p-6 animate-fade-in max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Referral Request</h3>
              <button 
                onClick={closeApplicantDetailModal}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-6 flex items-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h4 className="text-xl font-medium">{selectedApplicant.name}</h4>
                <p className="text-muted-foreground">{selectedApplicant.program} • {selectedApplicant.year}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h5 className="text-sm font-medium text-muted-foreground mb-1">Email</h5>
                <p>{selectedApplicant.email}</p>
              </div>
              <div>
                <h5 className="text-sm font-medium text-muted-foreground mb-1">Phone</h5>
                <p>{selectedApplicant.phone}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h5 className="text-sm font-medium text-muted-foreground mb-2">Request Message</h5>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm whitespace-pre-line">{selectedApplicant.coverLetter}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h5 className="text-sm font-medium text-muted-foreground mb-2">Resume</h5>
              <a 
                href={selectedApplicant.resumeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <line x1="10" y1="9" x2="8" y2="9"></line>
                </svg>
                View Resume
              </a>
            </div>
            
            {selectedApplicant.status === 'pending' ? (
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleReferralDecision(selectedApplicant.id, 'decline')}
                  className="px-4 py-2 border border-red-200 text-red-600 dark:border-red-800 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  Decline Referral
                </button>
                <button
                  onClick={() => handleReferralDecision(selectedApplicant.id, 'refer')}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Provide Referral
                </button>
              </div>
            ) : (
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-muted-foreground">
                  You have {selectedApplicant.status === 'referred' ? 'referred' : 'declined'} this student.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add this at the end of your component, before the closing div */}
{showEditSessionModal && sessionToEdit && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-xl p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Edit Session with {sessionToEdit.menteeName}</h3>
        <button 
          onClick={() => {
            setShowEditSessionModal(false);
            setSessionToEdit(null);
          }}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        try {
          const formData = new FormData(e.target);
          
          // Get date and ensure it's properly formatted
          const dateValue = formData.get('date');
          const formattedDate = dateValue.includes('-') 
            ? dateValue // Already formatted correctly
            : new Date(dateValue).toISOString().split('T')[0]; // Format as YYYY-MM-DD
          
          const updatedSession = {
            ...sessionToEdit,
            date: formattedDate,
            time: formData.get('time'),
            duration: parseInt(formData.get('duration')),
            topic: formData.get('topic'),
            location: formData.get('location'),
            status: "upcoming" // Ensure status is set to upcoming
          };
          
          console.log("Updating session:", updatedSession);
          handleSessionUpdate(updatedSession);
        } catch (error) {
          console.error("Error submitting form:", error);
          alert("There was an error updating the session. Please try again.");
        }
      }} className="space-y-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium mb-1">Date</label>
          <input 
            type="date" 
            id="date" 
            name="date"
            defaultValue={sessionToEdit.date}
            className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
            required
          />
        </div>
        
        <div>
          <label htmlFor="time" className="block text-sm font-medium mb-1">Time</label>
          <input 
            type="time" 
            id="time" 
            name="time"
            defaultValue={sessionToEdit.time}
            className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
            required
          />
        </div>
        
        <div>
          <label htmlFor="duration" className="block text-sm font-medium mb-1">Duration (minutes)</label>
          <select 
            id="duration" 
            name="duration"
            defaultValue={sessionToEdit.duration}
            className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
            <option value="90">90 minutes</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="topic" className="block text-sm font-medium mb-1">Topic</label>
          <input 
            type="text" 
            id="topic" 
            name="topic"
            defaultValue={sessionToEdit.topic}
            className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
            placeholder="e.g. Resume Review, Career Planning, etc."
          />
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-1">Location</label>
          <input 
            type="text" 
            id="location" 
            name="location"
            defaultValue={sessionToEdit.location}
            className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
            placeholder="e.g. Video Call, Campus Coffee Shop, etc."
          />
        </div>
        
        <div className="flex justify-between pt-4">
          <button 
            type="button"
            onClick={() => {
              try {
                cancelSession(sessionToEdit.id);
                setShowEditSessionModal(false);
                setSessionToEdit(null);
              } catch (error) {
                console.error("Error handling cancel button:", error);
              }
            }}
            className="px-4 py-2 flex items-center justify-center space-x-1 bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
            Cancel Session
          </button>
          
          <div className="flex space-x-2">
            <button 
              type="button"
              onClick={() => {
                setShowEditSessionModal(false);
                setSessionToEdit(null);
              }}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
)}

      {/* Don't forget to include the modal component in your render */}
      {showConnectionRequestsModal && <ConnectionRequestsModal />}

      <Footer />
    </div>
  );
};

export default AlumniDashboardPage;