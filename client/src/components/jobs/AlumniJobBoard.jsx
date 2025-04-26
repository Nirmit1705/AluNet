import React, { useState, useEffect } from "react";
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
  ExternalLink,
} from "lucide-react";
import Navbar from "../layout/Navbar"; // Import Navbar - adjust the path as needed

const AlumniJobBoard = () => {
  const [jobPostModal, setJobPostModal] = useState(false);
  const [expandedJob, setExpandedJob] = useState(null);
  const [editMode, setEditMode] = useState(false);
  
  // Sample job data posted by the current alumni
  const [myPostedJobs, setMyPostedJobs] = useState([
    {
      id: 1,
      title: "Frontend Developer",
      company: "Tech Solutions Inc.",
      location: "Remote",
      type: "Full Time",
      salary: "$90,000 - $120,000",
      posted: "2 days ago",
      description: "Looking for a talented frontend developer with React experience...",
      requirements: [
        "3+ years React experience", 
        "JavaScript/TypeScript", 
        "CSS/SCSS"
      ],
      applicationLink: "https://example.com/frontend-developer"
    },
    {
      id: 2,
      title: "UX Designer",
      company: "Creative Designs Co.",
      location: "Chicago, IL",
      type: "Contract",
      salary: "$70,000 - $90,000",
      posted: "1 week ago",
      description: "Seeking a UX designer to help create intuitive user experiences...",
      requirements: [
        "Portfolio of design work", 
        "Figma expertise", 
        "User research"
      ],
      applicationLink: "https://example.com/ux-designer"
    }
  ]);

  const [newJobPost, setNewJobPost] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full Time",
    salary: "",
    description: "",
    requirements: "",
    applicationLink: ""
  });

  const toggleJobPostModal = (isEdit = false) => {
    setJobPostModal(!jobPostModal);
    setEditMode(isEdit);
    
    if (!jobPostModal && !isEdit) {
      // Reset form when opening in create mode
      setNewJobPost({
        title: "",
        company: "",
        location: "",
        type: "Full Time",
        salary: "",
        description: "",
        requirements: "",
        applicationLink: ""
      });
    }
  };

  const handleJobFormChange = (e) => {
    const { id, value } = e.target;
    setNewJobPost((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const submitJobPosting = () => {
    if (
      !newJobPost.title || 
      !newJobPost.company || 
      !newJobPost.location || 
      !newJobPost.description || 
      !newJobPost.applicationLink
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    // Format requirements from textarea to array
    const requirementsArray = newJobPost.requirements
      .split("\n")
      .filter(req => req.trim() !== "");

    if (editMode) {
      // Update existing job
      setMyPostedJobs(prev => 
        prev.map(job => 
          job.id === newJobPost.id 
            ? {
                ...newJobPost,
                requirements: requirementsArray
              } 
            : job
        )
      );
    } else {
      // Create new job
      const newJob = {
        id: Date.now(),
        ...newJobPost,
        requirements: requirementsArray,
        posted: "Just now"
      };
      
      setMyPostedJobs(prev => [newJob, ...prev]);
    }

    setJobPostModal(false);
  };

  const deleteJobPost = (jobId) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      setMyPostedJobs(prev => prev.filter(job => job.id !== jobId));
    }
  };

  const editJobPost = (jobId) => {
    const jobToEdit = myPostedJobs.find(job => job.id === jobId);
    if (jobToEdit) {
      setNewJobPost({
        ...jobToEdit,
        requirements: jobToEdit.requirements.join("\n")
      });
      toggleJobPostModal(true);
    }
  };

  const toggleJobExpanded = (jobId) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  return (
    <>
      <Navbar /> {/* Add the Navbar at the top of the component */}
      <div className="container-custom py-8 pt-24">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Job Postings</h2>
          <button
            onClick={() => toggleJobPostModal(false)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Post a New Job
          </button>
        </div>

        {/* Job listings */}
        <div className="space-y-4">
          {myPostedJobs.length > 0 ? (
            myPostedJobs.map((job) => (
              <div
                key={job.id}
                className="glass-card rounded-xl overflow-hidden animate-fade-in transition-all duration-300"
              >
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => toggleJobExpanded(job.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-medium">{job.title}</h3>
                      <p className="text-muted-foreground">{job.company}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="inline-flex items-center text-xs bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded-full text-gray-800 dark:text-gray-200">
                          <MapPin className="h-3 w-3 mr-1" />
                          {job.location}
                        </span>
                        <span className="inline-flex items-center text-xs bg-blue-100 dark:bg-blue-900/20 px-2.5 py-0.5 rounded-full text-blue-800 dark:text-blue-300">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {job.type}
                        </span>
                        <span className="inline-flex items-center text-xs bg-green-100 dark:bg-green-900/20 px-2.5 py-0.5 rounded-full text-green-800 dark:text-green-300">
                          <Calendar className="h-3 w-3 mr-1" />
                          Posted {job.posted}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          editJobPost(job.id);
                        }}
                      >
                        <Edit className="h-5 w-5 text-gray-500 hover:text-primary" />
                      </button>
                      <button
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteJobPost(job.id);
                        }}
                      >
                        <Trash className="h-5 w-5 text-gray-500 hover:text-red-500" />
                      </button>
                      {expandedJob === job.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedJob === job.id && (
                  <div className="p-6 border-t border-gray-200 dark:border-gray-800 animate-fade-in">
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-muted-foreground text-sm">
                        {job.description}
                      </p>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Requirements</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {job.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Salary Range</h4>
                      <p className="text-primary font-medium">{job.salary}</p>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Application Link</h4>
                      <a
                        href={job.applicationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {job.applicationLink}
                      </a>
                    </div>

                    <div className="flex space-x-4">
                      <a
                        href={job.applicationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button-primary flex items-center"
                      >
                        View Application Page
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 glass-card rounded-xl">
              <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-medium mb-2">
                No job postings yet
              </h3>
              <p className="text-muted-foreground mb-6">
                You haven't posted any job opportunities yet. Create your first job posting to help students in your network.
              </p>
              <button
                onClick={() => toggleJobPostModal(false)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Create Your First Job Posting
              </button>
            </div>
          )}
        </div>

        {/* Job Post Modal */}
        {jobPostModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">
                  {editMode ? "Edit Job Posting" : "Post a New Job"}
                </h3>
                <button
                  onClick={() => setJobPostModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    placeholder="e.g. Frontend Developer"
                    value={newJobPost.title}
                    onChange={handleJobFormChange}
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium mb-1">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="company"
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    placeholder="e.g. Tech Solutions Inc."
                    value={newJobPost.company}
                    onChange={handleJobFormChange}
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    placeholder="e.g. Remote or San Francisco, CA"
                    value={newJobPost.location}
                    onChange={handleJobFormChange}
                  />
                </div>
                <div>
                  <label htmlFor="type" className="block text-sm font-medium mb-1">
                    Job Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="type"
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    value={newJobPost.type}
                    onChange={handleJobFormChange}
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="salary" className="block text-sm font-medium mb-1">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    id="salary"
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    placeholder="e.g. $80,000 - $100,000"
                    value={newJobPost.salary}
                    onChange={handleJobFormChange}
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    placeholder="Describe the job role, responsibilities, etc."
                    value={newJobPost.description}
                    onChange={handleJobFormChange}
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="requirements" className="block text-sm font-medium mb-1">
                    Requirements (one per line) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="requirements"
                    rows={3}
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    placeholder="e.g. 3+ years of experience with React"
                    value={newJobPost.requirements}
                    onChange={handleJobFormChange}
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="applicationLink" className="block text-sm font-medium mb-1">
                    Application Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    id="applicationLink"
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    placeholder="e.g. https://example.com/job-application"
                    value={newJobPost.applicationLink}
                    onChange={handleJobFormChange}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setJobPostModal(false)}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    onClick={submitJobPosting}
                  >
                    {editMode ? "Update Job" : "Post Job"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AlumniJobBoard;