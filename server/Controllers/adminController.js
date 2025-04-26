import asyncHandler from 'express-async-handler';
import Admin from '../Models/Admin.js';
import Student from '../Models/Student.js';
import Alumni from '../Models/Alumni.js';
import VerificationRequest from '../Models/VerificationRequest.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log(`Admin login attempt for email: ${email}`);
  
  if (email === 'verify@admin.com' && password === 'admin123') {
    console.log('Using direct login bypass for admin');
    
    // IMPORTANT: Create an actual admin document in the database instead of just making up an ID
    // First check if this admin already exists
    let admin = await Admin.findOne({ email: 'verify@admin.com' });
    
    if (!admin) {
      // Create the admin in the database if it doesn't exist yet
      console.log('Admin does not exist, creating a new admin document in database');
      admin = await Admin.create({
        name: 'System Admin',
        email: 'verify@admin.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin'
      });
      console.log(`Created new admin with ID: ${admin._id}`);
    } else {
      console.log(`Found existing admin with ID: ${admin._id}`);
    }
    
    // Generate token with the ACTUAL admin ID from the database
    const token = jwt.sign(
      { 
        id: admin._id.toString(),
        role: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log(`Generated admin token with real ID: ${token.substring(0, 15)}...`);
    
    return res.status(200).json({
      token,
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: 'admin'
    });
  }
  
  // Continue with regular login flow
  try {
    // Check if there's an admin in the database
    let admin = await Admin.findOne({ email }).select('+password');
    let isMatch = false;
    
    if (admin) {
      // Debug the stored password hash
      console.log("Admin found, password hash length:", admin.password?.length || 'undefined');
      
      // Compare passwords using a direct method for debugging
      try {
        isMatch = await admin.matchPassword(password);
        console.log("Password match result:", isMatch);
        
        // If normal comparison fails, try direct bcrypt compare
        if (!isMatch) {
          console.log("Attempting direct bcrypt compare as fallback");
          isMatch = await bcrypt.compare(password, admin.password);
          console.log("Direct bcrypt compare result:", isMatch);
        }
      } catch (matchError) {
        console.error("Error during password comparison:", matchError);
      }
    } else {
      // Fall back to env variables for initial admin (only if no admins exist in DB)
      const adminCount = await Admin.countDocuments();
      console.log(`No admin found with email: ${email}. Total admin accounts: ${adminCount}`);
      
      if (adminCount === 0 && 
          email === process.env.ADMIN_EMAIL && 
          await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH)) {
        
        // Create admin account if it doesn't exist but credentials match env vars
        console.log("Creating initial admin account from environment variables");
        admin = await Admin.create({
          name: 'System Admin',
          email: process.env.ADMIN_EMAIL,
          password: password, // Will be hashed by pre-save hook
          role: 'admin'
        });
        
        console.log('Created initial admin account from environment variables');
        isMatch = true;
      }
    }
    
    if (isMatch) {
      // Generate JWT token with admin role
      const token = jwt.sign(
        { 
          id: admin._id, 
          role: 'admin' 
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      
      console.log("Admin login successful, sending token");
      
      res.status(200).json({
        token,
        name: admin.name || 'System Admin',
        email: admin.email,
        role: 'admin'
      });
    } else {
      console.log("Admin login failed: Invalid credentials");
      res.status(401);
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    console.error("Admin login error:", error);
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
    
    console.log("Searching for verification requests with query:", query);
    
    // Check if VerificationRequest collection exists and has documents
    const countAll = await VerificationRequest.countDocuments({});
    console.log(`Total verification requests in database: ${countAll}`);
    
    // Double-check pending verifications specifically
    const countPending = await VerificationRequest.countDocuments({ status: 'pending' });
    console.log(`Pending verification requests: ${countPending}`);
    
    // If no verification requests found in VerificationRequest model,
    // check for unverified alumni directly
    let verifications = await VerificationRequest.find(query).sort({ createdAt: -1 });
    
    // Debug document URLs in verification requests
    if (verifications.length > 0) {
      verifications.forEach(v => {
        console.log(`Verification ${v._id} for ${v.name} has documentURL:`, v.documentURL);
      });
    }
    
    if (verifications.length === 0 && (!status || status === 'pending')) {
      console.log("No verification requests found, checking unverified alumni");
      
      // Find unverified alumni
      const unverifiedAlumni = await Alumni.find({ 
        $or: [
          { isVerified: false },
          { verificationStatus: 'pending' },
          { status: 'pending' }
        ]
      });
      
      console.log(`Found ${unverifiedAlumni.length} unverified alumni`);
      
      // Convert alumni to verification requests format
      if (unverifiedAlumni.length > 0) {
        verifications = unverifiedAlumni.map(alumni => ({
          _id: alumni._id,
          name: alumni.name,
          email: alumni.email,
          branch: alumni.branch,
          graduationYear: alumni.graduationYear,
          status: 'pending',
          userId: alumni._id,
          createdAt: alumni.createdAt,
          // Important: Set documentURL from all possible locations
          documentURL: alumni.verificationDocument?.url || 
                      alumni.documentURL || 
                      '',
          degree: alumni.degree || 'Not Specified',
          // Add other fields as needed
        }));
        
        // Debug document URLs in converted alumni records
        verifications.forEach(v => {
          console.log(`Converted alumni ${v._id} (${v.name}) has documentURL:`, v.documentURL);
        });
      }
    }
    
    console.log(`Returning ${verifications.length} verification requests`);
    res.status(200).json(verifications);
  } catch (error) {
    console.error("Error fetching verification requests:", error);
    res.status(500);
    throw new Error('Error fetching verification requests: ' + error.message);
  }
});

// @desc    Get verification request by ID
// @route   GET /api/admin/verifications/:id
// @access  Private/Admin
const getVerificationById = asyncHandler(async (req, res) => {
  try {
    let verification = await VerificationRequest.findById(req.params.id);
    
    // If verification not found in VerificationRequest collection, try Alumni
    if (!verification) {
      const alumni = await Alumni.findById(req.params.id);
      
      if (!alumni) {
        res.status(404);
        throw new Error('Verification request not found');
      }
      
      // Convert alumni to verification request format
      verification = {
        _id: alumni._id,
        name: alumni.name,
        email: alumni.email,
        branch: alumni.branch,
        graduationYear: alumni.graduationYear,
        status: alumni.verificationStatus || 'pending',
        userId: alumni._id,
        createdAt: alumni.createdAt,
        documentURL: alumni.verificationDocument?.url || alumni.documentURL || '',
        degree: alumni.degree || 'Not Specified',
        currentCompany: alumni.company,
        currentRole: alumni.position
      };
    }
    
    console.log("Returning verification details:", {
      id: verification._id,
      name: verification.name,
      documentURL: verification.documentURL
    });
    
    res.status(200).json(verification);
  } catch (error) {
    console.error("Error fetching verification request:", error);
    res.status(500);
    throw new Error('Error fetching verification request: ' + error.message);
  }
});

// Handle verification status update
const updateVerificationRequest = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const adminId = req.user.id; // Get admin ID from authenticated user
    
    console.log(`Updating verification request ${id} to ${status} by admin ${adminId}`);
    
    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status value');
    }
    
    // Find the verification request
    const verificationRequest = await VerificationRequest.findById(id);
    if (!verificationRequest) {
      res.status(404);
      throw new Error('Verification request not found');
    }
    
    // Update verification request status
    verificationRequest.status = status;
    
    // Add rejection reason if provided and status is rejected
    if (status === 'rejected' && rejectionReason) {
      verificationRequest.rejectionReason = rejectionReason;
    }
    
    // Save the verification request
    await verificationRequest.save();
    
    // If there's an associated alumni, update their status too
    if (verificationRequest.userId) {
      const alumni = await Alumni.findById(verificationRequest.userId);
      
      if (alumni) {
        // Update verification status
        alumni.verificationStatus = status;
        
        // Update verification timestamps and admin info
        if (status === 'approved') {
          alumni.isVerified = true;
          alumni.status = 'active';
          alumni.verificationApprovedAt = new Date();
          alumni.verificationApprovedBy = adminId;
          // Clear rejection info if previously rejected
          alumni.verificationRejectionReason = '';
          alumni.verificationRejectedAt = null;
          alumni.verificationRejectedBy = null;
        } else if (status === 'rejected') {
          alumni.isVerified = false;
          alumni.status = 'rejected';
          alumni.verificationRejectedAt = new Date();
          alumni.verificationRejectedBy = adminId;
          alumni.verificationRejectionReason = rejectionReason || 'Verification rejected by administrator';
          // Clear approval info if previously approved
          alumni.verificationApprovedAt = null;
          alumni.verificationApprovedBy = null;
        } else {
          // If reverted to pending
          alumni.isVerified = false;
          alumni.status = 'pending';
        }
        
        // Always record when a verification action was taken
        alumni.verificationSubmittedAt = alumni.verificationSubmittedAt || verificationRequest.createdAt || new Date();
        
        console.log(`Updating alumni verification status to ${status}`, {
          alumniId: alumni._id,
          isVerified: alumni.isVerified,
          verificationStatus: alumni.verificationStatus,
          status: alumni.status,
          timestamps: {
            submitted: alumni.verificationSubmittedAt,
            approved: alumni.verificationApprovedAt,
            rejected: alumni.verificationRejectedAt
          }
        });
        
        await alumni.save();
      }
    }
    
    res.status(200).json({
      message: `Verification request ${status} successfully`,
      verificationRequest
    });
  } catch (error) {
    console.error(`Error updating verification request:`, error);
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'Error updating verification request');
  }
});

export {
  adminLogin,
  getDashboardStats,
  getVerifications,
  getVerificationById,
  updateVerificationRequest,
  getUsers,
  updateUserStatus,
  getSystemLogs
};
