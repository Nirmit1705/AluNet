import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import Student from '../Models/Student.js';
import Alumni from '../Models/Alumni.js';
import Admin from '../Models/Admin.js';

// Protect routes - middleware to verify JWT token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if auth header exists and starts with Bearer
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token payload
      if (decoded.userType === 'student') {
        req.user = await Student.findById(decoded.id).select('-password');
      } else if (decoded.userType === 'alumni') {
        req.user = await Alumni.findById(decoded.id).select('-password');
      } else if (decoded.userType === 'admin') {
        req.user = await Admin.findById(decoded.id).select('-password');
      } else {
        // Handle case where no userType is specified in token
        // Try to find user in all models
        let user = await Student.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
          req.user.role = 'student';
        } else {
          user = await Alumni.findById(decoded.id).select('-password');
          if (user) {
            req.user = user;
            req.user.role = 'alumni';
          } else {
            user = await Admin.findById(decoded.id).select('-password');
            if (user) {
              req.user = user;
              req.user.role = 'admin';
            }
          }
        }
      }

      // Continue to next middleware/route handler
      next();
    } catch (error) {
      console.error('Auth error:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Admin-only routes
const adminProtect = asyncHandler(async (req, res, next) => {
  try {
    // First make sure token is verified
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
      res.status(401);
      throw new Error('Not authorized, no token');
    }
    
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try to find admin user
    let admin;
    
    // Check if the token identifies as admin role
    if (decoded.role === 'admin') {
      admin = await Admin.findById(decoded.id).select('-password');
    } else {
      // If not explicitly an admin token, try looking up as admin
      admin = await Admin.findById(decoded.id).select('-password');
    }
    
    if (!admin) {
      res.status(403);
      throw new Error('Not authorized as an admin');
    }
    
    // Set admin user in request
    req.user = admin;
    req.user.role = 'admin';
    
    next();
  } catch (error) {
    console.error('Admin auth error:', error.message);
    res.status(error.statusCode || 403);
    throw new Error(error.message || 'Not authorized as an admin');
  }
});

// Add alias for adminProtect
const adminOnly = adminProtect;

// Alumni only routes
const verifiedAlumniOnly = asyncHandler(async (req, res, next) => {
  if (!req.user.graduationYear || req.user.registrationNumber) {
    res.status(403);
    throw new Error('This route is only accessible to alumni');
  }
  
  // Check if alumni is verified
  if (!req.user.isVerified) {
    res.status(403);
    throw new Error('Your account must be verified to access this feature');
  }
  
  next();
});

// Optional protection middleware - will authenticate if token present but won't reject if not
const optionalProtect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      if (token) {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from the token
        // Try to find in different user models
        let user = await Student.findById(decoded.id).select('-password');
        let userRole = 'student';

        if (!user) {
          user = await Alumni.findById(decoded.id).select('-password');
          userRole = 'alumni';
        }

        if (!user) {
          user = await Admin.findById(decoded.id).select('-password');
          userRole = 'admin';
        }

        if (user) {
          // Set user and role in request
          req.user = user;
          req.userRole = userRole;
        }
      }

      // Always proceed, even if token is invalid or no token
      next();
    } catch (error) {
      // If token is invalid, proceed without setting req.user
      next();
    }
  } else {
    // No token, proceed without setting req.user
    next();
  }
});

export { protect, adminProtect, adminOnly, verifiedAlumniOnly, optionalProtect };