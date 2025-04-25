/**
 * This file is to help ensure correct paths are used throughout the codebase.
 * Use this to verify the correct casing and paths to middleware files.
 */

import { protect, adminProtect, adminOnly, optionalProtect } from './authMiddleware.js';
import { notFound, errorHandler } from './errorMiddleware.js';
import { authLimiter, accountLimiter } from './rateLimitMiddleware.js';

// These are the correct path references:
export {
  protect,
  adminProtect,
  adminOnly,
  optionalProtect,
  notFound,
  errorHandler,
  authLimiter,
  accountLimiter
};

// Log for verification
console.log('Middleware path check successful');
