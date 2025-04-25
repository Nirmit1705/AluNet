import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashboardPage from "../components/dashboard/AdminDashboardPage";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      try {
        const storedRole = localStorage.getItem("userRole");
        setUserRole(storedRole);
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

  if (!userRole || userRole !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-custom py-4">
          <div className="glass-card p-8 rounded-xl text-center">
            <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
            <p className="mb-6">This page is only available to admin users. Your current role is: <span className="font-semibold">{userRole || "unknown"}</span></p>
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
              {userRole === "alumni" && (
                <button 
                  onClick={() => navigate("/alumni-dashboard")} 
                  className="px-4 py-2 button-primary"
                >
                  Go to Alumni Dashboard
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
      <AdminDashboardPage />
    </div>
  );
};

export default AdminDashboard;
