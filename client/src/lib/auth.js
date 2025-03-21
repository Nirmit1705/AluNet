// Helper functions for authentication

/**
 * Check if the user is authenticated
 * @returns {boolean} Whether the user is authenticated
 */
export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

/**
 * Get the user type (student or alumni)
 * @returns {string|null} The user type or null if not authenticated
 */
export const getUserType = () => {
  return localStorage.getItem('userType');
};

/**
 * Check if the user is authorized for a specific role
 * @param {string} requiredRole - The required role (student or alumni)
 * @returns {boolean} Whether the user is authorized
 */
export const isAuthorized = (requiredRole) => {
  const userType = getUserType();
  return isAuthenticated() && userType === requiredRole;
};

/**
 * Log out the user by removing auth data from localStorage
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userType');
}; 