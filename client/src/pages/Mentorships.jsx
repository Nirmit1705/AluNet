import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Search, 
  Filter, 
  Calendar, 
  ArrowUpDown, 
  Clock, 
  Star,
  Mail, 
  MessageSquare, 
  X,
  ChevronLeft,
  ChevronRight,
  Linkedin
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import axios from "axios";

const MentorshipsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [mentorships, setMentorships] = useState([]);
  const [filteredMentorships, setFilteredMentorships] = useState([]);
  const [showMentorshipModal, setShowMentorshipModal] = useState(false);
  const [selectedMentorship, setSelectedMentorship] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState({ rating: 0, feedback: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch mentorships data from API
  useEffect(() => {
    const fetchMentorships = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        // First check if any sessions have expired
        try {
          await axios.get(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/mentorship/sessions/check-expired`
          );
        } catch (err) {
          console.warn("Failed to check expired sessions", err);
          // Continue anyway since this is just a helper
        }
        
        // Make API request to get student's mentorships
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/mentorship/student`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        console.log("Fetched mentorships data:", response.data);
        
        // Transform the data to match our component's expected format
        const transformedMentorships = response.data.map(mentorship => {
          // Get mentorship status
          const status = mentorship.status === 'accepted' ? 'active' : mentorship.status;
          
          // Get next session data if exists
          let nextSession = null;
          if (mentorship.nextSessionDate) {
            nextSession = new Date(mentorship.nextSessionDate).toISOString();
          }
          
          // Calculate progress based on completed and total sessions
          const completedSessions = mentorship.sessionsCompleted || 0;
          const totalSessions = mentorship.totalPlannedSessions || 5;
          const progress = totalSessions > 0 ? Math.floor((completedSessions / totalSessions) * 100) : 0;
          
          return {
            id: mentorship._id,
            mentorName: mentorship.alumni?.name || "Unnamed Mentor",
            mentorTitle: mentorship.alumni?.position 
              ? `${mentorship.alumni.position} at ${mentorship.alumni.company || 'Company'}`
              : "Mentor",
            mentorAvatar: mentorship.alumni?.profilePicture?.url || null,
            startDate: mentorship.startDate || mentorship.createdAt,
            nextSession: nextSession,
            totalSessions: totalSessions,
            completedSessions: completedSessions,
            focusAreas: mentorship.skillsToLearn || ["General mentorship"],
            status: status,
            progress: progress,
            notes: mentorship.mentorshipGoals || "Working on mentorship goals.",
            contact: {
              email: mentorship.alumni?.email || "unknown@example.com",
              linkedin: mentorship.alumni?.linkedin || "#"
            },
            rating: 0, // Initialize with 0, can be updated with feedback data
            ratingCount: 0
          };
        });
        
        setMentorships(transformedMentorships);
        setFilteredMentorships(transformedMentorships);
      } catch (err) {
        console.error("Error fetching mentorships:", err);
        setError(err.response?.data?.message || err.message || "Failed to load mentorships");
        
        // Initialize with empty arrays on error
        setMentorships([]);
        setFilteredMentorships([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMentorships();
    
    // Set up an interval to check for expired sessions every minute
    const intervalId = setInterval(() => {
      axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/mentorship/sessions/check-expired`
      ).catch(err => console.warn("Background session check failed", err));
    }, 60000); // 1 minute interval
    
    return () => clearInterval(intervalId);
  }, [navigate]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...mentorships];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        mentorship => 
          mentorship.mentorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mentorship.mentorTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mentorship.focusAreas.some(area => area.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(mentorship => mentorship.status === statusFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "name":
          comparison = a.mentorName.localeCompare(b.mentorName);
          break;
        case "date":
          comparison = new Date(a.startDate) - new Date(b.startDate);
          break;
        case "progress":
          comparison = a.progress - b.progress;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });
    
    setFilteredMentorships(result);
  }, [mentorships, searchTerm, statusFilter, sortBy, sortOrder]);

  const handleViewDetails = (mentorship) => {
    setSelectedMentorship(mentorship);
    setShowMentorshipModal(true);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const openFeedbackModal = (mentorship) => {
    setSelectedMentorship(mentorship);
    setFeedbackData({ rating: 0, feedback: "" }); // Reset feedback data
    setShowFeedbackModal(true);
  };

  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setSelectedMentorship(null);
  };

  const submitFeedback = (mentorshipId) => {
    if (!feedbackData.rating) {
      alert("Please provide a rating before submitting feedback.");
      return;
    }
    if (!feedbackData.feedback.trim()) {
      alert("Please provide feedback before submitting.");
      return;
    }
  
    // Find the mentorship
    const mentorshipIndex = mentorships.findIndex((m) => m.id === mentorshipId);
    if (mentorshipIndex === -1) return;
  
    // Update the mentor's rating
    const mentorship = mentorships[mentorshipIndex];
    const newRatingCount = mentorship.ratingCount + 1;
    const newRating =
      (mentorship.rating * mentorship.ratingCount + feedbackData.rating) /
      newRatingCount;
  
    mentorships[mentorshipIndex] = {
      ...mentorship,
      rating: parseFloat(newRating.toFixed(1)), // Update average rating
      ratingCount: newRatingCount, // Update rating count
    };
  
    // Update state
    setMentorships([...mentorships]);
    setFilteredMentorships([...mentorships]);
  
    alert("Thank you for your feedback!");
  
    // Simulate backend update (e.g., API call)
    console.log("Updated mentor profile:", mentorship);
  
    // Close modal after submission
    closeFeedbackModal();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            className="px-4 py-2 bg-primary text-white rounded-lg"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex items-center mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">My Mentorships</h1>
      </div>
      
      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by mentor name or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSort("name")}>
                By Mentor Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("date")}>
                By Start Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("progress")}>
                By Progress
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Mentorships list */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Mentor</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Focus Areas</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Progress</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Next Session</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMentorships.length > 0 ? (
                filteredMentorships.map((mentorship) => (
                  <tr 
                    key={mentorship.id} 
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3 border border-primary/20">
                          <AvatarImage src={mentorship.mentorAvatar} alt={mentorship.mentorName} />
                          <AvatarFallback>{mentorship.mentorName.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{mentorship.mentorName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{mentorship.mentorTitle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {mentorship.focusAreas.map((area, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="mr-4 min-w-[3rem] text-sm">
                          {mentorship.progress}%
                        </div>
                        <div className="w-full max-w-[100px] bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              mentorship.status === "completed" 
                                ? "bg-green-500" 
                                : mentorship.status === "paused" 
                                  ? "bg-amber-500" 
                                  : "bg-primary"
                            }`}
                            style={{ width: `${mentorship.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {mentorship.nextSession ? (
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {new Date(mentorship.nextSession).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        mentorship.status === "active" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                          : mentorship.status === "paused" 
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" 
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}>
                        {mentorship.status.charAt(0).toUpperCase() + mentorship.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* <Button 
                          variant="outline" 
                          size="sm" 
                          className="px-2"
                          onClick={() => navigate(`/messages/${mentorship.id}`)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button> */}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(mentorship)}
                        >
                          View Details
                        </Button>
                        {/* Add "Rate & Feedback" button for completed mentorships */}
                        {mentorship.status === "completed" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            bg="primary"
                            onClick={() => openFeedbackModal(mentorship)}
                          >
                            Rate & Feedback
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <Users className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-lg font-medium mb-1">No mentorships found</p>
                    <p className="text-sm max-w-md mx-auto mb-6">
                      {searchTerm || statusFilter !== "all" 
                        ? "Try adjusting your filters to see more results" 
                        : "You don't have any mentorships yet. Connect with a mentor to get started."}
                    </p>
                    {!searchTerm && statusFilter === "all" && (
                      <Button onClick={() => navigate("/connected-mentors")}>
                        Find a Mentor
                      </Button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
                  <p className="font-medium">
                    {selectedMentorship.nextSession 
                      ? new Date(selectedMentorship.nextSession).toLocaleDateString() 
                      : "No upcoming sessions"}
                  </p>
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
                    className={`h-2 rounded-full ${
                      selectedMentorship.status === "completed" 
                        ? "bg-green-500" 
                        : selectedMentorship.status === "paused" 
                          ? "bg-amber-500" 
                          : "bg-primary"
                    }`}
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
              <Button
                variant="outline"
                onClick={() => setShowMentorshipModal(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowMentorshipModal(false);
                  navigate(`/messages/${selectedMentorship.id}`);
                }}
              >
                Message Mentor
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedMentorship && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-xl p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Rate & Feedback</h3>
              <button
                onClick={closeFeedbackModal}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitFeedback(selectedMentorship.id);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Rate this mentorship</label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`h-6 w-6 ${
                        feedbackData.rating >= star ? "text-yellow-500" : "text-gray-300"
                      }`}
                      onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                    >
                      <Star className="h-6 w-6" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Provide Feedback</label>
                <textarea
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  rows="3"
                  placeholder="Write your feedback here..."
                  value={feedbackData.feedback}
                  onChange={(e) =>
                    setFeedbackData({ ...feedbackData, feedback: e.target.value })
                  }
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorshipsPage;