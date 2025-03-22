import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

const Dashboard = () => {
  // This would normally come from authentication
  // For now, simulate getting the role from localStorage or a token
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulate checking user role on component mount
  useEffect(() => {
    // In a real app, this would check authentication state
    // For demo, we'll check localStorage, which would be set during login
    const storedRole = localStorage.getItem("userRole");
    if (storedRole === "student" || storedRole === "alumni") {
      setUserRole(storedRole);
    } else {
      // Default to student if no role is set
      setUserRole("student");
      localStorage.setItem("userRole", "student");
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
  }

  // Fallback UI, though it shouldn't be rendered due to the redirects
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-custom pt-24 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <p className="text-muted-foreground mb-6">Welcome back! Here's what's happening.</p>
        
        <div className="flex flex-col items-center justify-center pt-8">
          <p className="text-lg text-muted-foreground mb-4">
            Please select which dashboard you'd like to view:
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setUserRole("student");
                localStorage.setItem("userRole", "student");
              }}
              className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              Student Dashboard
            </button>
            <button
              onClick={() => {
                setUserRole("alumni");
                localStorage.setItem("userRole", "alumni");
              }}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-600/90 transition-colors"
            >
              Alumni Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;