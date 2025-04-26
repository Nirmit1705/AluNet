import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { isAdmin } from '../../utils/authUtils';

const ProtectedRoute = ({ children, allowedRoles = [], redirectPath = '/' }) => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [redirectTo, setRedirectTo] = useState(redirectPath);
  const location = useLocation();

  useEffect(() => {
    const checkAccess = async () => {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      
      // Log current auth state for debugging
      console.log('ProtectedRoute: Checking auth state:', { 
        path: location.pathname,
        userRole, 
        allowedRoles,
        pendingVerification: localStorage.getItem('pendingVerification')
      });
      
      // Check if user is logged in
      if (!token) {
        console.log('ProtectedRoute: No token found, redirecting to', redirectPath);
        setHasAccess(false);
        setLoading(false);
        return;
      }
      
      // Special handling for alumni verification status
      if (userRole === 'alumni' && location.pathname !== '/verification-pending') {
        const pendingVerification = localStorage.getItem('pendingVerification');
        
        if (pendingVerification === 'true') {
          console.log('ProtectedRoute: Alumni has pending verification, redirecting to verification-pending');
          setRedirectTo('/verification-pending');
          setHasAccess(false);
          setLoading(false);
          return;
        }
      }
      
      // Special handling for verification-pending page
      // Allow alumni to access this page only if they have pending verification
      if (location.pathname === '/verification-pending') {
        if (userRole === 'alumni') {
          const pendingVerification = localStorage.getItem('pendingVerification');
          
          if (pendingVerification !== 'true') {
            console.log('ProtectedRoute: Verified alumni trying to access verification-pending page, redirecting to dashboard');
            setRedirectTo('/alumni-dashboard');
            setHasAccess(false);
            setLoading(false);
            return;
          } else {
            // Allow access to verification-pending for alumni with pending verification
            setHasAccess(true);
            setLoading(false);
            return;
          }
        }
      }
      
      // Check if user role is allowed
      if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        console.log(`ProtectedRoute: User role ${userRole} not allowed, redirecting`);
        // Set appropriate redirect based on role
        if (userRole === 'admin') {
          setRedirectTo('/admin-dashboard');
        } else if (userRole === 'alumni') {
          setRedirectTo('/alumni-dashboard');
        } else if (userRole === 'student') {
          setRedirectTo('/student-dashboard');
        }
        
        setHasAccess(false);
        setLoading(false);
        return;
      }
      
      // Admin specific access check
      if (allowedRoles.includes('admin') && userRole === 'admin') {
        if (!isAdmin()) {
          console.log('ProtectedRoute: Admin verification failed');
          setHasAccess(false);
          toast.error('Admin access required');
          setLoading(false);
          return;
        }
      }
      
      // User has access
      console.log('ProtectedRoute: Access granted');
      setHasAccess(true);
      setLoading(false);
    };

    checkAccess();
  }, [location, allowedRoles, redirectPath]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary/50 mb-4"></div>
          <p>Checking access...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
