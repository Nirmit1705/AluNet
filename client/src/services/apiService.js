import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Alumni API calls
export const fetchAlumni = async () => {
  try {
    const response = await api.get('/api/alumni');
    return response.data;
  } catch (error) {
    console.error("Error fetching alumni:", error);
    throw error;
  }
};

// Job API calls
export const fetchJobs = async () => {
  try {
    const response = await api.get('/api/jobs');
    return response.data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};

// Notification API calls
export const fetchNotifications = async () => {
  try {
    const response = await api.get('/api/students/notifications');
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

// Mentor request API calls
export const sendMentorRequest = async (mentorId) => {
  try {
    const response = await api.post('/api/students/mentor-request', { mentorId });
    return response.data;
  } catch (error) {
    console.error("Error sending mentor request:", error);
    throw error;
  }
};

// Student profile API calls
export const fetchStudentProfile = async () => {
  try {
    const response = await api.get('/api/students/profile');
    return response.data;
  } catch (error) {
    console.error("Error fetching student profile:", error);
    throw error;
  }
};

export default api;
