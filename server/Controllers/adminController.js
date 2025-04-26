import asyncHandler from 'express-async-handler';
import Admin from '../Models/Admin.js';
import Student from '../Models/Student.js';
import Alumni from '../Models/Alumni.js';
import VerificationRequest from '../Models/VerificationRequest.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    // Special handling for admin login
    if (email === 'verify@admin.com') {
      // Try to find admin in database
      const admin = await Admin.findOne({ email }).select('+password');
      
      let isMatch = false;
      
      if (admin) {
        // Compare passwords
        isMatch = await admin.matchPassword(password);
      }
      
      // For development, allow hardcoded admin login
      const hardcodedMatch = password === 'admin123';
      
      if (!isMatch && !hardcodedMatch) {
        res.status(401);
        throw new Error('Invalid credentials');
      }
      
      // Generate JWT token with admin role
      const token = jwt.sign(
        { 
          id: admin?._id || 'admin-fallback-id', 
          role: 'admin' 
        },
        process.env.JWT_SECRET || 'fallback-secret-key',
        { expiresIn: '1d' }
      );
      
      res.status(200).json({
        token,
        name: admin?.name || 'System Admin',
        email: admin?.email || email,
        role: 'admin'
      });
    } else {
      res.status(401);
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    res.status(401);
    throw new Error(error.message || 'Invalid credentials');
  }
});

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // Count all students
    const totalStudents = await Student.countDocuments();
    
    // Debug log to check what's happening with Alumni queries
    console.log("Checking Alumni collection status...");
    const allAlumni = await Alumni.find({});
    console.log(`Found ${allAlumni.length} total alumni records:`, 
      allAlumni.map(a => ({
        id: a._id, 
        name: a.name, 
        isVerified: a.isVerified,
        status: a.status,
        verificationStatus: a.verificationStatus
      }))
    );
    
    // Count verified alumni - check both isVerified and status fields
    // Some alumni documents might use different field naming conventions
    const totalAlumni = await Alumni.countDocuments({
      $or: [
        { isVerified: true },
        { status: 'active' },
        { verificationStatus: 'approved' }
      ]
    });
    
    // Count pending verification requests
    const pendingVerifications = await VerificationRequest.countDocuments({ status: 'pending' });
    
    // Count all users (including unverified alumni and admins)
    const totalAlumniAll = await Alumni.countDocuments();
    const totalAdmins = await Admin.countDocuments();
    const totalUsers = totalStudents + totalAlumniAll + totalAdmins;
    
    // Detailed debug logging
    console.log("Admin Dashboard Stats (Detailed):", {
      totalStudents,
      totalAlumni,
      pendingVerifications,
      totalUsers,
      totalAlumniAll,
      totalAdmins,
      alumniVerificationFields: allAlumni.length > 0 ? 
        `First alumni has isVerified=${allAlumni[0].isVerified}, status=${allAlumni[0].status}, verificationStatus=${allAlumni[0].verificationStatus}` : 
        'No alumni records found'
    });
    
    res.status(200).json({
      totalStudents,
      totalAlumni,
      pendingVerifications,
      totalUsers
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500);
    throw new Error('Error fetching dashboard stats: ' + error.message);
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  try {
    const { role, status, search } = req.query;
    let users = [];
    
    // Build query conditionals
    const buildStatusQuery = (statusParam) => {
      if (!statusParam || statusParam === 'all') return {};
      return { status: statusParam };
    };

    console.log("Query params:", { role, status, search });
    
    // Fetch users based on role and status
    if (role === 'student') {
      users = await Student.find(buildStatusQuery(status)).select('-password');
    } else if (role === 'alumni') {
      users = await Alumni.find(buildStatusQuery(status)).select('-password');
    } else if (role === 'admin') {
      users = await Admin.find(buildStatusQuery(status)).select('-password');
    } else {
      // Fetch all types of users
      const students = await Student.find(buildStatusQuery(status)).select('-password');
      const alumni = await Alumni.find(buildStatusQuery(status)).select('-password');
      const admins = await Admin.find(buildStatusQuery(status)).select('-password');
      
      // Add role property to each user
      students.forEach(student => {
        // Ensure student has a status
        if (!student._doc.status) {
          student._doc.status = 'active'; // Default status for students
        }
        student._doc.role = 'student';
      });
      
      alumni.forEach(alum => {
        // Ensure alumni has a status and handle verification status
        if (!alum._doc.status) {
          // Check for various possible verification fields
          const isVerified = alum._doc.isVerified || 
                            alum._doc.verificationStatus === 'approved' || 
                            false;
          
          alum._doc.status = isVerified ? 'active' : 'pending';
        }
        
        // Always include an explicit verification field for the frontend
        alum._doc.isVerified = alum._doc.isVerified || 
                              alum._doc.verificationStatus === 'approved' || 
                              alum._doc.status === 'active' || 
                              false;
                              
        alum._doc.role = 'alumni';
      });
      
      admins.forEach(admin => {
        // Ensure admin has a status
        if (!admin._doc.status) {
          admin._doc.status = 'active'; // Default status for admins
        }
        admin._doc.role = 'admin';
      });
      
      users = [...students, ...alumni, ...admins];
    }
    
    // Apply search filter if provided
    if (search) {
      users = users.filter(user => 
        user.name?.toLowerCase().includes(search.toLowerCase()) || 
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        (user.role && user.role.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    // Ensure every user has a valid status and verification field if they're alumni
    users = users.map(user => {
      if (!user.status || !['active', 'inactive', 'pending'].includes(user.status)) {
        // Set appropriate default status based on role
        if (user.role === 'alumni') {
          const isVerified = user.isVerified || 
                           user.verificationStatus === 'approved' || 
                           false;
          user.status = isVerified ? 'active' : 'pending';
          
          // Ensure verification field is present
          user.isVerified = isVerified;
        } else {
          user.status = 'active';  // default for student and admin
        }
      }
      
      // Extra check to ensure alumni have an isVerified field
      if (user.role === 'alumni' && user.isVerified === undefined) {
        user.isVerified = user.status === 'active';
      }
      
      return user;
    });
    
    // Log information for debugging
    console.log(`Returning ${users.length} users matching filters`);
    
    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsers:", error);
    res.status(500);
    throw new Error('Error fetching users: ' + error.message);
  }
});

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    
    console.log(`AdminController: Attempting to update user ${id} status to ${status}`);
    
    if (!['active', 'inactive', 'pending'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status value');
    }
    
    // Try to find and update the user in each collection
    let user;
    let userModel;
    
    // Try finding in Student collection first
    user = await Student.findById(id);
    if (user) {
      userModel = 'student';
      console.log(`Found user in Student collection: ${user.name}`);
    } else {
      // Try Alumni collection
      user = await Alumni.findById(id);
      if (user) {
        userModel = 'alumni';
        console.log(`Found user in Alumni collection: ${user.name}`);
      } else {
        // Try Admin collection
        user = await Admin.findById(id);
        if (user) {
          userModel = 'admin';
          console.log(`Found user in Admin collection: ${user.name}`);
        }
      }
    }
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    
    // Don't allow deactivating the last admin
    if (userModel === 'admin' && status === 'inactive') {
      const adminCount = await Admin.countDocuments();
      if (adminCount <= 1) {
        res.status(400);
        throw new Error('Cannot deactivate the last admin account');
      }
    }
    
    // Update user status - store old status for logging
    const oldStatus = user.status;
    user.status = status;
    
    // Special handling for alumni: sync verification status with active status
    if (userModel === 'alumni') {
      const oldVerified = user.isVerified;
      if (status === 'active') {
        user.isVerified = true;
        
        // Also update verificationStatus if it exists on the model
        if ('verificationStatus' in user) {
          user.verificationStatus = 'approved';
        }
      } else if (status === 'inactive' || status === 'pending') {
        user.isVerified = false;
        
        // Also update verificationStatus if it exists
        if ('verificationStatus' in user) {
          user.verificationStatus = status === 'pending' ? 'pending' : 'rejected';
        }
      }
      console.log(`Updated alumni verification: ${oldVerified} -> ${user.isVerified}`);
    }
    
    // Save changes to database
    const savedUser = await user.save();
    console.log(`Successfully updated ${userModel} ${user._id} status from ${oldStatus} to ${savedUser.status}`);
    
    res.status(200).json({
      message: `User status updated to ${status}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        role: userModel,
        isVerified: userModel === 'alumni' ? user.isVerified : undefined
      }
    });
  } catch (error) {
    console.error(`Error updating user status: ${error.message}`);
    res.status(500);
    throw new Error(`Error updating user status: ${error.message}`);
  }
});

// @desc    Get system logs
// @route   GET /api/admin/logs
// @access  Private/Admin
const getSystemLogs = asyncHandler(async (req, res) => {
  try {
    // Placeholder for log data
    // In a real app, you would have a Log model and query it
    const logs = [
      {
        _id: '1',
        type: 'info',
        message: 'System startup',
        timestamp: new Date(),
        source: 'System'
      },
      {
        _id: '2',
        type: 'info',
        message: 'User login',
        timestamp: new Date(),
        source: 'Authentication',
        userId: '123',
        ipAddress: '192.168.1.1'
      },
      {
        _id: '3',
        type: 'warning',
        message: 'Failed login attempt',
        timestamp: new Date(),
        source: 'Authentication',
        details: 'Invalid credentials',
        ipAddress: '192.168.1.2'
      },
      {
        _id: '4',
        type: 'error',
        message: 'Database connection failed',
        timestamp: new Date(),
        source: 'Database',
        details: 'Connection timeout'
      }
    ];
    
    res.status(200).json(logs);
  } catch (error) {
    res.status(500);
    throw new Error('Error fetching system logs');
  }
});

// @desc    Get all verification requests
// @route   GET /api/admin/verifications
// @access  Private/Admin
const getVerifications = asyncHandler(async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};
    
    // Apply status filter
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Apply search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const verifications = await VerificationRequest.find(query).sort({ createdAt: -1 });
    
    res.status(200).json(verifications);
  } catch (error) {
    res.status(500);
    throw new Error('Error fetching verification requests: ' + error.message);
  }
});

// @desc    Get verification request by ID
// @route   GET /api/admin/verifications/:id
// @access  Private/Admin
const getVerificationById = asyncHandler(async (req, res) => {
  try {
    const verification = await VerificationRequest.findById(req.params.id);
    
    if (!verification) {
      res.status(404);
      throw new Error('Verification request not found');
    }
    
    res.status(200).json(verification);
  } catch (error) {
    res.status(500);
    throw new Error('Error fetching verification request: ' + error.message);
  }
});

// @desc    Update verification status
// @route   PUT /api/admin/verifications/:id
// @access  Private/Admin
const updateVerificationStatus = asyncHandler(async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status value');
    }
    
    const verification = await VerificationRequest.findById(req.params.id);
    
    if (!verification) {
      res.status(404);
      throw new Error('Verification request not found');
    }
    
    // Update verification request
    verification.status = status;
    if (status === 'rejected' && rejectionReason) {
      verification.rejectionReason = rejectionReason;
    }
    
    await verification.save();
    
    // Update alumni status in the Alumni model
    const alumni = await Alumni.findById(verification.userId);
    if (alumni) {
      console.log(`Updating alumni ${alumni._id} (${alumni.name}) verification status to ${status}`);
      
      // Important: Update ALL relevant fields to ensure consistency
      alumni.isVerified = status === 'approved';
      alumni.verificationStatus = status;
      alumni.status = status === 'approved' ? 'active' : 'pending';
      
      // Add additional audit fields if they exist on the model
      if (status === 'approved') {
        if ('verificationApprovedAt' in alumni) alumni.verificationApprovedAt = Date.now();
        if ('verificationApprovedBy' in alumni) alumni.verificationApprovedBy = req.user._id;
      } else if (status === 'rejected') {
        if ('verificationRejectedAt' in alumni) alumni.verificationRejectedAt = Date.now();
        if ('verificationRejectedBy' in alumni) alumni.verificationRejectedBy = req.user._id;
        if ('verificationRejectionReason' in alumni) alumni.verificationRejectionReason = rejectionReason || '';
      }
      
      // Save the updated alumni document
      const updatedAlumni = await alumni.save();
      
      // Log the result for debugging
      console.log(`Alumni verification update result:`, {
        id: updatedAlumni._id,
        name: updatedAlumni.name,
        isVerified: updatedAlumni.isVerified,
        status: updatedAlumni.status,
        verificationStatus: updatedAlumni.verificationStatus
      });
    } else {
      console.warn(`Could not find alumni with ID ${verification.userId}`);
    }
    
    res.status(200).json({
      message: `Verification request ${status}`,
      verification
    });
  } catch (error) {
    console.error(`Error updating verification status:`, error);
    res.status(500);
    throw new Error(`Error updating verification status: ${error.message}`);
  }
});

// Ensure all exports are defined and properly exported
export {
  adminLogin,
  getDashboardStats,
  getVerifications,
  getVerificationById, 
  updateVerificationStatus,
  getUsers,
  updateUserStatus,
  getSystemLogs
};
