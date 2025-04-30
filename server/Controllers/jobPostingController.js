import asyncHandler from 'express-async-handler';
import JobPosting from '../Models/JobPosting.js';

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private (Alumni only)
const createJobPosting = asyncHandler(async (req, res) => {
  const { 
    title, 
    companyName, 
    location, 
    type,
    description, 
    requirements, 
    applicationLink,
    deadline,
    industry,
    experienceLevel,
    remoteWork,
    salary,
    skillsRequired,
    status
  } = req.body;

  // Check if user is an alumni
  if (!req.user.graduationYear || req.user.registrationNumber) {
    res.status(403);
    throw new Error('Only alumni can post jobs');
  }

  // Create job posting with simplified schema
  const jobPosting = await JobPosting.create({
    title,
    companyName,
    location,
    jobType: type,
    description,
    requirements: Array.isArray(requirements) ? requirements : requirements.split('\n').filter(req => req.trim() !== ''),
    applicationLink,
    applicationDeadline: deadline,
    salary,
    skillsRequired: skillsRequired || [],
    status: status || 'active',
    postedBy: req.user._id
  });

  if (jobPosting) {
    res.status(201).json(jobPosting);
  } else {
    res.status(400);
    throw new Error('Invalid job posting data');
  }
});

// @desc    Get all job postings
// @route   GET /api/jobs
// @access  Public
const getJobPostings = asyncHandler(async (req, res) => {
  const jobPostings = await JobPosting.find({})
    .populate('postedBy', 'name email profilePicture position company')
    .sort({ postedAt: -1 });
  
  res.json(jobPostings);
});

// @desc    Get job posting by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobPostingById = asyncHandler(async (req, res) => {
  const jobPosting = await JobPosting.findById(req.params.id)
    .populate('postedBy', 'name email profilePicture position company');
  
  if (jobPosting) {
    res.json(jobPosting);
  } else {
    res.status(404);
    throw new Error('Job posting not found');
  }
});

// @desc    Update job posting
// @route   PUT /api/jobs/:id
// @access  Private (Alumni only, must be creator)
const updateJobPosting = asyncHandler(async (req, res) => {
  const jobPosting = await JobPosting.findById(req.params.id);
  
  if (!jobPosting) {
    res.status(404);
    throw new Error('Job posting not found');
  }
  
  // Check if user is the creator of the job posting
  if (jobPosting.postedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this job posting');
  }
  
  const { title, companyName, location, description, requirements, applicationLink, deadline, type, industry, experienceLevel, remoteWork, salary, skillsRequired, status } = req.body;
  
  jobPosting.title = title || jobPosting.title;
  jobPosting.companyName = companyName || jobPosting.companyName;
  jobPosting.location = location || jobPosting.location;
  jobPosting.description = description || jobPosting.description;
  
  // Handle requirements array or string
  if (requirements) {
    jobPosting.requirements = Array.isArray(requirements) 
      ? requirements 
      : requirements.split('\n').filter(req => req.trim() !== '');
  }
  
  jobPosting.applicationLink = applicationLink || jobPosting.applicationLink;
  
  // Optional field updates
  if (deadline) jobPosting.applicationDeadline = deadline;
  if (type) jobPosting.jobType = type;
  if (salary) jobPosting.salary = salary;
  
  // Update skillsRequired if provided
  if (skillsRequired) {
    jobPosting.skillsRequired = Array.isArray(skillsRequired) ? skillsRequired : [];
  }
  
  // Update status if provided
  if (status) {
    jobPosting.status = status;
  }
  
  const updatedJobPosting = await jobPosting.save();
  
  res.json(updatedJobPosting);
});

// @desc    Delete job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Alumni only, must be creator)
const deleteJobPosting = asyncHandler(async (req, res) => {
  const jobPosting = await JobPosting.findById(req.params.id);
  
  if (!jobPosting) {
    res.status(404);
    throw new Error('Job posting not found');
  }
  
  // Check if user is the creator of the job posting
  if (jobPosting.postedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this job posting');
  }
  
  await JobPosting.deleteOne({ _id: req.params.id });
  
  res.json({ message: 'Job posting removed' });
});

// @desc    Search job postings
// @route   GET /api/jobs/search
// @access  Public
const searchJobPostings = asyncHandler(async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    res.status(400);
    throw new Error('Search query is required');
  }

  const jobPostings = await JobPosting.find(
    { $text: { $search: query } },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .populate('postedBy', 'name email profilePicture position company');

  res.json(jobPostings);
});

// @desc    Get job postings by alumni
// @route   GET /api/jobs/alumni/:alumniId
// @access  Public
const getJobPostingsByAlumni = asyncHandler(async (req, res) => {
  const jobPostings = await JobPosting.find({ postedBy: req.params.alumniId })
    .populate('postedBy', 'name email profilePicture position company')
    .sort({ postedAt: -1 });
  
  res.json(jobPostings);
});

// @desc    Get my job postings
// @route   GET /api/jobs/my-jobs
// @access  Private (Alumni only)
const getMyJobPostings = asyncHandler(async (req, res) => {
  try {
    const jobPostings = await JobPosting.find({ postedBy: req.user._id })
      .sort({ postedAt: -1 });
    
    res.json(jobPostings);
  } catch (error) {
    console.error("Error fetching my job postings:", error);
    res.status(500).json({ message: "Failed to fetch your job postings" });
  }
});

export {
  createJobPosting,
  getJobPostings,
  getJobPostingById,
  updateJobPosting,
  deleteJobPosting,
  searchJobPostings,
  getJobPostingsByAlumni,
  getMyJobPostings
};