import rateLimit from 'express-rate-limit';

/**
 * Standard rate limiter for regular API endpoints
 * 100 requests per IP per 15 minutes
 */
const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  message: {
    message: 'Too many requests, please try again later.'
  }
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per IP per 15 minutes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true,
  message: {
    message: 'Too many login attempts, please try again later.'
  }
});

/**
 * Moderate rate limiter for account operations
 * 10 requests per IP per 60 minutes
 */
const accountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  standardHeaders: true,
  message: {
    message: 'Too many account operations, please try again later.'
  }
});

export { standardLimiter, authLimiter, accountLimiter };