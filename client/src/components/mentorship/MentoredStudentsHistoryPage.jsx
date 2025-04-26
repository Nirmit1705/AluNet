import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Users, MessageSquare, Calendar, Search, Filter, X, Clock, BookOpen, GraduationCap, Trophy, BadgeCheck, Briefcase } from "lucide-react";
import Navbar from "../layout/Navbar";

// Sample data for previously mentored students
const mentoredStudentsHistoryData = [
  {
    id: 1,
    name: "Marcus Johnson",
    avatarUrl: null,
    program: "Computer Science",
    year: "Graduated 2023",
    role: "Former Student",
    mentorshipDuration: "1 year and 2 months",
    mentorshipPeriod: "Feb 2022 - Apr 2023",
    currentPosition: "Software Engineer at Google",
    achievements: ["Secured internship at Google", "Received full-time offer after graduation", "Developed e-commerce platform for local business"],
    skills: ["Java", "Python", "Data Structures"],
    interests: ["Backend Development", "Cloud Computing"]
  },
  {
    id: 2,
    name: "Aisha Patel",
    avatarUrl: null,
    program: "Computer Engineering",
    year: "Graduated 2022",
    role: "Former Student",
    mentorshipDuration: "9 months",
    mentorshipPeriod: "Sep 2021 - Jun 2022",
    currentPosition: "Hardware Engineer at Apple",
    achievements: ["Won hackathon first place", "Published research paper", "Completed certification in IoT systems"],
    skills: ["C++", "VHDL", "Embedded Systems"],
    interests: ["Hardware Design", "IoT", "Robotics"]
  },
  {
    id: 3,
    name: "Tyler Rodriguez",
    avatarUrl: null,
    program: "Information Systems",
    year: "Graduated 2023",
    role: "Former Student",
    mentorshipDuration: "1 year and 5 months",
    mentorshipPeriod: "Jan 2022 - Jun 2023",
    currentPosition: "Product Manager at Microsoft",
    achievements: ["Developed AI-based recommendation system", "Led team of 5 for capstone project", "Earned PM certification"],
    skills: ["Product Management", "Agile", "UX Research"],
    interests: ["AI/ML", "Product Strategy"]
  },
  {
    id: 4,
    name: "Sarah Kim",
    avatarUrl: null,
    program: "Data Science",
    year: "Graduated 2022",
    role: "Former Student",
    mentorshipDuration: "11 months",
    mentorshipPeriod: "Aug 2021 - Jul 2022",
    currentPosition: "Data Scientist at Netflix",
    achievements: ["Contributed to open-source ML library", "Published thesis on recommendation algorithms", "Awarded university research grant"],
    skills: ["Python", "Machine Learning", "Statistical Analysis"],
    interests: ["Recommendation Systems", "Computer Vision"]
  },
  {
    id: 5,
    name: "James Wilson",
    avatarUrl: null,
    program: "Software Engineering",
    year: "Graduated 2023",
    role: "Former Student",
    mentorshipDuration: "1 year",
    mentorshipPeriod: "May 2022 - May 2023",
    currentPosition: "Full Stack Developer at Shopify",
    achievements: ["Developed popular Chrome extension", "Created online learning platform", "Speaker at local tech conference"],
    skills: ["JavaScript", "React", "Node.js"],
    interests: ["Web Development", "Open Source", "EdTech"]
  },
  {
    id: 6,
    name: "Elena Martinez",
    avatarUrl: null,
    program: "User Experience Design",
    year: "Graduated 2022",
    role: "Former Student",
    mentorshipDuration: "10 months",
    mentorshipPeriod: "Jul 2021 - May 2022",
    currentPosition: "UX Designer at Airbnb",
    achievements: ["Redesigned university portal UI", "Won design competition", "Increased conversion by 45% for client project"],
    skills: ["Figma", "User Research", "Prototyping"],
    interests: ["Interaction Design", "Accessibility"]
  }
];

const MentoredStudentsHistoryPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState(mentoredStudentsHistoryData);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    programs: [],
    years: [],
    skills: []
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Navigate back to dashboard
  const goBack = () => {
    navigate(-1);
  };
  
  // Handle search input
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    if (e.target.value === "") {
      setStudents(mentoredStudentsHistoryData);
    } else {
      const filtered = mentoredStudentsHistoryData.filter(
        student => 
          student.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
          student.program.toLowerCase().includes(e.target.value.toLowerCase()) ||
          student.currentPosition.toLowerCase().includes(e.target.value.toLowerCase()) ||
          student.skills.some(skill => skill.toLowerCase().includes(e.target.value.toLowerCase())) ||
          student.interests.some(interest => interest.toLowerCase().includes(e.target.value.toLowerCase()))
      );
      setStudents(filtered);
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
  
  // View student details
  const viewStudentDetails = (student) => {
    setSelectedStudent(student);
  };
  
  // Close student details
  const closeStudentDetails = () => {
    setSelectedStudent(null);
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
          <h1 className="text-2xl font-bold">Students Mentored History</h1>
        </div>
        
        {/* Search and filter bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, program, current position, or skills..."
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
                  {['Computer Science', 'Computer Engineering', 'Information Systems', 'Software Engineering', 'Data Science', 'User Experience Design'].map(program => (
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
              
              {/* Graduation Year filter section */}
              <div>
                <h4 className="text-sm font-medium mb-2">Graduation Year</h4>
                <div className="space-y-1">
                  {['2023', '2022', '2021', '2020', '2019'].map(year => (
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
                  {['JavaScript', 'Python', 'Java', 'C++', 'React', 'Machine Learning', 'Product Management'].map(skill => (
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
          <p className="text-muted-foreground">Showing {students.length} mentored students</p>
        </div>
        
        {/* Students grid */}
        {students.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Mentored Students Found</h3>
            <p className="text-muted-foreground mb-6">You have not mentored any students previously, or they don't match your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {students.map(student => (
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
                      <Briefcase className="h-3 w-3 text-primary mr-1.5" />
                      <span className="text-xs text-primary font-medium">{student.currentPosition}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                  <span className="text-xs text-blue-600 dark:text-blue-400">Mentored for {student.mentorshipDuration}</span>
                </div>
                
                <div className="mt-4">
                  <div className="mb-3">
                    <p className="text-xs font-medium mb-1">Notable Achievements</p>
                    <div className="space-y-1">
                      {student.achievements.slice(0, 2).map((achievement, idx) => (
                        <div key={idx} className="flex items-start">
                          <Trophy className="h-3 w-3 text-amber-500 mt-0.5 mr-1.5 flex-shrink-0" />
                          <span className="text-xs">{achievement}</span>
                        </div>
                      ))}
                      {student.achievements.length > 2 && (
                        <span className="text-xs text-muted-foreground ml-4.5">+{student.achievements.length - 2} more achievements</span>
                      )}
                    </div>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs font-medium mb-1">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {student.skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {skill}
                        </span>
                      ))}
                      {student.skills.length > 3 && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                          +{student.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => viewStudentDetails(student)}
                    className="w-full px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <BadgeCheck className="h-4 w-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => messageStudent(student.id)}
                    className="w-full px-3 py-2 bg-primary text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 w-full max-w-3xl rounded-xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-border z-10 flex justify-between items-center">
              <h2 className="text-xl font-bold">Mentored Student Details</h2>
              <button 
                onClick={closeStudentDetails}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Student details */}
              <div className="flex items-start mb-6">
                <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-5 text-xl font-bold">
                  {selectedStudent.avatarUrl ? (
                    <img src={selectedStudent.avatarUrl} alt={selectedStudent.name} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    getInitials(selectedStudent.name)
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedStudent.name}</h3>
                  <p className="text-muted-foreground">{selectedStudent.program} • {selectedStudent.year}</p>
                  <div className="flex items-center mt-2">
                    <Briefcase className="h-4 w-4 text-primary mr-1.5" />
                    <span className="text-sm text-primary font-medium">{selectedStudent.currentPosition}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:gap-4 mt-2">
                    <div className="flex items-center mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground mr-1.5" />
                      <span className="text-sm text-muted-foreground">Mentored for {selectedStudent.mentorshipDuration}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 text-blue-600 mr-1.5" />
                      <span className="text-sm text-blue-600">{selectedStudent.mentorshipPeriod}</span>
                    </div>
                  </div>
                </div>
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
                      {selectedStudent.skills.map((skill, idx) => (
                        <span key={idx} className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Interests</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedStudent.interests.map((interest, idx) => (
                        <span key={idx} className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Achievements */}
                <div className="glass-card rounded-xl p-5">
                  <div className="flex items-center mb-4">
                    <Trophy className="h-5 w-5 text-amber-500 mr-2" />
                    <h4 className="font-medium">Notable Achievements</h4>
                  </div>
                  
                  <ul className="space-y-3">
                    {selectedStudent.achievements.map((achievement, idx) => (
                      <li key={idx} className="flex items-start">
                        <div className="min-w-5 mt-0.5 mr-2">
                          <Trophy className="h-4 w-4 text-amber-500" />
                        </div>
                        <span className="text-sm">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Action button */}
              <div className="flex justify-center">
                <button
                  onClick={() => messageStudent(selectedStudent.id)}
                  className="px-6 py-3 bg-primary text-white rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  <MessageSquare className="h-5 w-5" />
                  Message {selectedStudent.name}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentoredStudentsHistoryPage; 