import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Clock, 
  Calendar, 
  Search, 
  ChevronLeft, 
  Filter, 
  SlidersHorizontal,
  ArrowUpDown,
  X,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MenteeDetailsModal from './MenteeDetailsModal';
import ScheduleSessionModal from './ScheduleSessionModal';
import Navbar from '../layout/Navbar'; // Import the Navbar component - adjust path as needed
import { hasSessionEnded, markSessionCompleted } from '../../utils/sessionHelper';

const MenteesListPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [selectedMenteeForScheduling, setSelectedMenteeForScheduling] = useState(null);
  const [showDirectScheduleModal, setShowDirectScheduleModal] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState('nameAsc');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mentees, setMentees] = useState([]);
  const [allMentees, setAllMentees] = useState([]);

  // Fetch mentees data from the backend API
  const fetchMentees = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      // Make API request to get mentees
      console.log("Fetching mentees...");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/mentorship/mentees`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log("Fetched mentees raw data:", response.data);
      
      // Check if the response is empty but valid
      if (response.data && Array.isArray(response.data) && response.data.length === 0) {
        console.log("No mentees found in response. Checking connections...");
        
        // As a fallback, we can check for connections that might not have been converted to mentorships
        try {
          const connectionsResponse = await axios.get(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/connections`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          console.log("Fetched connections data:", connectionsResponse.data);
          
          // Check if there are any accepted connections that should be showing as mentees
          const acceptedConnections = connectionsResponse.data.filter(conn => conn.status === 'accepted');
          
          if (acceptedConnections.length > 0) {
            console.log("Found accepted connections that should appear as mentees:", acceptedConnections);
          }
        } catch (connErr) {
          console.error("Error checking connections:", connErr);
        }
      }
      
      // Get any locally cached schedule data
      const menteeSchedules = JSON.parse(localStorage.getItem('menteeSchedules') || '{}');
      
      // Transform the data to match our component's expected format
      const transformedMentees = response.data.map(mentee => {
        const menteeId = mentee._id;
        
        // Debug individual mentee data to identify issues
        console.log(`Processing mentee: ${mentee.name || 'Unknown'}, status: ${mentee.status || 'Unknown'}`);
        
        // Check if we have locally stored schedule data for this mentee
        const cachedSchedule = menteeSchedules[menteeId];
        
        // Use locally cached next session if it exists
        let nextSessionText = mentee.nextSession || "Not scheduled";
        let nextSessionDate = null;
        let requestStatus = mentee.status || "pending";
        
        if (cachedSchedule) {
          console.log(`Found cached schedule for mentee ${mentee.name}:`, cachedSchedule);
          nextSessionText = cachedSchedule.nextSession;
          nextSessionDate = cachedSchedule.rawDate; // Use the stored raw date
          requestStatus = cachedSchedule.requestStatus || requestStatus;
        }
        
        return {
          id: menteeId,
          name: mentee.name || 'Unknown Mentee',
          program: mentee.branch || 'Unknown Program',
          year: mentee.currentYear ? `${mentee.currentYear} Year` : 'Unknown Year',
          lastInteraction: mentee.lastInteraction || '2 days ago',
          lastInteractionDate: mentee.lastInteractionDate,
          nextSession: nextSessionText,
          nextSessionDate: nextSessionDate, // Store actual date for sorting
          profileImg: mentee.profilePicture?.url || null,
          status: mentee.status || "Active",
          requestStatus: requestStatus, // Add this to store the request status
          focusAreas: Array.isArray(mentee.focusAreas) && mentee.focusAreas.length > 0 
            ? mentee.focusAreas 
            : mentee.skillsToLearn && mentee.skillsToLearn.length > 0 
              ? mentee.skillsToLearn 
              : ["Career Guidance"],
          // Fix these session-related fields to ensure they're numbers
          sessionsCompleted: parseInt(mentee.sessionsCompleted || 0, 10),
          totalSessions: parseInt(mentee.totalPlannedSessions || 5, 10),
          // Recalculate progress based on completed sessions
          progress: (() => {
            const completed = parseInt(mentee.sessionsCompleted || 0, 10);
            const total = parseInt(mentee.totalPlannedSessions || 5, 10);
            return total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
          })(),
          startDate: mentee.startDate ? new Date(mentee.startDate).toLocaleDateString() : "January 15, 2023",
          email: mentee.email || 'unknown@example.com',
          notes: mentee.notes || "Working on mentorship goals.",
          mentorshipId: mentee.mentorshipId, // Keep the mentorship ID for scheduling sessions
          mentorshipGoals: mentee.mentorshipGoals || "",
          nextSessionId: cachedSchedule?.sessionId || mentee.nextSessionId, // Use cached session ID if available
          // Add these for tracking session completion
          nextSessionEndTime: cachedSchedule?.endTime || mentee.nextSessionEndTime,
          nextSessionCompleted: cachedSchedule?.completed || false
        };
      });
      
      console.log("Transformed mentees data:", transformedMentees);
      
      if (transformedMentees.length === 0) {
        console.log("No mentees found after transformation. Using fallback mentees data.");
        
        // Use sample data as fallback
        const sampleMentees = [
          {
            id: 1,
            name: "Emily Parker",
            program: "Computer Science",
            year: "Junior",
            lastInteraction: "2 days ago",
            nextSession: "May 15, 2023",
            profileImg: null,
            status: "Active",
            focusAreas: ["Technical Skills", "Career Guidance", "Interview Preparation"],
            progress: 60,
            sessionsCompleted: 3,
            totalSessions: 5,
            startDate: "January 15, 2023",
            email: "emily.parker@university.edu",
            notes: "Working on improving technical skills in React and preparing for internship interviews."
          },
          {
            id: 2,
            name: "Michael Chen",
            program: "Software Engineering",
            year: "Senior",
            lastInteraction: "1 week ago",
            nextSession: "May 18, 2023",
            profileImg: null,
            status: "Active",
            focusAreas: ["System Design", "Algorithm Practice", "Resume Review"],
            progress: 40,
            sessionsCompleted: 2,
            totalSessions: 5,
            startDate: "February 3, 2023",
            email: "michael.chen@university.edu",
            notes: "Preparing for full-time roles after graduation. Focusing on system design concepts."
          },
          {
            id: 3,
            name: "Sarah Johnson",
            program: "Data Science",
            year: "Graduate",
            lastInteraction: "Yesterday",
            nextSession: "May 22, 2023",
            profileImg: null,
            status: "Active",
            focusAreas: ["Machine Learning", "Data Visualization", "Project Planning"],
            progress: 80,
            sessionsCompleted: 4,
            totalSessions: 5,
            startDate: "December 10, 2022",
            email: "sarah.johnson@university.edu",
            notes: "Working on capstone project for MS degree. Needs guidance on ML model selection."
          },
          {
            id: 4,
            name: "David Kim",
            program: "Computer Engineering",
            year: "Senior",
            lastInteraction: "3 days ago",
            nextSession: "May 25, 2023",
            profileImg: null,
            status: "Active",
            focusAreas: ["Hardware Design", "Embedded Systems", "Job Search"],
            progress: 60,
            sessionsCompleted: 3,
            totalSessions: 5,
            startDate: "January 20, 2023",
            email: "david.kim@university.edu",
            notes: "Interested in roles at hardware companies. Working on portfolio projects."
          },
          {
            id: 5,
            name: "Jessica Martinez",
            program: "Information Systems",
            year: "Junior",
            lastInteraction: "5 days ago",
            nextSession: "May 30, 2023",
            profileImg: null,
            status: "Active",
            focusAreas: ["Project Management", "Business Analysis", "Technical Writing"],
            progress: 40,
            sessionsCompleted: 2,
            totalSessions: 5,
            startDate: "March 5, 2023",
            email: "jessica.martinez@university.edu",
            notes: "Looking for product management internships. Working on case studies."
          }
        ];
        
        setAllMentees(sampleMentees);
        setMentees(sampleMentees);
      } else {
        setAllMentees(transformedMentees);
        setMentees(transformedMentees);
      }

      // Make sure to set loading to false after data is set
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching mentees:", err);
      console.error("Error details:", err.response?.data);
      setError(err.response?.data?.message || err.message || "Failed to load mentees");
      setIsLoading(false);
      // Use sample data as fallback
      const sampleMentees = [
        {
          id: 1,
          name: "Emily Parker",
          program: "Computer Science",
          year: "Junior",
          lastInteraction: "2 days ago",
          nextSession: "May 15, 2023",
          profileImg: null,
          status: "Active",
          focusAreas: ["Technical Skills", "Career Guidance", "Interview Preparation"],
          progress: 60,
          sessionsCompleted: 3,
          totalSessions: 5,
          startDate: "January 15, 2023",
          email: "emily.parker@university.edu",
          notes: "Working on improving technical skills in React and preparing for internship interviews."
        },
        {
          id: 2,
          name: "Michael Chen",
          program: "Software Engineering",
          year: "Senior",
          lastInteraction: "1 week ago",
          nextSession: "May 18, 2023",
          profileImg: null,
          status: "Active",
          focusAreas: ["System Design", "Algorithm Practice", "Resume Review"],
          progress: 40,
          sessionsCompleted: 2,
          totalSessions: 5,
          startDate: "February 3, 2023",
          email: "michael.chen@university.edu",
          notes: "Preparing for full-time roles after graduation. Focusing on system design concepts."
        },
        {
          id: 3,
          name: "Sarah Johnson",
          program: "Data Science",
          year: "Graduate",
          lastInteraction: "Yesterday",
          nextSession: "May 22, 2023",
          profileImg: null,
          status: "Active",
          focusAreas: ["Machine Learning", "Data Visualization", "Project Planning"],
          progress: 80,
          sessionsCompleted: 4,
          totalSessions: 5,
          startDate: "December 10, 2022",
          email: "sarah.johnson@university.edu",
          notes: "Working on capstone project for MS degree. Needs guidance on ML model selection."
        },
        {
          id: 4,
          name: "David Kim",
          program: "Computer Engineering",
          year: "Senior",
          lastInteraction: "3 days ago",
          nextSession: "May 25, 2023",
          profileImg: null,
          status: "Active",
          focusAreas: ["Hardware Design", "Embedded Systems", "Job Search"],
          progress: 60,
          sessionsCompleted: 3,
          totalSessions: 5,
          startDate: "January 20, 2023",
          email: "david.kim@university.edu",
          notes: "Interested in roles at hardware companies. Working on portfolio projects."
        },
        {
          id: 5,
          name: "Jessica Martinez",
          program: "Information Systems",
          year: "Junior",
          lastInteraction: "5 days ago",
          nextSession: "May 30, 2023",
          profileImg: null,
          status: "Active",
          focusAreas: ["Project Management", "Business Analysis", "Technical Writing"],
          progress: 40,
          sessionsCompleted: 2,
          totalSessions: 5,
          startDate: "March 5, 2023",
          email: "jessica.martinez@university.edu",
          notes: "Looking for product management internships. Working on case studies."
        }
      ];
      setAllMentees(sampleMentees);
      setMentees(sampleMentees);
      // Make sure to set loading to false in case of error too
      setIsLoading(false);
    }
  }, [navigate]);

  // Function to check and update any completed sessions
  const checkAndUpdateCompletedSessions = useCallback(async () => {
    try {
      console.log("Checking for sessions that need to be marked as completed...");
      const currentMentees = [...mentees];
      let hasUpdates = false;
      
      // Check each mentee for sessions that should be completed
      for (let i = 0; i < currentMentees.length; i++) {
        const mentee = currentMentees[i];
        if (
          mentee.nextSessionDate && 
          mentee.nextSessionEndTime && 
          !mentee.nextSessionCompleted && 
          mentee.nextSessionId
        ) {
          const sessionHasEnded = hasSessionEnded(mentee.nextSessionDate, mentee.nextSessionEndTime);
          
          if (sessionHasEnded) {
            console.log(`Session for ${mentee.name} has ended, marking as completed`);
            
            try {
              // Update session status in the database
              await markSessionCompleted(mentee.nextSessionId);
              
              // Update local state
              currentMentees[i] = {
                ...mentee,
                nextSessionCompleted: true,
                sessionsCompleted: mentee.sessionsCompleted + 1,
                progress: Math.min(100, Math.ceil(((mentee.sessionsCompleted + 1) / mentee.totalSessions) * 100))
              };
              
              // Update the local storage to track completed sessions
              const menteeSchedules = JSON.parse(localStorage.getItem('menteeSchedules') || '{}');
              if (menteeSchedules[mentee.id]) {
                menteeSchedules[mentee.id].completed = true;
                localStorage.setItem('menteeSchedules', JSON.stringify(menteeSchedules));
              }
              
              hasUpdates = true;
            } catch (error) {
              console.error(`Failed to mark session as completed for mentee ${mentee.id}:`, error);
            }
          }
        }
      }
      
      if (hasUpdates) {
        setMentees(currentMentees);
        setAllMentees(prev => {
          const updated = [...prev];
          for (const mentee of currentMentees) {
            const index = updated.findIndex(m => m.id === mentee.id);
            if (index !== -1) {
              updated[index] = mentee;
            }
          }
          return updated;
        });
      }
      
    } catch (error) {
      console.error("Error checking completed sessions:", error);
    }
  }, [mentees]);
  
  // Run session check when component mounts
  useEffect(() => {
    checkAndUpdateCompletedSessions();
    
    // Set up an interval to check for completed sessions
    const checkInterval = setInterval(() => {
      checkAndUpdateCompletedSessions();
    }, 60000); // Check every minute

    return () => clearInterval(checkInterval);
  }, [checkAndUpdateCompletedSessions]);
  
  // Define handleBack function
  const handleBack = () => {
    navigate(-1);
  };

  const viewMenteeDetails = (mentee) => {
    setSelectedMentee(mentee);
  };
  const messageMentee = (menteeId) => {
    console.log(`Navigating to message with mentee ${menteeId}`);
    navigate(`/messages/${menteeId}`);
  };

  const openScheduleModal = (mentee, e) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedMenteeForScheduling(mentee);
    setShowDirectScheduleModal(true);
  };
  const handleCloseScheduleModal = () => {
    setShowDirectScheduleModal(false);
    setSelectedMenteeForScheduling(null);
  };

  // Implement handleSessionScheduled method
  const handleSessionScheduled = async (mentee, sessionDetails) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      // Format the date for API submission
      const formattedDate = sessionDetails.date;
      const endTime = getEndTime(sessionDetails.time, 60); // Default 60 minute sessions
      console.log("Scheduling session with details:", {
        mentee,
        sessionDetails,
        formattedDate,
        endTime
      });
      // Call API to schedule the session - using the correct endpoint
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/mentorship/${mentee.mentorshipId}/sessions`,
        {
          title: sessionDetails.title,
          description: sessionDetails.description,
          date: formattedDate,
          startTime: sessionDetails.time,
          endTime: endTime,
          meetingLink: sessionDetails.meetingLink || ""
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      console.log("Session scheduled successfully, API response:", response.data);
      // Format the next session display in a user-friendly way
      const displayDate = new Date(formattedDate).toLocaleDateString();
      const nextSessionFormatted = `${displayDate} at ${sessionDetails.time}`;
      // Update local state and localStorage
      // 1. Update local state for immediate UI feedback
      const updatedMentee = {
        ...mentee,
        nextSession: nextSessionFormatted,
        nextSessionId: response.data._id || response.data.id || mentee.nextSessionId,
        nextSessionDate: formattedDate,
        nextSessionEndTime: endTime, // Store the end time for tracking completion
        nextSessionCompleted: false, // Add a flag to track if this session has been marked as completed
        requestStatus: 'scheduled' // Store the end time for tracking completion
      };
      setMentees(prevMentees => 
        prevMentees.map(m => m.id === mentee.id ? updatedMentee : m)
      );
      setAllMentees(prevMentees => 
        prevMentees.map(m => m.id === mentee.id ? updatedMentee : m)
      );
      // 2. Store in localStorage for persistence
      const menteeSchedules = JSON.parse(localStorage.getItem('menteeSchedules') || '{}');
      menteeSchedules[mentee.id] = {
        nextSession: nextSessionFormatted,
        timestamp: new Date().toISOString(),
        sessionId: response.data._id || response.data.id,
        rawDate: formattedDate,
        endTime: endTime, // Store end time in local storage
        requestStatus: 'scheduled'
      };
      localStorage.setItem('menteeSchedules', JSON.stringify(menteeSchedules));
      // Show success message
      alert(`Session scheduled with ${mentee.name} on ${displayDate} at ${sessionDetails.time}`);
      // Close modal
      setShowDirectScheduleModal(false);
      setSelectedMenteeForScheduling(null);
    } catch (error) {
      console.error("Error scheduling session:", error);
      console.error("Error details:", error.response?.data || "No response data");
      setSelectedMenteeForScheduling(null);
      const errorMessage = error.response?.data?.message || error.message;
      alert(`Failed to schedule session: ${errorMessage}\nPlease check the console for more details.`);
    }
  };

  // Helper function to calculate end time (e.g., "10:00" + 60 minutes = "11:00")
  const getEndTime = (startTime, durationMinutes) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const durationHours = Math.floor(durationMinutes / 60);
    const remainingMinutes = durationMinutes % 60;
    const endDate = new Date();
    endDate.setHours(hours + durationHours, minutes + remainingMinutes, 0, 0);
    return endDate.toTimeString().slice(0, 5); // Return in "HH:MM" format
  };

  // Add useEffect to fetch mentees when component mounts
  useEffect(() => {
    fetchMentees();
  }, [fetchMentees]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter mentees by search query when component mounts
  useEffect(() => {
    if (!searchQuery.trim()) {
      const sorted = sortMentees(allMentees, sortOption);
      setMentees(sorted);
      return;
    }
    const filtered = allMentees.filter(mentee => 
      mentee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentee.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mentee.focusAreas && mentee.focusAreas.some(area => 
        area.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    );
    const sorted = sortMentees(filtered, sortOption);
    setMentees(sorted);
  }, [searchQuery, allMentees, sortOption]); // eslint-disable-line react-hooks/exhaustive-deps

  // Add a console log to debug what's happening
  useEffect(() => {
    console.log("Component state:", { 
      isLoading, 
      hasError: !!error, 
      menteeCount: mentees.length,
      allMenteesCount: allMentees.length
    });
  }, [isLoading, error, mentees, allMentees]);

  // Helper function to sort mentees without triggering state updates
  const sortMentees = (menteesToSort, option) => {
    if (!menteesToSort || !Array.isArray(menteesToSort) || menteesToSort.length === 0) {
      console.log("No mentees to sort, returning empty array");
      return [];
    }
    return [...menteesToSort].sort((a, b) => {
      switch (option) {
        case 'nameAsc':
          return a.name.localeCompare(b.name);
        case 'nameDesc':
          return b.name.localeCompare(a.name);
        case 'recentInteraction':
          // Try to compare based on lastInteractionDate if available
          if (a.lastInteractionDate && b.lastInteractionDate) {
            return new Date(b.lastInteractionDate) - new Date(a.lastInteractionDate);
          }
          // Fall back to string comparison if dates aren't available
          return a.lastInteraction.localeCompare(b.lastInteraction);
        case 'nextSession':
          // If we have actual next session dates, use those for sorting
          if (a.nextSessionDate && b.nextSessionDate) {
            return new Date(a.nextSessionDate) - new Date(b.nextSessionDate);
          }
          // Fall back to string comparison if dates aren't available
          return a.nextSession.localeCompare(b.nextSession);
        default:
          return 0;
      }
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container-custom pt-20 pb-12 flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading mentees...</p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Navbar />
        <div className="container-custom pt-20 pb-12">
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button className="px-4 py-2 bg-primary text-white rounded-lg" onClick={fetchMentees}>
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container-custom pt-20 pb-12">
        <div className="mb-6 flex items-center">
          <button 
            onClick={handleBack}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold">Current Mentees</h1>
        </div>
        {/* Search and filter section - unchanged */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          {/* Existing search and filter code */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              placeholder="Search mentees by name or program..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
            {/* Existing sort dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                onClick={() => document.getElementById('sortDropdown').classList.toggle('hidden')}
              >
                <ArrowUpDown className="h-4 w-4" />
                <span className="hidden sm:inline">Sort</span>
              </button>
              <div
                id="sortDropdown"
                className="absolute right-0 mt-1 z-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg w-48 hidden"
              >
                <div className="p-2">
                  <button
                    className={`w-full text-left px-3 py-1.5 rounded-md ${sortOption === 'nameAsc' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    onClick={() => {
                      setSortOption('nameAsc');
                      document.getElementById('sortDropdown').classList.add('hidden');
                    }}
                  >
                    Name (A-Z)
                  </button>
                  <button
                    className={`w-full text-left px-3 py-1.5 rounded-md ${sortOption === 'nameDesc' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    onClick={() => {
                      setSortOption('nameDesc');
                      document.getElementById('sortDropdown').classList.add('hidden');
                    }}
                  >
                    Name (Z-A)
                  </button>
                  <button
                    className={`w-full text-left px-3 py-1.5 rounded-md ${sortOption === 'recentInteraction' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    onClick={() => {
                      setSortOption('recentInteraction');
                      document.getElementById('sortDropdown').classList.add('hidden');
                    }}
                  >
                    Most Recent Interaction
                  </button>
                  <button
                    className={`w-full text-left px-3 py-1.5 rounded-md ${sortOption === 'nextSession' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    onClick={() => {
                      setSortOption('nextSession');
                      document.getElementById('sortDropdown').classList.add('hidden');
                    }}
                  >
                    Upcoming Sessions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Filter panel - unchanged */}
        {filterOpen && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-fade-down">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Filter Options
              </h3>
              <button onClick={() => setFilterOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Add filter options as needed */}
              <div>
                <label className="text-sm font-medium mb-1 block">Program</label>
                <select className="w-full px-3 py-2 bg-background border border-input rounded-md">
                  <option value="">All Programs</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="Information Systems">Information Systems</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Year</label>
                <select className="w-full px-3 py-2 bg-background border border-input rounded-md">
                  <option value="">All Years</option>
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Focus Area</label>
                <select className="w-full px-3 py-2 bg-background border border-input rounded-md">
                  <option value="">All Areas</option>
                  <option value="Technical Skills">Technical Skills</option>
                  <option value="Career Guidance">Career Guidance</option>
                  <option value="Interview Preparation">Interview Preparation</option>
                  <option value="System Design">System Design</option>
                  <option value="Job Search">Job Search</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <select className="w-full px-3 py-2 bg-background border border-input rounded-md">
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <button className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                Reset
              </button>
              <button className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90">
                Apply Filters
              </button>
            </div>
          </div>
        )}
        {/* Grid layout - unchanged */}
        {mentees.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentees.map((mentee) => (
              <div
                key={mentee.id}
                className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer h-full flex flex-col"
                onClick={() => viewMenteeDetails(mentee)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {mentee.profileImg ? (
                      <img 
                        src={mentee.profileImg} 
                        alt={`${mentee.name}'s profile`} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Users className="h-7 w-7" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-primary text-lg">{mentee.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{mentee.program} • {mentee.year}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                    <span className="text-xs text-muted-foreground">Last: {mentee.lastInteraction}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 text-green-600 mr-1.5" />
                    <span className="text-xs text-green-600">Next: {mentee.nextSession}</span>
                  </div>
                </div>
                <div className="mb-4 flex-grow">
                  <div className="text-xs text-muted-foreground mb-1">Mentorship Progress</div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${mentee.progress}%` }}></div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {/* Display the correct session counts here */}
                    {parseInt(mentee.sessionsCompleted || 0)} of {parseInt(mentee.totalSessions || 5)} Sessions Completed
                  </div>
                </div>
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {mentee.focusAreas.slice(0, 2).map((area, index) => (
                    <span key={index} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{area}</span>
                  ))}
                  {mentee.focusAreas.length > 2 && (
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                      +{mentee.focusAreas.length - 2} more
                    </span>
                  )}
                </div>
                <div className="flex gap-2 mt-auto">
                  {mentee.requestStatus === 'pending' ? (
                    <div className="flex-1 px-3 py-1.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-sm rounded-lg flex items-center justify-center">
                      <Clock className="h-4 w-4 mr-1.5" />
                      Request Pending
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={(e) => openScheduleModal(mentee, e)}
                        className="flex-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors flex items-center justify-center"
                      >
                        <Calendar className="h-4 w-4 mr-1.5" />
                        Schedule
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          messageMentee(mentee.id);
                        }}
                        className="flex-1 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-sm rounded-lg transition-colors flex items-center justify-center"
                      >
                        <MessageSquare className="h-4 w-4 mr-1.5" />
                        Message
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No mentees match your search criteria.</p>
          </div>
        )}
      </div>
      {/* Modals - unchanged */}
      <MenteeDetailsModal
        selectedMentee={selectedMentee}
        setSelectedMentee={setSelectedMentee}
        messageMentee={messageMentee}
      />
      <ScheduleSessionModal
        isOpen={showDirectScheduleModal}
        onClose={handleCloseScheduleModal}
        mentee={selectedMenteeForScheduling}
        onSchedule={handleSessionScheduled}
      />
    </>
  );
};

export default MenteesListPage;