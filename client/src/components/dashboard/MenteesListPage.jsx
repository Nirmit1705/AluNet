import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  Calendar, 
  Search, 
  ChevronLeft, 
  Filter, 
  SlidersHorizontal,
  ArrowUpDown,
  X,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MenteeDetailsModal from './MenteeDetailsModal';
import ScheduleSessionModal from './ScheduleSessionModal';

const MenteesListPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [selectedMenteeForScheduling, setSelectedMenteeForScheduling] = useState(null);
  const [showDirectScheduleModal, setShowDirectScheduleModal] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState('nameAsc');

  // Sample data - in a real app, this would come from an API
  const allMentees = [
    {
      id: 1,
      name: "Emily Parker",
      program: "Computer Science",
      year: "Junior",
      lastInteraction: "2 days ago",
      nextSession: "May 15, 2023",
      profileImg: null,
      status: "Active",
      focusAreas: ["Technical Skills", "Career Guidance", "Interview Preparation"],
      progress: 60,
      sessionsCompleted: 3,
      totalSessions: 5,
      startDate: "January 15, 2023",
      email: "emily.parker@university.edu",
      notes: "Working on improving technical skills in React and preparing for internship interviews."
    },
    {
      id: 2,
      name: "Michael Chen",
      program: "Software Engineering",
      year: "Senior",
      lastInteraction: "1 week ago",
      nextSession: "May 18, 2023",
      profileImg: null,
      status: "Active",
      focusAreas: ["System Design", "Algorithm Practice", "Resume Review"],
      progress: 40,
      sessionsCompleted: 2,
      totalSessions: 5,
      startDate: "February 3, 2023",
      email: "michael.chen@university.edu",
      notes: "Preparing for full-time roles after graduation. Focusing on system design concepts."
    },
    {
      id: 3,
      name: "Sarah Johnson",
      program: "Data Science",
      year: "Graduate",
      lastInteraction: "Yesterday",
      nextSession: "May 22, 2023",
      profileImg: null,
      status: "Active",
      focusAreas: ["Machine Learning", "Data Visualization", "Project Planning"],
      progress: 80,
      sessionsCompleted: 4,
      totalSessions: 5,
      startDate: "December 10, 2022",
      email: "sarah.johnson@university.edu",
      notes: "Working on capstone project for MS degree. Needs guidance on ML model selection."
    },
    {
      id: 4,
      name: "David Kim",
      program: "Computer Engineering",
      year: "Senior",
      lastInteraction: "3 days ago",
      nextSession: "May 25, 2023",
      profileImg: null,
      status: "Active",
      focusAreas: ["Hardware Design", "Embedded Systems", "Job Search"],
      progress: 60,
      sessionsCompleted: 3,
      totalSessions: 5,
      startDate: "January 20, 2023",
      email: "david.kim@university.edu",
      notes: "Interested in roles at hardware companies. Working on portfolio projects."
    },
    {
      id: 5,
      name: "Jessica Martinez",
      program: "Information Systems",
      year: "Junior",
      lastInteraction: "5 days ago",
      nextSession: "May 30, 2023",
      profileImg: null,
      status: "Active",
      focusAreas: ["Project Management", "Business Analysis", "Technical Writing"],
      progress: 40,
      sessionsCompleted: 2,
      totalSessions: 5,
      startDate: "March 5, 2023",
      email: "jessica.martinez@university.edu",
      notes: "Looking for product management internships. Working on case studies."
    }
  ];

  const handleBack = () => {
    navigate('/alumni-dashboard');
  };

  const viewMenteeDetails = (mentee) => {
    setSelectedMentee(mentee);
  };

  const messageMentee = (menteeId) => {
    navigate(`/messages?mentee=${menteeId}`);
  };

  const openScheduleModal = (mentee, e) => {
    if (e) e.stopPropagation();
    setSelectedMenteeForScheduling(mentee);
    setShowDirectScheduleModal(true);
  };

  const handleCloseScheduleModal = () => {
    setShowDirectScheduleModal(false);
  };

  const handleSessionScheduled = (mentee, sessionDetails) => {
    // In a real app, this would send the session data to an API
    console.log("Scheduling session:", {mentee, sessionDetails});
    
    // Give feedback
    alert(`Session scheduled with ${mentee.name} on ${sessionDetails.date} at ${sessionDetails.time}`);
    
    // Close modal
    setShowDirectScheduleModal(false);
  };

  // Filter mentees by search query
  const filteredMentees = allMentees.filter(mentee => 
    mentee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentee.program.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort mentees based on sort option
  const sortedMentees = [...filteredMentees].sort((a, b) => {
    switch (sortOption) {
      case 'nameAsc':
        return a.name.localeCompare(b.name);
      case 'nameDesc':
        return b.name.localeCompare(a.name);
      case 'recentInteraction':
        // This is just a simple example - in a real app you'd use dates
        return a.lastInteraction.localeCompare(b.lastInteraction);
      case 'nextSession':
        return a.nextSession.localeCompare(b.nextSession);
      default:
        return 0;
    }
  });

  return (
    <div className="container-custom pt-20 pb-12">
      <div className="mb-6 flex items-center">
        <button 
          onClick={handleBack}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Go back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">Current Mentees</h1>
      </div>
      
      {/* Search and filter section - unchanged */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        {/* Existing search and filter code */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
            placeholder="Search mentees by name or program..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
          
          {/* Existing sort dropdown */}
          <div className="relative">
            <button 
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={() => document.getElementById('sortDropdown').classList.toggle('hidden')}
            >
              <ArrowUpDown className="h-4 w-4" />
              <span className="hidden sm:inline">Sort</span>
            </button>
            
            <div 
              id="sortDropdown" 
              className="absolute right-0 mt-1 z-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg w-48 hidden"
            >
              <div className="p-2">
                <button
                  className={`w-full text-left px-3 py-1.5 rounded-md ${sortOption === 'nameAsc' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  onClick={() => {
                    setSortOption('nameAsc');
                    document.getElementById('sortDropdown').classList.add('hidden');
                  }}
                >
                  Name (A-Z)
                </button>
                <button
                  className={`w-full text-left px-3 py-1.5 rounded-md ${sortOption === 'nameDesc' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  onClick={() => {
                    setSortOption('nameDesc');
                    document.getElementById('sortDropdown').classList.add('hidden');
                  }}
                >
                  Name (Z-A)
                </button>
                <button
                  className={`w-full text-left px-3 py-1.5 rounded-md ${sortOption === 'recentInteraction' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  onClick={() => {
                    setSortOption('recentInteraction');
                    document.getElementById('sortDropdown').classList.add('hidden');
                  }}
                >
                  Most Recent Interaction
                </button>
                <button
                  className={`w-full text-left px-3 py-1.5 rounded-md ${sortOption === 'nextSession' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  onClick={() => {
                    setSortOption('nextSession');
                    document.getElementById('sortDropdown').classList.add('hidden');
                  }}
                >
                  Upcoming Sessions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filter panel - unchanged */}
      {filterOpen && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-fade-down">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filter Options
            </h3>
            <button onClick={() => setFilterOpen(false)} className="text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Add filter options as needed */}
            <div>
              <label className="text-sm font-medium mb-1 block">Program</label>
              <select className="w-full px-3 py-2 bg-background border border-input rounded-md">
                <option value="">All Programs</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Data Science">Data Science</option>
                <option value="Computer Engineering">Computer Engineering</option>
                <option value="Information Systems">Information Systems</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Year</label>
              <select className="w-full px-3 py-2 bg-background border border-input rounded-md">
                <option value="">All Years</option>
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
                <option value="Graduate">Graduate</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Focus Area</label>
              <select className="w-full px-3 py-2 bg-background border border-input rounded-md">
                <option value="">All Areas</option>
                <option value="Technical Skills">Technical Skills</option>
                <option value="Career Guidance">Career Guidance</option>
                <option value="Interview Preparation">Interview Preparation</option>
                <option value="System Design">System Design</option>
                <option value="Job Search">Job Search</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <select className="w-full px-3 py-2 bg-background border border-input rounded-md">
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4 gap-2">
            <button className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              Reset
            </button>
            <button className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90">
              Apply Filters
            </button>
          </div>
        </div>
      )}
      
      {/* NEW GRID LAYOUT */}
      {sortedMentees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMentees.map((mentee) => (
            <div 
              key={mentee.id} 
              className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer h-full flex flex-col"
              onClick={() => viewMenteeDetails(mentee)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Users className="h-7 w-7" />
                </div>
                
                <div>
                  <h4 className="font-medium text-primary text-lg">{mentee.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{mentee.program} • {mentee.year}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                  <span className="text-xs text-muted-foreground">Last: {mentee.lastInteraction}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 text-green-600 mr-1.5" />
                  <span className="text-xs text-green-600">Next: {mentee.nextSession}</span>
                </div>
              </div>
              
              <div className="mb-4 flex-grow">
                <div className="text-xs text-muted-foreground mb-1">Mentorship Progress</div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${mentee.progress}%` }}
                  ></div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {mentee.sessionsCompleted} of {mentee.totalSessions} Sessions Completed
                </div>
              </div>
              
              <div className="mb-4 flex flex-wrap gap-1.5">
                {mentee.focusAreas.slice(0, 2).map((area, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    {area}
                  </span>
                ))}
                {mentee.focusAreas.length > 2 && (
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                    +{mentee.focusAreas.length - 2} more
                  </span>
                )}
              </div>
              
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={(e) => openScheduleModal(mentee, e)}
                  className="flex-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors flex items-center justify-center"
                >
                  <Calendar className="h-4 w-4 mr-1.5" />
                  Schedule
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    messageMentee(mentee.id);
                  }}
                  className="flex-1 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-sm rounded-lg transition-colors flex items-center justify-center"
                >
                  <MessageSquare className="h-4 w-4 mr-1.5" />
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No mentees match your search criteria.</p>
        </div>
      )}
      
      {/* Modals - unchanged */}
      <MenteeDetailsModal
        selectedMentee={selectedMentee}
        setSelectedMentee={setSelectedMentee}
        messageMentee={messageMentee}
      />
      
      <ScheduleSessionModal 
        isOpen={showDirectScheduleModal}
        onClose={handleCloseScheduleModal}
        mentee={selectedMenteeForScheduling}
        onSchedule={handleSessionScheduled}
      />
    </div>
  );
};

export default MenteesListPage;