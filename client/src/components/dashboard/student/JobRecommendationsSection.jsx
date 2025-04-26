import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lightbulb, ExternalLink } from "lucide-react";

// Sample data for job recommendations
const jobs = [
  {
    id: 1,
    title: "Software Developer Intern",
    company: "Tech Solutions Inc.",
    location: "Remote",
    posted: "2 days ago",
    skills: ["React", "JavaScript", "Node.js"],
    description: "Great opportunity for students to gain real-world experience in software development.",
    tag: "New"
  },
  {
    id: 2,
    title: "Data Science Co-op",
    company: "DataMinds Analytics",
    location: "Hybrid",
    posted: "1 week ago",
    skills: ["Python", "SQL", "Machine Learning"],
    description: "Join our team to work on real-world data science problems.",
    tag: "Featured"
  },
  {
    id: 3,
    title: "UX/UI Design Intern",
    company: "Creative Designs",
    location: "On-site",
    posted: "3 days ago",
    skills: ["Figma", "Adobe XD", "UI/UX"],
    description: "Help design beautiful and functional user interfaces for our clients.",
    tag: "Hot"
  }
];

const JobRecommendationsSection = () => {
  const navigate = useNavigate();
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);

  // Apply for job function
  const applyForJob = (jobId) => {
    if (registeredEvents.includes(jobId)) {
      setRegisteredEvents(registeredEvents.filter(id => id !== jobId));
    } else {
      setRegisteredEvents([...registeredEvents, jobId]);
      // In a real app, this would initiate a job application
      alert(`Applied for job #${jobId}`);
    }
  };

  // View job opportunities
  const viewJobOpportunities = () => {
    navigate("/jobs");
    // In a real app, this would navigate to a jobs page
    alert("Navigating to job opportunities");
  };

  // Save/bookmark a job
  const saveJob = (jobId) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId));
      alert(`Job removed from saved jobs`);
    } else {
      setSavedJobs([...savedJobs, jobId]);
      alert(`Job saved for later reference`);
    }
  };

  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in animate-delay-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-medium text-lg">Job Recommendations</h3>
        <Lightbulb className="h-5 w-5 text-primary" />
      </div>
      <div className="space-y-4">
        {jobs.map((job) => (
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
              {job.skills.map((skill, index) => (
                <span key={index} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-0.5 rounded">
                  {skill}
                </span>
              ))}
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">{job.posted}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => saveJob(job.id)}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {savedJobs.includes(job.id) ? "Saved" : "Save"}
                </button>
                <button
                  className={`px-3 py-1 ${
                    registeredEvents.includes(job.id)
                      ? "bg-green-100 text-green-800"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  } text-sm rounded-lg transition-colors`}
                  onClick={() => applyForJob(job.id)}
                >
                  {registeredEvents.includes(job.id) ? "Applied" : "Apply"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={viewJobOpportunities}
        className="w-full mt-4 py-2 bg-white dark:bg-slate-800 text-primary hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-700 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <ExternalLink className="h-4 w-4" />
        View All Job Opportunities
      </button>
    </div>
  );
};

export default JobRecommendationsSection; 