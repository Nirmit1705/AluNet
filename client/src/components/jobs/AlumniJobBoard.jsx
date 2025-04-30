import React, { useState } from "react";
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

// Export the job posting form as a separate component so it can be reused
export const JobPostingForm = ({
  isOpen,
  onClose,
  formData,
  onChange,
  onSubmit,
  isEdit = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-xl p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">
            {isEdit ? "Edit Job Posting" : "Post a New Job"}
          </h3>
          <button
            onClick={onClose}
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
              value={formData.title}
              onChange={onChange}
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
              value={formData.company}
              onChange={onChange}
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
                value={formData.location}
                onChange={onChange}
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
                value={formData.type}
                onChange={onChange}
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
                value={formData.salary.min}
                onChange={onChange}
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
                value={formData.salary.max}
                onChange={onChange}
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
                value={formData.salary.currency}
                onChange={onChange}
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
                checked={formData.salary.isVisible}
                onChange={onChange}
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
              value={formData.description}
              onChange={onChange}
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
              value={formData.requirements}
              onChange={onChange}
              className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              rows="3"
              placeholder="Enter each requirement on a new line"
            ></textarea>
            <p className="text-xs text-muted-foreground mt-1">
              Enter each requirement on a new line
            </p>
          </div>

          <div>
            <label htmlFor="applicationLink" className="block text-sm font-medium mb-1">
              Application Link *
            </label>
            <input
              type="url"
              id="applicationLink"
              value={formData.applicationLink}
              onChange={onChange}
              className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              placeholder="https://example.com/apply"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              External link where students can apply
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              {isEdit ? "Update Job" : "Post Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AlumniJobBoard = () => {
  const [jobPostModal, setJobPostModal] = useState(false);
  const [expandedJob, setExpandedJob] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [myPostedJobs, setMyPostedJobs] = useState([
    {
      id: 1,
      title: "Frontend Developer",
      company: "Tech Solutions Inc.",
      location: "Remote",
      type: "Full Time",
      salary: {
        min: 90000,
        max: 120000,
        currency: "USD",
        isVisible: true,
      },
      posted: "2 days ago",
      description: "Looking for a talented frontend developer with React experience...",
      requirements: ["3+ years React experience", "JavaScript/TypeScript", "CSS/SCSS"],
      applicationLink: "https://example.com/frontend-developer",
    },
    {
      id: 2,
      title: "UX Designer",
      company: "Creative Designs Co.",
      location: "Chicago, IL",
      type: "Contract",
      salary: {
        min: 70000,
        max: 90000,
        currency: "USD",
        isVisible: true,
      },
      posted: "1 week ago",
      description: "Seeking a UX designer to help create intuitive user experiences...",
      requirements: ["Portfolio of design work", "Figma expertise", "User research"],
      applicationLink: "https://example.com/ux-designer",
    },
  ]);

  const [newJobPost, setNewJobPost] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full Time",
    salary: {
      min: "",
      max: "",
      currency: "USD",
      isVisible: true,
    },
    description: "",
    requirements: "",
    applicationLink: "",
  });

  const toggleJobPostModal = (isEdit = false) => {
    setJobPostModal(!jobPostModal);
    setEditMode(isEdit);

    if (!jobPostModal && !isEdit) {
      setNewJobPost({
        title: "",
        company: "",
        location: "",
        type: "Full Time",
        salary: {
          min: "",
          max: "",
          currency: "USD",
          isVisible: true,
        },
        description: "",
        requirements: "",
        applicationLink: "",
      });
    }
  };

  const handleJobFormChange = (e) => {
    const { id, value } = e.target;

    // Special handling for salary fields
    if (id.startsWith("salary.")) {
      const salaryField = id.split(".")[1]; // Get the specific salary field

      setNewJobPost((prev) => ({
        ...prev,
        salary: {
          ...prev.salary,
          [salaryField]: salaryField === "isVisible" ? e.target.checked : value,
        },
      }));
    } else {
      setNewJobPost((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  // Get value for consistent UI display when form is submitted
  const getJobTypeDisplayValue = (type) => {
    // This ensures consistent display of job type in UI
    const typeMap = {
      'full-time': 'Full Time',
      'part-time': 'Part Time',
      'contract': 'Contract',
      'internship': 'Internship',
      'remote': 'Remote',
      'Full Time': 'Full Time',
      'Part Time': 'Part Time',
      'Contract': 'Contract',
      'Internship': 'Internship',
      'Remote': 'Remote'
    };
    
    return typeMap[type] || type;
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

    const requirementsArray = newJobPost.requirements
      .split("\n")
      .filter((req) => req.trim() !== "");

    // Properly format salary data
    const formattedSalary = {
      ...newJobPost.salary,
      min: newJobPost.salary.min ? Number(newJobPost.salary.min) : undefined,
      max: newJobPost.salary.max ? Number(newJobPost.salary.max) : undefined,
    };

    if (editMode) {
      setMyPostedJobs((prev) =>
        prev.map((job) =>
          job.id === newJobPost.id
            ? {
                ...newJobPost,
                requirements: requirementsArray,
                salary: formattedSalary,
                type: getJobTypeDisplayValue(newJobPost.type) // Ensure consistent display
              }
            : job
        )
      );
    } else {
      const newJob = {
        id: Date.now(),
        ...newJobPost,
        requirements: requirementsArray,
        salary: formattedSalary,
        type: getJobTypeDisplayValue(newJobPost.type), // Ensure consistent display
        posted: "Just now",
      };

      setMyPostedJobs((prev) => [newJob, ...prev]);
    }

    setJobPostModal(false);
  };

  const deleteJobPost = (jobId) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      setMyPostedJobs((prev) => prev.filter((job) => job.id !== jobId));
    }
  };

  const editJobPost = (jobId) => {
    const jobToEdit = myPostedJobs.find((job) => job.id === jobId);
    if (jobToEdit) {
      setNewJobPost({
        ...jobToEdit,
        requirements: jobToEdit.requirements.join("\n"),
      });
      toggleJobPostModal(true);
    }
  };

  const toggleJobExpanded = (jobId) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  return (
    <>
      <Navbar />
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
                          {job.type} {/* This should now show the correct type */}
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
                      {job.salary.isVisible && (
                        <p className="text-primary font-medium">
                          {job.salary.currency} {job.salary.min} - {job.salary.max}
                        </p>
                      )}
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
              <h3 className="text-xl font-medium mb-2">No job postings yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't posted any job opportunities yet. Create your first
                job posting to help students in your network.
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

        <JobPostingForm
          isOpen={jobPostModal}
          onClose={() => setJobPostModal(false)}
          formData={newJobPost}
          onChange={handleJobFormChange}
          onSubmit={submitJobPosting}
          isEdit={editMode}
        />
      </div>
    </>
  );
};

export default AlumniJobBoard;