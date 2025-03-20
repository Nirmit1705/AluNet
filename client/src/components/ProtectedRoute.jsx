import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { isAuthenticated, isAuthorized } from '../lib/auth';

/**
 * ProtectedRoute component that checks if the user is authenticated and has the required role
 * Redirects to login if not authenticated
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string} [props.requiredRole] - Role required to access the route (optional)
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirects to login page if not authenticated
    if (!isAuthenticated()) {
      navigate('/login', { state: { message: 'Please log in to access this page' } });
    }
    
    // Redirects to appropriate dashboard if user doesn't have the required role
    if (requiredRole && !isAuthorized(requiredRole)) {
      // If authenticated but wrong role, redirect to their correct dashboard
      const userType = localStorage.getItem('userType');
      if (userType) {
        navigate(`/${userType}/dashboard`);
      } else {
        navigate('/login');
      }
    }
  }, [navigate, requiredRole]);
  
  // If not authenticated, don't render anything while navigating
  if (!isAuthenticated()) {
    return null;
  }
  
  // If role is required and user doesn't have it, don't render anything while navigating
  if (requiredRole && !isAuthorized(requiredRole)) {
    return null;
  }
  
  // If authenticated and authorized, render the children
  return children;
};

export default ProtectedRoute; 