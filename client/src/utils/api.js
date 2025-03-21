/**
 * API utility functions for making authenticated requests
 */

/**
 * Get the authentication token from localStorage
 * @returns {string|null} The authentication token or null if not found
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Get the user type (student or alumni) from localStorage
 * @returns {string|null} The user type or null if not found
 */
export const getUserType = () => {
  return localStorage.getItem('userType');
};

/**
 * Check if the user is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Make an authenticated API request
 * @param {string} url - The API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise} The fetch promise
 */
export const apiRequest = async (url, options = {}) => {
  const token = getToken();
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  
  // Add auth header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  // Make the request
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  // Handle unauthenticated responses
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    window.location.href = '/login';
    throw new Error('Authentication failed. Please log in again.');
  }
  
  return response;
};

/**
 * Logout the user by clearing localStorage and redirecting to login
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userType');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  window.location.href = '/login';
};

/**
 * Get user profile data based on user type
 * @returns {Promise} The user profile data
 */
export const getUserProfile = async () => {
  const userType = getUserType();
  const endpoint = userType === 'alumni' ? '/api/alumni/profile' : '/api/students/profile';
  
  const response = await apiRequest(endpoint);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get user profile');
  }
  
  return response.json();
}; 