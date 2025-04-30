import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Plus, Edit, Trash, ChevronRight, X } from "lucide-react";
import axios from "axios";

const JobPostingsSection = ({ myPostedJobs, setMyPostedJobs }) => {
  const navigate = useNavigate();
  const [jobPostModal, setJobPostModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newJobPost, setNewJobPost] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full Time',
    description: '',
    requirements: '',
    applicationLink: '',
    salary: {
      min: '',
      max: '',
      currency: 'INR',
      isVisible: true
    }
  });

  // Fetch jobs on component mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/jobs/my-jobs`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data && Array.isArray(response.data)) {
          setMyPostedJobs(response.data.map(job => ({
            id: job._id,
            title: job.title,
            company: job.companyName,
            location: job.location,
            type: job.jobType || "Full Time", // Use jobType from the server response
            datePosted: new Date(job.postedAt).toLocaleDateString(),
            description: job.description,
            requirements: job.requirements,
            applicationLink: job.applicationLink,
            salary: job.salary || {
              min: '',
              max: '',
              currency: 'USD',
              isVisible: true
            }
          })));
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };
    
    fetchJobs();
  }, [setMyPostedJobs]);

  // Toggle job post modal and handle edit mode
  const toggleJobPostModal = (job = null) => {
    if (job) {
      // Edit mode
      setEditMode(true);
      setCurrentJobId(job.id);
      setNewJobPost({
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        description: job.description,
        requirements: Array.isArray(job.requirements) 
          ? job.requirements.join('\n') 
          : job.requirements,
        applicationLink: job.applicationLink,
        salary: job.salary || {
          min: '',
          max: '',
          currency: 'USD',
          isVisible: true
        }
      });
    } else {
      // Create mode
      setEditMode(false);
      setCurrentJobId(null);
      setNewJobPost({
        title: '',
        company: '',
        location: '',
        type: 'Full Time',
        description: '',
        requirements: '',
        applicationLink: '',
        salary: {
          min: '',
          max: '',
          currency: 'USD',
          isVisible: true
        }
      });
    }
    
    setJobPostModal(!jobPostModal);
  };

  // Handle job form input changes
  const handleJobFormChange = (e) => {
    const { id, value } = e.target;
    
    // Special handling for salary fields
    if (id.startsWith('salary.')) {
      const salaryField = id.split('.')[1]; // Get the specific salary field
      
      setNewJobPost(prev => ({
        ...prev,
        salary: {
          ...prev.salary,
          [salaryField]: salaryField === 'isVisible' ? e.target.checked : value
        }
      }));
    } else {
      setNewJobPost(prev => ({
        ...prev,
        [id]: value
      }));
    }
  };
  
  // Submit job posting
  const submitJobPosting = async () => {
    // Validate form
    if (!newJobPost.title || !newJobPost.company || !newJobPost.location || !newJobPost.description || !newJobPost.applicationLink) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert('You must be logged in to post a job');
        return;
      }
      
      const requirementsArray = newJobPost.requirements
        .split('\n')
        .filter(req => req.trim() !== '');
      
      // Prepare the salary data as expected by the server
      const formattedSalary = {
        ...newJobPost.salary,
        min: newJobPost.salary.min ? Number(newJobPost.salary.min) : undefined,
        max: newJobPost.salary.max ? Number(newJobPost.salary.max) : undefined
      };
      
      const jobData = {
        title: newJobPost.title,
        companyName: newJobPost.company,
        location: newJobPost.location,
        type: newJobPost.type, // This is mapped to jobType in the controller
        description: newJobPost.description,
        requirements: requirementsArray,
        applicationLink: newJobPost.applicationLink,
        salary: formattedSalary,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        industry: "Technology", // Default
        experienceLevel: "mid-level" // Default
      };
      
      let response;
      
      if (editMode) {
        // Update existing job
        response = await axios.put(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/jobs/${currentJobId}`,
          jobData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Update in state
        if (response.data) {
          setMyPostedJobs(prev => prev.map(job => 
            job.id === currentJobId 
              ? {
                  ...job,
                  title: newJobPost.title,
                  company: newJobPost.company,
                  location: newJobPost.location,
                  type: newJobPost.type,
                  description: newJobPost.description,
                  requirements: requirementsArray,
                  applicationLink: newJobPost.applicationLink,
                  salary: formattedSalary
                }
              : job
          ));
        }
      } else {
        // Create new job
        response = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/jobs`,
          jobData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Add to state
        if (response.data) {
          const newJob = {
            id: response.data._id,
            title: newJobPost.title,
            company: newJobPost.company,
            location: newJobPost.location,
            type: newJobPost.type,
            datePosted: 'Just now',
            description: newJobPost.description,
            requirements: requirementsArray,
            applicationLink: newJobPost.applicationLink,
            salary: formattedSalary
          };
          
          setMyPostedJobs(prev => [newJob, ...prev]);
        }
      }
      
      // Close modal after successful submission
      setJobPostModal(false);
      alert(editMode ? 'Job updated successfully!' : 'Job posted successfully!');
      
    } catch (error) {
      console.error("Error submitting job:", error);
      alert(`Error: ${error.response?.data?.message || 'Failed to submit job posting'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to jobs page
  const goToJobs = () => {
    navigate("/alumni-job-board");
  };

  // Delete a job posting
  const deleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        await axios.delete(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/jobs/${jobId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setMyPostedJobs(prev => prev.filter(job => job.id !== jobId));
        alert('Job deleted successfully');
      } catch (error) {
        console.error("Error deleting job:", error);
        alert(`Error: ${error.response?.data?.message || 'Failed to delete job posting'}`);
      }
    }
  };

  return (
    <>
      {/* My Job Postings Section */}
      <div className="glass-card rounded-xl p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-medium text-lg">My Job Postings</h3>
          <Briefcase className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-4">
          {myPostedJobs.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-muted-foreground mb-4">You haven't posted any jobs yet.</p>
              <button 
                onClick={() => toggleJobPostModal()}
                className="button-primary px-4 py-2 inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Post Your First Job
              </button>
            </div>
          ) : (
            myPostedJobs.map((job) => (
              <div key={job.id} className="p-4 border border-border/30 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{job.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {job.company} • {job.location} • {job.type}
                    </p>
                    <p className="text-sm text-muted-foreground">{job.datePosted}</p>
                    {job.applicationLink && (
                      <a 
                        href={job.applicationLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline mt-1 inline-block"
                      >
                        Application Link
                      </a>
                    )}
                  </div>
                  <div className="flex items-center">
                    <button 
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors mr-1"
                      onClick={() => toggleJobPostModal(job)}
                    >
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button 
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                      onClick={() => deleteJob(job.id)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          {myPostedJobs.length > 0 && (
            <button 
              onClick={() => toggleJobPostModal()}
              className="w-full py-2 mt-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-primary font-medium rounded-lg border border-gray-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Post Another Job
            </button>
          )}
        </div>
        <button 
          className="w-full mt-4 text-sm text-primary font-medium flex items-center justify-center"
          onClick={goToJobs}
        >
          View all jobs
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>

      {/* Job Post Modal */}
      {jobPostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl p-6 rounded-xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editMode ? 'Edit Job Posting' : 'Post a New Job'}</h3>
              <button 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setJobPostModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div className="col-span-full">
                  <label htmlFor="title" className="block text-sm font-medium mb-1">Job Title*</label>
                  <input 
                    type="text" 
                    id="title" 
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    placeholder="e.g. Frontend Developer"
                    value={newJobPost.title}
                    onChange={handleJobFormChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium mb-1">Company*</label>
                  <input 
                    type="text" 
                    id="company" 
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    placeholder="e.g. Tech Solutions Inc."
                    value={newJobPost.company}
                    onChange={handleJobFormChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium mb-1">Location*</label>
                  <input 
                    type="text" 
                    id="location" 
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    placeholder="e.g. San Francisco, CA"
                    value={newJobPost.location}
                    onChange={handleJobFormChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="type" className="block text-sm font-medium mb-1">Job Type*</label>
                  <select 
                    id="type" 
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    value={newJobPost.type}
                    onChange={handleJobFormChange}
                    required
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                <div className="col-span-full">
                  <label htmlFor="applicationLink" className="block text-sm font-medium mb-1">Application Link*</label>
                  <input 
                    type="url" 
                    id="applicationLink" 
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    placeholder="https://example.com/apply"
                    value={newJobPost.applicationLink}
                    onChange={handleJobFormChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">External link where students can apply</p>
                </div>
                <div className="col-span-full">
                  <label htmlFor="description" className="block text-sm font-medium mb-1">Job Description*</label>
                  <textarea 
                    id="description" 
                    rows="4" 
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    placeholder="Describe the job role, responsibilities, etc."
                    value={newJobPost.description}
                    onChange={handleJobFormChange}
                    required
                  ></textarea>
                </div>
                <div className="col-span-full">
                  <label className="block text-sm font-medium mb-1">Salary Information</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                    <div>
                      <label htmlFor="salary.min" className="block text-xs text-muted-foreground mb-1">Minimum</label>
                      <input 
                        type="number" 
                        id="salary.min" 
                        className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                        placeholder="e.g. 50000"
                        value={newJobPost.salary.min}
                        onChange={handleJobFormChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="salary.max" className="block text-xs text-muted-foreground mb-1">Maximum</label>
                      <input 
                        type="number" 
                        id="salary.max" 
                        className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                        placeholder="e.g. 80000"
                        value={newJobPost.salary.max}
                        onChange={handleJobFormChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="salary.currency" className="block text-xs text-muted-foreground mb-1">Currency</label>
                      <select 
                        id="salary.currency" 
                        className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                        value={newJobPost.salary.currency}
                        onChange={handleJobFormChange}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="INR">INR</option>
                        <option value="CAD">CAD</option>
                      </select>
                    </div>
                    <div className="flex items-center pt-4">
                      <input 
                        type="checkbox" 
                        id="salary.isVisible" 
                        className="mr-2 h-4 w-4"
                        checked={newJobPost.salary.isVisible}
                        onChange={(e) => handleJobFormChange({
                          target: {
                            id: 'salary.isVisible',
                            checked: e.target.checked,
                            value: e.target.checked
                          }
                        })}
                      />
                      <label htmlFor="salary.isVisible" className="text-sm">Show salary in job posting</label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button"
                  className="px-4 py-2 border border-input rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setJobPostModal(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  onClick={submitJobPosting}
                  disabled={isLoading}
                >
                  {isLoading ? 'Submitting...' : editMode ? 'Update Job' : 'Post Job'}
                </button>
              </div>
</form>
          </div>
        </div>
      )}
    </>
  );
};

export default JobPostingsSection;