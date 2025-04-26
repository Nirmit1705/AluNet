import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import Student from '../Models/Student.js';
import Alumni from '../Models/Alumni.js';
import Admin from '../Models/Admin.js';

/**
 * Protect routes - verify JWT token and set req.user
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
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

      if (!user) {
        res.status(401);
        throw new Error('Not authorized, invalid token');
      }

      // Set user and role in request
      req.user = user;
      req.userRole = userRole || user.role || 'user';
      
      next();
    } catch (error) {
      console.error('Auth error:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

/**
 * Admin protection middleware
 */
const adminProtect = asyncHandler(async (req, res, next) => {
  try {
    // Get token from authorization header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      console.log("Admin auth failed: No token provided");
      res.status(401);
      throw new Error('Not authorized, no token');
    }

    // Log token for debugging
    console.log(`Admin auth token received: ${token.substring(0, 15)}...`);
    
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(`Token decoded successfully, ID: ${decoded.id}`);
      
      // Get the admin user
      const admin = await Admin.findById(decoded.id).select('-password');
      
      if (!admin) {
        console.log(`Admin auth failed: No admin found with ID ${decoded.id}`);
        
        // Additional check - see if any admins exist
        const adminCount = await Admin.countDocuments();
        console.log(`Total admins in database: ${adminCount}`);
        
        if (adminCount > 0) {
          // List all admin IDs to debug
          const allAdmins = await Admin.find({}).select('_id email');
          console.log('Available admin accounts:', allAdmins.map(a => ({ id: a._id, email: a.email })));
        }
        
        res.status(403);
        throw new Error('Not authorized as an admin');
      }
      
      console.log(`Admin auth successful: ${admin.name} (${admin.email})`);
      
      // Set the admin user on the request object
      req.user = admin;
      req.user.role = 'admin';
      
      next();
    } catch (jwtError) {
      console.log(`JWT verification error: ${jwtError.message}`);
      res.status(401);
      throw new Error(`Token verification failed: ${jwtError.message}`);
    }
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      res.status(401);
      throw new Error('Invalid token');
    } else if (error.name === 'TokenExpiredError') {
      res.status(401);
      throw new Error('Token expired');
    } else {
      res.status(403);
      throw new Error('Not authorized as an admin');
    }
  }
});

/**
 * Admin authorization middleware (alias for adminProtect)
 */
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