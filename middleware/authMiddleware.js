import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import Alumni from '../Models/Alumni.js';
import Student from '../Models/Student.js';

// Protect routes - verify token and set req.user
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by id
      // First check if it's an alumni
      let user = await Alumni.findById(decoded.id).select('-password');
      
      // If not found in alumni, check students
      if (!user) {
        user = await Student.findById(decoded.id).select('-password');
      }

      if (!user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      // Set user in request object
      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

export { protect, admin }; 