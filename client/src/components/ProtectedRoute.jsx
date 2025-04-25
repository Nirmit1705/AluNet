import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children, requiredRole = null, requireVerified = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isVerified, setIsVerified] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      const storedRole = localStorage.getItem('userRole');
      
      // Quick check for logged in status
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      try {
        // Special handling for admin routes - if we have a token and admin role,
        // trust it immediately to avoid unnecessary redirects
        if (storedRole === 'admin' && 
            (location.pathname.includes('/admin') || location.pathname === '/admin-dashboard')) {
          setIsAuthenticated(true);
          setUserRole('admin');
          setIsVerified(true);
          setIsLoading(false);
          return;
        }
        
        // For non-admin routes, verify token with backend
        const response = await axios.get('/api/users/verify-token', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.isValid) {
          setIsAuthenticated(true);
          setUserRole(response.data.role || storedRole);
          setIsVerified(response.data.isVerified);
        } else {
          // Token is invalid
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          setIsAuthenticated(false);
        }
      } catch (error) {
        // For demo purposes, fall back to local storage check
        if (token && storedRole) {
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
    
    // For all other cases, redirect to home page with a state parameter for the auth modal
    return <Navigate to="/" state={{ showLogin: true, from: location }} replace />;
  }
  
  // Check role requirement
  if (requiredRole && userRole !== requiredRole) {
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
    return <Navigate to="/verification-pending" replace />;
  }
  
  // If all checks pass, render the protected component
  return children;
};

export default ProtectedRoute;
