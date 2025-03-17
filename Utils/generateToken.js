import jwt from 'jsonwebtoken';

/**
 * Generate JWT token for authentication
 * @param {string} id - User ID to encode in the token
 * @returns {string} JWT token
 */
export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d", // Token expires in 30 days
    });
};