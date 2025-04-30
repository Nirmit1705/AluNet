import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Jobs = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      // Check if user is logged in
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      
      // Detect user role and redirect to appropriate job board
      const detectAndRedirect = async () => {
        try {
          // Get user role from localStorage first (faster)
          const userRole = localStorage.getItem("userRole");
          
          if (userRole) {
            redirectBasedOnRole(userRole.toLowerCase());
          } else {
            // If role not in localStorage, try to fetch from API
            const response = await axios.get(
              `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/me`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (response.data && response.data.role) {
              const role = response.data.role.toLowerCase();
              // Save role to localStorage for future use
              localStorage.setItem("userRole", role);
              redirectBasedOnRole(role);
            } else {
              // Default to student view if role can't be determined
              navigate("/student-job-board");
            }
          }
        } catch (error) {
          console.error("Error getting user role:", error);
          // Default to student view on error
          navigate("/student-job-board");
        }
      };
      
      const redirectBasedOnRole = (role) => {
        if (role === "alumni") {
          navigate("/alumni-job-board");
        } else {
          navigate("/student-job-board");
        }
      };
      
      detectAndRedirect();
    } catch (error) {
      console.error("Error checking authentication:", error);
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-primary/20 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-primary/20 rounded mb-3"></div>
          <div className="h-3 w-24 bg-primary/10 rounded"></div>
        </div>
      </div>
    );
  }

  // This shouldn't render as we're redirecting
  return null;
};

export default Jobs;