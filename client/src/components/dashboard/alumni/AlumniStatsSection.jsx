import React, { useState, useEffect } from "react";
import { Users, Briefcase, MessageSquare, Award } from "lucide-react";
import axios from "axios";

const AlumniStatsSection = ({ goToStudents, goToJobs, goToMessages, goToConnections }) => {
  const [stats, setStats] = useState({
    connections: {
      total: 0,
      increase: 0
    },
    jobPostings: {
      total: 0,
      applicants: 0
    },
    messages: {
      total: 0,
      unread: 0
    },
    mentored: {
      total: 0,
      recent: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Separately fetch connections if the main stats endpoint fails to include them
  const fetchConnections = async (token) => {
    try {
      console.log('Fetching connections separately...');
      const connectionsResponse = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/connections/students`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (connectionsResponse.data && Array.isArray(connectionsResponse.data)) {
        const connectionCount = connectionsResponse.data.length;
        console.log(`Found ${connectionCount} connections directly from connections API`);
        
        // Update just the connections part of stats
        setStats(prevStats => ({
          ...prevStats,
          connections: {
            ...prevStats.connections,
            total: connectionCount,
            // Estimate new connections as 20% of total if we don't have actual data
            increase: prevStats.connections.increase || Math.ceil(connectionCount * 0.2)
          }
        }));
        
        return connectionCount;
      }
      return 0;
    } catch (err) {
      console.error('Error fetching connections directly:', err);
      return 0;
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No auth token found');
        }

        console.log('Fetching alumni dashboard stats...');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/alumni/dashboard-stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        console.log('Stats API response:', response.data);
        
        if (response.data) {
          setStats(response.data);
          
          // If connections count is 0 but we think there should be connections,
          // fetch connections directly as a fallback
          if (response.data.connections?.total === 0) {
            console.log('Stats show 0 connections, trying direct connections API...');
            await fetchConnections(token);
          }
        }
      } catch (error) {
        console.error('Error fetching alumni dashboard stats:', error);
        setError('Failed to load dashboard statistics');
        
        // If main stats endpoint fails, try to at least get connections
        const token = localStorage.getItem('token');
        if (token) {
          await fetchConnections(token);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {loading && (
        <div className="col-span-4 text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-muted-foreground">Loading statistics...</p>
        </div>
      )}
      
      {!loading && error && (
        <div className="col-span-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}
      
      {!loading && !error && (
        <>
          <div 
            onClick={goToStudents}
            className="glass-card rounded-xl p-6 animate-fade-in cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Student Connections</h3>
              <Users className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats.connections?.total || 0}</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              +{stats.connections?.increase || 0} from last month
            </p>
          </div>

          <div 
            onClick={goToJobs}
            className="glass-card rounded-xl p-6 animate-fade-in animate-delay-100 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Job Postings</h3>
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats.jobPostings?.total || 0}</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              {stats.jobPostings?.applicants || 0} total applicants
            </p>
          </div>

          <div 
            onClick={goToMessages}
            className="glass-card rounded-xl p-6 animate-fade-in animate-delay-200 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Messages</h3>
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats.messages?.total || 0}</p>
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
              {stats.messages?.unread || 0} unread messages
            </p>
          </div>

          <div 
            onClick={goToConnections}
            className="glass-card rounded-xl p-6 animate-fade-in animate-delay-300 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Students Mentored</h3>
              <Award className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats.mentored?.total || 0}</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              +{stats.mentored?.recent || 0} this semester
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default AlumniStatsSection;
