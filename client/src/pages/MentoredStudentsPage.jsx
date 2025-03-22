import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { 
  Users, 
  Search, 
  MessageCircle, 
  UserMinus, 
  ArrowLeft, 
  Filter,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react";

// Sample data - in a real app, this would come from an API
const initialStudents = [
  {
    id: 1,
    name: "Alex Johnson",
    program: "Computer Science",
    year: "Senior",
    interests: ["Web Development", "AI"],
    connectionDate: "2023-03-15",
    avatar: null, // In a real app, this would be a URL
    lastActive: "Today",
    progress: "On track",
    careerGoals: "Software Engineer at a tech startup",
  },
  {
    id: 2,
    name: "Samantha Lee",
    program: "Data Science",
    year: "Junior",
    interests: ["Machine Learning", "Big Data"],
    connectionDate: "2023-05-22",
    avatar: null,
    lastActive: "Yesterday",
    progress: "Needs guidance",
    careerGoals: "Data Scientist in healthcare sector",
  },
  {
    id: 3,
    name: "Jason Wang",
    program: "Information Systems",
    year: "Sophomore",
    interests: ["Cybersecurity", "Cloud Computing"],
    connectionDate: "2023-07-10",
    avatar: null,
    lastActive: "3 days ago",
    progress: "Excellent",
    careerGoals: "Security analyst at a major firm",
  },
  {
    id: 4,
    name: "Maria Rodriguez",
    program: "Computer Engineering",
    year: "Senior",
    interests: ["Embedded Systems", "IoT"],
    connectionDate: "2022-11-05",
    avatar: null,
    lastActive: "1 week ago",
    progress: "On track",
    careerGoals: "Hardware engineer at a tech company",
  },
  {
    id: 5,
    name: "Tyrone Jackson",
    program: "Software Engineering",
    year: "Junior",
    interests: ["Mobile Development", "UX/UI Design"],
    connectionDate: "2023-02-18",
    avatar: null,
    lastActive: "Today",
    progress: "Needs guidance",
    careerGoals: "Mobile app developer",
  },
];

const MentoredStudentsPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmingRemoval, setConfirmingRemoval] = useState(null);
  const [filter, setFilter] = useState("all"); // all, recent, needs-guidance

  useEffect(() => {
    // In a real app, you would fetch the mentored students here
    // For now, we're using the sample data
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter and search students
  const filteredStudents = students
    .filter(student => {
      if (filter === "recent") {
        const date = new Date(student.connectionDate);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return date > threeMonthsAgo;
      } else if (filter === "needs-guidance") {
        return student.progress === "Needs guidance";
      }
      return true;
    })
    .filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.interests.some(interest => 
        interest.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  // Handle student selection
  const viewStudentDetails = (student) => {
    setSelectedStudent(student);
  };

  // Message student
  const messageStudent = (studentId) => {
    const student = students.find(s => s.id === studentId);
    navigate(`/messages/${studentId}`);
  };

  // Remove student from mentorship
  const removeConnection = (studentId) => {
    setConfirmingRemoval(studentId);
  };

  // Confirm remove connection
  const confirmRemoveConnection = (studentId) => {
    setIsLoading(true);
    
    // In a real app, this would be an API call
    setTimeout(() => {
      setStudents(students.filter(student => student.id !== studentId));
      setConfirmingRemoval(null);
      setSelectedStudent(null);
      setIsLoading(false);
    }, 800);
  };

  // Cancel remove connection
  const cancelRemoveConnection = () => {
    setConfirmingRemoval(null);
  };

  // Go back to dashboard
  const goBackToDashboard = () => {
    navigate("/alumni-dashboard");
  };

  // Back to list view (from student detail view)
  const backToList = () => {
    setSelectedStudent(null);
  };

  // Get student initials for avatar
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16 pb-6 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header with back button */}
          <div className="flex items-center mb-1 mt-2">
            <button 
              onClick={goBackToDashboard}
              className="mr-3"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold">Mentored Students</h1>
          </div>
          <p className="text-muted-foreground ml-8 mb-4">
            {students.length} students under your mentorship
          </p>

          {/* Main content - boxed with constrained width */}
          <div className="bg-white rounded-xl shadow-sm">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : selectedStudent ? (
              /* Selected student details view */
              <div className="animate-fade-in p-6">
                <button 
                  onClick={backToList}
                  className="flex items-center text-primary mb-6"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to all students
                </button>
                
                <div className="flex flex-col sm:flex-row gap-6 mb-8">
                  <div className="flex-shrink-0 h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                    {getInitials(selectedStudent.name)}
                  </div>
                  
                  <div className="flex-grow">
                    <h2 className="text-2xl font-bold mb-1">{selectedStudent.name}</h2>
                    <p className="text-muted-foreground mb-2">
                      {selectedStudent.program} • {selectedStudent.year}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedStudent.interests.map((interest, idx) => (
                        <span 
                          key={idx} 
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm mb-2">
                      <div>
                        <span className="text-muted-foreground">Connected since:</span>{' '}
                        <span className="font-medium">
                          {new Date(selectedStudent.connectionDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last active:</span>{' '}
                        <span className="font-medium">{selectedStudent.lastActive}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-3">
                      <button 
                        onClick={() => messageStudent(selectedStudent.id)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Message
                      </button>
                      
                      <button 
                        onClick={() => removeConnection(selectedStudent.id)}
                        className="px-4 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors flex items-center gap-2"
                      >
                        <UserMinus className="h-4 w-4" />
                        Remove Connection
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-border rounded-lg p-4">
                    <h3 className="font-medium mb-3">Mentorship Progress</h3>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span className={`font-medium ${
                          selectedStudent.progress === "Excellent" 
                            ? "text-green-600" 
                            : selectedStudent.progress === "Needs guidance" 
                            ? "text-amber-600"
                            : ""
                        }`}>
                          {selectedStudent.progress}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div 
                          className={`h-full rounded-full ${
                            selectedStudent.progress === "Excellent" 
                              ? "bg-green-600 w-[90%]" 
                              : selectedStudent.progress === "Needs guidance" 
                              ? "bg-amber-600 w-[35%]"
                              : "bg-primary w-[65%]"
                          }`}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Last mentorship session: <span className="font-medium">2 weeks ago</span>
                    </p>
                  </div>
                  
                  <div className="border border-border rounded-lg p-4">
                    <h3 className="font-medium mb-3">Career Goals</h3>
                    <p className="text-sm">{selectedStudent.careerGoals}</p>
                  </div>
                </div>
              </div>
            ) : (
              /* List view */
              <>
                <div className="flex items-center p-4 border-b border-gray-100">
                  {/* Search bar */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, program, or interests..."
                      className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  {/* Filter dropdown */}
                  <div className="ml-4 flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-gray-400" />
                    <select
                      className="bg-transparent border-none text-gray-700 font-medium text-sm focus:outline-none"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="all">All Students</option>
                      <option value="recent">Recently Added</option>
                      <option value="needs-guidance">Needs Guidance</option>
                    </select>
                  </div>
                </div>
                
                {/* Students list */}
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-40 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No students found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm 
                        ? "Try adjusting your search terms" 
                        : "You don't have any students matching the current filter"}
                    </p>
                  </div>
                ) : (
                  <div>
                    {filteredStudents.map((student) => (
                      <div 
                        key={student.id}
                        className="border-b border-gray-100 last:border-b-0"
                      >
                        {confirmingRemoval === student.id ? (
                          <div className="animate-fade-in p-4">
                            <h3 className="font-medium mb-2">Remove Connection</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Are you sure you want to remove {student.name} from your mentorship list? 
                              This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                              <button
                                onClick={() => confirmRemoveConnection(student.id)}
                                className="px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors flex items-center gap-2"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Yes, Remove
                              </button>
                              <button
                                onClick={cancelRemoveConnection}
                                className="px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
                              >
                                <XCircle className="h-4 w-4" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center p-4 hover:bg-gray-50">
                            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-4">
                              {getInitials(student.name)}
                            </div>
                            
                            <div 
                              className="flex-grow cursor-pointer" 
                              onClick={() => viewStudentDetails(student)}
                            >
                              <h3 className="font-medium">{student.name}</h3>
                              <p className="text-sm text-gray-500">
                                {student.program} • {student.year}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {student.interests.slice(0, 2).map((interest, idx) => (
                                  <span 
                                    key={idx} 
                                    className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full"
                                  >
                                    {interest}
                                  </span>
                                ))}
                                {student.interests.length > 2 && (
                                  <span className="text-xs text-gray-500">
                                    +{student.interests.length - 2} more
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex-shrink-0 flex gap-2">
                              <button
                                onClick={() => messageStudent(student.id)}
                                className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                              >
                                Message
                              </button>
                              <button
                                onClick={() => removeConnection(student.id)}
                                className="text-red-500"
                                aria-label={`Remove ${student.name} from connections`}
                              >
                                <UserMinus className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentoredStudentsPage; 