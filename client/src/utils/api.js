// Add a function to safely access environment variables
export const getEnvVariable = (key, fallback = '') => {
  if (import.meta.env) {
    return import.meta.env[`VITE_${key}`] || fallback;
  }
  return fallback;
};

// Update fetchWithAuth or any other function that uses process.env
export const getApiBaseUrl = () => {
  return getEnvVariable('API_URL', 'http://localhost:5000');
};
