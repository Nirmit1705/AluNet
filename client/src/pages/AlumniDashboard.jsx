import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import AlumniDashboardPage from "../components/dashboard/AlumniDashboardPage";

const AlumniDashboard = () => {
  const [userRole, setUserRole] = useState(null);
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
      
      // Get user role from localStorage
      const role = localStorage.getItem("userRole");
      setUserRole(role);
      setLoading(false);
    } catch (error) {
      console.error("Error checking user role:", error);
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary/50 mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (userRole !== "alumni") {
    return (
      <div className="container-custom py-16 mx-auto">
        <div className="glass-card p-8 rounded-xl text-center">
          <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
          <p className="mb-6">This dashboard is only available to alumni users. Your current role is: <span className="font-semibold">{userRole || "unknown"}</span></p>
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
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-custom pt-24 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Alumni Home</h1>
        </div>
        <p className="text-muted-foreground mb-6">Welcome back! Here's how you can connect and contribute as an alumni.</p>
        <AlumniDashboardPage />
      </div>
    </div>
  );
};

export default AlumniDashboard; 