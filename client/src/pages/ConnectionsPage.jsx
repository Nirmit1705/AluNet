import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { 
  Users, 
  Search, 
  UserMinus, 
  ArrowLeft, 
  Filter,
  CheckCircle2,
  XCircle,
  Loader2,
  UserCircle
} from "lucide-react";

// Sample data - in a real app, this would come from an API
const initialConnections = [
  {
    id: 1,
    name: "Alex Johnson",
    role: "Student",
    program: "Computer Science",
    year: "Senior",
    connectionDate: "2023-03-15",
    avatar: null,
    lastActive: "Today",
    type: "Mentee"
  },
  {
    id: 2,
    name: "Samantha Lee",
    role: "Student",
    program: "Data Science",
    year: "Junior",
    connectionDate: "2023-05-22",
    avatar: null,
    lastActive: "Yesterday",
    type: "Mentee"
  },
  {
    id: 3,
    name: "Dr. Michael Chen",
    role: "Professor",
    department: "Computer Science",
    connectionDate: "2022-09-10",
    avatar: null,
    lastActive: "1 week ago",
    type: "Colleague"
  },
  {
    id: 4,
    name: "Jennifer Smith",
    role: "Alumni",
    company: "Google",
    position: "Senior Software Engineer",
    connectionDate: "2022-11-05",
    avatar: null,
    lastActive: "3 days ago",
    type: "Peer"
  },
  {
    id: 5,
    name: "David Williams",
    role: "Career Advisor",
    department: "Career Services",
    connectionDate: "2023-01-18",
    avatar: null,
    lastActive: "Today",
    type: "Staff"
  },
  {
    id: 6,
    name: "Tyrone Jackson",
    role: "Student",
    program: "Software Engineering",
    year: "Junior",
    connectionDate: "2023-02-18",
    avatar: null,
    lastActive: "Today",
    type: "Mentee"
  },
  {
    id: 7,
    name: "Olivia Martinez",
    role: "Alumni",
    company: "Microsoft",
    position: "UX Designer",
    connectionDate: "2022-10-15",
    avatar: null,
    lastActive: "5 days ago",
    type: "Peer"
  }
];

const ConnectionsPage = () => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState(initialConnections);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmingRemoval, setConfirmingRemoval] = useState(null);
  const [filter, setFilter] = useState("all"); // all, mentees, peers, staff

  useEffect(() => {
    // In a real app, you would fetch the connections here
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

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
    .filter(connection => 
      connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (connection.program && connection.program.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (connection.company && connection.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (connection.position && connection.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
      connection.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Message connection
  const messageConnection = (connectionId) => {
    // In a real app, this would navigate to a messaging interface with that connection
    navigate(`/messages/${connectionId}`);
  };

  // Remove connection
  const removeConnection = (connectionId) => {
    setConfirmingRemoval(connectionId);
  };

  // Confirm remove connection
  const confirmRemoveConnection = (connectionId) => {
    setIsLoading(true);
    
    // In a real app, this would be an API call
    setTimeout(() => {
      setConnections(connections.filter(connection => connection.id !== connectionId));
      setConfirmingRemoval(null);
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

  // Get initials for avatar
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  // Get connection type color
  const getTypeColor = (type) => {
    switch (type) {
      case "Mentee":
        return "bg-blue-50 text-blue-600";
      case "Peer":
        return "bg-purple-50 text-purple-600";
      case "Staff":
      case "Colleague":
        return "bg-emerald-50 text-emerald-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
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
            <h1 className="text-2xl font-bold">Your Connections</h1>
          </div>
          <p className="text-muted-foreground ml-8 mb-4">
            {connections.length} people in your network
          </p>

          {/* Main content */}
          <div className="bg-white rounded-xl shadow-sm">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="flex items-center p-4 border-b border-gray-100">
                  {/* Search bar */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search connections..."
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
                      <option value="all">All Connections</option>
                      <option value="mentees">Mentees</option>
                      <option value="peers">Alumni Peers</option>
                      <option value="staff">Faculty & Staff</option>
                    </select>
                  </div>
                </div>
                
                {/* Connections list */}
                {filteredConnections.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCircle className="h-12 w-12 mx-auto text-muted-foreground opacity-40 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No connections found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm 
                        ? "Try adjusting your search terms" 
                        : "You don't have any connections matching the current filter"}
                    </p>
                  </div>
                ) : (
                  <div>
                    {filteredConnections.map((connection) => (
                      <div 
                        key={connection.id}
                        className="border-b border-gray-100 last:border-b-0"
                      >
                        {confirmingRemoval === connection.id ? (
                          <div className="animate-fade-in p-4">
                            <h3 className="font-medium mb-2">Remove Connection</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Are you sure you want to remove {connection.name} from your connections? 
                              This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                              <button
                                onClick={() => confirmRemoveConnection(connection.id)}
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
                              {getInitials(connection.name)}
                            </div>
                            
                            <div className="flex-grow">
                              <div className="flex items-center">
                                <h3 className="font-medium">{connection.name}</h3>
                                <span 
                                  className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getTypeColor(connection.type)}`}
                                >
                                  {connection.type}
                                </span>
                              </div>
                              
                              <p className="text-sm text-gray-500">
                                {connection.role === "Student" ? (
                                  `${connection.program} • ${connection.year}`
                                ) : connection.role === "Alumni" ? (
                                  `${connection.position} at ${connection.company}`
                                ) : (
                                  `${connection.role}${connection.department ? ` • ${connection.department}` : ''}`
                                )}
                              </p>
                              
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <span>Connected {new Date(connection.connectionDate).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}</span>
                                <span className="mx-2">•</span>
                                <span>Last active: {connection.lastActive}</span>
                              </div>
                            </div>
                            
                            <div className="flex-shrink-0 flex gap-2">
                              {connection.type === "Mentee" && (
                                <button
                                  onClick={() => messageConnection(connection.id)}
                                  className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                                >
                                  Message
                                </button>
                              )}
                              <button
                                onClick={() => removeConnection(connection.id)}
                                className="text-red-500"
                                aria-label={`Remove ${connection.name} from connections`}
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

export default ConnectionsPage; 