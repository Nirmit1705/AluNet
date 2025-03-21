import React from "react";
import Navbar from "../components/layout/Navbar";
import JobBoard from "../components/jobs/JobBoard";

const Jobs = () => {
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