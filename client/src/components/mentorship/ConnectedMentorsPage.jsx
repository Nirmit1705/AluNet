import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Users, Search, Filter, X, GraduationCap, MessageSquare, Heart, ExternalLink, Calendar, Briefcase, MapPin, Mail, BookOpen, Info, School } from "lucide-react";
import Navbar from "../layout/Navbar";
import MentorshipRequestForm from "./MentorshipRequestForm";
import { useUniversity } from "../../context/UniversityContext";

// Sample data for connected mentors
const connectedMentorsData = [
  {
    id: 1,
    name: "Dr. Emily Rodriguez",
    role: "Senior Software Engineer",
    company: "Google",
    experience: 8,
    location: "San Francisco, CA",
    avatar: null,
    specialties: ["Machine Learning", "Career Development", "System Design"],
    connectionDate: "2023-04-15",
    availability: "Weekday Evenings",
    email: "emily.rodriguez@example.com",
    linkedin: "https://linkedin.com/in/emilyrodriguez",
    lastInteraction: "3 days ago",
    education: "Ph.D. Computer Science, Stanford University",
    interests: ["AI Ethics", "Mentoring", "Open Source"],
    description: "Experienced ML engineer with a passion for helping students navigate the tech industry. Specializes in career guidance for those interested in AI and data science."
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Technical Product Manager",
    company: "Microsoft",
    experience: 6,
    location: "Seattle, WA",
    avatar: null,
    specialties: ["Product Management", "UX Design", "Technical Leadership"],
    connectionDate: "2023-05-20",
    availability: "Weekend Afternoons",
    email: "michael.chen@example.com",
    linkedin: "https://linkedin.com/in/michaelchen",
    lastInteraction: "1 week ago",
    education: "M.S. Computer Science, University of Washington",
    interests: ["Product Strategy", "Agile Development", "User Research"],
    description: "Product manager with engineering background who helps students understand the intersection of technology and business. Can provide guidance on technical product roles."
  },
  {
    id: 3,
    name: "Sarah Johnson",
    role: "Frontend Engineering Lead",
    company: "Meta",
    experience: 7,
    location: "Remote",
    avatar: null,
    specialties: ["React", "UI Architecture", "Frontend Interviews"],
    connectionDate: "2023-03-10",
    availability: "Tuesday & Thursday Evenings",
    email: "sarah.johnson@example.com",
    linkedin: "https://linkedin.com/in/sarahjohnson",
    lastInteraction: "2 days ago",
    education: "B.S. Computer Science, MIT",
    interests: ["Web Performance", "Design Systems", "Developer Experience"],
    description: "Frontend expert who loves helping students build impressive portfolios and prepare for technical interviews. Specializes in modern JavaScript frameworks and UI architecture."
  },
  {
    id: 4,
    name: "David Williams",
    role: "Data Science Director",
    company: "Amazon",
    experience: 10,
    location: "New York, NY",
    avatar: null,
    specialties: ["Data Science", "Machine Learning Operations", "Analytics"],
    connectionDate: "2023-06-05",
    availability: "Monday & Wednesday Mornings",
    email: "david.williams@example.com",
    linkedin: "https://linkedin.com/in/davidwilliams",
    lastInteraction: "5 days ago",
    education: "Ph.D. Statistics, Columbia University",
    interests: ["Large Language Models", "Data Ethics", "Causal Inference"],
    description: "Data science leader passionate about mentoring the next generation of data professionals. Can provide guidance on projects, career paths, and advanced techniques."
  },
  {
    id: 5,
    name: "Jessica Kim",
    role: "Security Engineering Manager",
    company: "IBM",
    experience: 9,
    location: "Austin, TX",
    avatar: null,
    specialties: ["Cybersecurity", "AppSec", "Security Career Guidance"],
    connectionDate: "2023-07-12",
    availability: "Weekends",
    email: "jessica.kim@example.com",
    linkedin: "https://linkedin.com/in/jessicakim",
    lastInteraction: "1 day ago",
    education: "M.S. Information Security, Carnegie Mellon University",
    interests: ["Security Education", "Ethical Hacking", "Privacy"],
    description: "Cybersecurity expert who helps students navigate the complex world of information security. Provides guidance on security careers, certifications, and practical skills."
  }
];

const ConnectedMentorsPage = () => {
  const navigate = useNavigate();
  const { 
    userUniversity, 
    filterByUniversity, 
    extractUniversity 
  } = useUniversity();
  
  const [allMentors, setAllMentors] = useState(connectedMentorsData);
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
  
  // Filter mentors by university when component mounts or userUniversity changes
  useEffect(() => {
    if (!showingAllUniversities && userUniversity) {
      const filteredByUniversity = filterByUniversity(connectedMentorsData);
      setAllMentors(filteredByUniversity);
      setMentors(filteredByUniversity);
    } else {
      setAllMentors(connectedMentorsData);
      setMentors(connectedMentorsData);
    }
  }, [userUniversity, filterByUniversity, showingAllUniversities]);
  
  // Toggle university filter
  const toggleUniversityFilter = () => {
    setShowingAllUniversities(!showingAllUniversities);
  };
  
  // Navigate back to dashboard
  const goBack = () => {
    navigate(-1);
  };
  
  // Handle search input
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
    let filtered = allMentors;
    
    // Apply specialty filters
    if (filters.specialties.length > 0) {
      filtered = filtered.filter(mentor => 
        mentor.specialties.some(specialty => 
          filters.specialties.includes(specialty)
        )
      );
    }
    
    // Apply availability filters
    if (filters.availability.length > 0) {
      filtered = filtered.filter(mentor => 
        filters.availability.some(time => 
          mentor.availability.includes(time)
        )
      );
    }
    
    // Apply search term if present
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
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      specialties: [],
      availability: []
    });
    setSearch("");
    setMentors(allMentors);
    setFilterOpen(false);
  };
  
  // View mentor profile
  const viewMentorProfile = (mentor) => {
    setSelectedMentor(mentor);
  };
  
  // Close mentor profile
  const closeMentorProfile = () => {
    setSelectedMentor(null);
  };
  
  // Message mentor
  const messageMentor = (mentorId) => {
    navigate(`/messages/${mentorId}`);
    // In a real app, this would navigate to the messages page with this mentor selected
    alert(`Navigating to message with mentor #${mentorId}`);
  };
  
  // Request mentorship with specific mentor
  const requestMentorship = (mentorId) => {
    const mentor = connectedMentorsData.find(m => m.id === mentorId);
    if (!mentor) return;
    
    // Show the mentorship request form
    setSelectedMentorForRequest(mentor);
    setShowMentorshipForm(true);
  };
  
  // Handle mentorship request submission
  const handleMentorshipSubmit = (formData) => {
    // In a real app, this would send the request to the backend
    console.log("Submitting mentorship request:", formData);
    
    // For demo purposes:
    alert(`Mentorship request for ${formData.mentorName} has been submitted successfully!`);
    
    // Close the form
    setShowMentorshipForm(false);
    setSelectedMentorForRequest(null);
  };
  
  // Cancel mentorship request
  const cancelMentorshipRequest = () => {
    setShowMentorshipForm(false);
    setSelectedMentorForRequest(null);
  };
  
  // Get initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // Get all unique specialties for filters
  const allSpecialties = Array.from(
    new Set(connectedMentorsData.flatMap(mentor => mentor.specialties))
  ).sort();
  
  // Get all unique availability times for filters
  const allAvailability = [
    "Weekday Mornings",
    "Weekday Afternoons",
    "Weekday Evenings",
    "Weekend Mornings",
    "Weekend Afternoons",
    "Weekend Evenings"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-custom pt-20 pb-12">
        {/* Header with back button */}
        <div className="mb-8">
          <button 
            onClick={goBack}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </button>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Connected Mentors</h1>
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
        </div>
        
        {/* Filter panel */}
        {filterOpen && (
          <div className="glass-card rounded-xl p-6 mb-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Filter Mentors</h3>
              <button onClick={toggleFilter} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Specialties filter */}
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
              
              {/* Availability filter */}
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
            
            {/* Filter actions */}
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
        
        {/* Results info */}
        <div className="mb-6">
          <p className="text-muted-foreground">Showing {mentors.length} mentors</p>
        </div>
        
        {/* Mentors grid */}
        {mentors.length === 0 ? (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {mentors.map(mentor => (
              <div key={mentor.id} className="glass-card rounded-xl p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => viewMentorProfile(mentor)}>
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
                    <p className="text-sm text-muted-foreground">{mentor.role} at {mentor.company}</p>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-3 w-3 text-muted-foreground mr-1.5" />
                      <span className="text-xs text-muted-foreground">Connected {new Date(mentor.connectionDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="mb-3">
                    <p className="text-xs font-medium mb-1">Specialties</p>
                    <div className="flex flex-wrap gap-1">
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
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{mentor.location}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    Available: {mentor.availability}
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
                  <button 
                    className="flex-1 px-3 py-2 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      requestMentorship(mentor.id);
                    }}
                  >
                    <Users className="h-3 w-3 inline mr-1" />
                    Request Mentorship
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Mentor Profile Modal */}
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
              {/* Mentor header */}
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
                  <p className="text-lg text-muted-foreground">{selectedMentor.role} at {selectedMentor.company}</p>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1.5" />
                      <span>{selectedMentor.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4 mr-1.5" />
                      <span>{selectedMentor.experience} years experience</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1.5" />
                      <span>Connected {new Date(selectedMentor.connectionDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button 
                      className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center"
                      onClick={() => messageMentor(selectedMentor.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </button>
                    <button 
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center"
                      onClick={() => requestMentorship(selectedMentor.id)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Request Mentorship
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Mentor details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left column */}
                <div className="space-y-6">
                  {/* Contact information */}
                  <div className="glass-card rounded-xl p-5">
                    <h4 className="font-medium mb-4">Contact Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-primary" />
                        <a href={`mailto:${selectedMentor.email}`} className="hover:text-primary transition-colors">
                          {selectedMentor.email}
                        </a>
                      </div>
                      <div className="flex items-center text-sm">
                        <ExternalLink className="h-4 w-4 mr-2 text-primary" />
                        <a href={selectedMentor.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                          LinkedIn Profile
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  {/* Education */}
                  <div className="glass-card rounded-xl p-5">
                    <h4 className="font-medium mb-4">Education</h4>
                    <div className="flex items-start">
                      <BookOpen className="h-4 w-4 mr-2 text-primary mt-0.5" />
                      <span className="text-sm">{selectedMentor.education}</span>
                    </div>
                  </div>
                  
                  {/* Availability */}
                  <div className="glass-card rounded-xl p-5">
                    <h4 className="font-medium mb-4">Availability</h4>
                    <div className="flex items-start">
                      <Calendar className="h-4 w-4 mr-2 text-primary mt-0.5" />
                      <span className="text-sm">{selectedMentor.availability}</span>
                    </div>
                  </div>
                </div>
                
                {/* Middle column */}
                <div className="space-y-6">
                  {/* Specialties */}
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
                  
                  {/* Interests */}
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
                
                {/* Right column */}
                <div>
                  {/* About */}
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
      
      {/* Mentorship Request Form */}
      {showMentorshipForm && selectedMentorForRequest && (
        <MentorshipRequestForm 
          mentor={selectedMentorForRequest}
          onSubmit={handleMentorshipSubmit}
          onCancel={cancelMentorshipRequest}
        />
      )}
    </div>
  );
};

export default ConnectedMentorsPage; 