import asyncHandler from 'express-async-handler';
import JobApplication from '../Models/JobApplication.js';
import JobPosting from '../Models/JobPosting.js';
import { createNotification } from './notificationController.js';

// @desc    Submit a job application
// @route   POST /api/jobs/:jobId/apply
// @access  Private (Students only)
const submitApplication = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { coverLetter, resumeUrl } = req.body;
  
  // Check if user is a student
  if (!req.user.registrationNumber) {
    res.status(403);
    throw new Error('Only students can apply for jobs');
  }
  
  // Find the job posting
  const jobPosting = await JobPosting.findById(jobId);
  if (!jobPosting) {
    res.status(404);
    throw new Error('Job posting not found');
  }
  
  // Check if user has already applied
  const existingApplication = await JobApplication.findOne({
    jobPosting: jobId,
    applicant: req.user._id
  });
  
  if (existingApplication) {
    res.status(400);
    throw new Error('You have already applied for this job');
  }
  
  // Create application
  const application = await JobApplication.create({
    jobPosting: jobId,
    applicant: req.user._id,
    coverLetter,
    resume: {
      url: resumeUrl,
      filename: resumeUrl ? resumeUrl.split('/').pop() : '',
    },
    appliedAt: new Date()
  });
  
  if (application) {
    // Increment application count
    await jobPosting.incrementApplications();
    
    // Notify the alumni who posted the job
    await createNotification(
      jobPosting.postedBy,
      'Alumni',
      'job-application',
      'New Job Application',
      `A student has applied for your job posting: ${jobPosting.title}`,
      application._id
    );
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: application._id,
    });
  } else {
    res.status(400);
    throw new Error('Invalid application data');
  }
});

// @desc    Get all applications for a job posting
// @route   GET /api/jobs/:jobId/applications
// @access  Private (Posted Alumni only)
const getJobApplications = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  
  // Find the job posting
  const jobPosting = await JobPosting.findById(jobId);
  
  if (!jobPosting) {
    res.status(404);
    throw new Error('Job posting not found');
  }
  
  // Check if the alumni is the one who posted the job
  if (jobPosting.postedBy.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to view applications for this job');
  }
  
  // Get applications
  const applications = await JobApplication.find({ jobPosting: jobId })
    .populate('applicant', 'name email registrationNumber branch graduationYear')
    .sort({ appliedAt: -1 });
  
  res.json(applications);
});

// @desc    Get all applications by a student
// @route   GET /api/jobs/applications/my-applications
// @access  Private (Students only)
const getMyApplications = asyncHandler(async (req, res) => {
  // Check if user is a student
  if (!req.user.registrationNumber) {
    res.status(403);
    throw new Error('Only students can view their applications');
  }
  
  // Get applications
  const applications = await JobApplication.find({ applicant: req.user._id })
    .populate({
      path: 'jobPosting',
      select: 'title companyName location status applicationDeadline',
      populate: {
        path: 'postedBy',
        select: 'name'
      }
    })
    .sort({ appliedAt: -1 });
  
  res.json(applications);
});

// @desc    Update application status
// @route   PUT /api/jobs/applications/:id
// @access  Private (Posted Alumni only)
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, feedback } = req.body;
  
  const application = await JobApplication.findById(id).populate('jobPosting');
  
  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }
  
  // Check if the alumni is the one who posted the job
  if (application.jobPosting.postedBy.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this application');
  }
  
  // Update status
  application.status = status;
  
  // Add feedback if provided
  if (feedback) {
    application.feedback = feedback;
  }
  
  // If status is reviewed or later, set reviewedAt
  if (['reviewed', 'shortlisted', 'rejected', 'hired'].includes(status)) {
    application.reviewedAt = new Date();
  }
  
  const updatedApplication = await application.save();
  
  // Notify the student
  await createNotification(
    application.applicant,
    'Student',
    'job-application-update',
    'Application Status Updated',
    `Your application for ${application.jobPosting.title} has been updated to ${status}`,
    application._id
  );
  
  res.json(updatedApplication);
});

export {
  submitApplication,
  getJobApplications,
  getMyApplications,
  updateApplicationStatus
};
