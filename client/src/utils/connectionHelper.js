import axios from 'axios';

/**
 * Check if user is connected to a specific alumni
 * @param {string|Object} alumni - Alumni ID or object with ID
 * @param {Array} connections - Array of connections
 * @returns {boolean} - Whether user is connected to the alumni
 */
export const isConnectedToAlumni = (alumni, connections) => {
  if (!alumni || !connections || !Array.isArray(connections)) return false;
  
  // If alumni is an object, extract the ID
  const alumniId = typeof alumni === 'object' ? (alumni._id || alumni.id) : alumni;
  if (!alumniId) return false;
  
  // Convert to string for safer comparison
  const alumniIdStr = String(alumniId);
  
  // Check if the alumni ID exists in the connections array
  return connections.some(id => String(id) === alumniIdStr);
};

/**
 * Fetch all connections for the current user
 * @returns {Promise<Array>} Array of connection IDs
 */
export const fetchUserConnections = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      // If no token, check local storage fallback
      const savedConnections = localStorage.getItem('connectedAlumni');
      return savedConnections ? JSON.parse(savedConnections) : [];
    }
    
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const response = await axios.get(
      `${apiUrl}/api/connections`, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (response.data && Array.isArray(response.data)) {
      // Extract IDs from the connections array
      const connectionIds = response.data.map(conn => {
        if (conn._id) return conn._id;
        if (conn.id) return conn.id;
        if (conn.alumniId) return conn.alumniId;
        if (conn.alumni) return conn.alumni;
        return null;
      }).filter(Boolean); // Remove any null values
      
      // Store in localStorage for persistence
      localStorage.setItem('connectedAlumni', JSON.stringify(connectionIds));
      
      return connectionIds;
    }
    return [];
  } catch (error) {
    console.error('Error fetching connections:', error);
    
    // Fallback to localStorage
    const savedConnections = localStorage.getItem('connectedAlumni');
    return savedConnections ? JSON.parse(savedConnections) : [];
  }
};

/**
 * Specifically fetch pending connection requests
 * @returns {Promise<Array>} Array of alumni IDs with pending requests
 */
export const fetchPendingRequests = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      // If no token, check local storage fallback
      const savedPending = localStorage.getItem('pendingConnectionRequests');
      return savedPending ? JSON.parse(savedPending) : [];
    }
    
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const response = await axios.get(
      `${apiUrl}/api/connections/pending`, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (response.data && Array.isArray(response.data)) {
      // Extract alumni IDs from the pending requests
      const pendingIds = response.data.map(req => {
        if (req.alumni) return req.alumni;
        if (req.alumniId) return req.alumniId;
        if (req.to) return req.to;
        return req._id; // fallback
      });
      
      // Store in localStorage for persistence
      localStorage.setItem('pendingConnectionRequests', JSON.stringify(pendingIds));
      
      return pendingIds;
    }
    return [];
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    
    // Fallback to localStorage
    const savedPending = localStorage.getItem('pendingConnectionRequests');
    return savedPending ? JSON.parse(savedPending) : [];
  }
};

/**
 * Check if a connection request is pending with an alumni
 * @param {string} alumniId - ID of the alumni
 * @returns {Promise<boolean>} - Whether request is pending
 */
export const isPendingRequest = async (alumniId) => {
  try {
    const pendingRequests = await fetchPendingRequests();
    return pendingRequests.some(id => String(id) === String(alumniId));
  } catch (error) {
    console.error('Error checking pending request:', error);
    return false;
  }
};

/**
 * Synchronize connection statuses with the backend and return combined data
 * @returns {Promise<Object>} Object containing connections and pendingRequests
 */
export const syncConnectionStatuses = async () => {
  try {
    const connections = await fetchUserConnections();
    const pendingRequests = await fetchPendingRequests();
    
    return {
      connections,
      pendingRequests
    };
  } catch (error) {
    console.error('Error syncing connection statuses:', error);
    
    // Fallbacks from localStorage
    const savedConnections = localStorage.getItem('connectedAlumni');
    const savedPending = localStorage.getItem('pendingConnectionRequests');
    
    return {
      connections: savedConnections ? JSON.parse(savedConnections) : [],
      pendingRequests: savedPending ? JSON.parse(savedPending) : []
    };
  }
};
