import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children, requiredRole = null, requireVerified = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isVerified, setIsVerified] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  // Add debugging to track authentication state changes
  useEffect(() => {
    console.log("Auth State:", { isAuthenticated, userRole, isVerified });
  }, [isAuthenticated, userRole, isVerified]);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      const storedRole = localStorage.getItem('userRole');
      
      console.log("Verifying auth with token:", token ? "exists" : "missing", "and role:", storedRole);
      
      // Quick check for logged in status
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        // Verify token with backend
        const response = await axios.get('/api/auth/verify', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.isValid) {
          setIsAuthenticated(true);
          setUserRole(response.data.role || storedRole);
          setIsVerified(response.data.isVerified || false);
        } else {
          // Clear invalid token
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth verification error:", error);
        
        // For development, allow continuing if backend check fails but token exists
        if (process.env.NODE_ENV === 'development') {
          console.warn("DEV MODE: Bypassing auth verification");
          setIsAuthenticated(true);
          setUserRole(storedRole);
          setIsVerified(true);
        } else {
          setIsAuthenticated(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [location.pathname]);

  // Show loading state
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check role if required
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = userRole === 'student' ? '/student-dashboard' : 
                         userRole === 'alumni' ? '/alumni-dashboard' : 
                         userRole === 'admin' ? '/admin-dashboard' : '/';
    return <Navigate to={redirectPath} replace />;
  }

  // Check verification status for alumni if required
  if (requireVerified && userRole === 'alumni' && !isVerified) {
    return <Navigate to="/verification-pending" replace />;
  }

  return children;
};

export default ProtectedRoute;
