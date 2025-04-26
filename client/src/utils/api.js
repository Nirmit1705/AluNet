// Add or modify the fetchWithAuth function
export const fetchWithAuth = async (url, options = {}) => {
  // Get the token from localStorage
  const token = localStorage.getItem('token');
  
  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  // Add authorization header if token exists and is not malformed
  if (token && token.split('.').length === 3) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (token) {
    // If token exists but appears malformed, clear it
    console.error('JWT malformed, clearing invalid token');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    // Redirect to login if needed
    window.location.href = '/login';
    throw new Error('Invalid authentication. Please login again.');
  }
  
  // Prepare the fetch options
  const fetchOptions = {
    ...options,
    headers
  };
  
  // Make the request
  const response = await fetch(url, fetchOptions);
  
  // Check for authentication errors
  if (response.status === 401) {
    // Clear auth data and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    window.location.href = '/login';
    throw new Error('Authentication expired. Please login again.');
  }
  
  return response;
};

// ...rest of your api.js file
