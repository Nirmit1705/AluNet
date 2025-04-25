import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { ChevronLeft, Calendar, Search, Filter, RefreshCw, X, XCircle, CheckCircle, Users, AlertTriangle, Shield, FileText, User, GraduationCap, Briefcase, Building, Mail } from "lucide-react";
import AdminVerificationModal from '../../components/dashboard/admin/AdminVerificationModal';

const AdminVerifications = () => {
  const navigate = useNavigate();
  const [verifications, setVerifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
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
    
    fetchVerifications();
  }, [navigate, filterStatus, searchQuery]);

  const fetchVerifications = async () => {
    try {
      setIsLoading(true);
      
      // Prepare query params
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (searchQuery) params.search = searchQuery;
      
      const response = await api.get('/admin/verifications', { params });
      
      if (response.data) {
        setVerifications(response.data);
      } else {
        throw new Error('No data received from server');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching verifications:", error);
      setError(error.response?.data?.message || "Failed to load verification data");
      setIsLoading(false);
    }
  };

  const viewVerificationDetails = (verification) => {
    setSelectedVerification(verification);
    setShowVerificationModal(true);
  };

  const handleModalClose = () => {
    setShowVerificationModal(false);
    setSelectedVerification(null);
  };

  const handleApprove = async (id) => {
    try {
      console.log(`Approving verification: ${id}`);
      
      const response = await api.put(`/admin/verifications/${id}`, { 
        status: 'approved'
      });
      
      console.log("Server response:", response.data);
      
      // Update UI
      setVerifications(prev => 
        prev.map(v => v._id === id ? { ...v, status: 'approved' } : v)
      );
      
      setShowVerificationModal(false);
      toast.success("Verification approved successfully");
      
      // Refresh data
      setTimeout(() => fetchVerifications(), 1000);
    } catch (error) {
      console.error("Error approving verification:", error);
      toast.error(error.response?.data?.message || "Failed to approve verification");
    }
  };

  const handleReject = async (id, rejectReason) => {
    try {
      console.log(`Rejecting verification: ${id} with reason: ${rejectReason}`);
      
      const response = await api.put(`/admin/verifications/${id}`, { 
        status: 'rejected',
        rejectionReason: rejectReason
      });
      
      console.log("Server response:", response.data);
      
      // Update UI
      setVerifications(prev => 
        prev.map(v => v._id === id ? { ...v, status: 'rejected', rejectionReason: rejectReason } : v)
      );
      
      setShowVerificationModal(false);
      toast.success("Verification rejected");
      
      // Refresh data
      setTimeout(() => fetchVerifications(), 1000);
    } catch (error) {
      console.error("Error rejecting verification:", error);
      toast.error(error.response?.data?.message || "Failed to reject verification");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const handleBack = () => {
    navigate('/admin-dashboard');
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
            <h1 className="text-2xl font-bold">Verification Requests</h1>
            <p className="text-muted-foreground">Review and approve alumni verification requests</p>
          </div>
        </div>
        
        {/* Search and filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select 
              className="pl-2 pr-8 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <button
              onClick={fetchVerifications}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
        
        {/* Verification requests list */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-lg text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
            <button
              onClick={fetchVerifications}
              className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800/30 rounded-md hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : verifications.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-muted-foreground">No verification requests found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {verifications.map((verification) => (
              <div 
                key={verification._id} 
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:border-primary/20 transition-colors cursor-pointer"
                onClick={() => viewVerificationDetails(verification)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">{verification.name}</h3>
                      <p className="text-sm text-muted-foreground">{verification.email}</p>
                      {verification.degree && verification.graduationYear && (
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                          <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
                          {verification.degree}, {verification.graduationYear}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:items-end gap-2">
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        verification.status === 'pending' 
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                          : verification.status === 'approved'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      Submitted: {formatDate(verification.createdAt)}
                    </div>
                    
                    {verification.documentURL && (
                      <a 
                        href={verification.documentURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-xs flex items-center hover:text-primary/80 mt-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FileText className="h-3.5 w-3.5 mr-1.5" />
                        View Document
                      </a>
                    )}
                  </div>
                </div>
                
                {verification.status === 'pending' && (
                  <div className="mt-4 flex justify-end gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(verification._id, "Not eligible for verification.");
                      }}
                      className="px-4 py-1.5 flex items-center text-xs border border-red-200 text-red-600 dark:border-red-800 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1.5" />
                      Reject
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(verification._id);
                      }}
                      className="px-4 py-1.5 flex items-center text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                      Approve
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Verification detail modal */}
      <AdminVerificationModal
        isOpen={showVerificationModal}
        verification={selectedVerification}
        onClose={handleModalClose}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default AdminVerifications;
