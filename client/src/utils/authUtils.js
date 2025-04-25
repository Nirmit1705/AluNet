/**
 * Utility functions for authentication and token handling
 */

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

/**
 * Check if the user is currently authenticated based on localStorage
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token && token !== 'undefined' && token !== 'null';
};

/**
 * Get the current user's role from localStorage
 * @returns {string|null}
 */
export const getUserRole = () => {
  return localStorage.getItem('userRole');
};

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
 * Get the appropriate dashboard URL for the current user role
 * 
 * @returns {string} The dashboard URL
 */
export const getDashboardUrl = () => {
  const role = getUserRole();
  
  switch (role) {
    case 'admin':
      return '/admin-dashboard';
    case 'alumni':
      return '/alumni-dashboard';
    case 'student':
    default:
      return '/student-dashboard';
  }
};
