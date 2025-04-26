import { toast } from "sonner";

/**
 * Handle admin login consistently across the application
 * 
 * @param {Object} navigate - React router navigate function
 * @param {string} email - Admin email address
 * @param {string} password - Admin password
 * @param {Function} onSuccess - Optional callback after successful login
 * @returns {Promise<boolean>} True if login successful
 */
export const handleAdminLogin = async (navigate, email, password, onSuccess) => {
  try {
    console.log("Admin login attempt for:", email);
    
    // Always try API first - no hardcoded checks
    try {
      // Log request for debugging
      console.log("Sending admin login request with:", { email, passwordLength: password?.length });
      
      const response = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password
        }),
      });
      
      // Log raw response for debugging
      const responseText = await response.text();
      console.log(`Admin login response (${response.status}):`, responseText);
      
      let data;
      try {
        // Try to parse the response as JSON
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse admin login response as JSON:", e);
        data = { message: responseText };
      }
      
      if (response.ok) {
        // Validate token
        if (!data.token) {
          console.error("No token received from server:", data);
          throw new Error("Authentication error: No token received");
        }
        
        // Store auth data
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", data.name || "Admin");
        
        toast.success("Logged in as administrator!");
        
        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Direct navigation
        window.location.href = "/admin-dashboard";
        return true;
      } else {
        // Handle failed authentication
        let errorMessage = "Invalid admin credentials";
        if (data && data.message) {
          errorMessage = data.message;
        }
        
        console.error("Admin authentication failed:", errorMessage);
        toast.error(errorMessage);
        return false;
      }
    } catch (apiError) {
      console.error("Admin API login error:", apiError);
      toast.error("Admin login service is unavailable. Please try again later.");
      return false;
    }
  } catch (error) {
    console.error("Admin login error:", error);
    toast.error("Failed to log in as admin. Please try again later.");
    return false;
  }
};

/**
 * Handle alumni login consistently across the application
 */
export const handleAlumniLogin = async (navigate, email, password, onSuccess) => {
  try {
    console.log("Alumni login attempt:", { email });
    
    // Try API first (in production environment)
    try {
      const response = await fetch("http://localhost:5000/api/alumni/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Validate token before storing
        if (!data.token || typeof data.token !== 'string') {
          console.error("Invalid token received from server:", data);
          throw new Error("Authentication error: Invalid token received");
        }
        
        // Store auth data
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", "alumni");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", data.name || email.split('@')[0]);
        
        // Explicitly check isVerified - be more strict about the true/false check
        // and log the exact value for debugging
        console.log("Alumni verification status:", data.isVerified);
        
        if (data.isVerified === false) {
          console.log("Alumni is NOT verified, setting pendingVerification flag");
          localStorage.setItem("pendingVerification", "true");
        } else if (data.isVerified === true) {
          console.log("Alumni IS verified, removing pendingVerification flag");
          localStorage.removeItem("pendingVerification");
        } else {
          console.warn("Ambiguous verification status:", data.isVerified);
          // Default to removing the flag if we're not sure
          localStorage.removeItem("pendingVerification");
        }
        
        toast.success("Logged in successfully!");
        
        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Check verification status to decide redirect
        // Be more explicit in the condition check
        if (data.isVerified === false) {
          console.log("Redirecting to verification pending page");
          window.location.href = "/verification-pending";
        } else {
          console.log("Redirecting to alumni dashboard");
          window.location.href = "/alumni-dashboard";
        }
        
        return true;
      } else {
        // Handle failed authentication
        const errorData = await response.text();
        let errorMessage = "Invalid credentials";
        try {
          const parsedError = JSON.parse(errorData);
          errorMessage = parsedError.message || errorMessage;
        } catch (e) {
          // If we can't parse the error, use the text directly
          errorMessage = errorData || errorMessage;
        }
        
        console.error("Authentication failed:", errorMessage);
        return false;
      }
    } catch (apiError) {
      console.error("Alumni API login error:", apiError);
      
      // Only use development fallback if explicitly in development mode
      if (process.env.NODE_ENV === 'development' || process.env.REACT_APP_MOCK_AUTH === 'true') {
        console.warn("Using development alumni login fallback");
        localStorage.setItem("token", `alumni-token-${Date.now()}`);
        localStorage.setItem("userRole", "alumni");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", email.split('@')[0]);
        localStorage.removeItem("pendingVerification"); // Assume verified in dev mode
        
        toast.success("Logged in as alumni (development mode)!");
        
        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Hard navigate to dashboard for clean reload
        window.location.href = "/alumni-dashboard";
        return true;
      }
      
      // If we're not in development mode, propagate the error
      throw apiError;
    }
  } catch (error) {
    console.error("Alumni login error:", error);
    return false;
  }
};

/**
 * Handle student login consistently across the application
 */
export const handleStudentLogin = async (navigate, email, password, onSuccess) => {
  try {
    console.log("Student login attempt:", { email });
    
    // Try API first (in production environment)
    try {
      const response = await fetch("http://localhost:5000/api/students/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Validate token before storing
        if (!data.token || typeof data.token !== 'string') {
          console.error("Invalid token received from server:", data);
          throw new Error("Authentication error: Invalid token received");
        }
        
        // Store auth data
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", "student");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", data.name || email.split('@')[0]);
        
        toast.success("Logged in as student successfully!");
        
        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Check verification status to decide redirect
        window.location.href = "/student-dashboard";
        
        return true;
      } else {
        // Handle failed authentication
        const errorData = await response.text();
        let errorMessage = "Invalid credentials";
        try {
          const parsedError = JSON.parse(errorData);
          errorMessage = parsedError.message || errorMessage;
        } catch (e) {
          // If we can't parse the error, use the text directly
          errorMessage = errorData || errorMessage;
        }
        
        console.error("Authentication failed:", errorMessage);
        return false;
      }
    } catch (apiError) {
      console.error("Student API login error:", apiError);
      
      // Only use development fallback if explicitly in development mode
      if (process.env.NODE_ENV === 'development' || process.env.REACT_APP_MOCK_AUTH === 'true') {
        console.warn("Using development student login fallback");
        localStorage.setItem("token", `student-token-${Date.now()}`);
        localStorage.setItem("userRole", "student");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", email.split('@')[0]);
        
        toast.success("Logged in as student (development mode)!");
        
        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Hard navigate to dashboard for clean reload
        window.location.href = "/student-dashboard";
        return true;
      }
      
      // If we're not in development mode, propagate the error
      throw apiError;
    }
  } catch (error) {
    console.error("Student login error:", error);
    return false;
  }
};

/**
 * Validate and fix existing token - to help with development flow
 */
export const verifyAdminRole = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");
  
  // If we have a token but no role, try to set admin role
  if (token && (!role || role !== "admin")) {
    if (token.includes("admin-token")) {
      localStorage.setItem("userRole", "admin");
      return true;
    }
  }
  
  return role === "admin";
};

/**
 * Check if JWT is valid
 */
export const isTokenValid = (token) => {
  if (!token || typeof token !== 'string') return false;
  
  // Basic structure check (3 parts separated by dots)
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  try {
    // Try to decode the payload (middle part)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token is expired
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return false;
    }
    
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Clear invalid tokens
 */
export const clearInvalidAuth = () => {
  const token = localStorage.getItem('token');
  if (!isTokenValid(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    return true;
  }
  return false;
};
