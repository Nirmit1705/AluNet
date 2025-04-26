import axios from 'axios';
import { toast } from 'sonner';

/**
 * Direct admin login with hardcoded credentials
 */
export const directAdminLogin = async (email, password) => {
  try {
    console.log("Attempting direct admin login");
    
    const response = await axios.post('http://localhost:5000/api/admin/login', {
      email: email || 'verify@admin.com',
      password: password || 'admin123'
    });
    
    if (response.data && response.data.token) {
      // Log token details for debugging
      console.log(`Received admin token: ${response.data.token.substring(0, 15)}...`);
      console.log(`Admin token length: ${response.data.token.length}`);
      
      // Store authentication data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('userEmail', email || 'verify@admin.com');
      localStorage.setItem('userName', response.data.name || 'Admin');
      
      // Verify the token was saved correctly
      const savedToken = localStorage.getItem('token');
      console.log(`Saved token verification: ${savedToken.substring(0, 15)}...`);
      console.log(`Saved token length: ${savedToken.length}`);
      
      toast.success('Logged in as administrator!');
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Admin authentication error:', error);
    toast.error(`Admin login failed: ${error.response?.data?.message || 'Unknown error'}`);
    return false;
  }
};

/**
 * Create an authenticated API client for admin endpoints
 */
export const createAdminApiClient = () => {
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
  });
  
  // Add token to all requests
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('userRole');
      
      console.log(`Sending request with role: ${role}, token exists: ${!!token}`);
      
      // Make sure token exists before adding it to headers
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Handle admin auth errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle 401/403 errors for admin routes
      if (error.response?.status === 401 || error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || 'Authentication failed';
        console.error(`Admin auth error: ${errorMessage}`);
        
        // Prevent alert loop by checking if we've shown this alert recently
        const lastAlertTime = localStorage.getItem('lastAdminAuthAlert');
        const currentTime = Date.now();
        
        // Only show alert if it's been more than 10 seconds since the last one
        if (!lastAlertTime || (currentTime - parseInt(lastAlertTime)) > 10000) {
          localStorage.setItem('lastAdminAuthAlert', currentTime.toString());
          
          // Use a timeout to prevent multiple alerts
          setTimeout(() => {
            const confirmLogin = window.confirm('Admin authentication failed. Would you like to log in as admin?');
            if (confirmLogin) {
              directAdminLogin();
            }
          }, 100);
        }
      }
      return Promise.reject(error);
    }
  );
  
  return api;
};

/**
 * Verify if admin token is valid by checking localStorage and token format
 */
export const hasValidAdminToken = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');
  
  if (!token || !role || role !== 'admin') {
    return false;
  }
  
  // Basic check for JWT format (3 parts separated by dots)
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }
  
  return true;
};
