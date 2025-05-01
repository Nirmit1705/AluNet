import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronLeft, Users, Search, Filter, X, GraduationCap, MessageSquare, Heart, ExternalLink, Calendar, Briefcase, MapPin, Mail, BookOpen, Info, School, Clock, Star, StarHalf } from "lucide-react";
import Navbar from "../layout/Navbar";
import MentorshipRequestForm from "./MentorshipRequestForm";
import { useUniversity } from "../../context/UniversityContext";

const ConnectedMentorsPage = () => {
  const navigate = useNavigate();
  const { 
    userUniversity, 
    filterByUniversity, 
    extractUniversity 
  } = useUniversity();
  
  // Initialize arrays correctly to prevent "undefined is not iterable" errors
  const [allMentors, setAllMentors] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    specialties: [],
    availability: []
  });
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showMentorshipForm, setShowMentorshipForm] = useState(false);
  const [selectedMentorForRequest, setSelectedMentorForRequest] = useState(null);
  const [showingAllUniversities, setShowingAllUniversities] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mentorshipRequests, setMentorshipRequests] = useState([]);
  const [mentorRatings, setMentorRatings] = useState({});
  
  // Add a function to fetch mentorship requests
  const fetchMentorshipRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/mentorship/student`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log("Fetched mentorship requests:", response.data);
      setMentorshipRequests(response.data || []);
    } catch (err) {
      console.error("Error fetching mentorship requests:", err);
    }
  }, [navigate]);
  
  // Add a function to fetch mentor ratings
  const fetchMentorRatings = async (mentorIds) => {
    try {
      const ratingPromises = mentorIds.map(id => 
        axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/mentorship/feedback/alumni/${id}`)
      );
      
      const responses = await Promise.all(ratingPromises);
      
      const ratingsMap = {};
      mentorIds.forEach((id, index) => {
        ratingsMap[id] = responses[index].data;
      });
      
      setMentorRatings(ratingsMap);
    } catch (err) {
      console.error("Error fetching mentor ratings:", err);
    }
  };

  // Fetch connected mentors when component mounts
  useEffect(() => {
    const fetchConnectedMentors = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/connections/mentors`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        console.log("Fetched mentor data:", response.data);
        
        const mentorsData = response.data || [];
        
        const transformedMentors = mentorsData.map(mentor => {
          let educationString = mentor.education;
          
          if (typeof mentor.education === 'object' && mentor.education !== null) {
            educationString = formatEducation(mentor.education);
          }
          
          let mentorshipAreas = [];
          
          if (Array.isArray(mentor.mentorshipAreas) && mentor.mentorshipAreas.length > 0) {
            mentorshipAreas = [...mentor.mentorshipAreas];
          } else if (mentor.mentorshipAreas && typeof mentor.mentorshipAreas === 'string') {
            mentorshipAreas = mentor.mentorshipAreas.split(',').map(area => area.trim());
          } else if (mentor.expertise && Array.isArray(mentor.expertise) && mentor.expertise.length > 0) {
            mentorshipAreas = [...mentor.expertise];
          }
          
          const specialties = mentor.specialties || mentor.expertise || mentor.skills || [];
          
          return {
            id: mentor.id || mentor._id,
            name: mentor.name || 'Unknown Mentor',
            role: mentor.role || `${mentor.position || 'Professional'} at ${mentor.company || 'Company'}`,
            position: mentor.position || 'Professional',
            specialties: specialties,
            mentorshipAreas: mentorshipAreas,
            availability: mentor.availability || "Available by appointment",
            location: mentor.location || mentor.city || "Remote",
            experience: mentor.experience || "N/A",
            education: educationString,
            description: mentor.description || mentor.bio || "No description available",
            interests: mentor.interests || [],
            connectionDate: mentor.connectionDate || new Date().toISOString(),
            lastInteraction: mentor.lastInteraction || "Recently",
            email: mentor.email || "",
            linkedin: mentor.linkedin || "#",
            avatar: mentor.profilePicture || mentor.avatar || null,
            company: mentor.company || "Company",
            mentorshipAvailable: mentor.mentorshipAvailable !== false
          };
        });
        
        setAllMentors(transformedMentors);
        setMentors(transformedMentors);
        
        // Fetch ratings for all mentors
        if (transformedMentors.length > 0) {
          fetchMentorRatings(transformedMentors.map(m => m.id));
        }
      } catch (err) {
        console.error("Error fetching connected mentors:", err);
        setError("Failed to load your connected mentors. Please try again later.");
        setAllMentors([]);
        setMentors([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConnectedMentors();
    fetchMentorshipRequests();
  }, [navigate, fetchMentorshipRequests]);
  
  // Filter mentors by university when userUniversity changes
  useEffect(() => {
    if (!showingAllUniversities && userUniversity && allMentors.length > 0) {
      const filteredByUniversity = filterByUniversity(allMentors);
      setMentors(filteredByUniversity);
    } else {
      setMentors(allMentors);
    }
  }, [userUniversity, filterByUniversity, showingAllUniversities, allMentors]);
  
  const toggleUniversityFilter = () => {
    setShowingAllUniversities(!showingAllUniversities);
  };
  
  const goBack = () => {
    navigate(-1);
  };
  
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    if (e.target.value === "") {
      setMentors(allMentors);
    } else {
      const filtered = allMentors.filter(
        mentor => 
          mentor.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
          mentor.role.toLowerCase().includes(e.target.value.toLowerCase()) ||
          mentor.company.toLowerCase().includes(e.target.value.toLowerCase()) ||
          mentor.specialties.some(specialty => specialty.toLowerCase().includes(e.target.value.toLowerCase()))
      );
      setMentors(filtered);
    }
  };
  
  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };
  
  const handleFilterChange = (category, value) => {
    setFilters(prev => {
      const updated = { ...prev };
      if (updated[category].includes(value)) {
        updated[category] = updated[category].filter(item => item !== value);
      } else {
        updated[category] = [...updated[category], value];
      }
      return updated;
    });
  };
  
  const applyFilters = () => {
    let filtered = allMentors;
    
    if (filters.specialties.length > 0) {
      filtered = filtered.filter(mentor => 
        mentor.specialties.some(specialty => 
          filters.specialties.includes(specialty)
        )
      );
    }
    
    if (filters.availability.length > 0) {
      filtered = filtered.filter(mentor => 
        filters.availability.some(time => 
          mentor.availability.includes(time)
        )
      );
    }
    
    if (search) {
      filtered = filtered.filter(
        mentor => 
          mentor.name.toLowerCase().includes(search.toLowerCase()) ||
          mentor.role.toLowerCase().includes(search.toLowerCase()) ||
          mentor.company.toLowerCase().includes(search.toLowerCase()) ||
          mentor.specialties.some(specialty => specialty.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    setMentors(filtered);
    setFilterOpen(false);
  };
  
  const resetFilters = () => {
    setFilters({
      specialties: [],
      availability: []
    });
    setSearch("");
    setMentors(allMentors);
    setFilterOpen(false);
  };
  
  const viewMentorProfile = (mentor) => {
    setSelectedMentor(mentor);
  };
  
  const closeMentorProfile = () => {
    setSelectedMentor(null);
  };
  
  const messageMentor = (mentorId) => {
    navigate(`/messages/${mentorId}`);
    alert(`Navigating to message with mentor #${mentorId}`);
  };
  
  const requestMentorship = (mentorId) => {
    const mentor = allMentors.find(m => m.id === mentorId);
    if (!mentor) {
      console.error("Mentor not found with ID:", mentorId);
      return;
    }
    
    const status = getMentorshipStatus(mentorId);
    if (status === 'accepted') {
      navigate('/mentorships');
      return;
    } else if (status === 'pending') {
      alert("You already have a pending mentorship request with this mentor.");
      return;
    }
    
    setSelectedMentorForRequest(mentor);
    setShowMentorshipForm(true);
  };
  
  const handleMentorshipSubmit = async (formData) => {
    try {
      console.log("Mentorship request submitted:", formData);
      fetchMentorshipRequests();
      setShowMentorshipForm(false);
      setSelectedMentorForRequest(null);
    } catch (error) {
      console.error("Error handling mentorship submission:", error);
    }
  };
  
  const getMentorshipStatus = (mentorId) => {
    if (!mentorshipRequests || !mentorshipRequests.length || !mentorId) {
      return null;
    }
    
    const request = mentorshipRequests.find(req => {
      const reqAlumniId = req.alumni?._id || req.alumni;
      const alumniIdStr = reqAlumniId?.toString();
      const mentorIdStr = mentorId?.toString();
      return alumniIdStr === mentorIdStr;
    });
    
    return request ? request.status : null;
  };
  
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  const allSpecialties = Array.from(
    new Set(allMentors.flatMap(mentor => mentor.specialties))
  ).sort();
  
  const allAvailability = [
    "Weekday Mornings",
    "Weekday Afternoons",
    "Weekday Evenings",
    "Weekend Mornings",
    "Weekend Afternoons",
    "Weekend Evenings"
  ];

  const renderMentorshipButton = (mentor) => {
    const status = getMentorshipStatus(mentor.id);
    
    if (status === 'pending') {
      return (
        <button 
          className="flex-1 px-3 py-2 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 rounded-lg flex items-center justify-center cursor-not-allowed"
          disabled
          onClick={(e) => e.stopPropagation()}
        >
          <Clock className="h-3 w-3 inline mr-1" />
          Request Pending
        </button>
      );
    } else if (status === 'accepted') {
      return (
        <button 
          className="flex-1 px-3 py-2 text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-lg flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            navigate('/mentorships');
          }}
        >
          <GraduationCap className="h-3 w-3 inline mr-1" />
          View Mentorship
        </button>
      );
    } else {
      return (
        <button 
          className="flex-1 px-3 py-2 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            requestMentorship(mentor.id);
          }}
        >
          <GraduationCap className="h-3 w-3 inline mr-1" />
          Request Mentorship
        </button>
      );
    }
  };
  
  const getMentorshipId = (mentorId) => {
    if (!mentorshipRequests || !mentorshipRequests.length || !mentorId) {
      return null;
    }
    
    const request = mentorshipRequests.find(
      req => req.alumni?.toString() === mentorId?.toString()
    );
    
    return request ? request._id : null;
  };
  
  const cancelMentorshipRequest = () => {
    setShowMentorshipForm(false);
    setSelectedMentorForRequest(null);
  };

  const renderRatingStars = (mentorId) => {
    const rating = mentorRatings[mentorId]?.averageRating || 0;
    const totalFeedbacks = mentorRatings[mentorId]?.totalFeedbacks || 0;
    
    if (totalFeedbacks === 0) return null;
    
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-1 mt-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
        ))}
        {halfStar && <StarHalf className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />}
        <span className="text-xs ml-1 text-gray-600 dark:text-gray-300">
          ({rating.toFixed(1)}) · {totalFeedbacks} {totalFeedbacks === 1 ? 'review' : 'reviews'}
        </span>
      </div>
    );
  };

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

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-custom pt-20">
          <div className="glass-card rounded-xl p-6 text-center">
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Error Loading Mentors</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-md"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mentors.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-custom pt-20">
          <div className="mb-6 flex items-center">
            <button 
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold">Connected Mentors</h1>
          </div>
          
          <div className="glass-card rounded-xl p-8 text-center">
            <Users className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-medium mb-2">No Connected Mentors</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven't connected with any mentors yet. Explore the alumni directory to find mentors who can guide you in your career journey.
            </p>
            <button
              onClick={() => navigate('/alumni-directory')}
              className="px-6 py-2 bg-primary text-white rounded-lg"
            >
              Explore Alumni Directory
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
        <div className="mb-6 flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold">Connected Mentors</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <p className="text-muted-foreground">View and connect with your mentors</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search mentors..."
                value={search}
                onChange={handleSearchChange}
                className="pl-9 pr-4 py-2 w-full rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <button
              onClick={toggleFilter}
              className="p-2 rounded-lg border border-input bg-background hover:bg-accent flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
        </div>
        
        {filterOpen && (
          <div className="glass-card rounded-xl p-6 mb-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Filter Mentors</h3>
              <button onClick={toggleFilter} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Specialties</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {allSpecialties.map(specialty => (
                    <label key={specialty} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.specialties.includes(specialty)}
                        onChange={() => handleFilterChange('specialties', specialty)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-3">Availability</h4>
                <div className="space-y-2">
                  {allAvailability.map(time => (
                    <label key={time} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.availability.includes(time)}
                        onChange={() => handleFilterChange('availability', time)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{time}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <p className="text-muted-foreground">Showing {mentors.length} mentors</p>
        </div>
        
        {mentors && mentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <div key={mentor.id || `mentor-${mentor.name}`} className="glass-card rounded-xl p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => viewMentorProfile(mentor)}>
                <div className="flex items-start">
                  <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4 text-lg font-bold">
                    {mentor.avatar ? (
                      <img src={mentor.avatar} alt={mentor.name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      getInitials(mentor.name)
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-lg">{mentor.name}</h4>
                    <p className="text-sm text-muted-foreground">{mentor.role}</p>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-3 w-3 text-muted-foreground mr-1.5" />
                      <span className="text-xs text-muted-foreground">
                        Connected {new Date(mentor.connectionDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-1.5">
                  <p className="text-sm text-muted-foreground">{mentor.company || 'Company'}</p>
                  {renderRatingStars(mentor.id)}
                </div>
                
                <div className="mt-4">
                  <div className="mb-3">
                    <p className="text-xs font-medium mb-1">Specialties</p>
                    <div className="flex flex-wrap gap-1">
                      {mentor.specialties && mentor.specialties.length > 0 ? (
                        <>
                          {mentor.specialties.slice(0, 3).map((specialty, idx) => (
                            <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {specialty}
                            </span>
                          ))}
                          {mentor.specialties.length > 3 && (
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-full">
                              +{mentor.specialties.length - 3} more
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-gray-500">No specialties listed</span>
                      )}
                    </div>
                  </div>
                  
                  {Array.isArray(mentor.mentorshipAreas) && mentor.mentorshipAreas.length > 0 ? (
                    <div className="mb-3">
                      <p className="text-xs font-medium mb-1">Mentorship Areas</p>
                      <div className="flex flex-wrap gap-1">
                        {mentor.mentorshipAreas.slice(0, 3).map((area, idx) => (
                          <span key={idx} className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                            {area}
                          </span>
                        ))}
                        {mentor.mentorshipAreas.length > 3 && (
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-full">
                            +{mentor.mentorshipAreas.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <p className="text-xs font-medium mb-1">Mentorship Areas</p>
                      <span className="text-xs text-gray-500">General mentorship</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{mentor.location || "Location not specified"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    Available: {mentor.availability || "Contact for availability"}
                  </p>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <button 
                    className="flex-1 px-3 py-2 text-xs border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      messageMentor(mentor.id);
                    }}
                  >
                    <MessageSquare className="h-3 w-3 inline mr-1" />
                    Message
                  </button>
                  
                  {renderMentorshipButton(mentor)}
                </div>
              </div>
            ))}

          </div>
        ) : (
          <div className="glass-card rounded-xl p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Mentors Found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your filters or search criteria.</p>
            <button
              onClick={resetFilters}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
      
      {selectedMentor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-border z-10 flex justify-between items-center">
              <h2 className="text-xl font-bold">Mentor Profile</h2>
              <button 
                onClick={closeMentorProfile}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
                <div className="h-24 w-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
                  {selectedMentor.avatar ? (
                    <img src={selectedMentor.avatar} alt={selectedMentor.name} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    getInitials(selectedMentor.name)
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold">{selectedMentor.name}</h3>
                  <p className="text-lg text-muted-foreground">{selectedMentor.role}</p>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1.5" />
                      <span>{selectedMentor.location || "Location not specified"}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4 mr-1.5" />
                      <span>{selectedMentor.experience ? `${selectedMentor.experience} years experience` : "Experience not specified"}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1.5" />
                      <span>Connected {new Date(selectedMentor.connectionDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {renderRatingStars(selectedMentor.id)}
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button 
                      className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center"
                      onClick={() => messageMentor(selectedMentor.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </button>
                    
                    {getMentorshipStatus(selectedMentor.id) === 'accepted' ? (
                      <button 
                        className="px-4 py-2 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-lg hover:opacity-90 transition-colors flex items-center"
                        onClick={() => navigate('/mentorships')}
                      >
                        <GraduationCap className="h-4 w-4 mr-2" />
                        View Mentorship
                      </button>
                    ) : getMentorshipStatus(selectedMentor.id) === 'pending' ? (
                      <button 
                        className="px-4 py-2 bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 rounded-lg flex items-center cursor-not-allowed"
                        disabled
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Request Pending
                      </button>
                    ) : (
                      <button 
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center"
                        onClick={() => requestMentorship(selectedMentor.id)}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Request Mentorship
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-6">
                  <div className="glass-card rounded-xl p-5">
                    <h4 className="font-medium mb-4">Education</h4>
                    <div className="flex items-start">
                      <School className="h-4 w-4 mr-2 text-primary mt-0.5" />
                      <span className="text-sm">
                        {formatEducation(selectedMentor.education)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="glass-card rounded-xl p-5">
                    <h4 className="font-medium mb-4">Availability</h4>
                    <div className="flex items-start">
                      <Calendar className="h-4 w-4 mr-2 text-primary mt-0.5" />
                      <span className="text-sm">{selectedMentor.availability}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="glass-card rounded-xl p-5">
                    <h4 className="font-medium mb-4">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMentor.specialties.map((specialty, idx) => (
                        <span key={idx} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="glass-card rounded-xl p-5">
                    <h4 className="font-medium mb-4">Mentorship Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(selectedMentor.mentorshipAreas) && selectedMentor.mentorshipAreas.length > 0 ? (
                        selectedMentor.mentorshipAreas.map((area, idx) => (
                          <span key={idx} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm rounded-full">
                            {area}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">General mentorship</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="glass-card rounded-xl p-5">
                    <h4 className="font-medium mb-4">Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMentor.interests.map((interest, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm rounded-full">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="glass-card rounded-xl p-5 h-full">
                    <h4 className="font-medium mb-4">About</h4>
                    <p className="text-sm text-muted-foreground">{selectedMentor.description}</p>
                    
                    <div className="mt-6 pt-6 border-t border-border">
                      <h5 className="font-medium text-sm mb-3">Mentorship History</h5>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Info className="h-4 w-4 mr-2 text-primary" />
                        <span>Last interaction: {selectedMentor.lastInteraction}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showMentorshipForm && selectedMentorForRequest && (
        <MentorshipRequestForm 
          mentorName={selectedMentorForRequest.name}
          mentorId={selectedMentorForRequest.id}
          mentorRole={selectedMentorForRequest.role}
          mentorEmail={selectedMentorForRequest.email}
          mentor={selectedMentorForRequest}
          onSubmit={handleMentorshipSubmit}
          onClose={cancelMentorshipRequest}
        />
      )}
    </div>
  );
};

const formatEducation = (education) => {
  if (typeof education === 'string') {
    return education;
  }
  
  if (education && typeof education === 'object') {
    let parts = [];
    if (education.degree) parts.push(education.degree);
    if (education.fieldOfStudy && !education.degree?.includes(education.fieldOfStudy)) {
      parts.push(`in ${education.fieldOfStudy}`);
    }
    
    if (education.institution && education.university && education.institution !== education.university) {
      parts.push(`at ${education.institution}, ${education.university}`);
    } else if (education.institution) {
      parts.push(`at ${education.institution}`);
    } else if (education.university) {
      parts.push(`at ${education.university}`);
    }
    
    return parts.join(' ');
  }
  
  if (Array.isArray(education) && education.length > 0) {
    return formatEducation(education[0]);
  }
  
  return 'Education details not available';
};

export default ConnectedMentorsPage;