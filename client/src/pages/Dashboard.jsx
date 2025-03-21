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
        <p>Loading dashboard...</p>
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
    <div className="min-h-screen">
      <Navbar />
      <div className="container-custom pt-24 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          
          {/* Role toggle with current role highlighted */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">View as:</span>
            <Tabs 
              value={userRole} 
              onValueChange={(value) => {
                setUserRole(value);
                localStorage.setItem("userRole", value);
              }}
            >
              <TabsList>
                <TabsTrigger value="student">Student</TabsTrigger>
                <TabsTrigger value="alumni">Alumni</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        <p className="text-muted-foreground mb-6">Welcome back! Here's what's happening.</p>
      </div>
    </div>
  );
};

export default Dashboard;