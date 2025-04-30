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
  Search,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  User,
  Filter,
  X,
  Check,
  BadgeCheck
} from "lucide-react";

const StudentJobBoard = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [expandedJob, setExpandedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [savedJobs, setSavedJobs] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [showSkillsFilter, setShowSkillsFilter] = useState(false);
  const [matchingJobs, setMatchingJobs] = useState([]);
  const [filterBySkills, setFilterBySkills] = useState(false);
  const navigate = useNavigate();

  // Fetch user profile to get their skills
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/students/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data && response.data.skills) {
          setUserSkills(response.data.skills);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Check if user is logged in
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        
        // Check if user is a student
        const userRole = localStorage.getItem("userRole");
        if (userRole && userRole.toLowerCase() !== "student") {
          // Redirect alumni to alumni job board
          navigate("/alumni-job-board");
          return;
        }
        
        // Fetch all job postings
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/jobs`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data && Array.isArray(response.data)) {
          // Only show active jobs
          const activeJobs = response.data.filter(job => job.status === "active" || !job.status);
          setJobs(activeJobs);
          
          // Find jobs matching user skills
          findMatchingJobs(activeJobs, userSkills);
        }
        
        // Load saved jobs from localStorage
        const savedJobsData = localStorage.getItem("savedJobs");
        if (savedJobsData) {
          setSavedJobs(JSON.parse(savedJobsData));
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to load job postings. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, [navigate, userSkills]);

  // Find jobs that match the user's skills
  const findMatchingJobs = (allJobs, skills) => {
    if (!skills || skills.length === 0) return;
    
    const matchingJobIds = allJobs.filter(job => {
      if (!job.skillsRequired || job.skillsRequired.length === 0) return false;
      
      // Check if any user skill matches any required skill
      return job.skillsRequired.some(requiredSkill => 
        skills.some(userSkill => 
          userSkill.toLowerCase().includes(requiredSkill.toLowerCase()) ||
          requiredSkill.toLowerCase().includes(userSkill.toLowerCase())
        )
      );
    }).map(job => job._id);
    
    setMatchingJobs(matchingJobIds);
  };

  // Toggle job expansion
  const toggleJobExpanded = (jobId) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  // Save/unsave job
  const toggleSaveJob = (jobId) => {
    const updatedSavedJobs = savedJobs.includes(jobId)
      ? savedJobs.filter(id => id !== jobId)
      : [...savedJobs, jobId];
    
    setSavedJobs(updatedSavedJobs);
    localStorage.setItem("savedJobs", JSON.stringify(updatedSavedJobs));
  };

  // Toggle skills matching filter
  const toggleSkillsFilter = () => {
    setFilterBySkills(!filterBySkills);
  };

  // Filter jobs based on search term and skills matching if enabled
  const filteredJobs = jobs.filter(job => {
    // First filter by skills if that option is selected
    if (filterBySkills && !matchingJobs.includes(job._id)) {
      return false;
    }
    
    // Then filter by search term
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      (job.title && job.title.toLowerCase().includes(search)) ||
      (job.companyName && job.companyName.toLowerCase().includes(search)) ||
      (job.location && job.location.toLowerCase().includes(search)) ||
      (job.description && job.description.toLowerCase().includes(search)) ||
      (job.skillsRequired && job.skillsRequired.some(skill => skill.toLowerCase().includes(search)))
    );
  });

  // Format date display
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate time ago
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

  // Check if a job matches user skills
  const isJobMatch = (jobId) => {
    return matchingJobs.includes(jobId);
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
            <h1 className="text-3xl font-bold">Available Jobs</h1>
            
            {/* Add filter section toggle button */}
            {userSkills.length > 0 && (
              <button 
                onClick={toggleSkillsFilter}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  filterBySkills 
                    ? "bg-primary text-white" 
                    : "border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                {filterBySkills ? <Check className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                {filterBySkills ? "Showing Matching Jobs" : "Show Jobs Matching My Skills"}
              </button>
            )}
          </div>
          
          {/* User skills info */}
          {userSkills.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4" />
                    Your Skills
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {userSkills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  {matchingJobs.length} matching job{matchingJobs.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          )}
          
          {error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-6">
              {error}
            </div>
          ) : null}
          
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search job postings..."
                className="pl-10 pr-4 py-2.5 w-full border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-gray-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Job Listings */}
          <div className="space-y-4">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div
                  key={job._id}
                  className={`glass-card rounded-xl overflow-hidden animate-fade-in transition-all duration-300 ${
                    isJobMatch(job._id) ? "border-l-4 border-primary" : ""
                  }`}
                >
                  <div className="p-6 cursor-pointer" onClick={() => toggleJobExpanded(job._id)}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-medium">{job.title}</h3>
                          {isJobMatch(job._id) && (
                            <span className="inline-flex items-center text-xs bg-green-100 dark:bg-green-900/20 px-2.5 py-0.5 rounded-full text-green-800 dark:text-green-300">
                              <BadgeCheck className="h-3 w-3 mr-1" />
                              Skills Match
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground">{job.companyName}</p>
                        
                        {/* Alumni information display */}
                        {job.postedBy && (
                          <div className="flex items-center mt-1 text-sm text-muted-foreground">
                            {job.postedBy.profilePicture ? (
                              typeof job.postedBy.profilePicture === 'object' && job.postedBy.profilePicture.url ? (
                                <img
                                  src={job.postedBy.profilePicture.url}
                                  alt={job.postedBy.name}
                                  className="h-3 w-3 mr-1 rounded-full object-cover"
                                />
                              ) : typeof job.postedBy.profilePicture === 'string' ? (
                                <img
                                  src={job.postedBy.profilePicture}
                                  alt={job.postedBy.name}
                                  className="h-3 w-3 mr-1 rounded-full object-cover"
                                />
                              ) : (
                                <User className="h-3 w-3 mr-1" />
                              )
                            ) : (
                              <User className="h-3 w-3 mr-1" />
                            )}
                            Posted by: {job.postedBy.name || "Alumni"}
                            {job.postedBy.position && ` • ${job.postedBy.position}`}
                          </div>
                        )}
                        
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
                        
                        {/* Show skills required badges */}
                        {job.skillsRequired && job.skillsRequired.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {job.skillsRequired.map((skill, index) => (
                              <span 
                                key={index} 
                                className={`px-2 py-1 text-xs rounded-full ${
                                  userSkills.some(userSkill => 
                                    userSkill.toLowerCase().includes(skill.toLowerCase()) ||
                                    skill.toLowerCase().includes(userSkill.toLowerCase())
                                  )
                                    ? "bg-primary/10 text-primary"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                                }`}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveJob(job._id);
                          }}
                        >
                          {savedJobs.includes(job._id) ? (
                            <BookmarkCheck className="h-5 w-5 text-primary" />
                          ) : (
                            <Bookmark className="h-5 w-5 text-gray-500 hover:text-primary" />
                          )}
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
                      {/* Alumni profile section */}
                      {job.postedBy && (
                        <div className="mb-4 flex items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 overflow-hidden">
                            {job.postedBy.profilePicture ? (
                              typeof job.postedBy.profilePicture === 'object' && job.postedBy.profilePicture.url ? (
                                <img
                                  src={job.postedBy.profilePicture.url}
                                  alt={job.postedBy.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : typeof job.postedBy.profilePicture === 'string' ? (
                                <img
                                  src={job.postedBy.profilePicture}
                                  alt={job.postedBy.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="h-5 w-5 text-primary" />
                              )
                            ) : (
                              <User className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {job.postedBy.name || "Alumni"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {job.postedBy.position || ""}
                              {job.postedBy.position && job.postedBy.company ? " at " : ""}
                              {job.postedBy.company || ""}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Job company section */}
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Company</h4>
                        <p className="text-muted-foreground text-sm font-medium">
                          {job.companyName}
                        </p>
                      </div>

                      {/* Job description section */}
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-muted-foreground text-sm whitespace-pre-line">
                          {job.description}
                        </p>
                      </div>

                      {/* Skills required section */}
                      {job.skillsRequired && job.skillsRequired.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Skills Required</h4>
                          <div className="flex flex-wrap gap-2">
                            {job.skillsRequired.map((skill, index) => (
                              <span 
                                key={index} 
                                className={`px-2 py-1 text-xs rounded-full ${
                                  userSkills.some(userSkill => 
                                    userSkill.toLowerCase().includes(skill.toLowerCase()) ||
                                    skill.toLowerCase().includes(userSkill.toLowerCase())
                                  )
                                    ? "bg-primary/10 text-primary"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                                }`}
                              >
                                {skill}
                                {userSkills.some(userSkill => 
                                  userSkill.toLowerCase().includes(skill.toLowerCase()) ||
                                  skill.toLowerCase().includes(userSkill.toLowerCase())
                                ) && (
                                  <Check className="h-3 w-3 ml-1 inline" />
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Requirements section */}
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

                      {/* Salary section */}
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

                      {/* Application deadline section */}
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Application Deadline</h4>
                        <p className="text-muted-foreground">
                          {formatDate(job.applicationDeadline)}
                        </p>
                      </div>
                      
                      {/* Application link section */}
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

                      {/* Action buttons */}
                      <div className="flex space-x-4">
                        <a
                          href={job.applicationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="button-primary flex items-center"
                        >
                          View Job Details
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
                          {savedJobs.includes(job._id) ? "Saved" : "Save Job"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 glass-card rounded-xl">
                <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-6">
                  {filterBySkills 
                    ? "No jobs matching your skills were found. Try turning off the skills filter or check back later."
                    : "There are no job postings that match your search criteria. Try adjusting your search or check back later."
                  }
                </p>
                {filterBySkills && (
                  <button
                    onClick={toggleSkillsFilter}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Show All Jobs
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentJobBoard;
