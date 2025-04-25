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
        console.log("No token found, not authenticated");
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      try {
        // Special handling for admin routes - if we have a token and admin role,
        // trust it immediately to avoid unnecessary redirects
        if (storedRole === 'admin' && 
            (location.pathname.includes('/admin') || location.pathname === '/admin-dashboard')) {
          console.log("Admin route detected, trusting token without verification");
          setIsAuthenticated(true);
          setUserRole('admin');
          setIsVerified(true);
          setIsLoading(false);
          return;
        }
        
        // For non-admin routes in development, trust the token from localStorage
        // to avoid unnecessary API calls and problems with mock auth
        // IMPORTANT: Add this check to fix the login loop
        if (storedRole && (process.env.NODE_ENV === 'development' || process.env.REACT_APP_MOCK_AUTH === 'true')) {
          console.log("Development mode or mock auth enabled - trusting localStorage token");
          setIsAuthenticated(true);
          setUserRole(storedRole);
          setIsVerified(storedRole !== 'alumni' || localStorage.getItem('pendingVerification') !== 'true');
          setIsLoading(false);
          return;
        }
        
        // For non-admin routes, verify token with backend
        try {
          const response = await axios.get('/api/users/verify-token', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          console.log("Token verification response:", response.data);
          
          if (response.data.isValid) {
            setIsAuthenticated(true);
            setUserRole(response.data.role || storedRole);
            setIsVerified(response.data.isVerified);
          } else {
            // Token is invalid
            console.log("Token invalid according to API");
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            setIsAuthenticated(false);
          }
        } catch (apiError) {
          console.error("API error during token verification:", apiError.message);
          
          // For demo purposes, fall back to local storage check
          if (token && storedRole) {
            console.log("API error - falling back to localStorage token");
            setIsAuthenticated(true);
            setUserRole(storedRole);
            
            // For alumni, check if pending verification
            if (storedRole === 'alumni' && localStorage.getItem('pendingVerification') === 'true') {
              setIsVerified(false);
            } else {
              setIsVerified(true);
            }
          } else {
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error("General auth error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyAuth();
  }, [location.pathname]);
  
  if (isLoading) {
    // You could return a loading spinner here
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Special handling for admin routes
    if (location.pathname.includes('/admin') || location.pathname === '/admin-dashboard') {
      // Redirect directly to the admin dashboard, which has its own login form
      return <Navigate to="/admin-dashboard" replace />;
    }
    
    // Add this check to prevent authentication loops
    // Check if we are already trying to show the login screen to prevent loops
    const fromLoginAttempt = location.state?.loginAttempt;
    
    if (fromLoginAttempt) {
      // If we're in a loop, just go to home page without state
      console.log("Detected login attempt loop, redirecting to home without state");
      return <Navigate to="/" replace />;
    }
    
    console.log("Redirecting to login page from:", location.pathname);
    // For all other cases, redirect to home page with a state parameter for the auth modal
    return <Navigate to="/" state={{ showLogin: true, from: location.pathname, loginAttempt: true }} replace />;
  }
  
  // Check role requirement
  if (requiredRole && userRole !== requiredRole) {
    console.log(`Role mismatch. Required: ${requiredRole}, Current: ${userRole}`);
    // Redirect to appropriate dashboard based on role
    if (userRole === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (userRole === 'alumni') {
      return <Navigate to="/alumni-dashboard" replace />;
    } else {
      return <Navigate to="/student-dashboard" replace />;
    }
  }
  
  // Check verification requirement for alumni
  if (requireVerified && userRole === 'alumni' && isVerified === false) {
    console.log("Alumni not verified, redirecting to verification pending");
    return <Navigate to="/verification-pending" replace />;
  }
  
  // If all checks pass, render the protected component
  return children;
};

export default ProtectedRoute;
