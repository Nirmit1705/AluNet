import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Generate JWT token for authentication
 * @param {string} id - User ID to encode in the token
 * @returns {string} JWT token
 */
const generateToken = (id) => {
    // Check if id is valid
    if (!id) {
        console.error('Error: Attempted to generate token with invalid ID');
        throw new Error('Cannot generate token: Invalid user ID provided');
    }
    
    // Add logging to check if JWT_SECRET is properly defined
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('Error: JWT_SECRET is not defined in environment variables');
        throw new Error('Server configuration error: Missing JWT_SECRET');
    }
    
    try {
        // Convert ObjectId to string if needed
        const userId = id.toString();
        
        const token = jwt.sign({ id: userId }, jwtSecret, {
            expiresIn: "30d", // Token expires in 30 days
        });
        
        // Basic validation of generated token
        if (!token || token === 'undefined') {
            throw new Error('Generated token is invalid');
        }
        
        return token;
    } catch (error) {
        console.error('Error generating token:', error);
        throw new Error(`Failed to generate authentication token: ${error.message}`);
    }
};

/**
 * Generate email verification token
 * @param {Object} user - User object to add token to
 * @returns {Object} Token object with token and expiry
 */
const generateEmailVerificationToken = (user) => {
  // Generate a random token (not a JWT)
  const token = crypto.randomBytes(32).toString('hex');
  
  // Set token expiration (24 hours from now)
  const expires = new Date();
  expires.setHours(expires.getHours() + 24);
  
  // Save to user object (don't save to DB here)
  user.emailVerificationToken = token;
  user.emailVerificationExpires = expires;
  
  return {
    token,
    expires
  };
};

/**
 * Generate password reset token
 * @param {Object} user - User object to add token to
 * @returns {Object} Token object with token and expiry
 */
const generatePasswordResetToken = (user) => {
  // Generate a random token (not a JWT)
  const token = crypto.randomBytes(32).toString('hex');
  
  // Set token expiration (1 hour from now)
  const expires = new Date();
  expires.setHours(expires.getHours() + 1);
  
  // Save to user object (don't save to DB here)
  user.resetPasswordToken = token;
  user.resetPasswordExpires = expires;
  
  return {
    token,
    expires
  };
};

// Export once to avoid duplicate exports
export { 
  generateToken,
  generateEmailVerificationToken,
  generatePasswordResetToken
};