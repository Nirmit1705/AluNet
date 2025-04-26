import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  // This would normally come from authentication
  // For now, simulate getting the role from localStorage or a token
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Simulate checking user role on component mount
  useEffect(() => {
    // In a real app, this would check authentication state
    // For demo, we'll check localStorage, which would be set during login
    const storedRole = localStorage.getItem("userRole");
    if (storedRole === "student" || storedRole === "alumni" || storedRole === "admin") {
      setUserRole(storedRole);
    } else {
      // Don't automatically set a role if none exists
      setUserRole(null);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary/50 mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to the appropriate dashboard based on user role
  if (userRole === "student") {
    return <Navigate to="/student-dashboard" replace />;
  } else if (userRole === "alumni") {
    return <Navigate to="/alumni-dashboard" replace />;
  } else if (userRole === "admin") {
    return <Navigate to="/admin-dashboard" replace />;
  }

  // If no role is set, show the dashboard selection UI
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-custom pt-20 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <p className="text-muted-foreground mb-6">Welcome back! Here's what's happening.</p>
        
        <div className="flex flex-col items-center justify-center pt-8">
          <p className="text-lg text-muted-foreground mb-4">
            Please select which dashboard you'd like to view:
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => {
                localStorage.setItem("userRole", "student");
                navigate("/student-dashboard");
              }}
              className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              Student Dashboard
            </button>
            <button
              onClick={() => {
                localStorage.setItem("userRole", "alumni");
                navigate("/alumni-dashboard");
              }}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-600/90 transition-colors"
            >
              Alumni Dashboard
            </button>
            <button
              onClick={() => {
                localStorage.setItem("userRole", "admin");
                navigate("/admin-dashboard");
              }}
              className="px-6 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-700/90 transition-colors"
            >
              Admin Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;