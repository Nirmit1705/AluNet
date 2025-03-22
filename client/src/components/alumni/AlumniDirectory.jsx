import React, { useState, useEffect } from "react";
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
  ArrowLeft,
  Heart,
  ExternalLink,
  Calendar,
  Mail,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  School
} from "lucide-react";
import { useUniversity } from "../../context/UniversityContext";

// Sample alumni data (in a real app, this would come from an API call)
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
    name: "Michael Chen",
    role: "Technical Product Manager",
    company: "Microsoft",
    experience: 6,
    location: "Seattle, WA",
    avatar: null,
    specialization: "Product Management",
    graduationYear: 2018,
    email: "michael.chen@example.com",
    linkedin: "https://linkedin.com/in/michaelchen",
    skills: ["Product Management", "UX Design", "Agile"],
    education: "M.S. Computer Science, University of Washington",
    interests: ["Product Strategy", "Agile Development", "User Research"],
    bio: "Product manager with engineering background who helps students understand the intersection of technology and business. Can provide guidance on technical product roles."
  },
  {
    id: 3,
    name: "Sarah Johnson",
    role: "Frontend Engineering Lead",
    company: "Meta",
    experience: 7,
    location: "Remote",
    avatar: null,
    specialization: "Web Development",
    graduationYear: 2017,
    email: "sarah.johnson@example.com",
    linkedin: "https://linkedin.com/in/sarahjohnson",
    skills: ["React", "JavaScript", "UI Architecture"],
    education: "B.S. Computer Science, MIT",
    interests: ["Web Performance", "Design Systems", "Developer Experience"],
    bio: "Frontend expert who loves helping students build impressive portfolios and prepare for technical interviews. Specializes in modern JavaScript frameworks and UI architecture."
  },
  {
    id: 4,
    name: "David Williams",
    role: "Data Science Director",
    company: "Amazon",
    experience: 10,
    location: "New York, NY",
    avatar: null,
    specialization: "Data Science",
    graduationYear: 2014,
    email: "david.williams@example.com",
    linkedin: "https://linkedin.com/in/davidwilliams",
    skills: ["Data Science", "Python", "Machine Learning", "SQL"],
    education: "Ph.D. Statistics, Columbia University",
    interests: ["Large Language Models", "Data Ethics", "Causal Inference"],
    bio: "Data science leader passionate about mentoring the next generation of data professionals. Can provide guidance on projects, career paths, and advanced techniques."
  },
  {
    id: 5,
    name: "Jessica Kim",
    role: "Security Engineering Manager",
    company: "IBM",
    experience: 9,
    location: "Austin, TX",
    avatar: null,
    specialization: "Cybersecurity",
    graduationYear: 2015,
    email: "jessica.kim@example.com",
    linkedin: "https://linkedin.com/in/jessicakim",
    skills: ["Cybersecurity", "Network Security", "Ethical Hacking"],
    education: "M.S. Information Security, Carnegie Mellon University",
    interests: ["Security Education", "Ethical Hacking", "Privacy"],
    bio: "Cybersecurity expert who helps students navigate the complex world of information security. Provides guidance on security careers, certifications, and practical skills."
  },
  {
    id: 6,
    name: "James Wilson",
    role: "Backend Developer",
    company: "Netflix",
    experience: 5,
    location: "Los Angeles, CA",
    avatar: null,
    specialization: "Distributed Systems",
    graduationYear: 2019,
    email: "james.wilson@example.com",
    linkedin: "https://linkedin.com/in/jameswilson",
    skills: ["Java", "Microservices", "AWS", "Spring Boot"],
    education: "B.S. Computer Engineering, UCLA",
    interests: ["System Design", "Cloud Architecture", "Performance Optimization"],
    bio: "Backend developer specialized in building scalable systems. Enjoys mentoring students in system design and server-side technologies."
  },
  {
    id: 7,
    name: "Olivia Garcia",
    role: "UX Research Lead",
    company: "Airbnb",
    experience: 7,
    location: "San Francisco, CA",
    avatar: null,
    specialization: "User Research",
    graduationYear: 2017,
    email: "olivia.garcia@example.com",
    linkedin: "https://linkedin.com/in/oliviagarcia",
    skills: ["User Research", "Usability Testing", "Design Thinking"],
    education: "M.S. Human-Computer Interaction, Carnegie Mellon University",
    interests: ["Accessible Design", "Behavioral Economics", "Design Ethics"],
    bio: "UX researcher passionate about creating user-centered experiences. Mentors students interested in UX careers and research methodologies."
  },
  {
    id: 8,
    name: "Robert Taylor",
    role: "Mobile Developer",
    company: "Spotify",
    experience: 6,
    location: "Stockholm, Sweden",
    avatar: null,
    specialization: "Mobile Development",
    graduationYear: 2018,
    email: "robert.taylor@example.com",
    linkedin: "https://linkedin.com/in/roberttaylor",
    skills: ["iOS", "Swift", "Android", "Kotlin"],
    education: "M.S. Mobile Computing, KTH Royal Institute of Technology",
    interests: ["App Architecture", "UI Animation", "Cross-platform Development"],
    bio: "Mobile developer with experience in both iOS and Android platforms. Helps students understand mobile development best practices and career paths."
  }
];

// Component definition starts here
const AlumniDirectory = () => {
  const navigate = useNavigate();
  const { 
    userUniversity,
    filterByUniversity,
    extractUniversity 
  } = useUniversity();
  
  const [allAlumni, setAllAlumni] = useState(alumniData);
  const [alumni, setAlumni] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    companies: [],
    specializations: [],
    graduationYears: [],
    skills: [],
    universities: []
  });
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [savedAlumni, setSavedAlumni] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showingAllUniversities, setShowingAllUniversities] = useState(false);
  const alumniPerPage = 6;
  
  // Calculate current alumni to display
  const indexOfLastAlumni = currentPage * alumniPerPage;
  const indexOfFirstAlumni = indexOfLastAlumni - alumniPerPage;
  const currentAlumni = alumni.slice(indexOfFirstAlumni, indexOfLastAlumni);
  const totalPages = Math.ceil(alumni.length / alumniPerPage);
  
  // Filter alumni by university when component mounts or userUniversity changes
  useEffect(() => {
    if (!showingAllUniversities && userUniversity) {
      const filteredByUniversity = filterByUniversity(alumniData);
      setAllAlumni(filteredByUniversity);
      setAlumni(filteredByUniversity);
    } else {
      setAllAlumni(alumniData);
      setAlumni(alumniData);
    }
    // Reset pagination when changing university filter
    setCurrentPage(1);
  }, [userUniversity, filterByUniversity, showingAllUniversities]);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  
  useEffect(() => {
    // Reset pagination when filtering
    setCurrentPage(1);
  }, [alumni]);
  
  // Navigate back
  const goBack = () => {
    navigate(-1);
  };
  
  // Toggle university filter
  const toggleUniversityFilter = () => {
    setShowingAllUniversities(!showingAllUniversities);
  };
  
  // Handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    filterAlumni(e.target.value, filters);
  };
  
  // Filter alumni based on search and filters
  const filterAlumni = (searchTerm, filterCriteria) => {
    let filtered = allAlumni;
    
    // Apply text search (name, role, company, skills, education/university)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(alumnus => 
        alumnus.name.toLowerCase().includes(term) ||
        alumnus.role.toLowerCase().includes(term) ||
        alumnus.company.toLowerCase().includes(term) ||
        alumnus.specialization.toLowerCase().includes(term) ||
        alumnus.education?.toLowerCase().includes(term) ||
        extractUniversity(alumnus.education).toLowerCase().includes(term) ||
        alumnus.skills.some(skill => skill.toLowerCase().includes(term))
      );
    }
    
    // Apply company filters
    if (filterCriteria.companies.length > 0) {
      filtered = filtered.filter(alumnus => 
        filterCriteria.companies.includes(alumnus.company)
      );
    }
    
    // Apply specialization filters
    if (filterCriteria.specializations.length > 0) {
      filtered = filtered.filter(alumnus => 
        filterCriteria.specializations.includes(alumnus.specialization)
      );
    }
    
    // Apply graduation year filters
    if (filterCriteria.graduationYears.length > 0) {
      filtered = filtered.filter(alumnus => 
        filterCriteria.graduationYears.includes(alumnus.graduationYear.toString())
      );
    }
    
    // Apply skills filters
    if (filterCriteria.skills.length > 0) {
      filtered = filtered.filter(alumnus => 
        filterCriteria.skills.some(skill => 
          alumnus.skills.includes(skill)
        )
      );
    }
    
    // Apply university filters
    if (filterCriteria.universities.length > 0) {
      filtered = filtered.filter(alumnus => {
        const university = extractUniversity(alumnus.education);
        return filterCriteria.universities.some(uni => 
          university.toLowerCase().includes(uni.toLowerCase())
        );
      });
    }
    
    setAlumni(filtered);
  };
  
  // Toggle filter panel
  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };
  
  // Handle filter changes
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
  
  // Apply filters
  const applyFilters = () => {
    filterAlumni(searchQuery, filters);
    setFilterOpen(false);
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      companies: [],
      specializations: [],
      graduationYears: [],
      skills: [],
      universities: []
    });
    setSearchQuery("");
    setAlumni(allAlumni);
    setFilterOpen(false);
  };
  
  // View alumni profile
  const viewAlumniProfile = (alumnus) => {
    setSelectedAlumni(alumnus);
  };
  
  // Close alumni profile
  const closeAlumniProfile = () => {
    setSelectedAlumni(null);
  };
  
  // Save/bookmark alumni
  const saveAlumni = (alumniId) => {
    if (savedAlumni.includes(alumniId)) {
      setSavedAlumni(savedAlumni.filter(id => id !== alumniId));
    } else {
      setSavedAlumni([...savedAlumni, alumniId]);
    }
  };
  
  // Connect with alumni
  const connectWithAlumni = (alumniId) => {
    // In a real app, this would send a connection request
    alert(`Connection request sent to alumni #${alumniId}`);
  };
  
  // Message alumni
  const messageAlumni = (alumniId) => {
    navigate(`/messages/${alumniId}`);
  };
  
  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // Extract unique filter values from the filtered alumni list
  const companies = [...new Set(allAlumni.map(alumnus => alumnus.company))];
  const specializations = [...new Set(allAlumni.map(alumnus => alumnus.specialization))];
  const graduationYears = [...new Set(allAlumni.map(alumnus => alumnus.graduationYear.toString()))];
  const allSkills = [...new Set(allAlumni.flatMap(alumnus => alumnus.skills))].sort();
  const universities = [...new Set(allAlumni.map(alumnus => extractUniversity(alumnus.education)))].filter(uni => uni).sort();
  
  return (
    <div className="container-custom py-8 pt-20">
      {/* Alumni header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Alumni Directory</h1>
          {userUniversity ? (
            <div className="flex items-center mb-2">
              <p className="text-gray-600 dark:text-gray-400 mr-2">
                {showingAllUniversities 
                  ? "Showing alumni from all universities" 
                  : `Showing alumni from ${userUniversity}`}
              </p>
              <button 
                onClick={toggleUniversityFilter}
                className="text-primary hover:text-primary/80 text-sm flex items-center"
              >
                <School className="h-4 w-4 mr-1" />
                {showingAllUniversities ? "Show only my university" : "Show all universities"}
              </button>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              Connect with alumni to expand your professional network
            </p>
          )}
        </div>
        
        {/* Search bar with filter toggle */}
        <div className="mt-4 md:mt-0 md:flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, skills, or university..."
              className="pl-10 pr-4 py-2.5 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <button
            onClick={toggleFilter}
            className="mt-2 md:mt-0 px-4 py-2.5 w-full md:w-auto bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg flex items-center justify-center"
          >
            <Filter className="h-5 w-5 mr-2" />
            <span>Filters</span>
          </button>
        </div>
      </div>
      
      {/* Filter panel */}
      {filterOpen && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-8 animate-fade-in shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Filter Alumni</h3>
            <button 
              onClick={toggleFilter}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Companies filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Companies</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {companies.map((company) => (
                  <label key={company} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.companies.includes(company)}
                      onChange={() => handleFilterChange('companies', company)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{company}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Skills filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Skills</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {allSkills.map((skill) => (
                  <label key={skill} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.skills.includes(skill)}
                      onChange={() => handleFilterChange('skills', skill)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{skill}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Universities filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Universities</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {universities.map((university) => (
                  <label key={university} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.universities.includes(university)}
                      onChange={() => handleFilterChange('universities', university)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{university}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Specializations filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Specializations</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {specializations.map((specialization) => (
                  <label key={specialization} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.specializations.includes(specialization)}
                      onChange={() => handleFilterChange('specializations', specialization)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{specialization}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Graduation Years filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Graduation Year</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {graduationYears.map((year) => (
                  <label key={year} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.graduationYears.includes(year)}
                      onChange={() => handleFilterChange('graduationYears', year)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{year}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Reset
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
      
      {/* Alumni grid */}
      {alumni.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentAlumni.map((alumnus) => (
              <div
                key={alumnus.id}
                className="glass-card rounded-xl p-6 transition-transform hover:scale-[1.02] cursor-pointer"
                onClick={() => viewAlumniProfile(alumnus)}
              >
                <div className="flex justify-between mb-4">
                  <div className="flex">
                    {alumnus.avatar ? (
                      <img
                        src={alumnus.avatar}
                        alt={alumnus.name}
                        className="h-12 w-12 rounded-xl object-cover mr-3"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mr-3">
                        <span className="text-base font-medium">{getInitials(alumnus.name)}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-medium leading-tight">{alumnus.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{alumnus.role}</p>
                      <p className="text-xs text-muted-foreground">{alumnus.company}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      saveAlumni(alumnus.id);
                    }}
                    className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
                  >
                    <Heart className={`h-4 w-4 ${savedAlumni.includes(alumnus.id) ? "fill-primary text-primary" : ""}`} />
                  </button>
                </div>
                
                <div className="space-y-1 mb-4">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5 mr-2" />
                    <span>{alumnus.experience} years experience</span>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 mr-2" />
                    <span>{alumnus.location}</span>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <GraduationCap className="h-3.5 w-3.5 mr-2" />
                    <span>{alumnus.graduationYear}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-xs font-medium mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {alumnus.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-full text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {alumnus.skills.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs">
                        +{alumnus.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      connectWithAlumni(alumnus.id);
                    }}
                    className="flex-1 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs flex items-center justify-center"
                  >
                    <Users className="h-3.5 w-3.5 mr-1.5" />
                    Connect
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      messageAlumni(alumnus.id);
                    }}
                    className="flex-1 py-1.5 bg-primary text-white hover:bg-primary/90 rounded-lg text-xs flex items-center justify-center"
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {alumni.length > alumniPerPage && (
            <div className="flex justify-center mt-10">
              <div className="flex items-center space-x-1">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  // Show current page, first, last, and pages around current
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`h-8 w-8 flex items-center justify-center rounded-lg ${
                          currentPage === pageNumber
                            ? 'bg-primary text-white'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    (pageNumber === currentPage - 2 && currentPage > 3) ||
                    (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
                  ) {
                    return <span key={pageNumber}>...</span>;
                  }
                  return null;
                })}
                
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">No alumni found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Reset Filters
          </button>
        </div>
      )}
      
      {/* Alumni Profile Modal */}
      {selectedAlumni && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 w-full max-w-3xl rounded-xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="relative h-28 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-xl">
              <button 
                onClick={closeAlumniProfile}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 rounded-full text-white"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="absolute -bottom-10 left-6">
                {selectedAlumni.avatar ? (
                  <img
                    src={selectedAlumni.avatar}
                    alt={selectedAlumni.name}
                    className="h-20 w-20 rounded-xl object-cover border-4 border-white dark:border-gray-900"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-xl bg-primary/10 text-primary flex items-center justify-center border-4 border-white dark:border-gray-900">
                    <span className="text-lg font-medium">{getInitials(selectedAlumni.name)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="pt-12 px-6 pb-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">{selectedAlumni.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedAlumni.role} at {selectedAlumni.company}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveAlumni(selectedAlumni.id)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Heart className={`h-5 w-5 ${savedAlumni.includes(selectedAlumni.id) ? "fill-primary text-primary" : ""}`} />
                  </button>
                  <button
                    onClick={() => messageAlumni(selectedAlumni.id)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Profile modal details section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="space-y-2">
                  <div className="flex items-center text-xs">
                    <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{selectedAlumni.experience} years experience</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{selectedAlumni.location}</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Class of {selectedAlumni.graduationYear}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-xs">
                    <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{selectedAlumni.education}</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a href={`mailto:${selectedAlumni.email}`} className="hover:text-primary">
                      {selectedAlumni.email}
                    </a>
                  </div>
                  {selectedAlumni.linkedin && (
                    <div className="flex items-center text-xs">
                      <ExternalLink className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a 
                        href={selectedAlumni.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-primary"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="text-xs font-medium mb-2">Specialized in</h4>
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">
                    {selectedAlumni.specialization}
                  </span>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Bio</h4>
                <p className="text-xs text-muted-foreground">{selectedAlumni.bio}</p>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAlumni.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-full text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mb-8">
                <h4 className="text-sm font-medium mb-2">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAlumni.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 rounded-full text-xs"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => connectWithAlumni(selectedAlumni.id)}
                  className="flex-1 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg flex items-center justify-center"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Connect
                </button>
                <button
                  onClick={() => messageAlumni(selectedAlumni.id)}
                  className="flex-1 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg flex items-center justify-center"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniDirectory; 