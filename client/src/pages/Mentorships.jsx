import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Search, 
  Filter, 
  Calendar, 
  ArrowUpDown, 
  Clock, 
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

  // Fetch mentorships data
  useEffect(() => {
    // In a real application, this would be an API call
    // Here we're using sample data
    const sampleMentorships = [
      {
        id: "m1",
        mentorName: "Dr. Sarah Chen",
        mentorTitle: "Senior Data Scientist at Google",
        mentorAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
        startDate: "2023-09-15",
        nextSession: "2023-11-20",
        totalSessions: 12,
        completedSessions: 5,
        focusAreas: ["Machine Learning", "Career Guidance", "Data Analysis"],
        status: "active",
        progress: 42,
        notes: "We're working on building a recommendation system project. Sarah has been extremely helpful in guiding me through best practices for data preprocessing and model selection.",
        contact: {
          email: "sarah.chen@example.com",
          linkedin: "linkedin.com/in/sarahchen"
        }
      },
      {
        id: "m2",
        mentorName: "Michael Rodriguez",
        mentorTitle: "Frontend Engineering Manager at Netflix",
        mentorAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
        startDate: "2023-08-10",
        nextSession: "2023-11-15",
        totalSessions: 10,
        completedSessions: 7,
        focusAreas: ["React", "System Design", "Career Development"],
        status: "active",
        progress: 70,
        notes: "Michael is helping me improve my React skills and prepare for frontend engineering interviews. We're working through a portfolio project that demonstrates advanced React patterns.",
        contact: {
          email: "michael.r@example.com",
          linkedin: "linkedin.com/in/michaelrodriguez"
        }
      },
      {
        id: "m3",
        mentorName: "Aisha Johnson",
        mentorTitle: "Product Manager at Microsoft",
        mentorAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
        startDate: "2023-07-22",
        nextSession: "2023-11-22",
        totalSessions: 8,
        completedSessions: 6,
        focusAreas: ["Product Strategy", "UX Research", "User Interviews"],
        status: "active",
        progress: 75,
        notes: "Aisha is helping me transition from engineering to product management. We've been working on case studies and practicing product interviews.",
        contact: {
          email: "aisha.j@example.com",
          linkedin: "linkedin.com/in/aishajohnson"
        }
      },
      {
        id: "m4",
        mentorName: "David Park",
        mentorTitle: "Mobile Developer at Spotify",
        mentorAvatar: "https://randomuser.me/api/portraits/men/22.jpg",
        startDate: "2023-10-05",
        nextSession: "2023-11-18",
        totalSessions: 6,
        completedSessions: 2,
        focusAreas: ["Mobile Development", "React Native", "App Architecture"],
        status: "active",
        progress: 33,
        notes: "David is helping me build my first React Native app. We're focusing on performance optimization and component reusability.",
        contact: {
          email: "david.p@example.com",
          linkedin: "linkedin.com/in/davidpark"
        }
      },
      {
        id: "m5",
        mentorName: "Elena Martinez",
        mentorTitle: "Data Engineering Lead at Amazon",
        mentorAvatar: "https://randomuser.me/api/portraits/women/28.jpg",
        startDate: "2023-06-12",
        nextSession: null,
        totalSessions: 12,
        completedSessions: 12,
        focusAreas: ["Big Data", "ETL Pipelines", "Data Warehousing"],
        status: "completed",
        progress: 100,
        notes: "Elena helped me master data engineering concepts and AWS services. Our mentorship was focused on building scalable data pipelines.",
        contact: {
          email: "elena.m@example.com",
          linkedin: "linkedin.com/in/elenamartinez"
        }
      },
      {
        id: "m6",
        mentorName: "Raj Patel",
        mentorTitle: "Backend Engineer at Stripe",
        mentorAvatar: "https://randomuser.me/api/portraits/men/45.jpg",
        startDate: "2023-05-20",
        nextSession: "2023-11-25",
        totalSessions: 8,
        completedSessions: 3,
        focusAreas: ["Node.js", "API Design", "Database Optimization"],
        status: "paused",
        progress: 38,
        notes: "Our mentorship is temporarily paused due to Raj's travel schedule. We'll resume in late November to continue our work on designing RESTful APIs.",
        contact: {
          email: "raj.p@example.com",
          linkedin: "linkedin.com/in/rajpatel"
        }
      }
    ];

    setMentorships(sampleMentorships);
    setFilteredMentorships(sampleMentorships);
  }, []);

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
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="px-2"
                          onClick={() => navigate(`/messages/${mentorship.id}`)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(mentorship)}
                        >
                          View Details
                        </Button>
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
    </div>
  );
};

export default MentorshipsPage; 