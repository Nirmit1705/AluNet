import asyncHandler from 'express-async-handler';
import MentorshipFeedback from '../Models/MentorshipFeedback.js';
import Mentorship from '../Models/Mentorship.js';
import mongoose from 'mongoose'; // Add this import
import { createNotification } from './notificationController.js';

// @desc    Submit feedback for a mentorship
// @route   POST /api/mentorship/:mentorshipId/feedback
// @access  Private (Student & Alumni)
const submitFeedback = asyncHandler(async (req, res) => {
  const { rating, feedback } = req.body;
  const { mentorshipId } = req.params;

  // Validate input
  if (!rating || !feedback) {
    res.status(400);
    throw new Error('Please provide both rating and feedback');
  }

  if (rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5');
  }

  // Find the mentorship
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
    throw new Error('Not authorized to submit feedback for this mentorship');
  }

  // Determine if feedback is from student or alumni
  const fromStudent = isStudent;

  // Check if user has already submitted feedback
  const existingFeedback = await MentorshipFeedback.findOne({
    mentorship: mentorshipId,
    fromStudent
  });

  if (existingFeedback) {
    res.status(400);
    throw new Error('You have already submitted feedback for this mentorship');
  }

  // Create feedback
  const mentorshipFeedback = await MentorshipFeedback.create({
    mentorship: mentorshipId,
    fromStudent,
    rating,
    feedback
  });

  if (mentorshipFeedback) {
    // Send notification to the other party
    const recipientId = isStudent ? mentorship.alumni : mentorship.student;
    const recipientModel = isStudent ? 'Alumni' : 'Student';
    const senderName = req.user.name;

    try {
      await createNotification(
        recipientId,
        recipientModel,
        'mentorship',
        'New Mentorship Feedback',
        `${senderName} has submitted feedback for your mentorship`,
        mentorship._id
      );
    } catch (error) {
      console.error('Failed to create feedback notification:', error.message);
    }

    res.status(201).json(mentorshipFeedback);
  } else {
    res.status(400);
    throw new Error('Invalid feedback data');
  }
});

// @desc    Get feedback for a mentorship
// @route   GET /api/mentorship/:mentorshipId/feedback
// @access  Private (Student & Alumni - must be part of the mentorship)
const getFeedback = asyncHandler(async (req, res) => {
  const { mentorshipId } = req.params;

  // Find the mentorship
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
    throw new Error('Not authorized to view feedback for this mentorship');
  }

  // Get all feedback for this mentorship
  const feedback = await MentorshipFeedback.find({ mentorship: mentorshipId });

  res.json(feedback);
});

// @desc    Get all feedback received by a user
// @route   GET /api/mentorship/feedback/received
// @access  Private
const getReceivedFeedback = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.user.constructor.modelName;
  
  // Determine if user is student or alumni
  const isStudent = userType === 'Student';
  
  // Find mentorships where user is involved
  const mentorshipsQuery = isStudent 
    ? { student: userId } 
    : { alumni: userId };
  
  const mentorships = await Mentorship.find(mentorshipsQuery);
  
  if (!mentorships.length) {
    return res.json([]);
  }
  
  // Find feedback where user received feedback (opposite of fromStudent value)
  const feedback = await MentorshipFeedback.find({
    mentorship: { $in: mentorships.map(m => m._id) },
    fromStudent: !isStudent
  }).populate({
    path: 'mentorship',
    populate: {
      path: isStudent ? 'alumni' : 'student',
      select: 'name email profilePicture'
    }
  });
  
  // Format the response to include details about the feedback provider
  const formattedFeedback = feedback.map(item => {
    const otherParty = isStudent ? item.mentorship.alumni : item.mentorship.student;
    
    return {
      _id: item._id,
      mentorshipId: item.mentorship._id,
      rating: item.rating,
      feedback: item.feedback,
      createdAt: item.createdAt,
      fromStudent: item.fromStudent,
      provider: {
        _id: otherParty._id,
        name: otherParty.name,
        email: otherParty.email,
        profilePicture: otherParty.profilePicture?.url || null
      }
    };
  });
  
  res.json(formattedFeedback);
});

// @desc    Get feedback statistics for a user
// @route   GET /api/mentorship/feedback/stats
// @access  Private
const getFeedbackStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.user.constructor.modelName;
  
  // Determine if user is student or alumni
  const isStudent = userType === 'Student';
  
  // Find mentorships where user is involved
  const mentorshipsQuery = isStudent 
    ? { student: userId } 
    : { alumni: userId };
  
  const mentorships = await Mentorship.find(mentorshipsQuery);
  
  if (!mentorships.length) {
    return res.json({
      totalFeedbacks: 0,
      averageRating: 0,
      ratingDistribution: {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
      }
    });
  }
  
  // Find feedback where user received feedback (opposite of fromStudent value)
  const feedback = await MentorshipFeedback.find({
    mentorship: { $in: mentorships.map(m => m._id) },
    fromStudent: !isStudent
  });
  
  // Calculate statistics
  const totalFeedbacks = feedback.length;
  
  if (totalFeedbacks === 0) {
    return res.json({
      totalFeedbacks: 0,
      averageRating: 0,
      ratingDistribution: {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
      }
    });
  }
  
  const totalRating = feedback.reduce((sum, item) => sum + item.rating, 0);
  const averageRating = totalRating / totalFeedbacks;
  
  // Count ratings for distribution
  const ratingDistribution = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
  };
  
  feedback.forEach(item => {
    ratingDistribution[item.rating]++;
  });
  
  res.json({
    totalFeedbacks,
    averageRating,
    ratingDistribution
  });
});

// @desc    Get ratings for specific alumni
// @route   GET /api/mentorship/feedback/alumni/:alumniId
// @access  Public
const getAlumniRating = asyncHandler(async (req, res) => {
  const { alumniId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(alumniId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid alumni ID format'
    });
  }

  // Find all mentorships where this person is the alumni
  const mentorships = await Mentorship.find({ alumni: alumniId });
  
  if (!mentorships.length) {
    return res.json({
      totalFeedbacks: 0,
      averageRating: 0,
      ratingDistribution: {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
      }
    });
  }
  
  // Find feedback where alumni received feedback from students
  const feedback = await MentorshipFeedback.find({
    mentorship: { $in: mentorships.map(m => m._id) },
    fromStudent: true
  });
  
  // Calculate statistics
  const totalFeedbacks = feedback.length;
  
  if (totalFeedbacks === 0) {
    return res.json({
      totalFeedbacks: 0,
      averageRating: 0,
      ratingDistribution: {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
      }
    });
  }
  
  const totalRating = feedback.reduce((sum, item) => sum + item.rating, 0);
  const averageRating = totalRating / totalFeedbacks;
  
  // Count ratings for distribution
  const ratingDistribution = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
  };
  
  feedback.forEach(item => {
    ratingDistribution[item.rating]++;
  });
  
  res.json({
    totalFeedbacks,
    averageRating,
    ratingDistribution
  });
});

export {
  submitFeedback,
  getFeedback,
  getReceivedFeedback,
  getFeedbackStats,
  getAlumniRating
};