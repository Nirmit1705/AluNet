import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [usingLocalMode, setUsingLocalMode] = useState(false);

  // Add a formatDate helper function at the top of the component
  const formatDate = (dateObj) => {
    if (!dateObj) return "";
    if (dateObj instanceof Date) {
      return dateObj.toLocaleString();
    }
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
    navigate("/login");
  };

  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        
        // Check if token starts with admin-token (local mode)
        if (token && token.startsWith('admin-token')) {
          console.log("Using local mode for admin dashboard");
          setUsingLocalMode(true);
          
          // Set sample data for local mode
          setStats({
            totalUsers: 256,
            totalStudents: 178,
            totalAlumni: 75,
            pendingVerifications: 5
          });
          
          // Fetch verifications data
          await fetchVerifications();
          setIsLoading(false);
          return;
        }
        
        // Not in local mode - try the API
        try {
          if (!token) {
            throw new Error("No authentication token found");
          }
          
          const response = await fetch("http://localhost:5000/api/admin/dashboard-stats", {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error("API not available");
          }
          
          const data = await response.json();
          setStats(data);
          
          // Also fetch verifications
          await fetchVerifications();
        } catch (error) {
          console.log("API not available, using local mode", error);
          setUsingLocalMode(true);
          
          // Set the same sample data as above
          setStats({
            totalUsers: 256,
            totalStudents: 178,
            totalAlumni: 75,
            pendingVerifications: 5
          });
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setError(error.message);
        setIsLoading(false);
      }
    };
    
    fetchDashboardStats();
  }, []);

  // Fetch verifications (only if not in local mode)
  const fetchVerifications = async () => {
    if (usingLocalMode) return;
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      try {
        const response = await fetch(`http://localhost:5000/api/admin/verifications?status=${filterStatus}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Not Found - /api/admin/verifications?status=${filterStatus}`);
        }
        
        const data = await response.json();
        setVerifications(data);
      } catch (error) {
        console.error("Error fetching verifications:", error);
        
        // Fallback to local mode if API is not available
        console.log("API not available, switching to local mode");
        setUsingLocalMode(true);
        
        // Set sample verifications
        setVerifications([
          {
            _id: "1",
            name: "John Smith",
            email: "john.smith@example.com",
            graduationYear: "2019",
            degree: "Bachelor of Computer Science",
            branch: "Computer Science",
            university: "University of Technology",
            dateApplied: "2023-05-15T09:30:00Z",
            documentURL: "https://example.com/docs/certificate1.pdf",
            status: "pending"
          },
          {
            _id: "2",
            name: "Sarah Johnson",
            email: "sarah.johnson@example.com",
            graduationYear: "2020",
            degree: "Master of Business Administration",
            branch: "Business",
            university: "State University",
            dateApplied: "2023-05-16T14:45:00Z",
            documentURL: "https://example.com/docs/certificate2.pdf",
            status: "pending"
          },
          {
            _id: "3",
            name: "Michael Chen",
            email: "michael.chen@example.com",
            graduationYear: "2018",
            degree: "Bachelor of Engineering",
            branch: "Mechanical Engineering",
            university: "Technical Institute",
            dateApplied: "2023-05-14T11:20:00Z",
            documentURL: "https://example.com/docs/certificate3.pdf",
            status: "pending"
          }
        ]);
      }
    } catch (error) {
      console.error("Error in fetchVerifications:", error);
      setUsingLocalMode(true);
    }
  };

  // Filter verifications based on search query and status
  const filteredVerifications = verifications.filter(verification => {
    const matchesSearch = !searchQuery || 
      verification.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      verification.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || verification.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Handle verification click
  const handleVerificationClick = (verification) => {
    setSelectedVerification(verification);
    setShowVerificationModal(true);
  };

  // Handle verification action (approve/reject)
  const handleVerificationAction = async (id, action, rejectReason = '') => {
    // Local mode - just update state
    if (usingLocalMode) {
      // Update the verification status
      const updatedVerifications = verifications.map(v => 
        v._id === id ? { ...v, status: action } : v
      );
      
      setVerifications(updatedVerifications);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingVerifications: prev.pendingVerifications - 1,
        totalAlumni: action === 'approved' ? prev.totalAlumni + 1 : prev.totalAlumni
      }));
      
      // Close the modal
      setShowVerificationModal(false);
      setSelectedVerification(null);
      return;
    }
    
    // Not in local mode - use API
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const response = await fetch(`http://localhost:5000/api/admin/verifications/${id}`, {
        method: 'PUT',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          status: action,
          rejectReason: rejectReason 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action} verification`);
      }
      
      // Update the verifications list
      const updatedVerifications = verifications.map(v => 
        v._id === id ? { ...v, status: action } : v
      );
      
      setVerifications(updatedVerifications);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingVerifications: prev.pendingVerifications - 1,
        totalAlumni: action === 'approved' ? prev.totalAlumni + 1 : prev.totalAlumni
      }));
      
      // Close the modal
      setShowVerificationModal(false);
      setSelectedVerification(null);
    } catch (error) {
      console.error(`Error ${action} verification:`, error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleModalClose = () => {
    setShowVerificationModal(false);
    setSelectedVerification(null);
  };

  // View all verifications
  const viewAllVerifications = () => {
    navigate("/admin/verifications");
  };

  // View all users
  const viewAllUsers = () => {
    navigate("/admin/users");
  };

  // View system logs
  const viewSystemLogs = () => {
    navigate("/admin/logs");
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
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="mb-6">{error}</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card rounded-xl p-6 animate-fade-in cursor-pointer" onClick={viewAllUsers}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Total Users</h3>
              <Users className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              +12 new users this week
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-100 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Students</h3>
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats.totalStudents}</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              +8 new registrations
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-200 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Alumni</h3>
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats.totalAlumni}</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              +3 verified this month
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-300 cursor-pointer" onClick={viewAllVerifications}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Pending Verifications</h3>
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats.pendingVerifications}</p>
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
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

        {/* Main dashboard content */}
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
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <select
                className="bg-background border border-input rounded-md px-3 py-2"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          
          {/* Verifications list */}
          <div className="space-y-4 mt-6">
            {filteredVerifications.length > 0 ? (
              filteredVerifications.map((verification) => (
                <div 
                  key={verification._id} 
                  className="p-4 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                  onClick={() => handleVerificationClick(verification)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-base">{verification.name}</h4>
                      <p className="text-sm text-muted-foreground">{verification.email}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {verification.degree}, {verification.graduationYear}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Applied: {formatDate(verification.dateApplied)}
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
                        {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                      </span>
                      <a 
                        href={verification.documentURL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-2 text-xs text-primary flex items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Document <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No verifications found matching your criteria.</p>
              </div>
            )}
          </div>
          
          <button 
            className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center"
            onClick={viewAllVerifications}
          >
            View all verifications
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Verification Modal */}
      <AdminVerificationModal
        isOpen={showVerificationModal}
        verification={selectedVerification}
        onClose={handleModalClose}
        onApprove={(id) => handleVerificationAction(id, "approved")}
        onReject={(id) => handleVerificationAction(id, "rejected")}
      />
    </div>
  );
};

export default AdminDashboardPage;
