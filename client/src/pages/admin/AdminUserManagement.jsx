import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Users,
  Search,
  Filter,
  ChevronLeft,
  MoreVertical,
  Check,
  X,
  User,
  GraduationCap,
  Briefcase,
  Shield,
  Ban,
  AlertTriangle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

const AdminUserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Setup axios instance with authorization header
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
  });
  
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
    
    fetchUsers();
  }, [navigate, filterRole, searchQuery, filterStatus]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Construct API query parameters
      const params = {};
      if (filterRole !== 'all') params.role = filterRole;
      if (filterStatus !== 'all') params.status = filterStatus;
      if (searchQuery) params.search = searchQuery;
      
      console.log("Fetching users with params:", params);
      
      // Get users from the server
      const response = await api.get('/admin/users', { params });
      
      if (response.data) {
        console.log("Received users data:", response.data);
        
        // Ensure all users have a valid status
        const processedUsers = response.data.map(user => {
          if (!user.status || !['active', 'inactive', 'pending'].includes(user.status)) {
            // Set default status based on role
            if (user.role === 'alumni') {
              user.status = user.isVerified ? 'active' : 'pending';
            } else {
              user.status = 'active'; // Default for students and admins
            }
          }
          return user;
        });
        
        setUsers(processedUsers);
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.response?.data?.message || 'Failed to load users data');
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const handleBack = () => {
    navigate('/admin-dashboard');
  };
  
  // Update the toggleUserStatus function to persist changes to the database
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      let newStatus;
      
      // Handle unknown status by defaulting to 'active'
      if (!currentStatus || currentStatus === 'unknown' || !['active', 'inactive', 'pending'].includes(currentStatus)) {
        currentStatus = 'active';
      }
      
      // Cycle through statuses: active -> inactive -> pending -> active
      if (currentStatus === 'active') {
        newStatus = 'inactive';
      } else if (currentStatus === 'inactive') {
        newStatus = 'pending';
      } else {
        newStatus = 'active';
      }
      
      console.log(`Client: Updating user ${userId} status from ${currentStatus} to ${newStatus}`);
      
      // Call API to update user status in the database
      const response = await api.put(`/admin/users/${userId}/status`, { 
        status: newStatus 
      });
      
      console.log('API Response:', response.data);
      
      if (response.data && response.data.user) {
        // Update the user in the local state with the data from the server
        setUsers(prevUsers => 
          prevUsers.map(user => {
            if (user._id === userId) {
              console.log(`Updating local user state for ${user.name}:`, {
                oldStatus: user.status,
                newStatus: response.data.user.status
              });
              return { 
                ...user, 
                status: response.data.user.status,
                // If the user is alumni, also update the isVerified property accordingly
                ...(user.role === 'alumni' && { isVerified: response.data.user.isVerified })
              };
            }
            return user;
          })
        );
        
        toast.success(`User status updated to ${response.data.user.status}`);
        
        // Force refetch to ensure we have the latest data
        setTimeout(() => fetchUsers(), 1000);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error(error.response?.data?.message || "Failed to update user status");
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        // Call API to delete the user
        await api.delete(`/admin/users/${userId}`);
        
        // Remove the user from the local state
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        toast.success("User deleted successfully");
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error(error.response?.data?.message || "Failed to delete user");
      }
    }
  };
  
  const resetPassword = async (userId) => {
    if (window.confirm("Are you sure you want to reset this user's password?")) {
      try {
        // Call API to reset the user's password
        const response = await api.post(`/admin/users/${userId}/reset-password`);
        
        toast.success(response.data?.message || "Password reset successful");
      } catch (error) {
        console.error("Error resetting password:", error);
        toast.error(error.response?.data?.message || "Failed to reset password");
      }
    }
  };
  
  const viewUserDetails = (userId) => {
    // In a real app, this would navigate to a detailed user view
    const user = users.find(u => u._id === userId);
    if (user) {
      toast.info(`Viewing details for ${user.name}`);
      // For now, we'll just show a modal or alert with user details
      alert(`User Details for ${user.name}:\nEmail: ${user.email}\nRole: ${user.role}\nStatus: ${user.status}\nJoined: ${formatDate(user.createdAt)}`);
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
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage platform users and permissions</p>
          </div>
        </div>
        
        {/* Search and filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              placeholder="Search by name, email or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button 
                className="flex items-center gap-2 px-3 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setStatusFilterOpen(!statusFilterOpen)}
              >
                <Filter className="h-4 w-4 text-gray-500" />
                <span>Status: {filterStatus === 'all' ? 'All' : filterStatus}</span>
              </button>
              
              {statusFilterOpen && (
                <div className="absolute left-0 mt-1 z-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg w-48">
                  <div className="p-2">
                    <button
                      className={`w-full text-left px-3 py-1.5 rounded-md ${filterStatus === 'all' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                      onClick={() => {
                        setFilterStatus('all');
                        setStatusFilterOpen(false);
                      }}
                    >
                      All Statuses
                    </button>
                    <button
                      className={`w-full text-left px-3 py-1.5 rounded-md ${filterStatus === 'active' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                      onClick={() => {
                        setFilterStatus('active');
                        setStatusFilterOpen(false);
                      }}
                    >
                      Active
                    </button>
                    <button
                      className={`w-full text-left px-3 py-1.5 rounded-md ${filterStatus === 'inactive' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                      onClick={() => {
                        setFilterStatus('inactive');
                        setStatusFilterOpen(false);
                      }}
                    >
                      Inactive
                    </button>
                    <button
                      className={`w-full text-left px-3 py-1.5 rounded-md ${filterStatus === 'pending' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                      onClick={() => {
                        setFilterStatus('pending');
                        setStatusFilterOpen(false);
                      }}
                    >
                      Pending
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <select 
              className="pl-2 pr-8 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="alumni">Alumni</option>
              <option value="admin">Admins</option>
            </select>
            
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 px-3 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Refresh users list"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Users list */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-lg text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
            <button
              onClick={fetchUsers}
              className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800/30 rounded-md hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-muted-foreground">No users found matching your criteria</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                            {user.profileImage ? (
                              <img src={user.profileImage} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                            ) : (
                              <User className="h-5 w-5" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'student' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : user.role === 'alumni'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                          {user.role === 'student' ? (
                            <GraduationCap className="h-3 w-3 mr-1" />
                          ) : user.role === 'alumni' ? (
                            <Briefcase className="h-3 w-3 mr-1" />
                          ) : (
                            <Shield className="h-3 w-3 mr-1" />
                          )}
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                        {user.role === 'student' && user.currentYear && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user.currentYear} Year</div>
                        )}
                        {user.role === 'alumni' && user.graduationYear && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Class of {user.graduationYear}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : user.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {user.status === 'active' ? (
                            <Check className="h-3 w-3 mr-1" />
                          ) : user.status === 'pending' ? (
                            <Clock className="h-3 w-3 mr-1" />
                          ) : (
                            <Ban className="h-3 w-3 mr-1" />
                          )}
                          {user.status === 'active' ? 'Active' : 
                           user.status === 'pending' ? 'Pending' : 
                           user.status === 'inactive' ? 'Inactive' : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative">
                          <button
                            onClick={() => setActionMenuOpen(actionMenuOpen === user._id ? null : user._id)}
                            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                          
                          {actionMenuOpen === user._id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    setActionMenuOpen(null);
                                    viewUserDetails(user._id);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                  View Details
                                </button>
                                <button
                                  onClick={() => {
                                    setActionMenuOpen(null);
                                    toggleUserStatus(user._id, user.status || 'active');
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                  {user.status === 'active' ? 'Deactivate User' : 
                                   user.status === 'inactive' ? 'Mark as Pending' : 'Activate User'}
                                </button>
                                <button
                                  onClick={() => {
                                    setActionMenuOpen(null);
                                    resetPassword(user._id);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-blue-700 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                  Reset Password
                                </button>
                                <button
                                  onClick={() => {
                                    setActionMenuOpen(null);
                                    deleteUser(user._id);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                  Delete User
                                </button>
                              </div>
                            </div>
                          )}
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

export default AdminUserManagement;
