import asyncHandler from 'express-async-handler';
import Mentorship from '../Models/Mentorship.js';
import Student from '../Models/Student.js';
import Alumni from '../Models/Alumni.js';
import { createNotification } from './notificationController.js';

// @desc    Create a new mentorship request
// @route   POST /api/mentorship
// @access  Private (Student only)
// Implement mentorship request creation to match frontend form
const createMentorshipRequest = asyncHandler(async (req, res) => {
  const { 
    alumniId, 
    requestMessage, 
    mentorshipGoals, 
    skillsToLearn, 
    timeRequired,
    availability,
    meetingMode 
  } = req.body;

  // Check if user is a student
  if (!req.user.registrationNumber) {
    res.status(403);
    throw new Error('Only students can request mentorship');
  }

  // Check if alumni exists and is available for mentorship
  const alumni = await Alumni.findById(alumniId);
  if (!alumni) {
    res.status(404);
    throw new Error('Alumni not found');
  }

  if (!alumni.mentorshipAvailable) {
    res.status(400);
    throw new Error('This alumni is not available for mentorship');
  }

  // Create new mentorship request
  const mentorship = await Mentorship.create({
    student: req.user._id,
    alumni: alumniId,
    requestMessage,
    mentorshipGoals,
    skillsToLearn: skillsToLearn || [],
    timeRequired,
    availability,
    meetingMode: meetingMode || 'online'
  });

  if (mentorship) {
    // Create notification for alumni
    await createNotification(
      alumniId,
      'Alumni',
      'mentorship',
      'New Mentorship Request',
      `${req.user.name} has requested your mentorship`,
      mentorship._id
    );
    
    res.status(201).json(mentorship);
  } else {
    res.status(400);
    throw new Error('Invalid mentorship data');
  }
});

// @desc    Get all mentorship requests for a student
// @route   GET /api/mentorship/student
// @access  Private (Student only)
const getStudentMentorshipRequests = asyncHandler(async (req, res) => {
  // Check if user is a student
  if (!req.user || req.user.registrationNumber === undefined) {
    res.status(403);
    throw new Error('Access denied');
  }

  const mentorships = await Mentorship.find({ student: req.user._id })
    .populate('alumni', 'name email currentPosition company linkedin')
    .sort('-createdAt');

  res.json(mentorships);
});

// @desc    Get all mentorship requests for an alumni
// @route   GET /api/mentorship/alumni
// @access  Private (Alumni only)
const getAlumniMentorshipRequests = asyncHandler(async (req, res) => {
  // Check if user is an alumni
  if (!req.user || req.user.graduationYear === undefined || req.user.registrationNumber !== undefined) {
    res.status(403);
    throw new Error('Access denied');
  }

  const mentorships = await Mentorship.find({ alumni: req.user._id })
    .populate('student', 'name email currentYear branch skills interests')
    .sort('-createdAt');

  res.json(mentorships);
});

// @desc    Respond to a mentorship request (accept/reject)
// @route   PUT /api/mentorship/:id/respond
// @access  Private (Alumni only)
const respondToMentorshipRequest = asyncHandler(async (req, res) => {
  const { status, responseMessage } = req.body;

  // Check if user is an alumni
  if (!req.user || req.user.graduationYear === undefined || req.user.registrationNumber !== undefined) {
    res.status(403);
    throw new Error('Only alumni can respond to mentorship requests');
  }

  // Find the mentorship request
  const mentorship = await Mentorship.findById(req.params.id);

  if (!mentorship) {
    res.status(404);
    throw new Error('Mentorship request not found');
  }

  // Check if the alumni is the one being requested
  if (mentorship.alumni.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to respond to this request');
  }

  // Update the mentorship request
  mentorship.status = status;
  mentorship.responseMessage = responseMessage || '';
  mentorship.responseDate = Date.now();

  const updatedMentorship = await mentorship.save();

  // Find student to create notification
  const student = await Student.findById(mentorship.student);

  if (student) {
    // Create notification for the student
    try {
      await createNotification(
        student._id,
        'Student',
        'mentorship',
        `Mentorship Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        `Your mentorship request to ${req.user.name} has been ${status}`,
        mentorship._id
      );
    } catch (error) {
      console.error('Failed to create mentorship response notification:', error.message);
      // Continue with the response even if notification fails
    }
  }

  res.json(updatedMentorship);
});

// @desc    Get all mentorship requests (for dashboard)
// @route   GET /api/mentorship
// @access  Public
const getAllMentorships = asyncHandler(async (req, res) => {
  const mentorships = await Mentorship.find({})
    .populate('student', 'name email currentYear branch')
    .populate('alumni', 'name email currentPosition company')
    .sort('-createdAt');

  res.json(mentorships);
});

export {
  createMentorshipRequest,
  getStudentMentorshipRequests,
  getAlumniMentorshipRequests,
  respondToMentorshipRequest,
  getAllMentorships
};