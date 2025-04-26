/**
 * Utility functions for authentication and token handling
 */

/**
 * Store authentication data in localStorage
 * 
 * @param {Object} authData - The authentication data to store
 * @param {string} authData.token - The authentication token
 * @param {string} authData.userRole - The user's role (student/alumni/admin)
 * @param {string} authData.userEmail - The user's email
 * @param {string} authData.userName - The user's name
 * @param {boolean} [authData.isVerified] - Whether the alumni user is verified
 */
export const storeAuthData = ({ token, userRole, userEmail, userName, isVerified }) => {
  localStorage.setItem('token', token);
  localStorage.setItem('userRole', userRole);
  localStorage.setItem('userEmail', userEmail || '');
  localStorage.setItem('userName', userName || '');
  
  // Handle alumni verification status
  if (userRole === 'alumni' && isVerified === false) {
    localStorage.setItem('pendingVerification', 'true');
  } else {
    localStorage.removeItem('pendingVerification');
  }
};

/**
 * Get the current user's role from localStorage
 * 
 * @returns {string|null} The user's role or null if not set
 */
export const getUserRole = () => {
  return localStorage.getItem('userRole');
};

/**
 * Check if the current user is authenticated
 * 
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Check if the current user is an admin
 * 
 * @returns {boolean} True if user is an admin
 */
export const isAdmin = () => {
  return getUserRole() === 'admin';
};

/**
 * Get the current authentication token
 * 
 * @returns {string|null} The auth token or null if not set
 */
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  localStorage.removeItem('pendingVerification');
};
