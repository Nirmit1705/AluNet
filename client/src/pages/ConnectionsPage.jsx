import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { 
  Users, 
  Search, 
  UserMinus, 
  ChevronLeft, 
  Filter,
  CheckCircle2,
  XCircle,
  Loader2,
  UserCircle,
  MessageSquare,
  X
} from "lucide-react";
import axios from "axios";

const ConnectionsPage = () => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [confirmingRemoval, setConfirmingRemoval] = useState(null);
  const [filter, setFilter] = useState("all"); // all, mentees, peers, staff
  const [error, setError] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    roles: [],
    skills: [],
    interests: []
  });

  useEffect(() => {
    fetchConnections();
  }, []);

  // Fetch connections from API
  const fetchConnections = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        navigate('/login');
        return;
      }
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      console.log("Fetching connections data...");
      const response = await axios.get(
        `${apiUrl}/api/connections`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log("API Response:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Transform API data to match our component's expected format
        const formattedConnections = response.data.map(conn => ({
          id: conn._id || conn.connectionId || conn.id || `conn-${Date.now()}`,
          userId: conn.connectionUserId,
          name: conn.userDetails?.name || "Unknown User",
          role: conn.userType === 'Student' ? 'Student' : conn.userType === 'Alumni' ? 'Alumni' : conn.userType || 'User',
          program: conn.userDetails?.branch || conn.userDetails?.field || '',
          year: conn.userType === 'Student' ? conn.userDetails?.currentYear || '' : '',
          company: conn.userType !== 'Student' ? conn.userDetails?.company || '' : '',
          position: conn.userType !== 'Student' ? conn.userDetails?.position || '' : '',
          department: conn.userDetails?.department || '',
          connectionDate: conn.connectedSince ? new Date(conn.connectedSince).toISOString().split('T')[0] : 
                          conn.createdAt ? new Date(conn.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          avatar: conn.userDetails?.profilePicture?.url || null,
          lastActive: conn.lastActive || "Recently",
          type: determineConnectionType(conn),
          skills: conn.userDetails?.skills || [],
          interests: conn.userDetails?.interests || []
        }));
        
        console.log("Formatted connections:", formattedConnections);
        setConnections(formattedConnections);
      } else {
        console.warn("Unexpected API response format:", response.data);
        throw new Error('API returned unexpected data format');
      }
    } catch (err) {
      console.error("Error fetching connections:", err);
      setError(err.response?.data?.message || err.message || "Failed to load connections");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to determine connection type based on user type
  const determineConnectionType = (connection) => {
    if (connection.userType === 'Student') return "Mentee";
    if (connection.userType === 'Alumni') return "Peer";
    if (connection.userType === 'Professor' || connection.userType === 'Staff') return "Colleague";
    return "Peer"; // Default
  };

  // Filter and search connections
  const filteredConnections = connections
    .filter(connection => {
      if (filter === "mentees") {
        return connection.type === "Mentee";
      } else if (filter === "peers") {
        return connection.type === "Peer";
      } else if (filter === "staff") {
        return connection.type === "Staff" || connection.type === "Colleague";
      }
      return true;
    })
    .filter(connection => {
      if (!searchTerm) return true;
      
      return (
        connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (connection.program && connection.program.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (connection.company && connection.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (connection.position && connection.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
        connection.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (connection.skills && connection.skills.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )) ||
        (connection.interests && connection.interests.some(interest => 
          interest.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    });

  // Message connection
  const messageConnection = (connectionId) => {
    navigate(`/messages/${connectionId}`);
  };

  // Remove connection
  const removeConnection = (connectionId) => {
    setConfirmingRemoval(connectionId);
  };

  // Confirm remove connection
  const confirmRemoveConnection = async (connectionId) => {
    try {
      setIsLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        navigate('/login');
        return;
      }
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Make API call to remove connection
      await axios.delete(
        `${apiUrl}/api/connections/${connectionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update UI
      setConnections(connections.filter(connection => connection.id !== connectionId));
      setConfirmingRemoval(null);
      
      // Show success message using alert for now
      alert('Connection removed successfully');
    } catch (error) {
      console.error('Error removing connection:', error);
      alert('Failed to remove connection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel connection removal
  const cancelRemoveConnection = () => {
    setConfirmingRemoval(null);
  };

  // Go back to dashboard
  const goBack = () => {
    navigate(-1);
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Toggle filter panel
  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
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

  // Apply filters
  const applyFilters = () => {
    // Logic to apply filters
    setFilterOpen(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      roles: [],
      skills: [],
      interests: []
    });
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return '';
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
          <h1 className="text-2xl font-bold">Your Connections</h1>
        </div>
        <p className="text-muted-foreground ml-8 mb-4">
          {connections.length} people in your network
        </p>

        {/* Search and filter bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, role, skills, or interests..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              value={searchTerm}
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
              {/* Connection type filter section */}
              <div>
                <h4 className="text-sm font-medium mb-2">Connection Type</h4>
                <div className="space-y-1">
                  {['Mentee', 'Peer', 'Colleague'].map(type => (
                    <div key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`type-${type}`}
                        className="mr-2"
                        checked={filters.roles.includes(type)}
                        onChange={() => handleFilterChange('roles', type)}
                      />
                      <label htmlFor={`type-${type}`} className="text-sm">{type}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Skills filter section */}
              <div>
                <h4 className="text-sm font-medium mb-2">Skills</h4>
                <div className="space-y-1">
                  {['Programming', 'Design', 'Marketing', 'Management', 'Research'].map(skill => (
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
              
              {/* Interests filter section */}
              <div>
                <h4 className="text-sm font-medium mb-2">Interests</h4>
                <div className="space-y-1">
                  {['Technology', 'Entrepreneurship', 'Education', 'Healthcare', 'Finance'].map(interest => (
                    <div key={interest} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`interest-${interest}`}
                        className="mr-2"
                        checked={filters.interests.includes(interest)}
                        onChange={() => handleFilterChange('interests', interest)}
                      />
                      <label htmlFor={`interest-${interest}`} className="text-sm">{interest}</label>
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

        {/* Main content */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <select
              className="bg-transparent border border-input rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary py-2 px-3"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Connections</option>
              <option value="mentees">Mentees</option>
              <option value="peers">Peers</option>
              <option value="staff">Faculty & Staff</option>
            </select>
          </div>
        </div>

        {/* Loading, error, or connections display */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex justify-center flex-col items-center h-64">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={fetchConnections}
              className="px-4 py-2 bg-primary text-white rounded-md"
            >
              Retry
            </button>
          </div>
        ) : (
          filteredConnections.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <UserCircle className="h-12 w-12 mx-auto text-muted-foreground opacity-40 mb-4" />
              <h3 className="text-lg font-medium mb-2">No connections found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filter !== "all"
                  ? "Try adjusting your search terms or filters" 
                  : "You don't have any connections yet"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredConnections.map(connection => (
                <div key={connection.id} className="glass-card rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4 text-xl font-bold">
                      {connection.avatar ? (
                        <img 
                          src={connection.avatar} 
                          alt={connection.name} 
                          className="h-full w-full rounded-full object-cover" 
                        />
                      ) : (
                        getInitials(connection.name)
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-lg">{connection.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {connection.role === "Student" ? (
                          `${connection.program} • ${connection.year}`
                        ) : connection.role === "Alumni" ? (
                          `${connection.position || 'Professional'} ${connection.company ? `at ${connection.company}` : ''}`
                        ) : (
                          `${connection.role}${connection.department ? ` • ${connection.department}` : ''}`
                        )}
                      </p>
                      <div className="flex items-center mt-1">
                        <span 
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            connection.type === "Mentee" 
                              ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
                              : connection.type === "Peer"
                                ? "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
                                : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                          }`}
                        >
                          {connection.type}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="text-xs text-muted-foreground">
                          Connected {new Date(connection.connectionDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      {/* Add skills and interests display */}
                      {connection.skills && connection.skills.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium mb-1">Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {connection.skills.slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {skill}
                              </span>
                            ))}
                            {connection.skills.length > 3 && (
                              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-full">
                                +{connection.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => messageConnection(connection.userId || connection.id)}
                      className="flex-1 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </button>
                    
                    {confirmingRemoval === connection.id ? (
                      <div className="flex-1 flex gap-1">
                        <button
                          onClick={() => confirmRemoveConnection(connection.id)}
                          className="flex-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 text-sm rounded-lg transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={cancelRemoveConnection}
                          className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => removeConnection(connection.id)}
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
          )
        )}
      </div>
    </div>
  );
};

export default ConnectionsPage;