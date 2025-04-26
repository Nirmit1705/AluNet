import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, RefreshCw, Clock } from "lucide-react";

const VerificationPending = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const pendingVerification = localStorage.getItem('pendingVerification');
    
    console.log("VerificationPending: Initial state check:", { 
      token: !!token, 
      userRole,
      pendingVerification 
    });
    
    if (!token) {
      navigate('/');
      return;
    }
    
    // If user is logged in but not an alumni, redirect to appropriate dashboard
    if (userRole !== 'alumni') {
      console.log("Non-alumni user on verification page, redirecting");
      if (userRole === 'student') {
        navigate('/student-dashboard');
      } else if (userRole === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/');
      }
      return;
    }
    
    // If alumni is verified (pendingVerification flag is not set), redirect to dashboard
    if (pendingVerification !== 'true') {
      console.log("Verified alumni on verification page, redirecting to dashboard");
      navigate('/alumni-dashboard');
      return;
    }

    // Check verification status from the server
    const checkStatus = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:5000/api/alumni/verification-status', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log("Verification status response:", response.data);

        // If verified, update local storage and redirect to dashboard
        if (response.data.isVerified === true) {
          console.log("Alumni is verified according to server, updating localStorage and redirecting");
          localStorage.removeItem('pendingVerification');
          navigate('/alumni-dashboard');
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
        
        // Explicitly handle 401/403 errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log("Authentication error, redirecting to login");
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          navigate('/login');
          return;
        }
        
        setError('Failed to check verification status. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [navigate]);

  const handleGoBack = () => {
    navigate('/');
  };

  const handleRefreshStatus = async () => {
    // Check verification status again
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/');
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/alumni/verification-status', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // If verified, redirect to dashboard
      if (response.data.isVerified) {
        localStorage.removeItem('pendingVerification');
        navigate('/alumni-dashboard');
      }
    } catch (error) {
      console.error('Error refreshing verification status:', error);
      setError('Failed to refresh verification status. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary/50 mb-4"></div>
          <p>Checking verification status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="container-custom max-w-lg">
        <div className="glass-card rounded-xl p-8 text-center">
          <button 
            onClick={handleGoBack}
            className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="h-20 w-20 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-6">
            <Clock className="h-10 w-10" />
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Verification Pending</h2>
          
          <p className="text-muted-foreground mb-8">
            Your alumni verification is currently under review by our administrators. 
            This process may take 1-2 business days. You'll receive an email once your account is verified.
          </p>
          
          <button
            onClick={handleRefreshStatus}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;