import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import axios from "axios";
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Trash, 
  Plus, 
  X,
  Search,
  ExternalLink 
} from "lucide-react";

const AlumniJobBoard = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [jobPostModal, setJobPostModal] = useState(false);
  const [expandedJob, setExpandedJob] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const [newJobPost, setNewJobPost] = useState({
    id: null,
    title: "",
    company: "",
    location: "",
    type: "Full Time",
    salary: {
      min: "",
      max: "",
      currency: "USD",
      isVisible: true
    },
    description: "",
    requirements: "",
    applicationLink: "",
    applicationDeadline: "",
    skillsRequired: [],
    status: "active"
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        
        const userRole = localStorage.getItem("userRole");
        if (userRole && userRole.toLowerCase() !== "alumni") {
          navigate("/student-job-board");
          return;
        }
        
        if (!localStorage.getItem("userName") || !localStorage.getItem("userPosition")) {
          try {
            const profileResponse = await axios.get(
              `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/alumni/profile`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (profileResponse.data) {
              localStorage.setItem("userName", profileResponse.data.name || "");
              localStorage.setItem("userPosition", profileResponse.data.position || "");
              localStorage.setItem("userProfilePicture", profileResponse.data.profilePicture?.url || "");
            }
          } catch (profileError) {
            console.error("Error fetching alumni profile:", profileError);
          }
        }
        
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/jobs/my-jobs`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data && Array.isArray(response.data)) {
          setJobs(response.data);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to load your job postings. Please try again later.");
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const toggleJobExpanded = (jobId) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  const toggleJobPostModal = (job = null) => {
    if (job) {
      setEditMode(true);
      setNewJobPost({
        id: job._id,
        title: job.title || "",
        company: job.companyName || "",
        location: job.location || "",
        type: job.jobType || "Full Time",
        salary: job.salary ? {
          min: job.salary.min || "",
          max: job.salary.max || "",
          currency: job.salary.currency || "USD",
          isVisible: job.salary.isVisible !== false
        } : {
          min: "",
          max: "",
          currency: "USD",
          isVisible: true
        },
        description: job.description || "",
        requirements: Array.isArray(job.requirements) 
          ? job.requirements.join("\n") 
          : job.requirements || "",
        applicationLink: job.applicationLink || "",
        applicationDeadline: job.applicationDeadline 
          ? new Date(job.applicationDeadline).toISOString().split("T")[0] 
          : "",
        skillsRequired: job.skillsRequired || [],
        status: job.status || "active"
      });
    } else {
      setEditMode(false);
      setNewJobPost({
        id: null,
        title: "",
        company: "",
        location: "",
        type: "Full Time",
        salary: {
          min: "",
          max: "",
          currency: "USD",
          isVisible: true
        },
        description: "",
        requirements: "",
        applicationLink: "",
        applicationDeadline: "",
        skillsRequired: [],
        status: "active"
      });
    }
    
    setJobPostModal(!jobPostModal);
  };

  const handleJobFormChange = (e) => {
    const { id, value, type, checked } = e.target;
    
    if (id === "skillsRequired") {
      const skillsArray = value.split(',').map(skill => skill.trim()).filter(Boolean);
      setNewJobPost(prev => ({
        ...prev,
        skillsRequired: skillsArray
      }));
      return;
    }
    
    if (id.includes('.')) {
      const [parent, child] = id.split('.');
      setNewJobPost(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setNewJobPost(prev => ({
        ...prev,
        [id]: value
      }));
    }
  };

  const submitJobPosting = async () => {
    try {
      if (!newJobPost.title || !newJobPost.company || !newJobPost.location || 
          !newJobPost.description || !newJobPost.applicationLink) {
        alert("Please fill in all required fields");
        return;
      }
      
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to post or edit jobs");
        return;
      }
      
      setLoading(true);
      
      const requirementsArray = newJobPost.requirements
        .split("\n")
        .filter(req => req.trim() !== "");
      
      let salaryData = undefined;
      if (newJobPost.salary.min && newJobPost.salary.max) {
        salaryData = {
          min: parseInt(newJobPost.salary.min),
          max: parseInt(newJobPost.salary.max),
          currency: newJobPost.salary.currency || "USD",
          isVisible: newJobPost.salary.isVisible !== false
        };
      }
      
      const jobData = {
        title: newJobPost.title,
        companyName: newJobPost.company,
        location: newJobPost.location,
        jobType: newJobPost.type,
        description: newJobPost.description,
        requirements: requirementsArray,
        applicationLink: newJobPost.applicationLink,
        salary: salaryData,
        applicationDeadline: newJobPost.applicationDeadline || undefined,
        skillsRequired: newJobPost.skillsRequired,
        status: newJobPost.status
      };
      
      let response;
      
      if (editMode && newJobPost.id) {
        response = await axios.put(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/jobs/${newJobPost.id}`,
          jobData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setJobs(prevJobs => 
          prevJobs.map(job => 
            job._id === newJobPost.id ? { ...job, ...response.data } : job
          )
        );
        
        alert("Job updated successfully");
      } else {
        response = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/jobs`,
          jobData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setJobs(prevJobs => [response.data, ...prevJobs]);
        
        alert("Job posted successfully");
      }
      
      setJobPostModal(false);
      
    } catch (error) {
      console.error("Error submitting job:", error);
      alert(`Error: ${error.response?.data?.message || "Failed to save job posting"}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
           
        setLoading(true);
                
        await axios.delete(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/jobs/${jobId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
        
        alert("Job deleted successfully");
      } catch (error) {
        console.error("Error deleting job:", error);
        alert(`Error: ${error.response?.data?.message || "Failed to delete job"}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      (job.title && job.title.toLowerCase().includes(search)) || 
      (job.companyName && job.companyName.toLowerCase().includes(search)) ||
      (job.location && job.location.toLowerCase().includes(search)) ||
      (job.description && job.description.toLowerCase().includes(search))
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString();
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
     
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (loading && jobs.length === 0) {
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Manage Job Postings</h1>
            <button
              onClick={() => toggleJobPostModal()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Post New Job
            </button>
          </div>
          
          {error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-6">
              {error}
            </div>
          ) : null}
          
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search your job postings..."
                className="pl-10 pr-4 py-2.5 w-full border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-gray-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div
                  key={job._id}
                  className="glass-card rounded-xl overflow-hidden animate-fade-in transition-all duration-300"
                >
                  <div className="p-6 cursor-pointer" onClick={() => toggleJobExpanded(job._id)}>
                    <div className="flex items-start justify-between">
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
                            {job.jobType || "Full Time"}
                          </span>
                          <span className="inline-flex items-center text-xs bg-green-100 dark:bg-green-900/20 px-2.5 py-0.5 rounded-full text-green-800 dark:text-green-300">
                            <Calendar className="h-3 w-3 mr-1" />
                            Posted {getTimeAgo(job.postedAt || job.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleJobPostModal(job);
                          }}
                        >
                          <Edit className="h-5 w-5 text-gray-500 hover:text-primary" />
                        </button>
                        <button
                          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteJob(job._id);
                          }}
                        >
                          <Trash className="h-5 w-5 text-gray-500 hover:text-red-500" />
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
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-muted-foreground text-sm whitespace-pre-line">
                          {job.description}
                        </p>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Requirements</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {job.requirements && Array.isArray(job.requirements) ? (
                            job.requirements.length > 0 ? (
                              job.requirements.map((req, index) => (
                                <li key={index}>{req}</li>
                              ))
                            ) : (
                              <li>No specific requirements listed</li>
                            )
                          ) : (
                            <li>No specific requirements listed</li>
                          )}
                        </ul>
                      </div>

                      {job.salary && (
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
                          {formatDate(job.applicationDeadline)}
                        </p>
                      </div>
                      
                      {job.applicationLink && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Application Link</h4>
                          <a
                            href={job.applicationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            {job.applicationLink}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}

                      {job.skillsRequired && job.skillsRequired.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Skills Required</h4>
                          <div className="flex flex-wrap gap-2">
                            {job.skillsRequired.map((skill, index) => (
                              <span 
                                key={index} 
                                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {job.status && job.status !== "active" && (
                        <div className="mb-4">
                          <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full ${
                            job.status === "filled" 
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" 
                              : job.status === "closed"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
                          }`}>
                            {job.status === "filled" 
                              ? "Position Filled" 
                              : job.status === "closed" 
                                ? "Closed" 
                                : job.status === "draft" 
                                  ? "Draft" 
                                  : job.status
                            }
                          </span>
                        </div>
                      )}

                      <div className="flex space-x-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleJobPostModal(job);
                          }}
                          className="button-secondary"
                        >
                          Edit Job Posting
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 glass-card rounded-xl">
                <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium mb-2">No job postings yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't posted any job opportunities yet. Create your first
                  job posting to help students in your network.
                </p>
                <button
                  onClick={() => toggleJobPostModal()}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create Your First Job Posting
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {jobPostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-xl p-4 sm:p-6 animate-fade-in my-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4 sm:mb-6 sticky top-0 bg-white dark:bg-gray-900 z-10 py-2">
                  <h3 className="text-lg sm:text-xl font-bold">
                    {editMode ? "Edit Job Posting" : "Post a New Job"}
                  </h3>
                  <button
                    onClick={() => setJobPostModal(false)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
        
                <form className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-1">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={newJobPost.title}
                      onChange={handleJobFormChange}
                      className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                      placeholder="e.g. Software Engineer"
                      required
                    />
                  </div>
        
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      id="company"
                      value={newJobPost.company}
                      onChange={handleJobFormChange}
                      className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                      placeholder="e.g. Google"
                      required
                    />
                  </div>
        
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium mb-1">
                        Location *
                      </label>
                      <input
                        type="text"
                        id="location"
                        value={newJobPost.location}
                        onChange={handleJobFormChange}
                        className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                        placeholder="e.g. San Francisco, CA or Remote"
                        required
                      />
                    </div>
        
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium mb-1">
                        Job Type *
                      </label>
                      <select
                        id="type"
                        value={newJobPost.type}
                        onChange={handleJobFormChange}
                        className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                        required
                      >
                        <option value="Full Time">Full Time</option>
                        <option value="Part Time">Part Time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                        <option value="Remote">Remote</option>
                      </select>
                    </div>
                  </div>
        
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="salary.min" className="block text-sm font-medium mb-1">
                        Minimum Salary
                      </label>
                      <input
                        type="number"
                        id="salary.min"
                        value={newJobPost.salary.min || ""}
                        onChange={handleJobFormChange}
                        className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                        placeholder="e.g. 50000"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="salary.max" className="block text-sm font-medium mb-1">
                        Maximum Salary
                      </label>
                      <input
                        type="number"
                        id="salary.max"
                        value={newJobPost.salary.max || ""}
                        onChange={handleJobFormChange}
                        className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                        placeholder="e.g. 80000"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="salary.currency" className="block text-sm font-medium mb-1">
                        Currency
                      </label>
                      <select
                        id="salary.currency"
                        value={newJobPost.salary.currency || "USD"}
                        onChange={handleJobFormChange}
                        className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="INR">INR</option>
                        <option value="CAD">CAD</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center pt-8">
                      <input
                        type="checkbox"
                        id="salary.isVisible"
                        checked={newJobPost.salary.isVisible || true}
                        onChange={handleJobFormChange}
                        className="mr-2 h-4 w-4"
                      />
                      <label htmlFor="salary.isVisible" className="text-sm font-medium">
                        Show salary in job posting
                      </label>
                    </div>
                  </div>
        
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">
                      Job Description *
                    </label>
                    <textarea
                      id="description"
                      value={newJobPost.description}
                      onChange={handleJobFormChange}
                      className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                      rows="4"
                      placeholder="Describe the job role, responsibilities, etc."
                      required
                    ></textarea>
                  </div>
        
                  <div>
                    <label htmlFor="requirements" className="block text-sm font-medium mb-1">
                      Requirements (Optional)
                    </label>
                    <textarea
                      id="requirements"
                      value={newJobPost.requirements}
                      onChange={handleJobFormChange}
                      className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                      rows="3"
                      placeholder="Enter each requirement on a new line"
                    ></textarea>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter each requirement on a new line
                    </p>
                  </div>
        
                  <div>
                    <label htmlFor="skillsRequired" className="block text-sm font-medium mb-1">
                      Skills Required (comma-separated)
                    </label>
                    <input
                      type="text"
                      id="skillsRequired"
                      value={newJobPost.skillsRequired.join(', ')}
                      onChange={handleJobFormChange}
                      className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                      placeholder="e.g. React, JavaScript, CSS"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Add skills that are required for this job (separated by commas)
                    </p>
                  </div>
        
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium mb-1">
                      Job Status
                    </label>
                    <select
                      id="status"
                      value={newJobPost.status}
                      onChange={handleJobFormChange}
                      className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    >
                      <option value="active">Active</option>
                      <option value="filled">Position Filled</option>
                      <option value="closed">Closed</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
        
                  <div>
                    <label htmlFor="applicationLink" className="block text-sm font-medium mb-1">
                      Application Link *
                    </label>
                    <input
                      type="url"
                      id="applicationLink"
                      value={newJobPost.applicationLink}
                      onChange={handleJobFormChange}
                      className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                      placeholder="https://example.com/apply"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      External link where students can apply
                    </p>
                  </div>
        
                  <div className="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-3 pt-4 sticky bottom-0 bg-white dark:bg-gray-900 pb-2 mt-6">
                    <button
                      type="button"
                      onClick={() => setJobPostModal(false)}
                      className="w-full sm:w-auto order-2 sm:order-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={submitJobPosting}
                      className="w-full sm:w-auto order-1 sm:order-2 mb-2 sm:mb-0 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      {editMode ? "Update Job" : "Post Job"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
      )}
    </div>
  );
};

export default AlumniJobBoard;
