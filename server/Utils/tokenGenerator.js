import crypto from 'crypto';

/**
 * Generate a random token for email verification
 * @returns {string} Random token
 */
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate an email verification token with expiration
 * @param {Object} user - User document (student or alumni)
 * @returns {Object} Token and expiry date
 */
const generateEmailVerificationToken = (user) => {
  const token = generateToken();
  
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