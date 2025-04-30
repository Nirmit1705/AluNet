import asyncHandler from '../utils/asyncHandler.js';
import Connection from '../Models/Connection.js';
import { createNotification } from './notificationController.js';
import Student from '../Models/Student.js';
import Alumni from '../Models/Alumni.js';

/**
 * @desc   Request a connection with an alumni
 * @route  POST /api/connections/request
 * @access Private (Student only)
 */
const requestConnection = asyncHandler(async (req, res) => {
  // Accept multiple possible parameter names for compatibility
  const alumniId = req.body.alumniId || req.body.userId || req.body.id;

  if (!alumniId) {
    res.status(400);
    throw new Error('Alumni ID is required');
  }

  // Check if user is a student
  if (!req.user || req.user.constructor.modelName !== 'Student') {
    res.status(403);
    throw new Error('Access denied. Only students can make connection requests.');
  }

  // Check if the alumni exists
  const alumni = await Alumni.findById(alumniId);
  if (!alumni) {
    res.status(404);
    throw new Error('Alumni not found');
  }

  // Check if a connection already exists or is pending
  const existingConnection = await Connection.findExistingConnection(req.user._id, alumniId);

  if (existingConnection) {
    if (existingConnection.status === 'accepted') {
      res.status(400);
      throw new Error('You are already connected with this alumni');
    } else if (existingConnection.status === 'pending') {
      res.status(400);
      throw new Error('A connection request is already pending');
    } else if (existingConnection.status === 'rejected') {
      // Update the rejected connection to pending again
      existingConnection.status = 'pending';
      existingConnection.message = req.body.message || existingConnection.message;
      await existingConnection.save();
      
      // Create notification for alumni
      await createNotification(
        alumniId,
        'Alumni',
        'connection',
        'New Connection Request',
        `${req.user.name} has requested to connect with you.`,
        existingConnection._id
      );
      
      res.status(200).json({ message: 'Connection request sent successfully' });
      return;
    }
  }

  // Create a new connection
  const connection = new Connection({
    student: req.user._id,
    alumni: alumniId,
    status: 'pending',
    message: req.body.message || 'I would like to connect with you for mentorship.'
  });

  await connection.save();

  // Create notification for alumni
  await createNotification(
    alumniId,
    'Alumni',
    'connection',
    'New Connection Request',
    `${req.user.name} has requested to connect with you.`,
    connection._id
  );

  res.status(201).json({ message: 'Connection request sent successfully' });
});

/**
 * @desc    Get pending connection requests for a student or alumni
 * @route   GET /api/connections/requests/pending
 * @access  Private
 */
const getPendingRequests = asyncHandler(async (req, res) => {
  const userModel = req.user.constructor.modelName;
  
  let pendingRequests;
  
  if (userModel === 'Student') {
    // Students can view their sent requests that are pending
    pendingRequests = await Connection.find({ 
      student: req.user._id, 
      status: 'pending' 
    }).sort({ createdAt: -1 });
    
    // Get alumni details for each request
    const detailedRequests = await Promise.all(pendingRequests.map(async (request) => {
      const alumniDetails = await Alumni.findById(request.alumni)
        .select('name email profilePicture company position');
      
      return {
        _id: request._id,
        recipient: {
          _id: alumniDetails?._id || request.alumni,
          details: alumniDetails || { name: 'Unknown Alumni' }
        },
        status: request.status,
        message: request.message,
        createdAt: request.createdAt,
        isOutgoing: true
      };
    }));
    
    res.json(detailedRequests);
  } else if (userModel === 'Alumni') {
    // Alumni can view requests sent to them that are pending
    pendingRequests = await Connection.find({ 
      alumni: req.user._id, 
      status: 'pending' 
    }).sort({ createdAt: -1 })
    .populate({
      path: 'student',
      select: 'name email profilePicture registrationNumber branch currentYear university college'
    });
    
    // Fix: Properly structure the response with student details
    const detailedRequests = pendingRequests.map((request) => {
      // Make sure student data is properly extracted
      const studentDetails = request.student || { name: 'Unknown Student' };
      
      return {
        _id: request._id,
        from: {
          details: studentDetails,
          model: 'Student'
        },
        status: request.status,
        message: request.message,
        createdAt: request.createdAt,
        isOutgoing: false
      };
    });
    
    res.json(detailedRequests);
  } else {
    res.status(403);
    throw new Error('Invalid user type');
  }
});

/**
 * @desc    Get all connections for a user
 * @route   GET /api/connections
 * @access  Private
 */
const getConnections = asyncHandler(async (req, res) => {
  const userModel = req.user.constructor.modelName;
  let connections;
  
  if (userModel === 'Student') {
    // Find all accepted connections for this student
    connections = await Connection.find({
      student: req.user._id,
      status: 'accepted'
    }).sort({ updatedAt: -1 });
    
    // Get details of connected alumni
    const detailedConnections = await Promise.all(connections.map(async (connection) => {
      const alumniDetails = await Alumni.findById(connection.alumni)
        .select('name email profilePicture company position');
      
      return {
        _id: connection._id,
        connectionUserId: connection.alumni,
        userType: 'Alumni',
        userDetails: alumniDetails || { name: 'Unknown Alumni' },
        connectedSince: connection.updatedAt
      };
    }));
    
    res.json(detailedConnections);
  } else if (userModel === 'Alumni') {
    // Find all accepted connections for this alumni
    connections = await Connection.find({
      alumni: req.user._id,
      status: 'accepted'
    }).sort({ updatedAt: -1 });
    
    // Get details of connected students
    const detailedConnections = await Promise.all(connections.map(async (connection) => {
      const studentDetails = await Student.findById(connection.student)
        .select('name email profilePicture university college currentYear');
      
      return {
        _id: connection._id,
        connectionUserId: connection.student,
        userType: 'Student',
        userDetails: studentDetails || { name: 'Unknown Student' },
        connectedSince: connection.updatedAt
      };
    }));
    
    res.json(detailedConnections);
  } else {
    res.status(403);
    throw new Error('Invalid user type');
  }
});

/**
 * @desc    Respond to a connection request (accept/reject)
 * @route   PUT /api/connections/requests/:id/respond
 * @access  Private (Alumni only)
 */
const respondToRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, responseMessage } = req.body;
  
  // Only alumni can respond to connection requests
  if (req.user.constructor.modelName !== 'Alumni') {
    res.status(403);
    throw new Error('Only alumni can respond to connection requests');
  }
  
  if (!['accepted', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status. Status must be "accepted" or "rejected"');
  }
  
  const connectionRequest = await Connection.findById(id);
  
  if (!connectionRequest) {
    res.status(404);
    throw new Error('Connection request not found');
  }
  
  // Verify that the current user is the alumni being requested
  if (connectionRequest.alumni.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to respond to this request');
  }
  
  // Update the request
  connectionRequest.status = status;
  connectionRequest.responseMessage = responseMessage || '';
  connectionRequest.responseDate = Date.now();
  
  const updatedRequest = await connectionRequest.save();
  
  // Send notification to the student only if the request is accepted
  if (status === 'accepted') {
    try {
      await createNotification(
        connectionRequest.student,
        'Student',
        'connection',
        `Connection Request Accepted`,
        `${req.user.name} has accepted your connection request`,
        connectionRequest._id
      );
    } catch (error) {
      console.error('Failed to create connection response notification:', error);
      // Continue with the response even if notification fails
    }
  }
  
  res.json({ 
    success: true,
    message: `Connection request ${status}`,
    request: updatedRequest
  });
});

/**
 * @desc    Get sent connection requests
 * @route   GET /api/connections/requests/sent
 * @access  Private (Students only)
 */
const getSentRequests = asyncHandler(async (req, res) => {
  // Only students can send connection requests
  if (req.user.constructor.modelName !== 'Student') {
    res.status(403);
    throw new Error('Only students can view sent connection requests');
  }
  
  const sentRequests = await Connection.find({
    student: req.user._id
  }).sort({ createdAt: -1 });
  
  // Add recipient details to each request
  const detailedRequests = await Promise.all(sentRequests.map(async (request) => {
    const recipient = await Alumni.findById(request.alumni)
      .select('name email profilePicture company position');
    
    return {
      _id: request._id,
      recipient: {
        _id: recipient?._id || request.alumni,
        details: recipient || { name: 'Unknown Alumni' }
      },
      status: request.status,
      message: request.message,
      responseMessage: request.responseMessage,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      responseDate: request.responseDate
    };
  }));
  
  res.json(detailedRequests);
});

/**
 * @desc   Get connected mentors for a student
 * @route  GET /api/connections/mentors
 * @access Private (Student only)
 */
const getConnectedMentors = asyncHandler(async (req, res) => {
  // Check if user is a student
  if (req.user.constructor.modelName !== 'Student') {
    res.status(403);
    throw new Error('Access denied. Only students can access this endpoint.');
  }

  // Find all connections where the student is connected and status is 'accepted'
  const connections = await Connection.find({
    student: req.user._id,
    status: 'accepted'
  }).populate({
    path: 'alumni',
    select: 'name email profilePicture position company graduationYear skills expertise availability education university degree location experience mentorshipAreas'
  });

  // Log the raw data from the database for debugging
  console.log(`Raw Alumni Data:`, connections.map(conn => ({
    alumniId: conn.alumni._id,
    mentorshipAreas: conn.alumni.mentorshipAreas,
    name: conn.alumni.name
  })));

  // Format the response with more detailed information
  const mentors = connections.map(connection => {
    const mentor = connection.alumni;
    
    // Ensure mentorshipAreas is properly handled - handle different data types
    let mentorshipAreas = [];
    
    if (mentor.mentorshipAreas) {
      if (Array.isArray(mentor.mentorshipAreas)) {
        mentorshipAreas = [...mentor.mentorshipAreas];
      } else if (typeof mentor.mentorshipAreas === 'string' && mentor.mentorshipAreas.trim()) {
        mentorshipAreas = mentor.mentorshipAreas.split(',').map(area => area.trim());
      }
    }
    
    // Log the extracted mentorship areas
    console.log(`Extracted mentorshipAreas for ${mentor.name}:`, mentorshipAreas);
    
    return {
      id: mentor._id,
      name: mentor.name,
      role: `${mentor.position || 'Professional'} at ${mentor.company || 'Company'}`,
      email: mentor.email,
      specialties: mentor.expertise || mentor.skills || [],
      mentorshipAreas: mentorshipAreas, // Use the properly processed mentorshipAreas
      availability: mentor.availability || "Available by appointment",
      profilePicture: mentor.profilePicture?.url || null,
      education: mentor.education || (mentor.university ? `${mentor.degree || 'Graduate'} from ${mentor.university}` : 'Education not specified'),
      university: mentor.university || 'University not specified',
      degree: mentor.degree || 'Degree not specified',
      location: mentor.location || 'Remote',
      experience: mentor.experience || 'Experience not specified',
      connectionDate: connection.updatedAt,
      connectionId: connection._id
    };
  });

  res.json(mentors);
});

/**
 * @desc   Get connected students for an alumni
 * @route  GET /api/connections/students
 * @access Private (Alumni only)
 */
const getConnectedStudents = asyncHandler(async (req, res) => {
  // Check if user is an alumni
  if (req.user.constructor.modelName !== 'Alumni') {
    res.status(403);
    throw new Error('Access denied. Only alumni can access this endpoint.');
  }

  // Find all connections where the alumni is connected and status is 'accepted'
  const connections = await Connection.find({
    alumni: req.user._id,
    status: 'accepted'
  }).populate({
    path: 'student',
    select: 'name email profilePicture registrationNumber branch currentYear university college skills interests'
  });

  // Format the response with detailed student information
  const students = connections.map(connection => {
    const student = connection.student;
    
    return {
      id: student._id,
      name: student.name,
      email: student.email,
      profilePicture: student.profilePicture?.url || null,
      registrationNumber: student.registrationNumber,
      branch: student.branch || 'Not specified',
      currentYear: student.currentYear || 'Not specified',
      university: student.university || 'Not specified',
      college: student.college || 'Not specified',
      skills: student.skills || [],
      interests: student.interests || [],
      connectionDate: connection.updatedAt,
      connectionId: connection._id
    };
  });

  res.json(students);
});

export {
  requestConnection,
  getPendingRequests,
  getConnections,
  respondToRequest,
  getSentRequests,
  getConnectedMentors,
  getConnectedStudents
};
