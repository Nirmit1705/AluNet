import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import MentorshipSession from '../Models/MentorshipSession.js';
import Mentorship from '../Models/Mentorship.js';
import { createNotification } from './notificationController.js';
import { updateExpiredSessions, updateMentorshipProgress } from '../utils/sessionStatusChecker.js';

// @desc    Schedule a new mentorship session
// @route   POST /api/mentorship/:mentorshipId/sessions
// @access  Private (Student & Alumni)
const scheduleSession = asyncHandler(async (req, res) => {
  try {
    const { 
      title, 
      description, 
      date, 
      startTime, 
      endTime, 
      meetingLink 
    } = req.body;

    const { mentorshipId } = req.params;

    console.log('Request to schedule session received:', {
      mentorshipId,
      title,
      date,
      startTime,
      endTime
    });

    // Validate required fields
    if (!title || !description || !date || !startTime || !endTime) {
      console.log('Missing required fields:', { title, description, date, startTime, endTime });
      res.status(400);
      throw new Error('Please provide all required fields: title, description, date, startTime, endTime');
    }

    // Validate date format
    const sessionDate = new Date(date);
    if (isNaN(sessionDate.getTime())) {
      console.log('Invalid date format:', date);
      res.status(400);
      throw new Error('Invalid date format');
    }

    // Find the mentorship
    console.log('Looking for mentorship with ID:', mentorshipId);
    const mentorship = await Mentorship.findById(mentorshipId);
    
    if (!mentorship) {
      console.log('Mentorship not found with ID:', mentorshipId);
      res.status(404);
      throw new Error('Mentorship not found');
    }

    console.log('Found mentorship:', mentorship._id);

    if (mentorship.status !== 'accepted') {
      console.log('Cannot schedule for non-accepted mentorship, status:', mentorship.status);
      res.status(400);
      throw new Error('Cannot schedule sessions for mentorships that are not accepted');
    }

    // Check if user is part of this mentorship
    const isStudent = mentorship.student.toString() === req.user._id.toString();
    const isAlumni = mentorship.alumni.toString() === req.user._id.toString();

    console.log('Checking authorization:', { 
      requestingUserId: req.user._id,
      studentId: mentorship.student,
      alumniId: mentorship.alumni,
      isStudent,
      isAlumni
    });

    if (!isStudent && !isAlumni) {
      console.log('User not authorized to schedule sessions');
      res.status(403);
      throw new Error('Not authorized to schedule sessions for this mentorship');
    }

    // Create session
    console.log('Creating session with data:', {
      mentorship: mentorshipId,
      student: mentorship.student,
      alumni: mentorship.alumni,
      title,
      date: sessionDate,
      startTime,
      endTime
    });

    const session = await MentorshipSession.create({
      mentorship: mentorshipId,
      student: mentorship.student,
      alumni: mentorship.alumni,
      title,
      description,
      date: sessionDate,
      startTime,
      endTime,
      meetingLink: meetingLink || '',
      status: 'scheduled'
    });

    if (session) {
      console.log('Session created successfully:', session._id);
      
      // Send notification to the other party
      const recipientId = isStudent ? mentorship.alumni : mentorship.student;
      const recipientModel = isStudent ? 'Alumni' : 'Student';
      const senderName = req.user.name;
      
      // Format date for notification
      const formattedDate = sessionDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      try {
        await createNotification(
          recipientId,
          recipientModel,
          'mentorship',
          'New Mentorship Session',
          `${senderName} has scheduled a mentorship session: "${title}" on ${formattedDate} at ${startTime}`,
          session._id
        );
        console.log('Notification sent to recipient');
      } catch (notificationError) {
        console.error('Failed to create notification:', notificationError);
        // Continue without failing the request
      }
      
      // Update mentorship with the next session date and other statistics
      try {
        // Update the lastInteractionDate
        mentorship.lastInteractionDate = new Date();
        
        // Count total completed and scheduled sessions
        const sessions = await MentorshipSession.find({ 
          mentorship: mentorshipId
        });
        
        const completedCount = sessions.filter(s => s.status === 'completed').length;
        const totalPlannedSessions = sessions.length;
        
        // Store the date of the next upcoming session in the mentorship document
        // Find the upcoming session that has the earliest date
        const upcomingSessions = sessions.filter(s => 
          s.status === 'scheduled' && new Date(s.date) >= new Date()
        ).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Store next session date in the mentorship document
        if (upcomingSessions.length > 0) {
          mentorship.nextSessionDate = upcomingSessions[0].date;
          console.log(`Setting nextSessionDate to ${mentorship.nextSessionDate}`);
        }
        
        // Update the mentorship with the counts and last interaction date
        await mentorship.updateSessionStats(
          completedCount,
          totalPlannedSessions,
          new Date()
        );
        console.log('Mentorship statistics updated');
      } catch (error) {
        console.error('Failed to update mentorship statistics:', error.message);
        // Continue without failing the request
      }
      
      res.status(201).json(session);
    } else {
      console.log('Failed to create session - invalid data');
      res.status(400);
      throw new Error('Invalid session data');
    }
  } catch (error) {
    console.error('Error in scheduleSession:', error);
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

// @desc    Get all sessions for a mentorship
// @route   GET /api/mentorship/:mentorshipId/sessions
// @access  Private (Student & Alumni)
const getSessionsByMentorship = asyncHandler(async (req, res) => {
  const { mentorshipId } = req.params;

  // Check if mentorship exists
  const mentorship = await Mentorship.findById(mentorshipId);
  
  if (!mentorship) {
    res.status(404);
    throw new Error('Mentorship not found');
  }

  // Check if user is part of this mentorship
  const isStudent = mentorship.student.toString() === req.user._id.toString();
  const isAlumni = mentorship.alumni.toString() === req.user._id.toString();

  if (!isStudent && !isAlumni) {
    res.status(403);
    throw new Error('Not authorized to view sessions for this mentorship');
  }

  // First, update any expired sessions
  await updateExpiredSessions();
  
  // Then get the updated sessions
  const sessions = await MentorshipSession.find({ mentorship: mentorshipId })
    .sort({ date: 1, startTime: 1 });

  res.json(sessions);
});

// @desc    Get session by ID
// @route   GET /api/mentorship/sessions/:sessionId
// @access  Private (Student & Alumni)
const getSessionById = asyncHandler(async (req, res) => {
  // First check and update expired sessions
  await updateExpiredSessions();
  
  const session = await MentorshipSession.findById(req.params.sessionId);

  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }

  // Check if user is part of this session
  const isParticipant = 
    session.student.toString() === req.user._id.toString() || 
    session.alumni.toString() === req.user._id.toString();

  if (!isParticipant) {
    res.status(403);
    throw new Error('Not authorized to view this session');
  }

  res.json(session);
});

// @desc    Update session
// @route   PUT /api/mentorship/sessions/:sessionId
// @access  Private (Student & Alumni)
const updateSession = asyncHandler(async (req, res) => {
  const { title, description, date, startTime, endTime, meetingLink, status } = req.body;
  
  const session = await MentorshipSession.findById(req.params.sessionId);

  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }

  // Check if user is part of this session
  const isParticipant = 
    session.student.toString() === req.user._id.toString() || 
    session.alumni.toString() === req.user._id.toString();

  if (!isParticipant) {
    res.status(403);
    throw new Error('Not authorized to update this session');
  }

  // Update fields
  if (title) session.title = title;
  if (description) session.description = description;
  if (date) session.date = new Date(date);
  if (startTime) session.startTime = startTime;
  if (endTime) session.endTime = endTime;
  if (meetingLink !== undefined) session.meetingLink = meetingLink;
  if (status && ['scheduled', 'completed', 'cancelled'].includes(status)) {
    session.status = status;
  }

  const updatedSession = await session.save();

  // Send notification to the other party
  const isStudent = session.student.toString() === req.user._id.toString();
  const recipientId = isStudent ? session.alumni : session.student;
  const recipientModel = isStudent ? 'Alumni' : 'Student';
  const senderName = req.user.name;

  try {
    await createNotification(
      recipientId,
      recipientModel,
      'mentorship',
      'Mentorship Session Updated',
      `${senderName} has updated the mentorship session: ${updatedSession.title}`,
      updatedSession._id
    );
  } catch (error) {
    console.error('Failed to create session update notification:', error.message);
  }

  res.json(updatedSession);
});

// @desc    Cancel session
// @route   PUT /api/mentorship/sessions/:sessionId/cancel
// @access  Private (Student & Alumni)
const cancelSession = asyncHandler(async (req, res) => {
  const session = await MentorshipSession.findById(req.params.sessionId);

  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }

  // Check if user is part of this session
  const isParticipant = 
    session.student.toString() === req.user._id.toString() || 
    session.alumni.toString() === req.user._id.toString();

  if (!isParticipant) {
    res.status(403);
    throw new Error('Not authorized to cancel this session');
  }

  // Cancel session
  session.status = 'cancelled';
  const updatedSession = await session.save();

  // Send notification to the other party
  const isStudent = session.student.toString() === req.user._id.toString();
  const recipientId = isStudent ? session.alumni : session.student;
  const recipientModel = isStudent ? 'Alumni' : 'Student';
  const senderName = req.user.name;

  try {
    await createNotification(
      recipientId,
      recipientModel,
      'mentorship',
      'Mentorship Session Cancelled',
      `${senderName} has cancelled the mentorship session: ${session.title}`,
      session._id
    );
  } catch (error) {
    console.error('Failed to create session cancellation notification:', error.message);
  }

  res.json(updatedSession);
});

// @desc    Get upcoming sessions for current user
// @route   GET /api/mentorship/sessions/my-upcoming
// @access  Private
const getMyUpcomingSessions = asyncHandler(async (req, res) => {
  // First check and update expired sessions
  await updateExpiredSessions();
  
  const userId = req.user._id;
  const userModel = req.user.constructor.modelName;

  const queryParam = userModel === 'Student' ? { student: userId } : { alumni: userId };

  // Get upcoming sessions - today or in the future, not cancelled
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sessions = await MentorshipSession.find({
    ...queryParam,
    date: { $gte: today },
    status: 'scheduled'
  })
  .sort({ date: 1, startTime: 1 })
  .limit(10); // Limit to 10 upcoming sessions

  res.json(sessions);
});

// Add a new endpoint to manually check and update session statuses
// @desc    Check and update expired sessions
// @route   GET /api/mentorship/sessions/check-expired
// @access  Public
const checkExpiredSessions = asyncHandler(async (req, res) => {
  const result = await updateExpiredSessions();
  res.json({ success: true, ...result });
});

export {
  scheduleSession,
  getSessionsByMentorship,
  getSessionById,
  updateSession,
  cancelSession,
  getMyUpcomingSessions,
  checkExpiredSessions  // Add the new endpoint
};