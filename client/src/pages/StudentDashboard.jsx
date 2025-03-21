import React from "react";
import Navbar from "../components/layout/Navbar";
import StudentDashboardPage from "../components/dashboard/StudentDashboardPage";

const StudentDashboard = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container-custom pt-24 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
        </div>
        <p className="text-muted-foreground mb-6">Welcome back! Here's what's happening in your student journey.</p>
      </div>
      <StudentDashboardPage />
    </div>
  );
};

export default StudentDashboard; 