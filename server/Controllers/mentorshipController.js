import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Mentorship from '../Models/Mentorship.js';
import Student from '../Models/Student.js';
import Alumni from '../Models/Alumni.js';
import { createNotification } from './notificationController.js';

// @desc    Create a new mentorship request
// @route   POST /api/mentorship
// @access  Private (Student only)
const createMentorshipRequest = asyncHandler(async (req, res) => {
  // Check if user is a student
  if (!req.user.registrationNumber) {
    res.status(403);
    throw new Error('Only students can request mentorship');
  }

  // Extract alumniId and other fields from request body
  const { 
    alumniId, 
    requestMessage, 
    mentorshipGoals, 
    skillsToLearn, 
    timeRequired, 
    availability, 
    meetingFrequency, 
    meetingMode,
    requestedSessions 
  } = req.body;

  // Better debugging for request body
  console.log("Received mentorship request:", {
    studentId: req.user._id,
    alumniId: alumniId,
    requestMessage: requestMessage ? `${requestMessage.substring(0, 20)}...` : null,
    timeRequired,
    availability: availability ? `${availability.substring(0, 20)}...` : null,
    meetingFrequency,
    meetingMode,
    requestedSessions
  });

  // Validate alumniId
  if (!alumniId) {
    res.status(400);
    throw new Error('Alumni ID is required');
  }

  console.log(`Attempting to find alumni with ID: ${alumniId}`);

  try {
    // Check if alumni exists and is available for mentorship
    const alumni = await Alumni.findById(alumniId);
    
    if (!alumni) {
      console.log(`No alumni found with ID: ${alumniId}`);
      console.log("Alumni model structure:", Object.keys(Alumni.schema.paths));
      
      res.status(404);
      throw new Error('Alumni not found');
    }

    console.log(`Found alumni: ${alumni.name}, mentorshipAvailable: ${alumni.mentorshipAvailable}`);

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
      meetingFrequency: meetingFrequency || '',
      meetingMode: meetingMode || 'online',
      requestedSessions: requestedSessions || 5, // Default to 5 if not specified
      totalPlannedSessions: requestedSessions || 5 // Set the totalPlannedSessions to match requestedSessions
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
      
      console.log(`Successfully created mentorship request: ${mentorship._id}`);
      res.status(201).json(mentorship);
    } else {
      res.status(400);
      throw new Error('Invalid mentorship data');
    }
  } catch (error) {
    console.error(`Error creating mentorship request: ${error.message}`);
    
    // Check if error has already been handled
    if (res.statusCode !== 200) {
      throw error;
    }
    
    // Handle unexpected errors
    res.status(500);
    throw new Error(`Failed to create mentorship request: ${error.message}`);
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
    .populate('alumni', 'name email currentPosition company linkedin profilePicture')
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
    .populate('student', 'name email currentYear branch skills interests profilePicture')
    .sort('-createdAt');

  res.json(mentorships);
});

// @desc    Respond to a mentorship request (accept/reject)
// @route   PUT /api/mentorship/:id/respond
// @access  Private (Alumni only)
const respondToMentorshipRequest = asyncHandler(async (req, res) => {
  const { status, responseMessage } = req.body;

  // Validate request body
  if (!status || !['accepted', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Please provide a valid status (accepted/rejected)');
  }

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

  // Check if the request is still pending
  if (mentorship.status !== 'pending') {
    res.status(400);
    throw new Error('This request has already been responded to');
  }

  // Update the mentorship request using the updateStatus method
  await mentorship.updateStatus(
    status, 
    req.user._id, 
    'Alumni', 
    responseMessage || ''
  );

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

  // Fetch the updated mentorship with populated fields
  const updatedMentorship = await Mentorship.findById(req.params.id)
    .populate('student', 'name email currentYear branch skills interests')
    .populate('alumni', 'name email currentPosition company linkedin');

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

// @desc    Get all mentees for an alumni
// @route   GET /api/mentorship/mentees
// @access  Private (Alumni only)
const getMentees = asyncHandler(async (req, res) => {
  // Verify the user is an alumni
  if (!req.user || req.user.constructor.modelName !== 'Alumni') {
    res.status(403);
    throw new Error('Access denied. Only alumni can view their mentees.');
  }

  try {
    // Find all mentorships where this alumni is the mentor and status is accepted
    const mentorships = await Mentorship.find({ 
      alumni: req.user._id,
      status: 'accepted'
    }).populate({
      path: 'student',
      select: 'name email profilePicture branch currentYear interests skills'
    });

    console.log(`Found ${mentorships.length} mentorships for alumni ${req.user._id}`);

    // Get sessions for these mentorships to calculate progress
    const MentorshipSession = mongoose.model('MentorshipSession');
    
    // Transform the mentorships to return student information with enhanced data
    const mentees = await Promise.all(mentorships.map(async (mentorship) => {
      // Get all sessions for this mentorship
      const sessions = await MentorshipSession.find({ 
        mentorship: mentorship._id,
      }).sort({ date: -1 });

      console.log(`Found ${sessions.length} sessions for mentorship ${mentorship._id}`);

      // Calculate metrics
      const completedSessions = sessions.filter(s => s.status === 'completed').length;
      const totalPlannedSessions = sessions.length > 0 ? sessions.length + 2 : 5; // Add buffer or use default 5
      const progress = totalPlannedSessions > 0 ? Math.floor((completedSessions / totalPlannedSessions) * 100) : 0;
      
      // Get last interaction date from most recent session
      const lastSession = sessions.length > 0 ? sessions[0] : null;
      const lastInteraction = lastSession ? formatTimeAgo(lastSession.createdAt) : "No previous sessions";
      
      // Get next scheduled session if any - explicitly check for scheduled status
      const nextSession = sessions.find(s => s.status === 'scheduled' && new Date(s.date) > new Date());
      
      // Format the next session date in a user-friendly way
      let nextSessionDate = "Not scheduled";
      if (nextSession) {
        const sessionDate = new Date(nextSession.date);
        nextSessionDate = `${sessionDate.toLocaleDateString()} at ${nextSession.startTime}`;
        
        // Log the next session details to help with debugging
        console.log(`Next session for mentee ${mentorship.student.name}:`, {
          date: nextSession.date,
          formattedDate: sessionDate.toLocaleDateString(),
          startTime: nextSession.startTime,
          title: nextSession.title
        });
      } else if (mentorship.nextSessionDate) {
        // Use the stored nextSessionDate as fallback
        const sessionDate = new Date(mentorship.nextSessionDate);
        nextSessionDate = sessionDate.toLocaleDateString();
        console.log(`Using stored nextSessionDate for mentee ${mentorship.student.name}:`, nextSessionDate);
      }
      
      return {
        _id: mentorship.student._id,
        name: mentorship.student.name,
        email: mentorship.student.email,
        branch: mentorship.student.branch,
        currentYear: mentorship.student.currentYear,
        profilePicture: mentorship.student.profilePicture,
        lastInteraction: lastInteraction,
        nextSession: nextSessionDate,
        // Add the raw next session date for frontend use
        nextSessionDate: mentorship.nextSessionDate || nextSession?.date,
        mentorshipId: mentorship._id,
        progress: progress,
        sessionsCompleted: completedSessions,
        totalSessions: totalPlannedSessions,
        skillsToLearn: mentorship.skillsToLearn || [],
        focusAreas: mentorship.focusAreas || [],
        startDate: mentorship.startDate,
        status: mentorship.status,
        mentorshipGoals: mentorship.mentorshipGoals?.substring(0, 100) || "Working on mentorship goals.",
        // Include all the session IDs so we can easily reference them from the frontend
        sessionIds: sessions.map(session => session._id),
        // Include the next upcoming session ID for easy reference
        nextSessionId: nextSession ? nextSession._id : null
      };
    }));

    // Helper function to format time ago
    function formatTimeAgo(date) {
      const now = new Date();
      const diff = now - new Date(date);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (days === 0) return "Today";
      if (days === 1) return "Yesterday";
      if (days < 7) return `${days} days ago`;
      if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
      return `${Math.floor(days / 30)} months ago`;
    }

    res.json(mentees);
  } catch (error) {
    console.error(`Error fetching mentees: ${error.message}`);
    res.status(500);
    throw new Error(`Failed to fetch mentees: ${error.message}`);
  }
});

export {
  createMentorshipRequest,
  getStudentMentorshipRequests,
  getAlumniMentorshipRequests,
  respondToMentorshipRequest,
  getAllMentorships,
  getMentees
};