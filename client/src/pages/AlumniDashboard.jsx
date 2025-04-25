import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AlumniDashboardPage from "../components/dashboard/AlumniDashboardPage";
import Navbar from "../components/layout/Navbar";

const AlumniDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      try {
        const storedRole = localStorage.getItem("userRole");
        setUserRole(storedRole);
        
        // If role is alumni but we're not on alumni dashboard, force navigation
        if (storedRole === "alumni" && window.location.pathname !== "/alumni-dashboard") {
          window.location.href = "/alumni-dashboard";
        }
      } catch (error) {
        console.error("Error retrieving user role:", error);
      } finally {
        setIsLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary/50 mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!userRole || userRole !== "alumni") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-custom py-4">
          <div className="glass-card p-8 rounded-xl text-center">
            <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
            <p className="mb-6">This page is only available to alumni users. Your current role is: <span className="font-semibold">{userRole || "unknown"}</span></p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => navigate("/")} 
                className="px-4 py-2 button-secondary"
              >
                Go to Homepage
              </button>
              {userRole === "student" && (
                <button 
                  onClick={() => navigate("/student-dashboard")} 
                  className="px-4 py-2 button-primary"
                >
                  Go to Student Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <AlumniDashboardPage />
    </div>
  );
};

export default AlumniDashboard;