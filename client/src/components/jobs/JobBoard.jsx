import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Briefcase,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  BookmarkPlus,
  ExternalLink,
  Search,
} from "lucide-react";

const JobBoard = ({ userRole = "student" }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedJob, setExpandedJob] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [jobListings, setJobListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Fetch job listings from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Get user ID from localStorage if available
        setUserId(localStorage.getItem("userId") || null);

        // Get saved jobs from localStorage
        const savedJobsFromStorage = JSON.parse(localStorage.getItem("savedJobs") || "[]");
        setSavedJobs(savedJobsFromStorage);

        // Fetch jobs from API
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/jobs`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        );

        if (response.data) {
          setJobListings(response.data);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load job listings. Please try again later.");
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs based on search term
  const filteredJobs = jobListings.filter((job) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      job.title.toLowerCase().includes(searchLower) ||
      job.companyName.toLowerCase().includes(searchLower) ||
      job.location.toLowerCase().includes(searchLower) ||
      (job.description && job.description.toLowerCase().includes(searchLower))
    );
  });

  const toggleJobExpanded = (jobId) => {
    // If expanding a job, track a view
    if (expandedJob !== jobId) {
      trackJobView(jobId);
    }
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  const toggleSaveJob = (jobId) => {
    const newSavedJobs = savedJobs.includes(jobId)
      ? savedJobs.filter((id) => id !== jobId)
      : [...savedJobs, jobId];

    setSavedJobs(newSavedJobs);
    localStorage.setItem("savedJobs", JSON.stringify(newSavedJobs));
  };

  // Track job view
  const trackJobView = async (jobId) => {
    try {
      // This could be implemented on the backend to track views
      // For now, we'll just log it
      console.log(`Viewed job ${jobId}`);
    } catch (err) {
      console.error("Error tracking job view:", err);
    }
  };

  // Track job click (application link click)
  const trackJobClick = async (jobId, event) => {
    try {
      event.stopPropagation(); // Prevent toggling job expansion

      // Call API to track click
      await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/jobs/${jobId}/click`
      );

      console.log(`Clicked application link for job ${jobId}`);
    } catch (err) {
      console.error("Error tracking job click:", err);
    }
  };

  // Format date to display relative time (e.g., "2 days ago")
  const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-8">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-medium mb-2">Error Loading Jobs</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search jobs by title, company, or location..."
            className="pl-10 pr-4 py-2.5 w-full border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Job Opportunities</h2>

      {/* Job listings */}
      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div
              key={job._id}
              className="glass-card rounded-xl overflow-hidden animate-fade-in transition-all duration-300"
            >
              <div
                className="p-6 cursor-pointer"
                onClick={() => toggleJobExpanded(job._id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-white p-2 flex items-center justify-center overflow-hidden">
                      {job.postedBy?.profilePicture ? (
                        <img
                          src={job.postedBy.profilePicture}
                          alt={job.postedBy.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <Briefcase className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">{job.title}</h3>
                      <p className="text-muted-foreground">{job.companyName}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="inline-flex items-center text-xs bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded-full text-gray-800 dark:text-gray-200">
                          <MapPin className="h-3 w-3 mr-1" />
                          {job.location}
                        </span>
                        <span className="inline-flex items-center text-xs bg-blue-100 dark:bg-blue-900/20 px-2.5 py-0.5 rounded-full text-blue-800 dark:text-blue-300">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {job.jobType}
                        </span>
                        <span className="inline-flex items-center text-xs bg-green-100 dark:bg-green-900/20 px-2.5 py-0.5 rounded-full text-green-800 dark:text-green-300">
                          Posted {formatRelativeDate(job.postedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveJob(job._id);
                      }}
                    >
                      <BookmarkPlus
                        className={`h-5 w-5 ${
                          savedJobs.includes(job._id)
                            ? "text-primary"
                            : "text-gray-500"
                        }`}
                      />
                    </button>
                    {expandedJob === job._id ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              {expandedJob === job._id && (
                <div className="p-6 border-t border-gray-200 dark:border-gray-800 animate-fade-in">
                  <div className="mb-4 flex items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      {job.postedBy?.profilePicture ? (
                        <img
                          src={job.postedBy.profilePicture}
                          alt={job.postedBy.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <Briefcase className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {job.postedBy?.name || "Alumni"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {job.postedBy?.currentPosition} at {job.companyName}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-muted-foreground text-sm">
                      {job.description}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Requirements</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {job.requirements && typeof job.requirements === 'string' ? (
                        job.requirements.split('\n').map((req, index) => (
                          <li key={index}>{req}</li>
                        ))
                      ) : job.requirements && Array.isArray(job.requirements) ? (
                        job.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))
                      ) : (
                        <li>No specific requirements listed</li>
                      )}
                    </ul>
                  </div>

                  {job.salary && job.salary.isVisible && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Salary Range</h4>
                      <p className="text-primary font-medium">
                        {job.salary.min && job.salary.max
                          ? `${job.salary.currency || "$"}${job.salary.min.toLocaleString()} - ${job.salary.currency || "$"}${job.salary.max.toLocaleString()}`
                          : "Competitive salary"
                        }
                      </p>
                    </div>
                  )}

                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Application Deadline</h4>
                    <p className="text-muted-foreground">
                      {new Date(job.applicationDeadline).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <a
                      href={job.applicationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button-primary flex items-center"
                      onClick={(e) => trackJobClick(job._id, e)}
                    >
                      Apply Now
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                    <button
                      className={`button-secondary ${
                        savedJobs.includes(job._id) ? "bg-primary/20" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveJob(job._id);
                      }}
                    >
                      {savedJobs.includes(job._id) ? "Saved" : "Save for Later"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-medium mb-2">
              No job opportunities found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or check back later for new job postings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobBoard;