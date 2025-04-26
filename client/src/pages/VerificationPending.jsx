import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import axios from 'axios';

const VerificationPending = () => {
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Check verification status
    const checkStatus = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/alumni/verification-status', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setVerificationStatus(response.data.status);
        if (response.data.rejectionReason) {
          setRejectionReason(response.data.rejectionReason);
        }
        
        // If verified, redirect to dashboard
        if (response.data.isVerified) {
          localStorage.removeItem('pendingVerification');
          navigate('/alumni-dashboard');
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
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
      
      const response = await axios.get('/api/alumni/verification-status', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setVerificationStatus(response.data.status);
      if (response.data.rejectionReason) {
        setRejectionReason(response.data.rejectionReason);
      }
      
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

  const handleResendVerification = () => {
    navigate('/resend-verification');
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
          
          {verificationStatus === 'pending' ? (
            <>
              <div className="h-20 w-20 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10" />
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
            </>
          ) : verificationStatus === 'rejected' ? (
            <>
              <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-6">
                <X className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Verification Rejected</h2>
              <p className="text-muted-foreground mb-4">
                Unfortunately, your alumni verification request has been rejected.
              </p>
              {rejectionReason && (
                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg mb-6 text-left">
                  <h3 className="font-medium text-red-700 dark:text-red-400 mb-2">Reason for rejection:</h3>
                  <p className="text-red-600 dark:text-red-300">{rejectionReason}</p>
                </div>
              )}
              <button
                onClick={handleResendVerification}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Submit New Verification
              </button>
            </>
          ) : (
            <>
              <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Verification Error</h2>
              <p className="text-muted-foreground mb-8">
                There was an error checking your verification status. Please try again later.
              </p>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg mb-6">
                  <p className="text-red-600 dark:text-red-300">{error}</p>
                </div>
              )}
              <button
                onClick={handleRefreshStatus}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center mx-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;