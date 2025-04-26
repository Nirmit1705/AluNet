import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, MessageSquare, UserMinus, Users, ChevronLeft, X } from "lucide-react";
import Navbar from "../layout/Navbar";

// Sample data for connections - in real app, this would come from an API
const studentConnectionsData = [
  {
    id: 1,
    name: "Sophia Williams",
    avatarUrl: null,
    program: "Computer Engineering",
    year: "4th Year",
    role: "Student",
    lastInteraction: "2 days ago",
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
    skills: ["Python", "R", "Data Visualization"],
    interests: ["Big Data", "Statistical Analysis"]
  },
  {
    id: 6,
    name: "Noah Patel",
    avatarUrl: null,
    program: "Computer Engineering",
    year: "4th Year",
    role: "Student",
    lastInteraction: "1 week ago",
    skills: ["Embedded Systems", "C", "IoT"],
    interests: ["Hardware Design", "Smart Devices"]
  },
  {
    id: 7,
    name: "Emma Lee",
    avatarUrl: null,
    program: "UX Design",
    year: "3rd Year",
    role: "Student",
    lastInteraction: "Yesterday",
    skills: ["Figma", "Adobe XD", "User Research"],
    interests: ["Interaction Design", "Accessibility"]
  }
];

const StudentConnectionsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [connections, setConnections] = useState(studentConnectionsData);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    programs: [],
    years: [],
    skills: []
  });
  const [confirmingRemoval, setConfirmingRemoval] = useState(null);

  // Navigate back to dashboard
  const goBack = () => {
    navigate(-1);
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    if (e.target.value === "") {
      setConnections(studentConnectionsData);
    } else {
      const filtered = studentConnectionsData.filter(
        student => 
          student.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
          student.program.toLowerCase().includes(e.target.value.toLowerCase()) ||
          student.skills.some(skill => skill.toLowerCase().includes(e.target.value.toLowerCase())) ||
          student.interests.some(interest => interest.toLowerCase().includes(e.target.value.toLowerCase()))
      );
      setConnections(filtered);
    }
  };

  // Toggle filter panel
  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  // Message a student
  const messageStudent = (studentId) => {
    navigate(`/messages?student=${studentId}`);
    // In a real app, this would navigate to a messaging interface with the student
  };

  // Remove a student connection
  const confirmRemoveConnection = (studentId) => {
    setConfirmingRemoval(studentId);
  };

  // Actually remove the connection after confirmation
  const removeConnection = (studentId) => {
    setConnections(connections.filter(student => student.id !== studentId));
    setConfirmingRemoval(null);
    // In a real app, this would also update the backend
  };

  // Cancel connection removal
  const cancelRemoval = () => {
    setConfirmingRemoval(null);
  };

  // Get initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
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
          <h1 className="text-2xl font-bold">Student Connections</h1>
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
                  {['Computer Science', 'Computer Engineering', 'Information Systems', 'Software Engineering', 'Data Science', 'UX Design'].map(program => (
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
                  {['React', 'JavaScript', 'Python', 'Java', 'UI/UX', 'Machine Learning', 'Data Science'].map(skill => (
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
          <p className="text-muted-foreground">Showing {connections.length} connections</p>
        </div>

        {/* Connections grid */}
        {connections.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Connections Found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearch("");
                setConnections(studentConnectionsData);
                setFilterOpen(false);
              }}
              className="px-6 py-2 bg-primary text-white rounded-md"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {connections.map(student => (
              <div key={student.id} className="glass-card rounded-xl p-6">
                <div className="flex items-start">
                  <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4 text-xl font-bold">
                    {student.avatarUrl ? (
                      <img src={student.avatarUrl} alt={student.name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      getInitials(student.name)
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-lg">{student.name}</h4>
                    <p className="text-sm text-muted-foreground">{student.program} • {student.year}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-muted-foreground">Last interaction: {student.lastInteraction}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="mb-3">
                    <p className="text-xs font-medium mb-1">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {student.skills.map((skill, idx) => (
                        <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-1">Interests</p>
                    <div className="flex flex-wrap gap-1">
                      {student.interests.map((interest, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-full">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => messageStudent(student.id)}
                    className="flex-1 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </button>
                  {confirmingRemoval === student.id ? (
                    <div className="flex-1 flex gap-1">
                      <button
                        onClick={() => removeConnection(student.id)}
                        className="flex-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 text-sm rounded-lg transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={cancelRemoval}
                        className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => confirmRemoveConnection(student.id)}
                      className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-200 text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <UserMinus className="h-4 w-4" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentConnectionsPage; 