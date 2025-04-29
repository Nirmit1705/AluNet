import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Users, CheckCircle, XCircle, Clock, Calendar, Search, Filter, X, Briefcase, GraduationCap, BookOpen, AlertCircle } from "lucide-react";
import Navbar from "../layout/Navbar";
import axios from "axios";

const MentorshipRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    programs: [],
    years: [],
    skills: []
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingRequestIds, setProcessingRequestIds] = useState([]);
  
  // Fetch mentorship requests from API
  const fetchMentorshipRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/mentorship/alumni`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log("Fetched mentorship requests:", response.data);
      
      // Transform the data to match our component's expected format
      const transformedRequests = response.data.map(request => ({
        id: request._id,
        studentName: request.student?.name || 'Unknown Student',
        studentId: request.student?._id || '',
        program: request.student?.branch || 'Unknown Program',
        year: request.student?.currentYear ? `${request.student.currentYear} Year` : 'Unknown Year',
        avatarUrl: request.student?.profilePicture?.url || null,
        skills: request.student?.skills || [],
        interests: request.student?.interests || [],
        requestDate: new Date(request.requestDate).toISOString(),
        message: request.requestMessage || '',
        goals: request.mentorshipGoals ? [request.mentorshipGoals] : [],
        availability: [request.availability] || ['Not specified'],
        preferredMentorshipType: request.meetingMode || 'Not specified',
        status: request.status,
        skillsToLearn: request.skillsToLearn || [],
        timeRequired: request.timeRequired || 'Not specified',
        meetingFrequency: request.meetingFrequency || 'Not specified',
        requestedSessions: request.requestedSessions || 5 // Include requested sessions
      }));
      
      setRequests(transformedRequests);
    } catch (err) {
      console.error("Error fetching mentorship requests:", err);
      setError(err.response?.data?.message || err.message || "Failed to load mentorship requests");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchMentorshipRequests();
  }, [fetchMentorshipRequests]);
  
  // Navigate back to dashboard
  const goBack = () => {
    navigate(-1);
  };
  
  // Handle search input
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    if (e.target.value === "") {
      // Don't reset to sample data, just show all fetched requests
      return;
    }
    
    // Filter the actual requests based on search term
    const searchTerm = e.target.value.toLowerCase();
    const filtered = requests.filter(
      request => 
        request.studentName.toLowerCase().includes(searchTerm) ||
        request.program.toLowerCase().includes(searchTerm) ||
        request.skills.some(skill => skill.toLowerCase().includes(searchTerm)) ||
        request.interests.some(interest => interest.toLowerCase().includes(searchTerm))
    );
  };
  
  // Toggle filter panel
  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };
  
  // View request details
  const viewRequestDetails = (request) => {
    setSelectedRequest(request);
  };
  
  // Close request details
  const closeRequestDetails = () => {
    setSelectedRequest(null);
  };
  
  // Accept a mentorship request
  const acceptRequest = async (requestId) => {
    try {
      setProcessingRequestIds(prev => [...prev, requestId]);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/mentorship/${requestId}/respond`,
        { 
          status: 'accepted',
          responseMessage: 'I would be happy to mentor you!' 
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log("Accepted mentorship request:", response.data);
      
      // Update the local state to reflect the change
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'accepted' } 
            : req
        )
      );
      
      // Close the detail view
      setSelectedRequest(null);
      
      // Show confirmation message
      alert(`You have accepted the mentorship request from ${requests.find(req => req.id === requestId)?.studentName}`);
      
      // Refresh the requests
      fetchMentorshipRequests();
    } catch (err) {
      console.error("Error accepting mentorship request:", err);
      alert("Failed to accept mentorship request. Please try again.");
    } finally {
      setProcessingRequestIds(prev => prev.filter(id => id !== requestId));
    }
  };
  
  // Decline a mentorship request
  const declineRequest = async (requestId) => {
    try {
      setProcessingRequestIds(prev => [...prev, requestId]);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/mentorship/${requestId}/respond`,
        { 
          status: 'rejected',
          responseMessage: 'Sorry, I am not available for mentorship at this time.' 
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log("Declined mentorship request:", response.data);
      
      // Update the local state to reflect the change
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'rejected' } 
            : req
        )
      );
      
      // Close the detail view
      setSelectedRequest(null);
      
      // Show confirmation message
      alert(`You have declined the mentorship request from ${requests.find(req => req.id === requestId)?.studentName}`);
      
      // Refresh the requests
      fetchMentorshipRequests();
    } catch (err) {
      console.error("Error declining mentorship request:", err);
      alert("Failed to decline mentorship request. Please try again.");
    } finally {
      setProcessingRequestIds(prev => prev.filter(id => id !== requestId));
    }
  };
  
  // Get initials from name
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-custom pt-20">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-custom pt-20">
          <div className="mb-6 flex items-center">
            <button 
              onClick={goBack}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold">Mentorship Requests</h1>
          </div>
          
          <div className="glass-card rounded-xl p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">Error Loading Requests</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <button
              onClick={fetchMentorshipRequests}
              className="px-4 py-2 bg-primary text-white rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-custom pt-20">
        {/* Header with back button */}
        <div className="mb-6 flex items-center">
          <button 
            onClick={goBack}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold">Mentorship Requests</h1>
        </div>
        
        {/* Search and filter bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, program, skills, or interests..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <button
            onClick={toggleFilter}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
              filterOpen 
                ? "bg-primary text-white" 
                : "border border-input hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>
        
        {/* Filter panel - keep as is */}
        {/* ...existing filter panel code... */}
        
        {/* Results count */}
        <div className="mb-6">
          <p className="text-muted-foreground">Showing {requests.length} mentorship requests</p>
        </div>
        
        {/* Requests grid */}
        {requests.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Mentorship Requests Found</h3>
            <p className="text-muted-foreground mb-6">You currently don't have any pending mentorship requests.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {requests.filter(req => req.status === 'pending').map((request) => (
              <div key={request.id} className="glass-card rounded-xl p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => viewRequestDetails(request)}>
                <div className="flex items-start">
                  <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4 text-lg font-bold">
                    {request.avatarUrl ? (
                      <img src={request.avatarUrl} alt={request.studentName} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      getInitials(request.studentName)
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-lg">{request.studentName}</h4>
                    <p className="text-sm text-muted-foreground">{request.program} • {request.year}</p>
                    <div className="flex items-center mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground mr-1.5" />
                      <span className="text-xs text-muted-foreground">Requested on {formatDate(request.requestDate)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="mb-3">
                    <p className="text-xs font-medium mb-1">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {request.skills.map((skill, idx) => (
                        <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs font-medium mb-1">Interests</p>
                    <div className="flex flex-wrap gap-1">
                      {request.interests.map((interest, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-full">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm mt-3 line-clamp-3">
                    {request.message}
                  </p>
                </div>
                
                <div className="mt-4 text-center">
                  <button className="w-full px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors">
                    View Request Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 w-full max-w-3xl rounded-xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-border z-10 flex justify-between items-center">
              <h2 className="text-xl font-bold">Mentorship Request Details</h2>
              <button 
                onClick={closeRequestDetails}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Student details */}
              <div className="flex items-start mb-6">
                <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-5 text-xl font-bold">
                  {selectedRequest.avatarUrl ? (
                    <img src={selectedRequest.avatarUrl} alt={selectedRequest.studentName} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    getInitials(selectedRequest.studentName)
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedRequest.studentName}</h3>
                  <p className="text-muted-foreground">{selectedRequest.program} • {selectedRequest.year}</p>
                  <p className="text-sm mt-1">Student ID: {selectedRequest.studentId}</p>
                  <div className="flex items-center mt-2">
                    <Clock className="h-4 w-4 text-muted-foreground mr-1.5" />
                    <span className="text-sm text-muted-foreground">Request received on {formatDate(selectedRequest.requestDate)}</span>
                  </div>
                </div>
              </div>
              
              {/* Message */}
              <div className="glass-card rounded-xl p-5 mb-6">
                <h4 className="font-medium mb-3">Message from Student</h4>
                <p className="text-muted-foreground">{selectedRequest.message}</p>
              </div>
              
              {/* Student information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Skills & Interests */}
                <div className="glass-card rounded-xl p-5">
                  <div className="flex items-center mb-4">
                    <BookOpen className="h-5 w-5 text-primary mr-2" />
                    <h4 className="font-medium">Skills & Interests</h4>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRequest.skills.map((skill, idx) => (
                        <span key={idx} className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Interests</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRequest.interests.map((interest, idx) => (
                        <span key={idx} className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Mentorship Goals */}
                <div className="glass-card rounded-xl p-5">
                  <div className="flex items-center mb-4">
                    <GraduationCap className="h-5 w-5 text-primary mr-2" />
                    <h4 className="font-medium">Mentorship Goals</h4>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Goals</p>
                    <ul className="space-y-2">
                      {selectedRequest.goals.map((goal, idx) => (
                        <li key={idx} className="flex items-start">
                          <div className="min-w-5 mt-0.5 mr-2">
                            <span className="inline-block h-1.5 w-1.5 bg-primary rounded-full"></span>
                          </div>
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {selectedRequest.skillsToLearn && selectedRequest.skillsToLearn.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Skills to Learn</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedRequest.skillsToLearn.map((skill, idx) => (
                          <span key={idx} className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Availability & Preferences */}
              <div className="glass-card rounded-xl p-5 mb-6">
                <div className="flex items-center mb-4">
                  <Calendar className="h-5 w-5 text-primary mr-2" />
                  <h4 className="font-medium">Availability & Preferences</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Available Times</p>
                    <ul className="space-y-1">
                      {selectedRequest.availability.map((time, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">• {time}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Preferred Format</p>
                    <p className="text-sm text-muted-foreground">{selectedRequest.preferredMentorshipType}</p>
                    {selectedRequest.timeRequired && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Time Required</p>
                        <p className="text-sm text-muted-foreground">{selectedRequest.timeRequired}</p>
                      </div>
                    )}
                    {selectedRequest.meetingFrequency && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Meeting Frequency</p>
                        <p className="text-sm text-muted-foreground">{selectedRequest.meetingFrequency}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Requested Sessions</p>
                    <p className="text-sm text-muted-foreground">{selectedRequest.requestedSessions} sessions</p>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={() => declineRequest(selectedRequest.id)}
                  className="px-5 py-2.5 border border-red-200 text-red-500 rounded-lg flex items-center justify-center gap-2 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={processingRequestIds.includes(selectedRequest.id)}
                >
                  {processingRequestIds.includes(selectedRequest.id) ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5" />
                      Decline Request
                    </>
                  )}
                </button>
                <button
                  onClick={() => acceptRequest(selectedRequest.id)}
                  className="px-5 py-2.5 bg-primary text-white rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={processingRequestIds.includes(selectedRequest.id)}
                >
                  {processingRequestIds.includes(selectedRequest.id) ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Accept as Mentee
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorshipRequestsPage;