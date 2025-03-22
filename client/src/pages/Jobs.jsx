import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import JobBoard from "../components/jobs/JobBoard";

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
      
      setLoading(false);
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

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-6">Job Board</h1>
          <JobBoard />
        </div>
      </div>
    </div>
  );
};

export default Jobs; 