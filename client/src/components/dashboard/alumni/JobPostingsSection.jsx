import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Plus, Edit, Trash, ChevronRight } from "lucide-react";

const JobPostingsSection = ({ myPostedJobs, setMyPostedJobs }) => {
  const navigate = useNavigate();
  const [jobPostModal, setJobPostModal] = useState(false);
  const [newJobPost, setNewJobPost] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full Time',
    description: '',
    requirements: ''
  });

  // Toggle job post modal
  const toggleJobPostModal = () => {
    setJobPostModal(!jobPostModal);
  };

  // Handle job form input changes
  const handleJobFormChange = (e) => {
    const { id, value } = e.target;
    setNewJobPost(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  // Submit job posting
  const submitJobPosting = () => {
    // Validate form
    if (!newJobPost.title || !newJobPost.company || !newJobPost.location || !newJobPost.description) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Create new job object
    const newJob = {
      id: Date.now(), // Using timestamp as a simple ID
      title: newJobPost.title,
      company: newJobPost.company,
      location: newJobPost.location,
      type: newJobPost.type,
      description: newJobPost.description,
      requirements: newJobPost.requirements.split('\n').filter(req => req.trim() !== ''),
      datePosted: 'Just now',
      applicants: 0,
      skills: []
    };
    
    // Add job to list
    setMyPostedJobs(prev => [newJob, ...prev]);
    
    // Reset form and close modal
    setNewJobPost({
      title: '',
      company: '',
      location: '',
      type: 'Full Time',
      description: '',
      requirements: ''
    });
    setJobPostModal(false);
    
    // Show success message
    alert('Job posted successfully!');
  };

  // Navigate to jobs page
  const goToJobs = () => {
    navigate("/jobs");
  };

  // Edit a job posting
  const editJob = (jobId) => {
    // In a real app, this would open an edit form
    alert(`Editing job #${jobId}`);
  };

  // Delete a job posting
  const deleteJob = (jobId) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      setMyPostedJobs(myPostedJobs.filter(job => job.id !== jobId));
      alert(`Job #${jobId} deleted successfully`);
    }
  };

  // View job applicants
  const viewApplicants = (jobId) => {
    // In a real app, this would navigate to an applicants page
    alert(`Viewing applicants for job #${jobId}`);
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
                onClick={toggleJobPostModal}
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
                  </div>
                  <div className="flex items-center">
                    <button 
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors mr-1"
                      onClick={() => editJob(job.id)}
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
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-sm text-primary">
                    <span className="font-medium">{job.applicants}</span> applications
                  </span>
                  <button 
                    className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-lg hover:bg-primary/20 transition-colors"
                    onClick={() => viewApplicants(job.id)}
                  >
                    View Applicants
                  </button>
                </div>
              </div>
            ))
          )}
          {myPostedJobs.length > 0 && (
            <button 
              onClick={toggleJobPostModal}
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
              <h3 className="text-xl font-bold">Post a New Job</h3>
              <button 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={toggleJobPostModal}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div className="col-span-full">
                  <label htmlFor="title" className="block text-sm font-medium mb-1">Job Title</label>
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
                  <label htmlFor="company" className="block text-sm font-medium mb-1">Company</label>
                  <input 
                    type="text" 
                    id="company" 
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    placeholder="e.g. Tech Solutions Inc."
                    value={newJobPost.company}
                    onChange={handleJobFormChange}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium mb-1">Location</label>
                    <input 
                      type="text" 
                      id="location" 
                      className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                      placeholder="e.g. San Francisco, CA"
                      value={newJobPost.location}
                      onChange={handleJobFormChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium mb-1">Job Type</label>
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
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                </div>
                <div className="col-span-full">
                  <label htmlFor="description" className="block text-sm font-medium mb-1">Job Description</label>
                  <textarea 
                    id="description" 
                    rows="4" 
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    placeholder="Describe the job role, responsibilities, etc."
                    value={newJobPost.description}
                    onChange={handleJobFormChange}
                  ></textarea>
                </div>
                <div className="col-span-full">
                  <label htmlFor="requirements" className="block text-sm font-medium mb-1">Requirements</label>
                  <textarea 
                    id="requirements" 
                    rows="3" 
                    className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    placeholder="e.g. 3+ years of experience with React"
                    value={newJobPost.requirements}
                    onChange={handleJobFormChange}
                  ></textarea>
                  <p className="text-xs text-muted-foreground mt-1">Enter each requirement on a new line</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button"
                  className="px-4 py-2 border border-input rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={toggleJobPostModal}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  onClick={submitJobPosting}
                >
                  Post Job
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