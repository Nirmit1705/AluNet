import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Filter, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Link2, 
  User, 
  Tag, 
  MessageSquare, 
  X, 
  Users, 
  ChevronLeft,
  ChevronRight,
  Heart,
  ExternalLink,
  Calendar,
  Mail,
  BookOpen,
  Info,
  School,
  Eye,
  UserPlus,
  Clock,
  ArrowLeft,
  Check, // Added Check icon
  Star,
  StarHalf // Added Star and StarHalf icons
} from "lucide-react";
import { useUniversity } from "../context/UniversityContext";
import axios from "axios";
import { toast } from "sonner";
import Navbar from "../components/layout/Navbar"; // Import Navbar component

// Component definition starts here
const AlumniDirectory = () => {
  const navigate = useNavigate();
  // Extract userUniversity and related functions from the context
  const { userUniversity, filterByUniversity, extractUniversity } = useUniversity();
  
  // State variables
  const [allAlumni, setAllAlumni] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [connections, setConnections] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const itemsPerPage = 12;
  
  const [filters, setFilters] = useState({
    companies: [],
    specializations: [],
    graduationYears: [],
    skills: [],
    universities: []
  });
  
  // Add these state variables to track connection requests
  const [connectionRequests, setConnectionRequests] = useState({});
  const [connectedAlumni, setConnectedAlumni] = useState([]);
  const [alumniRatings, setAlumniRatings] = useState({}); // Added state for alumni ratings

  // Sample alumni data for testing
  const alumniData = [
    {
      id: 1,
      name: "Dr. Emily Rodriguez",
      role: "Senior Software Engineer",
      company: "Google",
      experience: 8,
      location: "San Francisco, CA",
      avatar: null,
      specialization: "Machine Learning",
      graduationYear: 2016,
      email: "emily.rodriguez@example.com",
      linkedin: "https://linkedin.com/in/emilyrodriguez",
      skills: ["Machine Learning", "Python", "TensorFlow"],
      education: "Ph.D. Computer Science, Stanford University",
      interests: ["AI Ethics", "Mentoring", "Open Source"],
      bio: "Experienced ML engineer with a passion for helping students navigate the tech industry. Specializes in career guidance for those interested in AI and data science."
    },
    {
      id: 2,
      name: "James Wilson",
      role: "Product Manager",
      company: "Microsoft",
      experience: 5,
      location: "Seattle, WA",
      avatar: null,
      specialization: "Product Development",
      graduationYear: 2018,
      email: "james.wilson@example.com",
      linkedin: "https://linkedin.com/in/jameswilson",
      skills: ["Product Management", "UX Design", "Agile"],
      education: "MBA, University of Washington",
      interests: ["Technology Innovation", "Mentoring", "Entrepreneurship"],
      bio: "Product manager with experience in launching consumer tech products. Happy to help students interested in product management roles."
    },
    {
      id: 3,
      name: "Sophia Chen",
      role: "Data Scientist",
      company: "Netflix",
      experience: 6,
      location: "Los Angeles, CA",
      avatar: null,
      specialization: "Data Analytics",
      graduationYear: 2017,
      email: "sophia.chen@example.com",
      linkedin: "https://linkedin.com/in/sophiachen",
      skills: ["Data Science", "Python", "SQL", "Statistics"],
      education: "M.S. Data Science, UCLA",
      interests: ["Machine Learning", "Data Visualization", "Career Development"],
      bio: "Data scientist with expertise in recommendation systems. Passionate about helping students transition into data science roles."
    },
    {
      id: 4,
      name: "Marcus Johnson",
      role: "Frontend Developer",
      company: "Amazon",
      experience: 4,
      location: "New York, NY",
      avatar: null,
      specialization: "Web Development",
      graduationYear: 2019,
      email: "marcus.johnson@example.com",
      linkedin: "https://linkedin.com/in/marcusjohnson",
      skills: ["React", "JavaScript", "HTML/CSS"],
      education: "B.S. Computer Science, NYU",
      interests: ["Web Accessibility", "UI Design", "Mentoring Juniors"],
      bio: "Frontend developer focusing on creating accessible web experiences. Happy to mentor students on web development and modern JavaScript."
    },
    {
      id: 5,
      name: "Priya Patel",
      role: "Project Manager",
      company: "IBM",
      experience: 7,
      location: "Chicago, IL",
      avatar: null,
      specialization: "Project Management",
      graduationYear: 2016,
      email: "priya.patel@example.com",
      linkedin: "https://linkedin.com/in/priyapatel",
      skills: ["Project Management", "Agile", "Scrum", "Leadership"],
      education: "MBA, University of Chicago",
      interests: ["Leadership Development", "Women in Tech", "Public Speaking"],
      bio: "Project manager with experience in large enterprise software implementations. Passionate about mentoring women in technology."
    },
    {
      id: 6,
      name: "David Kim",
      role: "UX Designer",
      company: "Apple",
      experience: 9,
      location: "Cupertino, CA",
      avatar: null,
      specialization: "User Experience",
      graduationYear: 2014,
      email: "david.kim@example.com",
      linkedin: "https://linkedin.com/in/davidkim",
      skills: ["UX Research", "Figma", "User Testing", "Prototyping"],
      education: "M.F.A. Design, RISD",
      interests: ["Design Thinking", "Accessibility", "Mentoring"],
      bio: "UX designer with experience creating human-centered digital experiences. Enjoy mentoring students interested in UX/UI design."
    },
    {
      id: 7,
      name: "Olivia Martinez",
      role: "Cybersecurity Analyst",
      company: "Cisco",
      experience: 6,
      location: "San Jose, CA",
      avatar: null,
      specialization: "Network Security",
      graduationYear: 2017,
      email: "olivia.martinez@example.com",
      linkedin: "https://linkedin.com/in/oliviamartinez",
      skills: ["Network Security", "Penetration Testing", "Security Auditing"],
      education: "M.S. Cybersecurity, Stanford University",
      interests: ["Digital Forensics", "Security Education", "Women in Cybersecurity"],
      bio: "Cybersecurity professional specializing in network defense. Passionate about increasing diversity in the cybersecurity field."
    },
    {
      id: 8,
      name: "Robert Smith",
      role: "Backend Engineer",
      company: "Salesforce",
      experience: 10,
      location: "San Francisco, CA",
      avatar: null,
      specialization: "Cloud Architecture",
      graduationYear: 2012,
      email: "robert.smith@example.com",
      linkedin: "https://linkedin.com/in/robertsmith",
      skills: ["Java", "Spring Boot", "AWS", "Microservices"],
      education: "B.S. Computer Engineering, UC Berkeley",
      interests: ["System Design", "Mentoring", "Open Source Development"],
      bio: "Experienced backend engineer specializing in scalable cloud architectures. Enjoy mentoring students on system design principles."
    }
  ];

  // Get all available filter options - moved up before its first usage
  const getFilterOptions = () => {
    const options = {
      companies: Array.from(new Set(allAlumni.map(a => a.company).filter(Boolean))),
      specializations: Array.from(new Set(allAlumni.map(a => a.specialization).filter(Boolean))),
      graduationYears: Array.from(new Set(allAlumni.map(a => a.graduationYear?.toString()).filter(Boolean))).sort((a, b) => b - a),
      skills: Array.from(new Set(allAlumni.flatMap(a => a.skills || []))),
      universities: Array.from(new Set(allAlumni.map(a => {
        // Make sure education is a string before calling extractUniversity
        if (a.education && typeof a.education === 'string') {
          return extractUniversity(a.education);
        }
        return '';
      }).filter(Boolean)))
    };
    
    return options;
  };

  // Fetch alumni data when component mounts - improved version
  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        setIsLoading(true);
        
        // IMPORTANT: Load all connected alumni IDs from localStorage FIRST
        const savedConnections = localStorage.getItem('connectedAlumni');
        let localConnections = [];
        if (savedConnections) {
          try {
            localConnections = JSON.parse(savedConnections);
            console.log('🔄 Loaded connections from localStorage:', localConnections);
            setConnections(localConnections);
          } catch (e) {
            console.error('Error parsing saved connections:', e);
            localStorage.removeItem('connectedAlumni'); // Clear corrupted data
          }
        }
        
        // Fetch all alumni data from API with more reliable approach
        let fetchedAlumni = [];
        try {
          const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
          const token = localStorage.getItem('token');
          
          // Try the main alumni endpoint first
          let response;
          try {
            response = await axios.get(`${apiUrl}/api/alumni`, {
              params: {
                includeEducation: true,
                includeAll: true
              },
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
          } catch (mainApiError) {
            // If that fails, try the users/alumni endpoint
            console.log("Main alumni endpoint failed, trying fallback...");
            response = await axios.get(`${apiUrl}/api/users/alumni`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
          }
          
          if (response.status === 200 && response.data) {
            console.log("Successfully fetched alumni data:", response.data);
            fetchedAlumni = processAlumniData(response.data);
            setAllAlumni(fetchedAlumni);
          } else {
            throw new Error('API returned unexpected response');
          }
        } catch (apiError) {
          console.error('API fetch failed, using sample data:', apiError);
          // Don't use static sample data, instead set an empty array or minimal data
          fetchedAlumni = [];
          setAllAlumni(fetchedAlumni);
        }
        
        // Filter out connected alumni
        const filteredAlumni = filterAlumniByConnections(fetchedAlumni, localConnections);
        setAlumni(filteredAlumni);
        setNoResults(filteredAlumni.length === 0);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error setting up alumni directory:', error);
        setIsLoading(false);
        // Use empty arrays instead of sample data
        setAllAlumni([]);
        setAlumni([]);
      }
    };

    fetchAlumni();
    
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favoriteAlumni');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Error parsing saved favorites:', e);
      }
    }
  }, []);
  
  // Fetch alumni ratings
  useEffect(() => {
    const fetchAlumniRatings = async () => {
      if (alumni.length === 0) return;
      
      try {
        const alumniIds = alumni.map(alum => alum.id);
        const ratingPromises = alumniIds.map(id => 
          axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/mentorship/feedback/alumni/${id}`)
        );
        
        const responses = await Promise.all(ratingPromises);
        
        const ratingsMap = {};
        alumniIds.forEach((id, index) => {
          ratingsMap[id] = responses[index].data;
        });
        
        setAlumniRatings(ratingsMap);
      } catch (err) {
        console.error("Error fetching alumni ratings:", err);
      }
    };
    
    fetchAlumniRatings();
  }, [alumni]);
  
  // Process alumni data to ensure consistent format
  const processAlumniData = (data) => {
    return data.map(alum => {
      // Keep original education data
      let educationField = '';
      
      // Case 1: If education is already a string
      if (alum.education && typeof alum.education === 'string') {
        educationField = alum.education;
      } 
      // Case 2: If education is an array
      else if (alum.education && Array.isArray(alum.education) && alum.education.length > 0) {
        educationField = alum.education.map(edu => {
          if (typeof edu === 'object') {
            let parts = [];
            if (edu.degree) parts.push(edu.degree);
            if (edu.fieldOfStudy && !edu.degree?.includes(edu.fieldOfStudy)) {
              parts.push(`in ${edu.fieldOfStudy}`);
            }
            
            // Handle education institution information
            if (edu.institution && edu.university && edu.institution !== edu.university) {
              parts.push(`${edu.institution}, ${edu.university}`);
            } else if (edu.institution) {
              parts.push(edu.institution);
            } else if (edu.university) {
              parts.push(edu.university);
            }
            
            // Handle years
            if (edu.startYear && edu.endYear) {
              parts.push(`(${edu.startYear}-${edu.endYear})`);
            } else if (edu.endYear) {
              parts.push(`(${edu.endYear})`);
            }
            
            return parts.join(' ');
          }
          return edu;
        }).join('; ');
      }
      // Case 3: Fall back to degree + university
      else if (alum.degree && alum.university) {
        educationField = `${alum.degree}, ${alum.university}`;
      }
      // Case 4: Final fallback
      else {
        educationField = alum.university || 'Education information not available';
      }
      
      // Ensure we have a valid alumniId
      const alumniId = alum._id || alum.id || alum.alumniId || `alum-${Date.now()}`;
      
      return {
        ...alum,
        id: alumniId, // Ensure the transformed object always has an id field
        _id: alumniId, // Keep the _id field for API compatibility
        education: educationField,
        // Keep the original education array if it exists for detailed view
        previousEducation: Array.isArray(alum.education) ? alum.education : 
                           Array.isArray(alum.previousEducation) ? alum.previousEducation : null,
        // Ensure all alumni have these key properties
        name: alum.name || 'Unknown Alumni',
        role: alum.position || alum.jobTitle || alum.role || 'Alumni',
        company: alum.company || '',
        skills: alum.skills || [],
        // If graduationYear is missing, make a reasonable estimate
        graduationYear: alum.graduationYear || 
                       (alum.education && typeof alum.education === 'string' && 
                        alum.education.match(/\d{4}/) ? 
                        parseInt(alum.education.match(/\d{4}/)[0]) : 
                        new Date().getFullYear() - 5)
      };
    });
  };
  
  // Filter alumni by connections
  const filterAlumniByConnections = (alumniList, connectionsList) => {
    if (!alumniList || !Array.isArray(alumniList)) return [];
    
    return alumniList.filter(alum => {
      const possibleIds = [
        alum._id, 
        alum.id, 
        alum.userId, 
        alum.alumniId
      ].filter(Boolean).map(String);
      
      // Check if this alumni is connected
      const isConnectedAlum = connectionsList.some(connId => {
        const connIdStr = String(connId);
        return possibleIds.some(alumId => 
          alumId === connIdStr || 
          connIdStr.includes(alumId) || 
          alumId.includes(connIdStr)
        );
      });
      
      return !isConnectedAlum; // Keep only unconnected alumni
    });
  };

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (!query) {
      // When clearing search, filter again by connections
      filterAlumniByConnections(allAlumni, connections);
      return;
    }
    
    // First filter by search criteria
    const searchFiltered = allAlumni.filter(alum => 
      alum.name.toLowerCase().includes(query) ||
      (alum.company && alum.company.toLowerCase().includes(query)) ||
      (alum.specialization && alum.specialization.toLowerCase().includes(query)) ||
      (alum.skills && alum.skills.some(skill => skill.toLowerCase().includes(query)))
    );
    
    // Then apply connection filtering to the search results
    filterAlumniByConnections(searchFiltered, connections);
    setCurrentPage(1);
  };

  // Toggle filter panel
  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  // Connect with alumni - Add check before sending request
  const connectWithAlumni = async (alumniId) => {
    // First check if already connected
    if (isConnected(alumniId)) {
      alert('You are already connected with this alumni');
      return;
    }
    
    try {
      // Update UI immediately to prevent multiple clicks
      setConnectionRequests({
        ...connectionRequests,
        [alumniId]: 'pending'
      });

      const response = await axios.post(
        '/api/connections/request', 
        {
          alumniId: alumniId,
          message: `I'd like to connect with you to learn more about your professional experiences.`
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      if (response.status === 201) {
        // Add to connections list and update state
        const updatedConnections = [...connections, alumniId];
        setConnections(updatedConnections);
        
        // IMPORTANT: Update localStorage immediately
        localStorage.setItem('connectedAlumni', JSON.stringify(updatedConnections));
        
        // IMPORTANT: Remove this alumni from the displayed list
        // Also remove from allAlumni to ensure it doesn't come back
        setAlumni(prevAlumni => {
          return prevAlumni.filter(alum => {
            const id = alum._id || alum.id;
            return String(id) !== String(alumniId);
          });
        });
        
        setAllAlumni(prevAllAlumni => {
          return prevAllAlumni.filter(alum => {
            const id = alum._id || alum.id;
            return String(id) !== String(alumniId);
          });
        });
        
        // Show success message
        alert('Connection request sent successfully');
      }
    } catch (error) {
      console.error('Error connecting with alumni:', error);
      
      // If there was an error, reset the UI state for this alumni
      if (error.response?.data?.message === "You are already connected with this alumni") {
        // Add this ID to connections to prevent future attempts
        const updatedConnections = [...connections, alumniId];
        setConnections(updatedConnections);
        localStorage.setItem('connectedAlumni', JSON.stringify(updatedConnections));
        
        // Remove this alumni from the displayed list
        setAlumni(alumni => alumni.filter(alum => {
          const id = alum._id || alum.id;
          return id !== alumniId;
        }));
        
        alert('You are already connected with this alumni');
      } else {
        // Reset pending state for this alumni
        setConnectionRequests(prev => {
          const updated = {...prev};
          delete updated[alumniId];
          return updated;
        });
        const errorMessage = error.response?.data?.message || 'Failed to send connection request';
        alert(errorMessage);
      }
    }
  };

  // Message alumni
  const messageAlumni = (alumniId) => {
    navigate(`/messages/${alumniId}`);
  };

  // View alumni details
  const viewAlumniDetails = (alumni) => {
    setSelectedAlumni(alumni);
  };

  // Close alumni details
  const closeAlumniDetails = () => {
    setSelectedAlumni(null);
  };

  // Toggle favorite
  const toggleFavorite = (alumniId) => {
    let newFavorites;
    
    if (favorites.includes(alumniId)) {
      newFavorites = favorites.filter(id => id !== alumniId);
    } else {
      newFavorites = [...favorites, alumniId];
    }
    
    setFavorites(newFavorites);
    localStorage.setItem('favoriteAlumni', JSON.stringify(newFavorites));
  };

  // Filter options
  const filterOptions = getFilterOptions();

  // Show only alumni that are not already connected
  const filteredAlumni = useMemo(() => {
    if (!alumni || !Array.isArray(alumni) || alumni.length === 0) return [];
    
    // Slice for pagination but don't filter again - already filtered in the useEffect
    return alumni.slice(
      (currentPage - 1) * itemsPerPage, 
      currentPage * itemsPerPage
    );
  }, [alumni, currentPage, itemsPerPage]);

  // Apply filters without losing the connection filtering
  const applyFilters = () => {
    let filteredAlumni = [...allAlumni];
    
    // First filter out connected alumni
    filteredAlumni = filteredAlumni.filter(alum => {
      const alumniId = alum._id || alum.id;
      return !isConnected(alumniId);
    });
    
    // Then apply the other filters
    // Filter by company
    if (filters.companies.length > 0) {
      filteredAlumni = filteredAlumni.filter(alum => 
        filters.companies.includes(alum.company)
      );
    }
    
    // Filter by specialization
    if (filters.specializations.length > 0) {
      filteredAlumni = filteredAlumni.filter(alum => 
        filters.specializations.includes(alum.specialization)
      );
    }
    
    // Filter by graduation year
    if (filters.graduationYears.length > 0) {
      filteredAlumni = filteredAlumni.filter(alum => 
        filters.graduationYears.includes(alum.graduationYear.toString())
      );
    }
    
    // Filter by skill
    if (filters.skills.length > 0) {
      filteredAlumni = filteredAlumni.filter(alum => 
        alum.skills && filters.skills.some(skill => alum.skills.includes(skill))
      );
    }
    
    // Filter by university
    if (filters.universities.length > 0) {
      filteredAlumni = filteredAlumni.filter(alum => 
        filters.universities.some(uni => 
          alum.education && alum.education.toLowerCase().includes(uni.toLowerCase())
        )
      );
    }
    
    setAlumni(filteredAlumni);
    setNoResults(filteredAlumni.length === 0);
    setCurrentPage(1);
    setFilterOpen(false);
  };

  // Also update reset filters to maintain connection filtering
  const resetFilters = () => {
    setFilters({
      companies: [],
      specializations: [],
      graduationYears: [],
      skills: [],
      universities: []
    });
    
    // Filter out connected alumni when resetting other filters
    const unconnectedAlumni = allAlumni.filter(alum => {
      const alumniId = alum._id || alum.id;
      return !isConnected(alumniId);
    });
    
    setAlumni(unconnectedAlumni);
    setNoResults(unconnectedAlumni.length === 0);
    setFilterOpen(false);
    setCurrentPage(1);
  };

  // Handle filter change
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

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // Helper function to get profile picture url from various possible field structures
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
    
    // Fall back to avatar field if it exists
    if (alumni.avatar) {
      return alumni.avatar;
    }
    
    // No profile picture available
    return null;
  };

  // Helper function to render rating stars
  const renderRatingStars = (alumniId) => {
    const rating = alumniRatings[alumniId]?.averageRating || 0;
    const totalFeedbacks = alumniRatings[alumniId]?.totalFeedbacks || 0;
    
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

  // Pagination controls
  const totalPages = Math.ceil(alumni.length / itemsPerPage);
  const paginatedAlumni = alumni.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };

  // Also update the isConnected function to use the same improved logic
  const isConnected = (alumniId) => {
    if (!alumniId) return false;
    
    // Convert to string
    const alumIdStr = String(alumniId);
    
    // Check each connection
    const connected = connections.some(connId => {
      const connIdStr = String(connId);
      
      // Try exact match
      if (alumIdStr === connIdStr) {
        console.log(`Connected match found: ${alumIdStr} === ${connIdStr}`);
        return true;
      }
      
      // Try substring match
      if (connIdStr.includes(alumIdStr) || alumIdStr.includes(connIdStr)) {
        console.log(`Connected substring match: ${connIdStr} includes ${alumIdStr}`);
        return true;
      }
      
      return false;
    });
    
    return connected;
  };

  return (
    <>
      <Navbar /> {/* Add Navbar at the top of the component */}
      <div className="container-custom pt-24 pb-12">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Alumni Directory</h1>
            <p className="text-muted-foreground">
              Connect with alumni from your university and beyond
            </p>
          </div>
        </div>

        {/* Search and filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search alumni by name, company, or skills..."
              className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              value={searchQuery}
              onChange={handleSearch}
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
            {Object.values(filters).some(arr => arr.length > 0) && (
              <span className="flex items-center justify-center w-5 h-5 bg-primary-foreground text-primary text-xs rounded-full">
                {Object.values(filters).reduce((count, arr) => count + arr.length, 0)}
              </span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {filterOpen && (
          <div className="glass-card rounded-xl p-6 mb-8 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Filters</h3>
              <button
                onClick={toggleFilter}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
              {/* Company filter section */}
              <div>
                <h4 className="text-sm font-medium mb-2">Company</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {filterOptions.companies.map(company => (
                    <div key={company} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`company-${company}`}
                        className="mr-2"
                        checked={filters.companies.includes(company)}
                        onChange={() => handleFilterChange('companies', company)}
                      />
                      <label htmlFor={`company-${company}`} className="text-sm">{company}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Specialization filter section */}
              <div>
                <h4 className="text-sm font-medium mb-2">Specialization</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {filterOptions.specializations.map(specialization => (
                    <div key={specialization} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`specialization-${specialization}`}
                        className="mr-2"
                        checked={filters.specializations.includes(specialization)}
                        onChange={() => handleFilterChange('specializations', specialization)}
                      />
                      <label htmlFor={`specialization-${specialization}`} className="text-sm">{specialization}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Graduation Year filter section */}
              <div>
                <h4 className="text-sm font-medium mb-2">Graduation Year</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {filterOptions.graduationYears.map(year => (
                    <div key={year} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`year-${year}`}
                        className="mr-2"
                        checked={filters.graduationYears.includes(year)}
                        onChange={() => handleFilterChange('graduationYears', year)}
                      />
                      <label htmlFor={`year-${year}`} className="text-sm">{year}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Skills filter section */}
              <div>
                <h4 className="text-sm font-medium mb-2">Skills</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {filterOptions.skills.map(skill => (
                    <div key={skill} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`skill-${skill}`}
                        className="mr-2"
                        checked={filters.skills.includes(skill)}
                        onChange={() => handleFilterChange('skills', skill)}
                      />
                      <label htmlFor={`skill-${skill}`} className="text-sm">{skill}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* University filter section */}
              <div>
                <h4 className="text-sm font-medium mb-2">University</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {filterOptions.universities.map(university => (
                    <div key={university} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`university-${university}`}
                        className="mr-2"
                        checked={filters.universities.includes(university)}
                        onChange={() => handleFilterChange('universities', university)}
                      />
                      <label htmlFor={`university-${university}`} className="text-sm">{university}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={resetFilters}
                className="px-4 py-2 rounded-md border border-input hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
              >
                Reset
              </button>
              <button 
                onClick={applyFilters}
                className="px-4 py-2 rounded-md bg-primary text-white text-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
        
        {/* Results count and pagination info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            {isLoading 
              ? "Loading alumni..." 
              : noResults 
                ? "No alumni found matching your criteria" 
                : `Showing ${filteredAlumni.length} of ${allAlumni.length} alumni${connections.length > 0 ? ` (excluding ${connections.length} connections)` : ''}`
            }
          </p>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={prevPage} 
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button 
                onClick={nextPage} 
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="glass-card rounded-xl p-6 animate-pulse">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-full mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-4/6"></div>
                </div>
                <div className="mt-4 flex justify-between">
                  <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-2/5"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-2/5"></div>
                </div>
              </div>
            ))}
          </div>
        ) : noResults ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Alumni Found</h3>
            <p className="text-muted-foreground mb-6">No alumni match your search criteria. Try adjusting your filters or search terms.</p>
            <button 
              onClick={resetFilters}
              className="px-4 py-2 bg-primary text-white rounded-md inline-flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAlumni.length > 0 ? (
              filteredAlumni.map((alum) => (
                <div key={alum._id} className="glass-card rounded-xl p-6 animate-fade-in hover:shadow-md transition-all">
                  <div className="flex items-start">
                    <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4 text-lg font-bold overflow-hidden">
                      {getProfilePictureUrl(alum) ? (
                        <img 
                          src={getProfilePictureUrl(alum)} 
                          alt={alum.name} 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        getInitials(alum.name)
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-lg">{alum.name}</h4>
                        <button 
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          onClick={() => toggleFavorite(alum.id)}
                        >
                          <Heart className={`h-4 w-4 ${favorites.includes(alum.id) ? "fill-red-500 text-red-500" : ""}`} />
                        </button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {alum.position ? `${alum.position}${alum.company ? ` at ${alum.company}` : ''}` : 'Alumni'}
                      </p>
                      <div className="flex items-center mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground mr-1.5" />
                        <span className="text-xs text-muted-foreground">
                          Class of {alum.graduationYear || 'N/A'}
                        </span>
                      </div>
                      
                      {/* Mentorship availability indicator */}
                      {alum.mentorshipAvailable && (
                        <div className="mt-2 flex items-center">
                          <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs rounded-full flex items-center">
                            <GraduationCap className="h-3 w-3 mr-1" />
                            Available for Mentorship
                          </span>
                        </div>
                      )}
                      
                      {/* Skills preview */}
                      {alum.skills && alum.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {alum.skills.slice(0, 2).map((skill, index) => (
                            <span key={index} className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                              {skill}
                            </span>
                          ))}
                          {alum.skills.length > 2 && (
                            <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                              +{alum.skills.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Alumni ratings */}
                      {renderRatingStars(alum._id || alum.id)}
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button 
                      className="w-full px-3 py-2 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center"
                      onClick={() => viewAlumniDetails(alum)}
                    >
                      <Eye className="h-3 w-3 mr-2" />
                      View Profile
                    </button>
                    
                    {connectionRequests[alum._id || alum.id] === 'pending' ? (
                      <button 
                        className="w-full px-3 py-2 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 rounded-lg flex items-center justify-center cursor-not-allowed"
                        disabled
                      >
                        <Clock className="h-3 w-3 mr-2" />
                        Pending
                      </button>
                    ) : isConnected(alum._id || alum.id) ? (
                      <button 
                        className="w-full px-3 py-2 text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-lg flex items-center justify-center cursor-not-allowed"
                        disabled
                      >
                        <Check className="h-3 w-3 mr-2" />
                        Connected
                      </button>
                    ) : (
                      <button 
                        className="w-full px-3 py-2 text-xs bg-primary text-white rounded-lg hover:opacity-90 transition-colors flex items-center justify-center"
                        onClick={() => connectWithAlumni(alum._id || alum.id)}
                      >
                        <UserPlus className="h-3 w-3 mr-2" />
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full glass-card rounded-xl p-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No New Alumni to Connect With</h3>
                <p className="text-muted-foreground mb-6">
                  You're already connected with all alumni in this view. Try adjusting your search or filters to discover more alumni.
                </p>
                <button 
                  onClick={resetFilters}
                  className="px-4 py-2 bg-primary text-white rounded-md inline-flex items-center"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Pagination controls */}
        {!isLoading && !noResults && totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <button 
                onClick={prevPage} 
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={`page-${page}`}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-md flex items-center justify-center ${
                    currentPage === page 
                      ? 'bg-primary text-white' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button 
                onClick={nextPage} 
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Alumni Details Modal */}
        {selectedAlumni && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-xl max-h-[90vh] overflow-y-auto animate-fade-in">
              <div className="sticky top-0 bg-white dark:bg-gray-900 p-6 border-b border-border flex justify-between items-center z-10">
                <button 
                  onClick={closeAlumniDetails}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-bold">Alumni Profile</h2>
                <button 
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors"
                  onClick={() => toggleFavorite(selectedAlumni.id)}
                  aria-label={favorites.includes(selectedAlumni.id) ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart className={`h-5 w-5 ${favorites.includes(selectedAlumni.id) ? "fill-red-500 text-red-500" : ""}`} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="h-24 w-24 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-6 text-3xl font-bold">
                    {getProfilePictureUrl(selectedAlumni) ? (
                      <img 
                        src={getProfilePictureUrl(selectedAlumni)} 
                        alt={selectedAlumni.name} 
                        className="h-full w-full rounded-full object-cover" 
                      />
                    ) : (
                      getInitials(selectedAlumni.name)
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedAlumni.name}</h3>
                    <p className="text-lg text-muted-foreground">{selectedAlumni.role}</p>
                    
                    <div className="flex mt-2 gap-4">
                      {selectedAlumni.linkedin && (
                        <a 
                          href={selectedAlumni.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary flex items-center hover:underline"
                        >
                          <Link2 className="h-4 w-4 mr-1" />
                          LinkedIn
                        </a>
                      )}
                      
                      <a 
                        href={`mailto:${selectedAlumni.email}`}
                        className="text-sm text-primary flex items-center hover:underline"
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </a>
                    </div>
                    {/* Alumni ratings */}
                    {renderRatingStars(selectedAlumni._id || selectedAlumni.id)}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {selectedAlumni.company && (
                    <div className="flex items-start">
                      <Briefcase className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Company</h4>
                        <p>{selectedAlumni.company}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedAlumni.location && (
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Location</h4>
                        <p>{selectedAlumni.location}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start">
                    <GraduationCap className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Graduation</h4>
                      <p>Class of {selectedAlumni.graduationYear}</p>
                    </div>
                  </div>
                  
                  {selectedAlumni.experience && (
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Experience</h4>
                        <p>{selectedAlumni.experience} years</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {selectedAlumni.bio && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">About</h4>
                    <p className="text-muted-foreground">{selectedAlumni.bio}</p>
                  </div>
                )}

                {/* Add this in the alumni details modal, inside the detailed view of an alumni */}
                {selectedAlumni && selectedAlumni.mentorshipAvailable && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Mentorship</h4>
                    <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-start">
                        <GraduationCap className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-green-600">Available for Mentorship</p>
                          {selectedAlumni.mentorshipAreas && selectedAlumni.mentorshipAreas.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Mentorship areas:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedAlumni.mentorshipAreas.map((area, index) => (
                                  <span key={index} className="text-xs bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 px-2 py-1 rounded-full">
                                    {area}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Education</h4>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {selectedAlumni.education && selectedAlumni.education !== 'Education information not available' ? (
                      <div>
                        {Array.isArray(selectedAlumni.previousEducation) && selectedAlumni.previousEducation.length > 0 ? (
                          // If we have detailed previous education data
                          selectedAlumni.previousEducation.map((edu, index) => (
                            <div key={index} className="mb-3 last:mb-0">
                              <div className="flex items-start">
                                <School className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium">
                                    {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                                  </p>
                                  <div className="text-sm text-muted-foreground">
                                    {edu.institution && edu.university && edu.institution !== edu.university ? (
                                      <p>
                                        {edu.institution}, {edu.university}
                                      </p>
                                    ) : (
                                      <p>{edu.institution || edu.university}</p>
                                    )}
                                    <p>{edu.startYear} - {edu.endYear || 'Present'}</p>
                                    {edu.description && (
                                      <p className="text-sm italic mt-1">{edu.description}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          // If we only have a string representation of education
                          <div className="flex items-center">
                            <School className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                            <p>{selectedAlumni.education}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm italic">Education information not available</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedAlumni.skills && selectedAlumni.skills.map((skill, idx) => (
                        <span key={idx} className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Interests</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedAlumni.interests && selectedAlumni.interests.map((interest, idx) => (
                        <span key={idx} className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-border p-4 flex gap-3">
                {connectionRequests[selectedAlumni?._id || selectedAlumni?.id] === 'pending' ? (
                  <button
                    disabled
                    className="flex-1 px-4 py-3 bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 rounded-lg flex items-center justify-center cursor-not-allowed font-medium"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Request Pending
                  </button>
                ) : isConnected(selectedAlumni?._id || selectedAlumni?.id) ? (
                  <button
                    onClick={() => messageAlumni(selectedAlumni._id || selectedAlumni.id)}
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    <MessageSquare className="h-4 w-4 mr-2 inline" />
                    Message
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        connectWithAlumni(selectedAlumni._id || selectedAlumni.id);
                        closeAlumniDetails();
                      }}
                      className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                      <UserPlus className="h-4 w-4 mr-2 inline" />
                      Connect
                    </button>
                    <button
                      onClick={() => messageAlumni(selectedAlumni._id || selectedAlumni.id)}
                      className="flex-1 px-4 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors font-medium"
                    >
                      <MessageSquare className="h-4 w-4 mr-2 inline" />
                      Message
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AlumniDirectory;