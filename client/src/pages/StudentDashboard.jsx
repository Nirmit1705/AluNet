import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import DashboardNavbar from '../components/DashboardNavbar';
import axios from 'axios';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [error, setError] = useState(null);
  
  // Add states for job filtering and sorting
  const [jobFilters, setJobFilters] = useState({
    location: 'all',
    jobType: 'all',
    showSavedOnly: false
  });
  const [jobSortOption, setJobSortOption] = useState('deadline'); // Options: deadline, company, title
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  
  // Student mock data - guaranteed fallback
  const STUDENT_MOCK_DATA = null; // Set to null so we don't use mock data
  
  // Function to guarantee student data shows
  const forceStudentDataReset = () => {
    // Clear any alumni data first
    try {
      const userType = localStorage.getItem('userType');
      const storedUserData = localStorage.getItem('userData');
      
      // Try to preserve the user's name if possible
      if (storedUserData) {
        try {
          const parsedData = JSON.parse(storedUserData);
          if (parsedData.name) {
            return parsedData; // Return the actual stored data
          }
        } catch (e) {
          console.error('Error parsing stored userData:', e);
        }
      }
      
      return null; // Return null if no data found
    } catch (error) {
      console.error('Error in forceStudentDataReset:', error);
      return null;
    }
  };
  
  // Helper function to get initials from name
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };
  
  // Helper function to extract field value with fallbacks
  const getFieldValue = (data, fieldOptions, defaultValue = '') => {
    if (!data) return defaultValue;
    
    for (const field of fieldOptions) {
      if (data[field] !== undefined && data[field] !== null) {
        return data[field];
      }
    }
    
    return defaultValue;
  };
  
  // Debug helper function
  const logDebugInfo = () => {
    console.log("Current userData in StudentDashboard:", userData);
    // We can't reference studentData here to avoid circular dependencies
    const nameValue = getFieldValue(userData, ['name', 'fullName', 'userName'], 'Student User');
    console.log("Name value extracted:", nameValue);
  };
  
  // Load user data from MongoDB instead of localStorage
  useEffect(() => {
    const fetchUserFromAPI = async () => {
      setIsLoading(true);
      try {
        // Get auth token from localStorage (only thing we'll keep in localStorage)
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No auth token found');
          setError('You must be logged in. Please login again.');
          setIsLoading(false);
          return;
        }

        // Set authorization header
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };
        
        // Fetch student profile from API
        const response = await axios.get('http://localhost:5000/api/students/profile', config);
        
        if (response.data) {
          console.log('Student data from API:', response.data);
          
          // Update the user data state with API response
          setUserData({
            ...response.data,
            userType: 'student'
          });
          
          // We'll still store userType in localStorage for route protection
          localStorage.setItem('userType', 'student');
          
          // Also store the data in localStorage for persistence
          localStorage.setItem('userData', JSON.stringify(response.data));
        } else {
          console.error('No data returned from API');
          setError('No user data found. Please update your profile or contact support.');
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
        
        // If we get a 401 error, the token is invalid/expired
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token'); // Clear invalid token
          setError('Your session has expired. Please login again.');
        } else {
          // Try to get data from localStorage as last resort
          const storedData = localStorage.getItem('userData');
          if (storedData) {
            try {
              const parsedData = JSON.parse(storedData);
              setUserData({...parsedData, userType: 'student'});
              setError('Could not connect to server. Using locally stored data.');
            } catch (e) {
              setError('Error connecting to server and no valid local data found. Please login again.');
            }
          } else {
            setError('Error connecting to server and no local data found. Please login again.');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserFromAPI();
  }, []);
  
  // Now create studentData using useMemo after all helper functions are defined
  const studentData = useMemo(() => {
    // If userData is null, return nothing to prevent errors
    if (!userData) {
      console.log("userData is null in useMemo, waiting for data");
      return null;
    }
    
    // Create a clean student object with real user data
    return {
      // Basic student info from user data
      name: userData.name,
      year: userData.year,
      branch: userData.branch,
      enrollmentNumber: userData.enrollmentNumber,
      email: userData.email || '',
      phone: userData.phone || '',
      
      // Stats from user data or initialize empty
      stats: userData.stats || {
        mentorConnections: 0,
        savedJobs: 0,
        pendingApplications: 0
      },
      
      // Use actual data from the API if available
      mentors: userData.mentors || [],
      mentorshipRequests: userData.mentorshipRequests || [],
      recentJobs: userData.recentJobs || [],
      events: userData.events || []
    };
  }, [userData]);

  // Add this useEffect after the studentData useMemo
  useEffect(() => {
    if (studentData && studentData.name) {
      // This will help debug if we're correctly setting the student name
      document.title = `Student Dashboard - ${studentData.name}`;
      console.log("Dashboard rendered with name:", studentData.name);
    }
  }, [studentData]);

  // Function to handle profile edit
  const startEditing = () => {
    setEditedData({
      name: studentData.name,
      email: studentData.email,
      enrollmentNumber: studentData.enrollmentNumber,
      phone: studentData.phone || '',
      branch: studentData.branch,
      year: studentData.year
    });
    setIsEditing(true);
  };

  const saveProfileChanges = async () => {
    try {
      setIsLoading(true);
      
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Set authorization header
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      // Send update request to API
      const response = await axios.put(
        'http://localhost:5000/api/students/profile',
        editedData,
        config
      );
      
      if (response.data) {
        console.log('Profile updated successfully:', response.data);
        
        // Update local state with the updated data from API
        setUserData({
          ...userData,
          ...response.data
        });
        
        // Exit editing mode
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to reset all user data
  const resetStudentData = async () => {
    if (window.confirm("This will log you out and you'll need to login again. Continue?")) {
      try {
        // Clear all localStorage data
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        
        // Redirect to login page
        window.location.href = '/login';
      } catch (error) {
        console.error('Error during logout:', error);
        alert('Failed to log out. Please try again.');
      }
    }
  };

  // Handle job filtering
  const handleFilterChange = (filterType, value) => {
    setJobFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Handle job sorting
  const handleSortChange = (sortOption) => {
    setJobSortOption(sortOption);
    setShowSortMenu(false);
  };

  // Enhanced toggle saved job function with localStorage persistence
  const toggleJobSaved = async (jobId) => {
    try {
      if (!studentData || !studentData.recentJobs) {
        console.error('No job data available');
        return;
      }
      
      // Find the job in the current state
      const job = studentData.recentJobs.find(job => job.id === jobId);
      if (!job) {
        console.error('Job not found:', jobId);
        return;
      }
      
      // Get current saved status before toggling
      const currentSavedStatus = job.saved;
      const newSavedStatus = !currentSavedStatus;
      
      console.log(`Toggling job ${jobId} saved status from ${currentSavedStatus} to ${newSavedStatus}`);
      
      // Get current saved jobs from localStorage or initialize empty array
      let savedJobs = [];
      try {
        const savedJobsJson = localStorage.getItem('savedJobs');
        if (savedJobsJson) {
          savedJobs = JSON.parse(savedJobsJson);
        }
      } catch (err) {
        console.error('Error loading saved jobs from localStorage:', err);
        savedJobs = [];
      }
      
      // Update saved jobs in localStorage
      if (newSavedStatus) {
        // Add job to saved if not already there
        if (!savedJobs.includes(jobId)) {
          savedJobs.push(jobId);
        }
      } else {
        // Remove job from saved
        savedJobs = savedJobs.filter(id => id !== jobId);
      }
      
      // Save updated list to localStorage
      localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
      
      // Update UI state by creating a new jobs array with updated saved status
      const updatedJobs = studentData.recentJobs.map(j => 
        j.id === jobId ? {...j, saved: newSavedStatus} : j
      );
      
      // Log the state before and after update for debugging
      console.log('Before update:', studentData.recentJobs.map(j => ({id: j.id, saved: j.saved})));
      console.log('After update:', updatedJobs.map(j => ({id: j.id, saved: j.saved})));
      
      // Update the userData state with new jobs array
      setUserData(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          recentJobs: updatedJobs,
          stats: {
            ...prev.stats,
            savedJobs: savedJobs.length
          }
        };
      });
      
      // In a real app, make API call to update saved status on the server
      // For now, just simulate with console log
      console.log(`API call would be: ${newSavedStatus ? 'POST' : 'DELETE'} to /api/students/jobs/${jobId}/saved`);
      
      // Show visual feedback with animation
      const button = document.querySelector(`button[data-job-id="${jobId}"]`);
      if (button) {
        button.classList.add('animate-pulse');
        
        // Add saved-indicator animation if saving (not unsaving)
        if (newSavedStatus) {
          const cardElement = button.closest('.job-card');
          if (cardElement) {
            cardElement.classList.add('saved-indicator');
            setTimeout(() => {
              cardElement.classList.remove('saved-indicator');
            }, 800);
          }
        }
        
        // Accessibility announcement for screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = newSavedStatus 
          ? `Job ${job.title} saved` 
          : `Job ${job.title} removed from saved jobs`;
        document.body.appendChild(announcement);
        
        // Show a success toast notification
        const message = newSavedStatus ? 'Job saved successfully' : 'Job removed from saved jobs';
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-white border border-gray-200 shadow-lg rounded-lg p-4 flex items-center transition-opacity duration-500 z-50';
        notification.innerHTML = `
          <div class="mr-3 text-${newSavedStatus ? 'green' : 'yellow'}-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              ${!newSavedStatus ? 
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />' : 
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />'}
            </svg>
          </div>
          <div>
            <p class="font-medium">${message}</p>
          </div>
        `;
        document.body.appendChild(notification);
        
        // Clean up announcements and notifications
        setTimeout(() => {
          if (announcement.parentNode) {
            document.body.removeChild(announcement);
          }
          
          notification.style.opacity = '0';
          setTimeout(() => {
            if (notification.parentNode) {
              document.body.removeChild(notification);
            }
          }, 500);
        }, 3000);
        
        setTimeout(() => {
          button.classList.remove('animate-pulse');
        }, 600);
      }
      
      // Update the Stats panel as well
      const statsElement = document.querySelector('.text-3xl.font-bold.text-primary-blue:nth-child(2)');
      if (statsElement) {
        statsElement.textContent = savedJobs.length.toString();
      }
      
    } catch (error) {
      console.error('Error toggling job saved status:', error);
      alert('Failed to update saved status. Please try again.');
    }
  };

  // Load saved jobs from localStorage when component mounts
  useEffect(() => {
    try {
      if (!userData || !userData.recentJobs || userData.recentJobs.length === 0) {
        console.log('No job data available yet to update saved status');
        return;
      }
      
      console.log('Loading saved jobs from localStorage');
      const savedJobsJson = localStorage.getItem('savedJobs');
      if (savedJobsJson) {
        const savedJobIds = JSON.parse(savedJobsJson);
        console.log('Found saved job IDs in localStorage:', savedJobIds);
        
        // Update job saved status based on localStorage
        setUserData(prev => {
          if (!prev || !prev.recentJobs) return prev;
          
          const updatedJobs = prev.recentJobs.map(job => ({
            ...job,
            saved: savedJobIds.includes(job.id)
          }));
          
          console.log('Updated jobs with saved status:', 
            updatedJobs.map(j => ({id: j.id, saved: j.saved}))
          );
          
          return {
            ...prev,
            recentJobs: updatedJobs,
            stats: {
              ...prev.stats,
              savedJobs: savedJobIds.length
            }
          };
        });
      } else {
        console.log('No saved jobs found in localStorage');
      }
    } catch (err) {
      console.error('Error loading saved jobs from localStorage:', err);
    }
  }, [userData?.recentJobs]);

  // Get all unique locations from jobs
  const jobLocations = useMemo(() => {
    if (!studentData?.recentJobs) return [];
    return ['all', ...new Set(studentData.recentJobs.map(job => job.location))];
  }, [studentData?.recentJobs]);

  // Get all unique job types from jobs
  const jobTypes = useMemo(() => {
    if (!studentData?.recentJobs) return [];
    return ['all', ...new Set(studentData.recentJobs.map(job => job.jobType))];
  }, [studentData?.recentJobs]);

  // Filter and sort jobs
  const filteredAndSortedJobs = useMemo(() => {
    if (!studentData?.recentJobs) return [];
    
    // First apply filters
    let filtered = [...studentData.recentJobs];
    
    if (jobFilters.location !== 'all') {
      filtered = filtered.filter(job => job.location === jobFilters.location);
    }
    
    if (jobFilters.jobType !== 'all') {
      filtered = filtered.filter(job => job.jobType === jobFilters.jobType);
    }
    
    if (jobFilters.showSavedOnly) {
      filtered = filtered.filter(job => job.saved);
    }
    
    // Then sort
    return filtered.sort((a, b) => {
      switch (jobSortOption) {
        case 'company':
          return a.company.localeCompare(b.company);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'newest':
          return b.postedDate - a.postedDate;
        case 'deadline':
        default:
          return a.deadlineDate - b.deadlineDate;
      }
    });
  }, [studentData?.recentJobs, jobFilters, jobSortOption]);

  // Function to view mentor profile
  const handleViewMentorProfile = (mentorId) => {
    if (!studentData || !studentData.mentors) return;
    
    const mentor = studentData.mentors.find(m => m.id === mentorId);
    if (!mentor) return;
    
    // In a real app, navigate to mentor profile
    // For now, show details in a modal/alert
    alert(`
      Name: ${mentor.name}
      Position: ${mentor.position} at ${mentor.company}
      Graduated: ${mentor.graduationYear || 'N/A'}
      Expertise: ${mentor.expertise ? mentor.expertise.join(', ') : 'Various fields'}
      Email: ${mentor.email || 'N/A'}
    `);
  };

  // Function to request mentorship
  const handleRequestMentorship = async (mentorId) => {
    try {
      console.log('%c📨 Creating mentorship request via API...', 'color: blue; font-weight: bold');
      
      const mentorName = "Alumni User"; // For demo, use fixed name
      const mentorEmail = "alumni@example.com"; // For demo, use fixed email
      
      // For demo purposes, use a fixed ID to make it easier to test
      const requestId = "13865a6b-9544-4c4f-b30a-ab1d9d21fef3";
      
      const newRequest = {
        id: requestId,
        mentorId,
        mentorName,
        mentorEmail,
        status: 'pending',
        sentDate: new Date().toISOString(),
        message: "I would like to request mentorship from you for career guidance in software development.",
        requestType: 'mentorship',
        // Add student information
        studentId: userData?.id || 'student123',
        studentName: userData?.name || 'Student User',
        studentYear: userData?.year || '3rd Year',
        studentBranch: userData?.branch || 'Computer Engineering',
        studentEmail: userData?.email || 'student@example.com'
      };
      
      console.log('%c📨 Prepared new mentorship request:', 'color: blue', newRequest);
      
      // Get auth token for API call
      const token = localStorage.getItem('token');
      
      // Set up headers for API call
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Make API call to create mentorship request
      try {
        // Simulated API call (replace with actual endpoint)
        console.log('%c📨 Sending mentorship request to API...', 'color: blue');
        
        // FOR DEMO: Skip actual API call and use direct event approach to show mentorship request
        // In a real implementation, you would use:
        /*
        const response = await axios.post(
          'http://localhost:5000/api/mentorship/requests',
          newRequest,
          { headers }
        );
        
        if (response.data) {
          console.log('%c📨 API response:', 'color: green', response.data);
          // Update student data with the new request from API response
          newRequest = response.data;
        }
        */
        
        // For demo: Use direct data pass instead of localStorage
        if (window.directMentorshipRequestPass) {
          window.directMentorshipRequestPass.requests = 
            window.directMentorshipRequestPass.requests || [];
            
          // Remove existing request with same ID if any
          window.directMentorshipRequestPass.requests = 
            window.directMentorshipRequestPass.requests.filter(req => req.id !== requestId);
            
          // Add new request
          window.directMentorshipRequestPass.requests.push(newRequest);
          
          console.log('%c📨 Updated direct request pass:', 'color: green', 
            window.directMentorshipRequestPass.requests);
        } else {
          window.directMentorshipRequestPass = {
            requests: [newRequest],
            timestamp: new Date().toISOString()
          };
          console.log('%c📨 Created direct request pass:', 'color: green', 
            window.directMentorshipRequestPass);
        }
      } catch (apiError) {
        console.error('API call failed:', apiError);
        throw new Error('Failed to send mentorship request to server');
      }
      
      // Update student data to reflect the new request
      setStudentData(prevData => {
        console.log('%c📨 Updating studentData with new request', 'color: purple');
        return {
          ...prevData,
          mentorshipRequests: [
            ...(prevData.mentorshipRequests || []).filter(req => req.mentorId !== mentorId),
            newRequest
          ]
        };
      });
      
      // Directly dispatch custom event for real-time update
      console.log('%c📨 Dispatching mentorshipRequestSent event', 'color: green');
      const mentorshipEvent = new CustomEvent('mentorshipRequestSent', {
        detail: { 
          request: newRequest,
          source: 'api',
          timestamp: new Date().toISOString()
        }
      });
      window.dispatchEvent(mentorshipEvent);
      
      // Visual feedback for the user
      const successMessage = document.createElement('div');
      successMessage.id = 'mentorship-success-message';
      successMessage.className = 'fixed top-4 right-4 bg-white border border-green-200 shadow-lg rounded-lg p-4 flex items-center z-50';
      successMessage.innerHTML = `
        <div class="mr-3 bg-green-100 p-2 rounded-full text-green-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p class="font-medium text-gray-800">Mentorship Request Sent!</p>
          <p class="text-sm text-gray-600">Your request has been sent to ${mentorName}</p>
        </div>
      `;
      
      // Force visibility
      successMessage.style.cssText = 'display: flex !important; opacity: 1 !important;';
      
      document.body.appendChild(successMessage);
      
      // Remove the success message after 5 seconds
      setTimeout(() => {
        successMessage.style.opacity = '0';
        successMessage.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
          if (successMessage.parentNode) {
            successMessage.parentNode.removeChild(successMessage);
          }
        }, 500);
      }, 5000);
      
      return true;
    } catch (error) {
      console.error('Error requesting mentorship:', error);
      alert('Failed to send mentorship request. Please try again.');
      return false;
    }
  };

  // Function to cancel a mentorship request
  const handleCancelRequest = async (mentorId) => {
    if (!studentData || !studentData.mentors) return;
    
    const mentor = studentData.mentors.find(m => m.id === mentorId);
    if (!mentor || mentor.status !== 'Pending') {
      console.error('Cannot cancel request: mentor not found or not in pending state', mentorId);
      return;
    }
    
    if (!confirm(`Are you sure you want to cancel your mentorship request to ${mentor.name}?`)) {
      return;
    }
    
    try {
      // In a real app, send cancellation request to API
      // For now, simulate API call and update localStorage
      /*
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      // Cancel request via API
      const response = await axios.delete(
        `http://localhost:5000/api/mentorship/requests/${mentorshipRequestId}`,
        config
      );
      */
      
      // For demonstration, update in localStorage
      // Get existing requests
      const requestsJson = localStorage.getItem('mentorshipRequests');
      if (requestsJson) {
        try {
          let requests = JSON.parse(requestsJson);
          if (!Array.isArray(requests)) requests = [];
          
          // Find the specific request for this mentor
          const requestIndex = requests.findIndex(
            req => req.mentorId === mentorId && req.status === 'pending'
          );
          
          if (requestIndex !== -1) {
            // Remove or mark as cancelled
            requests[requestIndex].status = 'cancelled';
            requests[requestIndex].cancelledAt = new Date().toISOString();
            localStorage.setItem('mentorshipRequests', JSON.stringify(requests));
            
            console.log('Cancelled mentorship request for mentor:', mentorId);
          } else {
            console.warn('No pending request found for mentor:', mentorId);
          }
        } catch (e) {
          console.error('Error updating mentorship requests in localStorage:', e);
        }
      }
      
      // Update student data to reflect cancelled request
      setUserData(prev => {
        if (!prev) return prev;
        
        // Update mentorship requests list
        const updatedRequests = (prev.mentorshipRequests || []).map(req => {
          if (req.mentorId === mentorId && req.status === 'pending') {
            return { ...req, status: 'cancelled', cancelledAt: new Date().toISOString() };
          }
          return req;
        });
        
        // Update mentor status back to Available
        const updatedMentors = (prev.mentors || []).map(m => 
          m.id === mentorId ? {...m, status: 'Available'} : m
        );
        
        return {
          ...prev,
          mentors: updatedMentors,
          mentorshipRequests: updatedRequests
        };
      });
      
      // Show notification
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-white border border-gray-200 shadow-lg rounded-lg p-4 flex items-center transition-opacity duration-500 z-50';
      notification.innerHTML = `
        <div class="mr-3 text-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="font-medium">Mentorship request cancelled</p>
        </div>
      `;
      document.body.appendChild(notification);
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
          if (notification.parentNode) {
            document.body.removeChild(notification);
          }
        }, 500);
      }, 3000);
      
    } catch (error) {
      console.error('Error cancelling mentorship request:', error);
      alert('Failed to cancel mentorship request. Please try again.');
    }
  };

  // Add a test button to the profile section to trigger mentorship request
  const renderTestMentorshipButton = () => {
    return (
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-md font-medium mb-2">Test Mentorship Request</h3>
        <p className="text-sm text-gray-600 mb-3">
          Click the button below to send a test mentorship request (for debugging purposes)
        </p>
        <button
          onClick={() => {
            console.log('Test mentorship request button clicked');
            handleRequestMentorship('test-mentor-id');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
        >
          Send Test Request
        </button>
      </div>
    );
  };

  // Function to render the student profile section
  const renderStudentProfile = () => {
    return (
      <div className="p-6">
        <div className="space-y-6">
          {/* Personal Information */}
          <div>
            <h4 className="text-lg font-medium mb-4">Personal Information</h4>
            {isEditing ? (
              // Editing mode - show form
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-1">
                  <label className="text-sm text-gray-500 font-medium">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editedData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-500 font-medium">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={editedData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-500 font-medium">Enrollment Number</label>
                  <input
                    type="text"
                    name="enrollmentNumber"
                    value={editedData.enrollmentNumber}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-500 font-medium">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editedData.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-500 font-medium">Branch</label>
                  <input
                    type="text"
                    name="branch"
                    value={editedData.branch}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-500 font-medium">Year</label>
                  <input
                    type="text"
                    name="year"
                    value={editedData.year}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
            ) : (
              // View mode - show data
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 font-medium">Full Name</p>
                  <p className="text-base">{studentData.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 font-medium">Email Address</p>
                  <p className="text-base">{studentData.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 font-medium">Enrollment Number</p>
                  <p className="text-base">{studentData.enrollmentNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 font-medium">Phone Number</p>
                  <p className="text-base">{studentData.phone || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 font-medium">Branch</p>
                  <p className="text-base">{studentData.branch}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500 font-medium">Year</p>
                  <p className="text-base">{studentData.year}</p>
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              {isEditing ? (
                <>
                  <Button 
                    className="flex items-center" 
                    variant="outline"
                    onClick={cancelEditing}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex items-center" 
                    onClick={saveProfileChanges}
                  >
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button 
                  className="flex items-center" 
                  variant="outline"
                  onClick={startEditing}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
          
          {/* Academic Information */}
          <div className="pt-4 border-t">
            <h4 className="text-lg font-medium mb-4">Academic Information</h4>
            <p className="text-gray-600 mb-4">Your academic achievements and activities will be visible to alumni who can help with mentorship opportunities.</p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">No academic information added yet</span>
                <Button size="sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Add Details
                </Button>
              </div>
            </div>
          </div>
          
          {/* Career Interests */}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium">Career Interests</h4>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={resetStudentData}
              >
                Reset Profile Data
              </Button>
            </div>
            <p className="text-gray-600 mb-4">Specify your career interests to receive personalized job recommendations and connect with relevant alumni.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {['Software Development', 'Data Science', 'UI/UX Design'].map((interest, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-primary-blue/10 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span className="text-sm font-medium">{interest}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Edit Interests
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // In your renderTabContent function, find the profile tab and add the test button
  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'profile':
        return (
          <div className="bg-white rounded-lg shadow-md">
            {renderStudentProfile()}
            {renderTestMentorshipButton()} {/* Add test button to profile section */}
          </div>
        );
      case 'overview':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Mentor Connections</CardTitle>
                  <CardDescription>Active mentoring relationships</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary-blue">{studentData.stats.mentorConnections}</div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link to="/mentors" className="text-sm text-primary-blue hover:underline">Find more mentors</Link>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Saved Jobs</CardTitle>
                  <CardDescription>Opportunities you're interested in</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary-blue">{studentData.stats.savedJobs}</div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link to="/jobs" className="text-sm text-primary-blue hover:underline">View saved jobs</Link>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Applications</CardTitle>
                  <CardDescription>Jobs you've applied to</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary-blue">{studentData.stats.pendingApplications}</div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link to="/applications" className="text-sm text-primary-blue hover:underline">Track applications</Link>
                </CardFooter>
              </Card>
            </div>
            
            {/* Recent Events Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Connect with alumni and career opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentData.events.map(event => (
                    <div key={event.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <div className="flex items-center mt-1 text-sm text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            {event.date}
                          </div>
                          <div className="flex items-center mt-1 text-sm text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            {event.location} ({event.type})
                          </div>
                        </div>
                        <Button variant="rsvp" size="sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                          RSVP
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="ml-auto">
                  View All Events
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
      case 'jobs':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Job Opportunities</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowFilterMenu(!showFilterMenu);
                      setShowSortMenu(false);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    Filter
                  </Button>
                  
                  {showFilterMenu && (
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg z-10 p-4 border">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                          </label>
                          <select 
                            className="w-full p-2 border rounded-md bg-white text-gray-800"
                            value={jobFilters.location}
                            onChange={(e) => handleFilterChange('location', e.target.value)}
                          >
                            {jobLocations.map(location => (
                              <option key={location} value={location}>
                                {location === 'all' ? 'All Locations' : location}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Job Type
                          </label>
                          <select 
                            className="w-full p-2 border rounded-md bg-white text-gray-800"
                            value={jobFilters.jobType}
                            onChange={(e) => handleFilterChange('jobType', e.target.value)}
                          >
                            {jobTypes.map(type => (
                              <option key={type} value={type}>
                                {type === 'all' ? 'All Types' : type}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex items-center">
                          <input 
                            type="checkbox"
                            id="saved-only"
                            checked={jobFilters.showSavedOnly}
                            onChange={(e) => handleFilterChange('showSavedOnly', e.target.checked)}
                            className="rounded text-primary-blue mr-2"
                          />
                          <label htmlFor="saved-only" className="text-sm text-gray-700">
                            Show saved jobs only
                          </label>
                        </div>
                        
                        <div className="pt-2 flex justify-end">
                          <Button 
                            size="sm"
                            onClick={() => {
                              setJobFilters({
                                location: 'all',
                                jobType: 'all',
                                showSavedOnly: false
                              });
                            }}
                          >
                            Reset Filters
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowSortMenu(!showSortMenu);
                      setShowFilterMenu(false);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="21" y1="10" x2="7" y2="10"></line>
                      <line x1="21" y1="6" x2="3" y2="6"></line>
                      <line x1="21" y1="14" x2="3" y2="14"></line>
                      <line x1="21" y1="18" x2="7" y2="18"></line>
                    </svg>
                    Sort
                  </Button>
                  
                  {showSortMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border overflow-hidden">
                      <div className="py-1">
                        {[
                          { id: 'deadline', label: 'Deadline (Soonest)' },
                          { id: 'newest', label: 'Recently Posted' },
                          { id: 'company', label: 'Company Name' },
                          { id: 'title', label: 'Job Title' }
                        ].map(option => (
                          <button
                            key={option.id}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800 ${jobSortOption === option.id ? 'bg-gray-100 font-medium' : ''}`}
                            onClick={() => handleSortChange(option.id)}
                          >
                            {option.label}
                            {jobSortOption === option.id && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Filter summary labels */}
            {(jobFilters.location !== 'all' || jobFilters.jobType !== 'all' || jobFilters.showSavedOnly) && (
              <div className="flex flex-wrap gap-2 items-center text-sm">
                <span className="text-gray-600">Active filters:</span>
                
                {jobFilters.location !== 'all' && (
                  <span className="bg-gray-100 px-2 py-1 rounded-full flex items-center">
                    Location: {jobFilters.location}
                    <button 
                      className="ml-1 text-gray-500 hover:text-gray-700"
                      onClick={() => handleFilterChange('location', 'all')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </span>
                )}
                
                {jobFilters.jobType !== 'all' && (
                  <span className="bg-gray-100 px-2 py-1 rounded-full flex items-center">
                    Type: {jobFilters.jobType}
                    <button 
                      className="ml-1 text-gray-500 hover:text-gray-700"
                      onClick={() => handleFilterChange('jobType', 'all')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </span>
                )}
                
                {jobFilters.showSavedOnly && (
                  <span className="bg-gray-100 px-2 py-1 rounded-full flex items-center">
                    Saved only
                    <button 
                      className="ml-1 text-gray-500 hover:text-gray-700"
                      onClick={() => handleFilterChange('showSavedOnly', false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </span>
                )}
              </div>
            )}
            
            <div className="grid gap-4">
              {filteredAndSortedJobs.length > 0 ? (
                filteredAndSortedJobs.map(job => (
                  <Card key={job.id} className="job-card">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-medium">{job.title}</h4>
                          <p className="text-gray-600">{job.company}</p>
                          <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                              </svg>
                              {job.location}
                            </div>
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                              </svg>
                              {job.deadline}
                            </div>
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                              </svg>
                              {job.jobType}
                            </div>
                          </div>
                          <p className="mt-2 text-sm text-gray-600">{job.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            data-job-id={job.id}
                            onClick={() => toggleJobSaved(job.id)}
                            className={`transition-all duration-300 ${job.saved ? 'border-primary-blue bg-blue-50 text-primary-blue' : ''}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-1 transition-colors duration-300 ${job.saved ? 'fill-primary-blue text-primary-blue' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                            </svg>
                            {job.saved ? 'Saved' : 'Save'}
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => {
                              // Open a job application page in a new tab
                              const applicationUrls = {
                                'Google': 'https://careers.google.com',
                                'Microsoft': 'https://careers.microsoft.com',
                                'Amazon': 'https://www.amazon.jobs',
                                'Adobe': 'https://www.adobe.com/careers.html',
                                'Netflix': 'https://jobs.netflix.com'
                              };
                              
                              // Get the application URL based on company name, or default to LinkedIn
                              const applicationUrl = applicationUrls[job.company] || 'https://www.linkedin.com/jobs';
                              window.open(applicationUrl, '_blank');
                            }}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-gray-500 mb-2">No jobs found matching your filters.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setJobFilters({
                        location: 'all',
                        jobType: 'all',
                        showSavedOnly: false
                      });
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex justify-center">
              <Button as={Link} to="/jobs" variant="outline">
                Browse All Job Opportunities
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Button>
            </div>
          </div>
        );
      case 'mentors':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Your Mentors</h3>
              <div className="flex space-x-2">
                {/* Add filter dropdown for available mentors */}
                <div className="relative">
                  <Button variant="outline">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    Filter
                  </Button>
                </div>
                
                <Button as={Link} to="/find-mentors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="18" y1="8" x2="23" y2="13"></line>
                    <line x1="23" y1="8" x2="18" y2="13"></line>
                  </svg>
                  Find New Mentors
                </Button>
              </div>
            </div>
            
            {/* Mentorship Requests Tracking */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Mentorship Requests</CardTitle>
                <CardDescription>Track your pending and completed mentorship requests</CardDescription>
              </CardHeader>
              <CardContent>
                {studentData.mentorshipRequests && studentData.mentorshipRequests.length > 0 ? (
                  <div className="space-y-4">
                    {studentData.mentorshipRequests.map(request => {
                      const mentor = studentData.mentors.find(m => m.id === request.mentorId);
                      if (!mentor) return null;
                      
                      return (
                        <div key={request.id} className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{mentor.name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  request.status === 'accepted' 
                                    ? 'bg-green-100 text-green-700'
                                    : request.status === 'rejected'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{mentor.position} at {mentor.company}</p>
                              <p className="text-sm text-gray-500 mt-2">Sent on {new Date(request.sentDate).toLocaleDateString()}</p>
                              <p className="text-sm mt-2">{request.message}</p>
                            </div>
                            {request.status === 'pending' && (
                              <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700">
                                Cancel Request
                              </Button>
                            )}
                            {request.status === 'accepted' && (
                              <Button size="sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                </svg>
                                Message
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">You don't have any active mentorship requests.</p>
                    <p className="text-sm text-gray-600">Request mentorship from alumni to get personalized career guidance.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Available Mentors */}
            <h4 className="font-medium text-lg mt-4 mb-2">Available Mentors</h4>
            <div className="grid gap-4">
              {studentData.mentors.filter(mentor => mentor.status === 'Available').map(mentor => (
                <Card key={mentor.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="h-12 w-12 bg-primary-blue/10 rounded-full flex items-center justify-center">
                          <span className="text-primary-blue font-medium">
                            {getInitials(mentor.name)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{mentor.name}</h4>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                              {mentor.status}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">{mentor.position}</p>
                          <p className="text-gray-600 text-sm">{mentor.company}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {mentor.expertise && mentor.expertise.map((skill, i) => (
                              <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewMentorProfile(mentor.id)}>
                          View Profile
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleRequestMentorship(mentor.id)}
                        >
                          Request Mentorship
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Active Mentors */}
            <h4 className="font-medium text-lg mt-6 mb-2">Active Mentorships</h4>
            <div className="grid gap-4">
              {studentData.mentors.filter(mentor => mentor.status === 'Active').map(mentor => (
                <Card key={mentor.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="h-12 w-12 bg-primary-blue/10 rounded-full flex items-center justify-center">
                          <span className="text-primary-blue font-medium">
                            {getInitials(mentor.name)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{mentor.name}</h4>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                              {mentor.status}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">{mentor.position}</p>
                          <p className="text-gray-600 text-sm">{mentor.company}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          variant="outline"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v6M12 18v4M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M16 12h6M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24"></path>
                          </svg>
                          Schedule Meeting
                        </Button>
                        <Button size="sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                          </svg>
                          Message
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Pending Requests */}
            <h4 className="font-medium text-lg mt-6 mb-2">Pending Requests</h4>
            <div className="grid gap-4">
              {studentData.mentors.filter(mentor => mentor.status === 'Pending').map(mentor => (
                <Card key={mentor.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="h-12 w-12 bg-primary-blue/10 rounded-full flex items-center justify-center">
                          <span className="text-primary-blue font-medium">
                            {getInitials(mentor.name)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{mentor.name}</h4>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                              {mentor.status}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">{mentor.position}</p>
                          <p className="text-gray-600 text-sm">{mentor.company}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          variant="outline"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleCancelRequest(mentor.id)}
                        >
                          Cancel Request
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      default:
        return <div>Content not found</div>;
    }
  };

  // One-time execution when component loads - clear any conflicting data
  (function cleanupLocalStorage() {
    try {
      // Preserve only specific student-related keys and clear others
      const keysToPreserve = ['userName', 'userId', 'userData', 'userType', 'token'];
      const allKeys = Object.keys(localStorage);
      
      // If userType is alumni but we're on student page, force reset it
      if (localStorage.getItem('userType') === 'alumni') {
        console.warn('Found alumni userType in localStorage while on student page - resetting');
        localStorage.setItem('userType', 'student');
      }
      
      // Look for keys that might have alumni data
      const alumniKeys = allKeys.filter(key => 
        key.toLowerCase().includes('alumni') || 
        key === 'company' || 
        key === 'position' || 
        key === 'gradYear'
      );
      
      if (alumniKeys.length > 0) {
        console.warn('Found potential alumni data keys in localStorage:', alumniKeys);
        alumniKeys.forEach(key => localStorage.removeItem(key));
      }
      
      console.log('Local storage cleanup complete');
    } catch (error) {
      console.error('Error in cleanup function:', error);
    }
  })();

  // Final check of student name right before rendering
  console.log('FINAL CHECK - Student name used for rendering:', studentData?.name);
  
  // Show error message if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
          <div className="mb-6 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Connection Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => window.location.href = '/login'}
              className="py-2 px-4 bg-primary-blue text-white rounded hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
            <button
              onClick={() => window.location.reload()}
              className="py-2 px-4 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22%3E%3Cg fill=%22%23e6e6e6%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/svg%3E')">
      <DashboardNavbar userType="student" />
      
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Header - Styled like the alumni dashboard */}
          <header className="bg-white shadow">
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div className="mb-4 md:mb-0">
                  <h1 className="text-2xl font-bold text-gray-800">Welcome back, {studentData.name}!</h1>
                  <p className="text-gray-600">{studentData.branch} - {studentData.year}</p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab('profile')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                      <circle cx="8.5" cy="7" r="4"/>
                      <line x1="18" y1="8" x2="23" y2="13"></line>
                      <line x1="23" y1="8" x2="18" y2="13"></line>
                    </svg>
                    Profile
                  </Button>
                  <Button className="animate-pulse-button">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Connect with Alumni
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="container mx-auto px-4 py-8">
            {/* Tabs - Styled like the alumni dashboard */}
            <div className="border-b mb-8">
              <div className="flex justify-center space-x-8 mb-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-2 mb-px text-sm font-medium ${
                    activeTab === 'overview'
                      ? 'border-primary-blue text-white bg-primary-blue'
                      : 'bg-white text-primary-blue hover:text-white hover:bg-primary-blue border-primary-blue'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className={`px-2 mb-px text-sm font-medium ${
                    activeTab === 'jobs'
                      ? 'border-primary-blue text-white bg-primary-blue'
                      : 'bg-white text-primary-blue hover:text-white hover:bg-primary-blue border-primary-blue'
                  }`}
                >
                  Job Opportunities
                </button>
                <button
                  onClick={() => setActiveTab('mentors')}
                  className={`px-2 mb-px text-sm font-medium ${
                    activeTab === 'mentors'
                      ? 'border-primary-blue text-white bg-primary-blue'
                      : 'bg-white text-primary-blue hover:text-white hover:bg-primary-blue border-primary-blue'
                  }`}
                >
                  Mentors
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-2 mb-px text-sm font-medium ${
                    activeTab === 'profile'
                      ? 'border-primary-blue text-white bg-primary-blue'
                      : 'bg-white text-primary-blue hover:text-white hover:bg-primary-blue border-primary-blue'
                  }`}
                >
                  Profile
                </button>
              </div>
            </div>
            
            {/* Tab content - Keep student-specific content */}
            {renderTabContent()}
          </main>
        </>
      )}
    </div>
  );
};

export default StudentDashboard; 