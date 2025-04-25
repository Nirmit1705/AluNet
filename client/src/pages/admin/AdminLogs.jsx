import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Shield,
  Search,
  Filter,
  ChevronLeft,
  Calendar,
  Clock,
  FileText,
  AlertTriangle,
  Info,
  RefreshCw
} from 'lucide-react';

const AdminLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'error', 'info', 'warning'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Setup axios instance with authorization header
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
  });
  
  // Add interceptor to include token in all requests
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  useEffect(() => {
    // Verify admin role
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
      navigate('/admin-dashboard');
      return;
    }
    
    fetchLogs();
  }, [navigate, filterType, searchQuery]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      
      // Prepare query params
      const params = {};
      if (filterType !== 'all') params.type = filterType;
      if (searchQuery) params.search = searchQuery;
      
      const response = await api.get('/admin/logs', { params });
      
      if (response.data) {
        setLogs(response.data);
      } else {
        throw new Error('No log data received from server');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setError(error.response?.data?.message || "Failed to load system logs data");
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin-dashboard');
  };

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return String(dateString);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom pt-8 pb-16">
        {/* Header with back button */}
        <div className="mb-8 flex items-center">
          <button 
            onClick={handleBack}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">System Logs</h1>
            <p className="text-muted-foreground">Monitor and analyze system activity</p>
          </div>
        </div>
        
        {/* Search and filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              placeholder="Search logs by message, source, or user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select 
              className="pl-2 pr-8 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Log Types</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
            <button
              onClick={fetchLogs}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
        
        {/* Logs list */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-lg text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
            <button
              onClick={fetchLogs}
              className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800/30 rounded-md hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-muted-foreground">No logs found matching your criteria</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.type === 'error' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : log.type === 'warning'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        }`}>
                          {log.type === 'error' ? (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          ) : log.type === 'warning' ? (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          ) : (
                            <Info className="h-3 w-3 mr-1" />
                          )}
                          {log.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm">{log.message}</p>
                        {log.details && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{log.details}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {log.source}
                        {log.userId && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">User: {log.userId}</p>
                        )}
                        {log.ipAddress && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">IP: {log.ipAddress}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          <span>{formatDate(log.timestamp).split(',')[0]}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{formatDate(log.timestamp).split(',')[1]}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogs;
