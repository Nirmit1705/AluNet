import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lightbulb, ExternalLink } from "lucide-react";

const JobRecommendationsSection = ({ jobs = [] }) => {
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);

  // View job opportunities
  const viewJobOpportunities = () => {
    navigate("/student-job-board");
  };

  // Save/bookmark a job
  const saveJob = (jobId) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId));
      
      // Get saved jobs from localStorage
      const savedJobsFromStorage = JSON.parse(localStorage.getItem("savedJobs") || "[]");
      
      // Remove job from localStorage
      localStorage.setItem("savedJobs", JSON.stringify(
        savedJobsFromStorage.filter(id => id !== jobId)
      ));
    } else {
      setSavedJobs([...savedJobs, jobId]);
      
      // Get saved jobs from localStorage
      const savedJobsFromStorage = JSON.parse(localStorage.getItem("savedJobs") || "[]");
      
      // Add job to localStorage
      localStorage.setItem("savedJobs", JSON.stringify(
        [...savedJobsFromStorage, jobId]
      ));
    }
  };

  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-medium text-lg">Job Recommendations</h3>
        <Lightbulb className="h-5 w-5 text-primary" />
      </div>
      <div className="space-y-4">
        {jobs.length > 0 ? (
          jobs.slice(0, 3).map((job) => (
            <div key={job.id} className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-primary">{job.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{job.company} • {job.location}</p>
                </div>
                {job.tag && (
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                    {job.tag}
                  </span>
                )}
              </div>
              <p className="text-sm mb-2">{job.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {job.skills && job.skills.map((skill, index) => (
                  <span key={index} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-0.5 rounded">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">{job.posted || job.postedDate}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveJob(job.id)}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {savedJobs.includes(job.id) ? "Saved" : "Save"}
                  </button>
                  <a
                    href={job.applicationUrl || job.applicationLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-lg hover:bg-primary/20 transition-colors flex items-center"
                  >
                    Apply
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No job recommendations available right now.</p>
          </div>
        )}
      </div>
      <button
        onClick={viewJobOpportunities}
        className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center hover:underline"
      >
        View all job opportunities
      </button>
    </div>
  );
};

export default JobRecommendationsSection;