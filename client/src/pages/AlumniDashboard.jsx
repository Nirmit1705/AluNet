import React from "react";
import Navbar from "../components/layout/Navbar";
import AlumniDashboardPage from "../components/dashboard/AlumniDashboardPage";

const AlumniDashboard = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container-custom pt-24 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Alumni Dashboard</h1>
        </div>
        <p className="text-muted-foreground mb-6">Welcome back! Here's how you can connect and contribute as an alumni.</p>
      </div>
      <AlumniDashboardPage />
    </div>
  );
};

export default AlumniDashboard; 