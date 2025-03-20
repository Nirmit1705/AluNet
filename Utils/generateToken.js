import jwt from 'jsonwebtoken';

/**
 * Generate JWT token for authentication
 * @param {string} id - User ID to encode in the token
 * @returns {string} JWT token
 */
export const generateToken = (id) => {
    // Add logging to check if JWT_SECRET is properly defined
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    try {
        return jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: "30d", // Token expires in 30 days
        });
    } catch (error) {
        console.error('Error generating token:', error);
        throw new Error(`Failed to generate token: ${error.message}`);
    }
};