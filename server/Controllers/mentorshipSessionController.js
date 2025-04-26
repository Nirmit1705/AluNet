import asyncHandler from 'express-async-handler';
import MentorshipSession from '../Models/MentorshipSession.js';
import Mentorship from '../Models/Mentorship.js';
import { createNotification } from './notificationController.js';

// @desc    Schedule a new mentorship session
// @route   POST /api/mentorship/:mentorshipId/sessions
// @access  Private (Student & Alumni)
// Implement session scheduling to match frontend form
const scheduleSession = asyncHandler(async (req, res) => {
  const { 
    mentorshipId, 
    title, 
    description, 
    date, 
    startTime, 
    endTime, 
    meetingLink 
  } = req.body;

  // Find the mentorship
  const mentorship = await Mentorship.findById(mentorshipId);
  if (!mentorship) {
    res.status(404);
    throw new Error('Mentorship not found');
  }

  if (mentorship.status !== 'accepted') {
    res.status(400);
    throw new Error('Cannot schedule sessions for mentorships that are not accepted');
  }

  // Check if user is part of this mentorship
  const isStudent = mentorship.student.toString() === req.user._id.toString();
  const isAlumni = mentorship.alumni.toString() === req.user._id.toString();

  if (!isStudent && !isAlumni) {
    res.status(403);
    throw new Error('Not authorized to schedule sessions for this mentorship');
  }

  // Create session
  const session = await MentorshipSession.create({
    mentorship: mentorshipId,
    student: mentorship.student,
    alumni: mentorship.alumni,
    title,
    description,
    date: new Date(date),
    startTime,
    endTime,
    meetingLink: meetingLink || ''
  });

  if (session) {
    // Send notification to the other party
    const recipientId = isStudent ? mentorship.alumni : mentorship.student;
    const recipientModel = isStudent ? 'Alumni' : 'Student';
    const senderName = req.user.name;
    
    await createNotification(
      recipientId,
      recipientModel,
      'mentorship',
      'New Mentorship Session',
      `${senderName} has scheduled a mentorship session: ${title}`,
      session._id
    );
    
    res.status(201).json(session);
  } else {
    res.status(400);
    throw new Error('Invalid session data');
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

  // Get sessions
  const sessions = await MentorshipSession.find({ mentorship: mentorshipId })
    .sort({ date: 1, startTime: 1 });

  res.json(sessions);
});

// @desc    Get session by ID
// @route   GET /api/mentorship/sessions/:sessionId
// @access  Private (Student & Alumni)
const getSessionById = asyncHandler(async (req, res) => {
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

export {
  scheduleSession,
  getSessionsByMentorship,
  getSessionById,
  updateSession,
  cancelSession,
  getMyUpcomingSessions
};