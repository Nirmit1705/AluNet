import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, MessageSquare, ChevronRight } from "lucide-react";
import axios from "axios";

const ConnectionsSection = ({ goToConnections }) => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch connections when component mounts
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No auth token found');
          return;
        }
        
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/connections`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (response.data && Array.isArray(response.data)) {
          // Format connections data for display
          const formattedConnections = response.data.map(conn => ({
            id: conn._id || conn.connectionUserId,
            userId: conn.connectionUserId,
            name: conn.userDetails?.name || 'Unknown User',
            role: conn.userType === 'Student' ? 'Student' : 'Alumni',
            program: conn.userDetails?.branch || 'Unknown Program',
            year: conn.userType === 'Student' ? conn.userDetails?.currentYear ? `${conn.userDetails.currentYear} Year` : '' : '',
            company: conn.userType !== 'Student' ? conn.userDetails?.company || '' : '',
            position: conn.userType !== 'Student' ? conn.userDetails?.position || '' : '',
            profileImage: conn.userDetails?.profilePicture?.url || null,
            lastActive: "Recently",
            connectionDate: new Date(conn.connectedSince || conn.requestDate).toLocaleDateString()
          }));
          
          console.log('Fetched connections data:', formattedConnections);
          setConnections(formattedConnections.slice(0, 3)); // Show only the first 3 connections
        } else {
          // If no connections, use empty array
          setConnections([]);
        }
      } catch (err) {
        console.error("Error fetching connections:", err);
        setError(err.response?.data?.message || err.message || "Failed to load connections");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConnections();
  }, []);

  // Navigate to messages with a specific connection
  const messageConnection = (connectionId) => {
    navigate(`/messages/${connectionId}`);
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

  // Loading state
  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-medium text-lg">Current Connections</h3>
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div className="flex justify-center items-center h-32">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-medium text-lg">Current Connections</h3>
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div className="text-center py-8 text-red-500">
          <p>Error loading connections: {error}</p>
        </div>
      </div>
    );
  }

  // No connections state
  if (connections.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-medium text-lg">Current Connections</h3>
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No connections yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-medium text-lg">Current Connections</h3>
        <Users className="h-5 w-5 text-primary" />
      </div>
      <div className="space-y-4">
        {connections.map((connection) => (
          <div key={connection.id} className="flex items-start p-4 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4">
              {connection.profileImage ? (
                <img 
                  src={connection.profileImage} 
                  alt={connection.name} 
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="font-medium">{getInitials(connection.name)}</span>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{connection.name}</h4>
              {connection.role === "Student" ? (
                <p className="text-sm text-muted-foreground">{connection.program} • {connection.year}</p>
              ) : (
                <p className="text-sm text-muted-foreground">{connection.position}{connection.company ? ` at ${connection.company}` : ''}</p>
              )}
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                  {connection.role}
                </span>
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded-full">
                  Connected
                </span>
              </div>
            </div>
            <button 
              onClick={() => messageConnection(connection.id)}
              className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-sm rounded-lg transition-colors"
            >
              Message
            </button>
          </div>
        ))}
      </div>
      <button 
        onClick={goToConnections}
        className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center"
      >
        View all connections
        <ChevronRight className="h-4 w-4 ml-1" />
      </button>
    </div>
  );
};

export default ConnectionsSection;
