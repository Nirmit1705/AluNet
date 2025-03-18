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

      // Find user by id - check all possible user types
      let user = await Alumni.findById(decoded.id);
      
      if (!user) {
        user = await Student.findById(decoded.id);
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

// Middleware to check if user is alumni
const isAlumni = (req, res, next) => {
  // Check if the user is from the Alumni model
  if (req.user && req.user.constructor.modelName === 'Alumni') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as alumni');
  }
};

export { protect, isAlumni }; 