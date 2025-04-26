import asyncHandler from 'express-async-handler';
import JobPosting from '../Models/JobPosting.js';
import Student from '../Models/Student.js';
import { createNotification } from './notificationController.js';

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
    remoteWork
  } = req.body;

  // Check if user is an alumni
  if (!req.user.graduationYear || req.user.registrationNumber) {
    res.status(403);
    throw new Error('Only alumni can post jobs');
  }

  // Create job posting
  const jobPosting = await JobPosting.create({
    title,
    companyName,
    location,
    jobType: type,
    description,
    requirements: Array.isArray(requirements) ? requirements : requirements.split('\n').filter(req => req.trim() !== ''),
    applicationLink,
    applicationDeadline: deadline,
    industry,
    experienceLevel,
    remoteWork: remoteWork || false,
    postedBy: req.user._id,
  });

  if (jobPosting) {
    // Find relevant students to notify
    const jobKeywords = [
      ...title.toLowerCase().split(' '),
      ...requirements.toString().toLowerCase().split(' ')
    ].filter(word => word.length > 3);
    
    const relevantStudents = await Student.find({
      $or: [
        { skills: { $in: jobKeywords.map(keyword => new RegExp(keyword, 'i')) } },
        { interests: { $in: jobKeywords.map(keyword => new RegExp(keyword, 'i')) } }
      ]
    }).limit(50);
    
    // Create notifications
    const notificationPromises = relevantStudents.map(student => 
      createNotification(
        student._id,
        'Student',
        'job',
        'New Job Posting',
        `A new job "${title}" at ${companyName} has been posted that matches your skills`,
        jobPosting._id
      )
    );
    
    await Promise.all(notificationPromises);
    
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
    .populate('postedBy', 'name email')
    .sort({ postedAt: -1 }); // Most recent first
  
  res.json(jobPostings);
});

// @desc    Get job posting by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobPostingById = asyncHandler(async (req, res) => {
  const jobPosting = await JobPosting.findById(req.params.id)
    .populate('postedBy', 'name email');

  if (jobPosting) {
    res.json(jobPosting);
  } else {
    res.status(404);
    throw new Error('Job posting not found');
  }
});

// @desc    Update job posting
// @route   PUT /api/jobs/:id
// @access  Private (Posted Alumni only)
const updateJobPosting = asyncHandler(async (req, res) => {
  const jobPosting = await JobPosting.findById(req.params.id);

  if (!jobPosting) {
    res.status(404);
    throw new Error('Job posting not found');
  }

  // Check if the alumni is the one who posted the job
  if (jobPosting.postedBy.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this job posting');
  }

  // Update fields
  const { title, companyName, location, description, requirements, applicationLink } = req.body;
  
  jobPosting.title = title || jobPosting.title;
  jobPosting.companyName = companyName || jobPosting.companyName;
  jobPosting.location = location || jobPosting.location;
  jobPosting.description = description || jobPosting.description;
  jobPosting.requirements = requirements || jobPosting.requirements;
  jobPosting.applicationLink = applicationLink || jobPosting.applicationLink;

  const updatedJobPosting = await jobPosting.save();
  res.json(updatedJobPosting);
});

// @desc    Delete job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Posted Alumni only)
const deleteJobPosting = asyncHandler(async (req, res) => {
  const jobPosting = await JobPosting.findById(req.params.id);

  if (!jobPosting) {
    res.status(404);
    throw new Error('Job posting not found');
  }

  // Check if the alumni is the one who posted the job
  if (jobPosting.postedBy.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this job posting');
  }

  await jobPosting.deleteOne();
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
    .populate('postedBy', 'name email');

  res.json(jobPostings);
});

// @desc    Get job postings by alumni
// @route   GET /api/jobs/alumni/:alumniId
// @access  Public
const getJobPostingsByAlumni = asyncHandler(async (req, res) => {
  const jobPostings = await JobPosting.find({ postedBy: req.params.alumniId })
    .populate('postedBy', 'name email')
    .sort({ postedAt: -1 });
  
  res.json(jobPostings);
});

export {
  createJobPosting,
  getJobPostings,
  getJobPostingById,
  updateJobPosting,
  deleteJobPosting,
  searchJobPostings,
  getJobPostingsByAlumni
};