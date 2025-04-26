import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Users, CheckCircle, XCircle, Clock, Calendar, Search, Filter, X, Briefcase, GraduationCap, BookOpen } from "lucide-react";
import Navbar from "../layout/Navbar";

// Sample data for mentorship requests
const mentorshipRequestsData = [
  {
    id: 1,
    studentName: "Emily Parker",
    studentId: "EP20210405",
    program: "Computer Science",
    year: "3rd Year",
    avatarUrl: null,
    skills: ["JavaScript", "React", "Web Development"],
    interests: ["Frontend Development", "UI/UX Design"],
    requestDate: "2023-05-10",
    message: "I'm particularly interested in your experience at Microsoft and would love guidance on preparing for technical interviews at major tech companies. I'm also working on improving my frontend skills and could use advice on portfolio projects.",
    goals: ["Prepare for technical interviews", "Build portfolio projects", "Learn industry best practices"],
    availability: ["Mondays and Wednesdays evenings", "Friday afternoons"],
    preferredMentorshipType: "Virtual, bi-weekly meetings"
  },
  {
    id: 2,
    studentName: "Jason Miller",
    studentId: "JM20200309",
    program: "Data Science",
    year: "4th Year",
    avatarUrl: null,
    skills: ["Python", "Machine Learning", "SQL"],
    interests: ["Data Visualization", "AI Ethics"],
    requestDate: "2023-05-08",
    message: "I'm currently working on my capstone project that involves natural language processing and recommendation systems. I would appreciate guidance on best practices and potential career paths in data science after graduation.",
    goals: ["Complete capstone project", "Explore data science career paths", "Prepare for job search"],
    availability: ["Tuesday afternoons", "Thursday evenings", "Weekends"],
    preferredMentorshipType: "Mix of virtual and in-person, monthly"
  },
  {
    id: 3,
    studentName: "Alex Thompson",
    studentId: "AT20220512",
    program: "Information Systems",
    year: "2nd Year",
    avatarUrl: null,
    skills: ["Java", "Database Design", "System Analysis"],
    interests: ["Enterprise Systems", "Project Management"],
    requestDate: "2023-05-12",
    message: "I'm still exploring different areas in IT and would value your insights on various career paths. I'm particularly drawn to project management but want to ensure I have the technical foundation needed. I would also appreciate advice on relevant internships to pursue.",
    goals: ["Explore IT career options", "Develop technical skills", "Find relevant internships"],
    availability: ["Monday through Friday afternoons"],
    preferredMentorshipType: "In-person, monthly meetings"
  },
  {
    id: 4,
    studentName: "Priya Sharma",
    studentId: "PS20210708",
    program: "Software Engineering",
    year: "3rd Year",
    avatarUrl: null,
    skills: ["C++", "Java", "Algorithms"],
    interests: ["Distributed Systems", "Cloud Computing"],
    requestDate: "2023-05-07",
    message: "I'm keen to learn more about your experience in building scalable systems. I'm currently taking advanced courses in distributed systems and would appreciate guidance on practical applications and industry trends in this area.",
    goals: ["Deepen knowledge of distributed systems", "Learn about industry applications", "Prepare for advanced roles"],
    availability: ["Weekday evenings", "Sunday afternoons"],
    preferredMentorshipType: "Virtual, weekly check-ins"
  },
  {
    id: 5,
    studentName: "David Wilson",
    studentId: "DW20190204",
    program: "Computer Engineering",
    year: "4th Year",
    avatarUrl: null,
    skills: ["Hardware Design", "Embedded Systems", "IoT"],
    interests: ["Smart Devices", "Robotics"],
    requestDate: "2023-05-11",
    message: "I'm working on an IoT thesis project and would value your expertise in hardware-software integration. Additionally, I'm considering pursuing a graduate degree and would appreciate advice on whether that's beneficial for industry roles in embedded systems.",
    goals: ["Complete thesis project", "Evaluate graduate study options", "Prepare for specialized roles"],
    availability: ["Monday, Wednesday, Friday mornings", "Tuesday evenings"],
    preferredMentorshipType: "In-person, bi-weekly sessions"
  }
];

const MentorshipRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState(mentorshipRequestsData);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    programs: [],
    years: [],
    skills: []
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Navigate back to dashboard
  const goBack = () => {
    navigate(-1);
  };
  
  // Handle search input
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    if (e.target.value === "") {
      setRequests(mentorshipRequestsData);
    } else {
      const filtered = mentorshipRequestsData.filter(
        request => 
          request.studentName.toLowerCase().includes(e.target.value.toLowerCase()) ||
          request.program.toLowerCase().includes(e.target.value.toLowerCase()) ||
          request.skills.some(skill => skill.toLowerCase().includes(e.target.value.toLowerCase())) ||
          request.interests.some(interest => interest.toLowerCase().includes(e.target.value.toLowerCase()))
      );
      setRequests(filtered);
    }
  };
  
  // Toggle filter panel
  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };
  
  // Set selected request
  const viewRequestDetails = (request) => {
    setSelectedRequest(request);
  };
  
  // Close request details
  const closeRequestDetails = () => {
    setSelectedRequest(null);
  };
  
  // Accept a mentorship request
  const acceptRequest = (requestId) => {
    // In a real app, this would call an API to update the request status
    console.log(`Accepting request ${requestId}`);
    // Remove the request from the list and close the detail view
    setRequests(requests.filter(req => req.id !== requestId));
    setSelectedRequest(null);
    // Show confirmation message
    alert(`You have accepted the mentorship request from ${mentorshipRequestsData.find(req => req.id === requestId)?.studentName}`);
  };
  
  // Decline a mentorship request
  const declineRequest = (requestId) => {
    // In a real app, this would call an API to update the request status
    console.log(`Declining request ${requestId}`);
    // Remove the request from the list and close the detail view
    setRequests(requests.filter(req => req.id !== requestId));
    setSelectedRequest(null);
    // Show confirmation message
    alert(`You have declined the mentorship request from ${mentorshipRequestsData.find(req => req.id === requestId)?.studentName}`);
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
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
            {requests.map(request => (
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
              
              {/* Request message */}
              <div className="glass-card rounded-xl p-5 mb-6">
                <h4 className="font-medium mb-3">Message from Student</h4>
                <p className="text-muted-foreground">{selectedRequest.message}</p>
              </div>
              
              {/* Details grid */}
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
              </div>
              
              {/* Availability */}
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
                  </div>
                </div>
              </div>
              
              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={() => declineRequest(selectedRequest.id)}
                  className="px-5 py-2.5 border border-red-200 text-red-500 rounded-lg flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                  Decline Request
                </button>
                <button
                  onClick={() => acceptRequest(selectedRequest.id)}
                  className="px-5 py-2.5 bg-primary text-white rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  <CheckCircle className="h-5 w-5" />
                  Accept as Mentee
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