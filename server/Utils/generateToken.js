import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const generateToken = (id) => {
    try {
        // Generate JWT token with the user ID
        const token = jwt.sign(
            { id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );
        
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

export {
  generateToken,
  generateEmailVerificationToken
};