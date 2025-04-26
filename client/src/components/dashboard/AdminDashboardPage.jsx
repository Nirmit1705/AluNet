import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  Users, 
  GraduationCap, 
  Briefcase, 
  Shield,
  FileCheck,
  Filter,
  Search,
  ChevronRight,
  ExternalLink,
  LogOut
} from "lucide-react";
import AdminVerificationModal from "./admin/AdminVerificationModal";
import { directAdminLogin, createAdminApiClient } from "../../utils/adminAuth";
import { isAdmin } from "../../utils/authUtils";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verifications, setVerifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending"); // 'all', 'pending', 'approved', 'rejected'
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalAlumni: 0,
    pendingVerifications: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format date helper function
  const formatDate = (dateObj) => {
    if (!dateObj) return "";
    try {
      return new Date(dateObj).toLocaleString();
    } catch (e) {
      return String(dateObj);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/");
    toast.success("Logged out successfully");
  };

  // Create API client once to avoid recreating it
  const api = createAdminApiClient();

  // Check admin role and token validity on component mount
  useEffect(() => {
    const validateAdminAccess = async () => {
      // First check if role is admin
      if (!isAdmin()) {
        console.warn("User role is not admin");
        setError("You don't have administrator privileges. Please log in with valid admin credentials.");
        setIsLoading(false);
        return;
      }

      // Then check if token exists and is not empty
      const token = localStorage.getItem("token");
      if (!token || token === 'null' || token === 'undefined' || token === '') {
        console.error("No valid authentication token found");
        setError("Authentication failed. Please log in with valid admin credentials.");
        setIsLoading(false);
        return;
      }

      // Proceed with fetching data
      fetchDashboardStats();
    };

    validateAdminAccess();
  }, []);

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      
      // Call the API
      const response = await api.get('/admin/dashboard-stats');
      
      console.log("Dashboard stats response:", response.data);
      
      // Update the stats state with data from the API
      setStats({
        totalUsers: response.data.totalUsers || 0,
        totalStudents: response.data.totalStudents || 0,
        totalAlumni: response.data.totalAlumni || 0,
        pendingVerifications: response.data.pendingVerifications || 0
      });
      
      // Also fetch verifications
      await fetchVerifications();
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      
      if (error.response?.status === 403) {
        setError("Not authorized as an admin. Please log in with valid admin credentials.");
      } else {
        setError(error.response?.data?.message || "Failed to load admin dashboard");
      }
      
      setIsLoading(false);
    }
  };

  // Use this function in the useEffect
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Fetch verifications
  const fetchVerifications = async () => {
    try {
      console.log("Fetching verification requests with filter:", filterStatus);
      const response = await api.get('/admin/verifications', {
        params: {
          status: filterStatus === 'all' ? undefined : filterStatus,
          search: searchQuery || undefined
        }
      });
      
      console.log("Verification requests response:", response.data);
      
      if (Array.isArray(response.data)) {
        setVerifications(response.data);
      } else {
        console.error("Unexpected verification data format:", response.data);
        setVerifications([]);
      }
    } catch (error) {
      console.error("Error fetching verifications:", error);
      toast.error("Failed to load verifications");
    }
  };

  // Use useEffect to refetch when filters change
  useEffect(() => {
    if (!isLoading && !error) {
      fetchVerifications();
    }
  }, [filterStatus, searchQuery]);

  // Handle verification view details
  const viewVerificationDetails = (verification) => {
    setSelectedVerification(verification);
    setShowVerificationModal(true);
  };

  // Handle verification status update
  const handleVerificationAction = async (id, action, rejectReason) => {
    try {
      console.log(`Admin requesting ${action} for verification ${id}, reason: ${rejectReason || 'none'}`);
      
      // Validate inputs
      if (!id) {
        console.error("Missing verification ID");
        toast.error("Error: Missing verification ID");
        return;
      }
      
      // Send the API request
      const response = await api.put(`/admin/verifications/${id}`, { 
        status: action,
        rejectionReason: rejectReason || undefined
      });
      
      console.log("Server response:", response.data);
      
      // Update the verifications list
      const updatedVerifications = verifications.map(v => 
        v._id === id ? { ...v, status: action } : v
      );
      
      setVerifications(updatedVerifications);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingVerifications: Math.max(0, prev.pendingVerifications - 1),
        totalAlumni: action === 'approved' ? prev.totalAlumni + 1 : prev.totalAlumni
      }));
      
      // Close the modal
      setShowVerificationModal(false);
      setSelectedVerification(null);
      
      // Show success message
      toast.success(`Verification ${action} successfully`);
      
      // Refresh data to ensure we're in sync with the server
      setTimeout(() => {
        fetchVerifications();
        fetchDashboardStats();
      }, 1000);
    } catch (error) {
      console.error(`Error ${action} verification:`, error);
      toast.error(`Verification ${action} failed: ${error.response?.data?.message || error.message || "Unknown error"}`);
    }
  };

  const handleModalClose = () => {
    setShowVerificationModal(false);
    setSelectedVerification(null);
  };

  // Fix the navigation logic in the view functions to use proper admin routes
  const viewAllVerifications = () => {
    navigate("/admin/verifications");
  };

  const viewAllUsers = () => {
    navigate("/admin/users");
  };

  const viewSystemLogs = () => {
    navigate("/admin/logs");
  };
  
  // Improved admin login with better error handling and feedback
  const adminLogin = async (e) => {
    if (e) e.preventDefault();
    
    try {
      setIsLoading(true);
      const loginSuccess = await directAdminLogin();
      
      if (loginSuccess) {
        // Reload the page to apply new token
        window.location.reload();
      } else {
        setError("Admin login failed. Please try again or contact system support.");
        setIsLoading(false);
      }
    } catch (loginError) {
      console.error("Admin login error:", loginError);
      setError("Admin login failed: " + (loginError.message || "Unknown error"));
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pb-12 relative min-h-screen flex flex-col">
        <div className="container-custom pt-20 flex-grow flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-primary/50 mb-4"></div>
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pb-12 relative min-h-screen flex flex-col">
        <div className="container-custom pt-20 flex-grow">
          <div className="glass-card p-8 rounded-xl text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Error</h2>
            <p className="mb-6">{error}</p>
            
            {/* Add quick admin login form */}
            <div className="max-w-md mx-auto mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Admin Quick Login</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Click below to log in with the default admin credentials:
              </p>
              <button 
                onClick={adminLogin}
                className="px-4 py-2 bg-primary text-white rounded-lg"
              >
                Log in as Admin
              </button>
            </div>
            
            <button 
              onClick={() => navigate("/")} 
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg mr-2"
            >
              Go to Homepage
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-white rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12 relative min-h-screen flex flex-col">
      {/* Logout Button */}
      <div className="container-custom py-4 flex justify-end">
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
      
      <div className="container-custom flex-grow">
        {/* Page header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage and monitor the platform from here</p>
        </header>

        {/* Stats overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card rounded-xl p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Students</h3>
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats.totalStudents || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Total registered students
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Alumni</h3>
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats.totalAlumni || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Verified alumni members
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-300 cursor-pointer" onClick={viewAllVerifications}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Pending Verifications</h3>
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats.pendingVerifications || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Awaiting review
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="glass-card rounded-xl p-6 mb-8 animate-fade-in relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-bold">Admin Actions</h2>
              <span className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Administrator Tools</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Manage the platform and user accounts</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button 
                onClick={viewAllVerifications}
                className="button-primary py-3 px-6 w-full h-full flex flex-col items-center justify-center gap-1 rounded-lg transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]"
              >
                <FileCheck className="h-6 w-6 mb-1" />
                <span className="font-medium">Verify Alumni</span>
                <span className="text-xs opacity-80">Review pending verifications</span>
              </button>
              <button 
                onClick={viewAllUsers}
                className="button-secondary py-3 px-6 w-full h-full flex flex-col items-center justify-center gap-1 rounded-lg transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Users className="h-6 w-6 mb-1" />
                <span className="font-medium">Manage Users</span>
                <span className="text-xs opacity-80">View and edit user accounts</span>
              </button>
              <button 
                onClick={viewSystemLogs}
                className="button-secondary py-3 px-6 w-full h-full flex flex-col items-center justify-center gap-1 rounded-lg transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Shield className="h-6 w-6 mb-1" />
                <span className="font-medium">System Logs</span>
                <span className="text-xs opacity-80">Monitor platform activity</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pending verifications section */}
        <div className="glass-card rounded-xl p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-medium text-lg">Pending Alumni Verifications</h3>
            <Shield className="h-5 w-5 text-primary" />
          </div>
          
          {/* Search and filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center">
              <Filter className="h-4 w-4 text-gray-500 mr-2" />
              <select 
                className="pl-2 pr-8 py-2 bg-background border border-input rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          
          {/* Verification list */}
          <div className="space-y-4 mt-6">
            {verifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No verification requests found matching your criteria.
              </div>
            ) : (
              verifications.slice(0, 5).map((verification) => (
                <div 
                  key={verification._id} 
                  className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                  onClick={() => viewVerificationDetails(verification)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-base">{verification.name}</h4>
                      <p className="text-sm text-muted-foreground">{verification.email}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {verification.degree}, {verification.graduationYear}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Applied: {formatDate(verification.dateApplied || verification.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        verification.status === 'pending' 
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                          : verification.status === 'approved'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {verification.status === 'pending' ? 'Pending Review' : verification.status === 'approved' ? 'Approved' : 'Rejected'}
                      </span>
                      <button className="mt-4 flex items-center gap-2 text-primary text-sm">
                        View Details
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* View more button */}
          {verifications.length > 0 && (
            <div className="mt-6 flex justify-center">
              <button 
                onClick={viewAllVerifications}
                className="button-secondary flex items-center gap-2"
              >
                View All Verification Requests
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Verification modal */}
      <AdminVerificationModal
        isOpen={showVerificationModal}
        verification={selectedVerification}
        onClose={handleModalClose}
        onApprove={(id) => handleVerificationAction(id, "approved")}
        onReject={(id, reason) => handleVerificationAction(id, "rejected", reason)}
      />
    </div>
  );
};

export default AdminDashboardPage;
