import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import AlumniDashboardPage from "../components/dashboard/AlumniDashboardPage";

const AlumniDashboard = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the user role from localStorage
    const storedRole = localStorage.getItem("userRole");
    setUserRole(storedRole);
    setLoading(false);
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect non-alumni users to the main dashboard
  if (userRole !== "alumni") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container-custom pt-24 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Alumni Home</h1>
        </div>
        <p className="text-muted-foreground mb-6">Welcome back! Here's how you can connect and contribute as an alumni.</p>
      </div>
      <AlumniDashboardPage />
    </div>
  );
};

export default AlumniDashboard; 