import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronLeft, Users, MessageSquare, Calendar, Search, Filter, X, Clock, BookOpen, GraduationCap, Clipboard, UserMinus, UserCheck } from "lucide-react";
import Navbar from "../layout/Navbar";

// Sample data for current mentees
const currentMenteesData = [
  {
    id: 1,
    name: "Sophia Williams",
    avatarUrl: null,
    program: "Computer Engineering",
    year: "4th Year",
    role: "Student",
    lastInteraction: "2 days ago",
    nextSession: "May 20, 2023",
    mentorshipDuration: "3 months",
    goals: ["Prepare for technical interviews", "Build portfolio projects", "Learn industry best practices"],
    skills: ["Java", "Python", "Machine Learning"],
    interests: ["AI", "Robotics"]
  },
  {
    id: 2,
    name: "Michael Chen",
    avatarUrl: null,
    program: "Information Systems",
    year: "3rd Year",
    role: "Student",
    lastInteraction: "1 week ago",
    nextSession: "May 18, 2023",
    mentorshipDuration: "2 months",
    goals: ["Land an internship", "Develop frontend skills", "Network with professionals"],
    skills: ["UI/UX", "React", "Node.js"],
    interests: ["Web Development", "Product Design"]
  },
  {
    id: 3,
    name: "Olivia Johnson",
    avatarUrl: null,
    program: "Software Engineering",
    year: "2nd Year",
    role: "Student",
    lastInteraction: "Yesterday",
    nextSession: "May 25, 2023",
    mentorshipDuration: "6 months",
    goals: ["Improve coding skills", "Understand software architecture", "Find research opportunities"],
    skills: ["C++", "Data Structures", "Algorithms"],
    interests: ["Competitive Programming", "Cybersecurity"]
  },
  {
    id: 4,
    name: "Ethan Rodriguez",
    avatarUrl: null,
    program: "Computer Science",
    year: "4th Year",
    role: "Student",
    lastInteraction: "3 days ago",
    nextSession: "May 19, 2023",
    mentorshipDuration: "4 months",
    goals: ["Prepare for grad school", "Polish research paper", "Develop leadership skills"],
    skills: ["React", "TypeScript", "MongoDB"],
    interests: ["Full Stack Development", "Cloud Computing"]
  },
  {
    id: 5,
    name: "Ava Smith",
    avatarUrl: null,
    program: "Data Science",
    year: "3rd Year",
    role: "Student",
    lastInteraction: "5 days ago",
    nextSession: "May 27, 2023",
    mentorshipDuration: "1 month",
    goals: ["Learn data visualization", "Master statistical analysis", "Find data science internship"],
    skills: ["Python", "R", "Data Visualization"],
    interests: ["Big Data", "Statistical Analysis"]
  }
];

const CurrentMenteesPage = () => {
  const navigate = useNavigate();
  const [mentees, setMentees] = useState(currentMenteesData);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    programs: [],
    years: [],
    skills: []
  });
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [confirmingEndMentorship, setConfirmingEndMentorship] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add useEffect to load real data instead of static data
  useEffect(() => {
    const fetchMentees = async () => {
      try {
        setIsLoading(true);
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
        
        // Fetch mentees data from API
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/mentorship/mentees`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (response.data.length > 0) {
          // Transform backend data to match our component structure
          const transformedMentees = response.data.map(mentee => ({
            id: mentee._id,
            name: mentee.name,
            avatarUrl: mentee.profilePicture?.url || null,
            program: mentee.branch || 'Program not specified',
            year: mentee.currentYear ? `${mentee.currentYear} Year` : 'Year not specified',
            role: "Student",
            lastInteraction: mentee.lastInteraction || "2 days ago",
            nextSession: mentee.nextSession || "Not scheduled",
            mentorshipDuration: calculateDuration(mentee.startDate),
            goals: mentee.mentorshipGoals ? 
              mentee.mentorshipGoals.split(/[.,;]/).filter(g => g.trim().length > 0).map(g => g.trim()) : 
              ["No goals specified"],
            skills: mentee.skills || [],
            interests: mentee.interests || []
          }));
          
          setMentees(transformedMentees);
        } else {
          // If no mentees, keep the sample data
          console.log("No mentees found, using sample data");
        }
      } catch (err) {
        console.error("Error fetching mentees:", err);
        setError(err.response?.data?.message || err.message || "Failed to load mentees");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMentees();
    
    // Set up an interval to check for expired sessions every minute
    const intervalId = setInterval(() => {
      axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/mentorship/sessions/check-expired`
      ).catch(err => console.warn("Background session check failed", err));
    }, 60000); // 1 minute interval
    
    return () => clearInterval(intervalId);
  }, [navigate]);
  
  // Helper function to calculate mentorship duration
  const calculateDuration = (startDate) => {
    if (!startDate) return "Unknown duration";
    
    const start = new Date(startDate);
    const now = new Date();
    const diffMonths = (now.getFullYear() - start.getFullYear()) * 12 + 
      now.getMonth() - start.getMonth();
    
    if (diffMonths < 1) {
      const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
      return `${diffDays} days`;
    } else if (diffMonths === 1) {
      return "1 month";
    } else if (diffMonths < 12) {
      return `${diffMonths} months`;
    } else {
      const years = Math.floor(diffMonths / 12);
      const remainingMonths = diffMonths % 12;
      return remainingMonths 
        ? `${years} year${years > 1 ? 's' : ''} and ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` 
        : `${years} year${years > 1 ? 's' : ''}`;
    }
  };
  
  // Navigate back to dashboard
  const goBack = () => {
    navigate(-1);
  };
  
  // Handle search input
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    if (e.target.value === "") {
      setMentees(currentMenteesData);
    } else {
      const filtered = currentMenteesData.filter(
        mentee => 
          mentee.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
          mentee.program.toLowerCase().includes(e.target.value.toLowerCase()) ||
          mentee.skills.some(skill => skill.toLowerCase().includes(e.target.value.toLowerCase())) ||
          mentee.interests.some(interest => interest.toLowerCase().includes(e.target.value.toLowerCase()))
      );
      setMentees(filtered);
    }
  };
  
  // Toggle filter panel
  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };
  
  // Message a mentee
  const messageMentee = (menteeId) => {
    navigate(`/messages?mentee=${menteeId}`);
    // In a real app, this would navigate to a messaging interface with the mentee
  };
  
  // Schedule a session
  const scheduleSession = (menteeId) => {
    navigate(`/schedule-session?mentee=${menteeId}`);
    // In a real app, this would navigate to a session scheduling interface
    alert(`Scheduling a session with mentee ${menteeId}`);
  };
  
  // View mentee details
  const viewMenteeDetails = (mentee) => {
    setSelectedMentee(mentee);
  };
  
  // Close mentee details
  const closeMenteeDetails = () => {
    setSelectedMentee(null);
  };
  
  // End mentorship
  const confirmEndMentorship = (menteeId) => {
    setConfirmingEndMentorship(menteeId);
  };
  
  // Actually end the mentorship
  const endMentorship = (menteeId) => {
    setMentees(mentees.filter(mentee => mentee.id !== menteeId));
    setConfirmingEndMentorship(null);
    setSelectedMentee(null);
    // In a real app, this would also update the backend
    alert(`Ended mentorship with ${currentMenteesData.find(mentee => mentee.id === menteeId)?.name}`);
  };
  
  // Cancel end mentorship
  const cancelEndMentorship = () => {
    setConfirmingEndMentorship(null);
  };
  
  // Get initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // Format date
  const formatDate = (dateString) => {
    return dateString;
  };

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
          <h1 className="text-2xl font-bold">Current Mentees</h1>
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
        
        {/* Filter panel */}
        {filterOpen && (
          <div className="glass-card rounded-xl p-6 mb-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Filters</h3>
              <button
                onClick={toggleFilter}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Program filter section */}
              <div>
                <h4 className="text-sm font-medium mb-2">Program</h4>
                <div className="space-y-1">
                  {['Computer Science', 'Computer Engineering', 'Information Systems', 'Software Engineering', 'Data Science'].map(program => (
                    <div key={program} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`program-${program}`}
                        className="mr-2"
                        // Handle filter change
                      />
                      <label htmlFor={`program-${program}`} className="text-sm">{program}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Year filter section */}
              <div>
                <h4 className="text-sm font-medium mb-2">Year</h4>
                <div className="space-y-1">
                  {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'].map(year => (
                    <div key={year} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`year-${year}`}
                        className="mr-2"
                        // Handle filter change
                      />
                      <label htmlFor={`year-${year}`} className="text-sm">{year}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Skills filter section */}
              <div>
                <h4 className="text-sm font-medium mb-2">Skills</h4>
                <div className="space-y-1">
                  {['JavaScript', 'Python', 'Java', 'C++', 'React', 'Machine Learning', 'Data Science'].map(skill => (
                    <div key={skill} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`skill-${skill}`}
                        className="mr-2"
                        // Handle filter change
                      />
                      <label htmlFor={`skill-${skill}`} className="text-sm">{skill}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button className="px-4 py-2 rounded-md border border-input hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">
                Reset
              </button>
              <button className="px-4 py-2 rounded-md bg-primary text-white text-sm">
                Apply Filters
              </button>
            </div>
          </div>
        )}
        
        {/* Results count */}
        <div className="mb-6">
          <p className="text-muted-foreground">Showing {mentees.length} mentees</p>
        </div>
        
        {/* Mentees grid */}
        {mentees.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Mentees Found</h3>
            <p className="text-muted-foreground mb-6">You are not currently mentoring any students.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {mentees.map(mentee => (
              <div key={mentee.id} className="glass-card rounded-xl p-6">
                <div className="flex items-start">
                  <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4 text-xl font-bold">
                    {mentee.avatarUrl ? (
                      <img src={mentee.avatarUrl} alt={mentee.name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      getInitials(mentee.name)
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-lg">{mentee.name}</h4>
                    <p className="text-sm text-muted-foreground">{mentee.program} • {mentee.year}</p>
                    <div className="flex items-center mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground mr-1.5" />
                      <span className="text-xs text-muted-foreground">Last interaction: {mentee.lastInteraction}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 p-2 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center">
                  <Calendar className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                  <span className="text-xs text-green-600 dark:text-green-400">Next session: {mentee.nextSession}</span>
                </div>
                
                <div className="mt-4">
                  <div className="mb-3">
                    <p className="text-xs font-medium mb-1">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {mentee.skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {skill}
                        </span>
                      ))}
                      {mentee.skills.length > 3 && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                          +{mentee.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => viewMenteeDetails(mentee)}
                    className="w-full px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <UserCheck className="h-4 w-4" />
                    View Details
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => messageMentee(mentee.id)}
                      className="flex-1 px-3 py-2 bg-primary text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </button>
                    <button
                      onClick={() => scheduleSession(mentee.id)}
                      className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-200 text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Calendar className="h-4 w-4" />
                      Schedule
                    </button>
                  </div>
                </div>
              </div>
            ))}

          </div>
        )}
      </div>
      
      {/* Mentee Details Modal */}
      {selectedMentee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 w-full max-w-3xl rounded-xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-border z-10 flex justify-between items-center">
              <h2 className="text-xl font-bold">Mentee Details</h2>
              <button 
                onClick={closeMenteeDetails}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Student details */}
              <div className="flex items-start mb-6">
                <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-5 text-xl font-bold">
                  {selectedMentee.avatarUrl ? (
                    <img src={selectedMentee.avatarUrl} alt={selectedMentee.name} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    getInitials(selectedMentee.name)
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedMentee.name}</h3>
                  <p className="text-muted-foreground">{selectedMentee.program} • {selectedMentee.year}</p>
                  <div className="flex flex-col sm:flex-row sm:gap-4 mt-2">
                    <div className="flex items-center mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground mr-1.5" />
                      <span className="text-sm text-muted-foreground">Mentoring for {selectedMentee.mentorshipDuration}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 text-green-600 mr-1.5" />
                      <span className="text-sm text-green-600">Next session: {selectedMentee.nextSession}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mentorship information */}
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
                      {selectedMentee.skills.map((skill, idx) => (
                        <span key={idx} className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Interests</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMentee.interests.map((interest, idx) => (
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
                  
                  <ul className="space-y-2">
                    {selectedMentee.goals.map((goal, idx) => (
                      <li key={idx} className="flex items-start">
                        <div className="min-w-5 mt-0.5 mr-2">
                          <span className="inline-block h-1.5 w-1.5 bg-primary rounded-full"></span>
                        </div>
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => messageMentee(selectedMentee.id)}
                  className="flex-1 px-5 py-2.5 bg-primary text-white rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  <MessageSquare className="h-5 w-5" />
                  Message Mentee
                </button>
                <button
                  onClick={() => scheduleSession(selectedMentee.id)}
                  className="flex-1 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-200 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Calendar className="h-5 w-5" />
                  Schedule Session
                </button>
                {confirmingEndMentorship === selectedMentee.id ? (
                  <div className="flex-1 flex gap-1">
                    <button
                      onClick={() => endMentorship(selectedMentee.id)}
                      className="flex-1 px-3 py-2.5 bg-red-100 hover:bg-red-200 text-red-600 text-sm rounded-lg transition-colors"
                    >
                      Confirm End
                    </button>
                    <button
                      onClick={cancelEndMentorship}
                      className="flex-1 px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => confirmEndMentorship(selectedMentee.id)}
                    className="px-5 py-2.5 border border-red-200 text-red-500 rounded-lg flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
                  >
                    <UserMinus className="h-5 w-5" />
                    End Mentorship
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentMenteesPage;