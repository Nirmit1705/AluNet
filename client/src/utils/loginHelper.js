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
    // First try API login
    let loginSuccess = false;
    
    try {
      // Make API call to admin login endpoint
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
      
      if (response.ok) {
        const data = await response.json();
        
        // Store admin data and token
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", data.name || "Admin");
        
        toast.success("Logged in as administrator!");
        loginSuccess = true;
        
        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Use window.location.href for direct navigation instead of navigate
        window.location.href = "/admin-dashboard";
        return true;
      }
    } catch (apiError) {
      console.error("Admin API login error:", apiError);
      // Fallback to development login
    }
    
    // If API login failed, fall back to development login
    if (!loginSuccess && email === "verify@admin.com" && password === "admin123") {
      console.log("Using development admin login");
      // Generate a special admin token for development purposes
      const adminToken = `admin-token-${Date.now()}`;
      
      // Set admin role
      localStorage.setItem("token", adminToken);
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", "System Admin");
      
      toast.success("Logged in as administrator (development mode)!");
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Use window.location.href for guaranteed redirect
      window.location.href = "/admin-dashboard";
      return true;
    }
    
    return loginSuccess;
  } catch (error) {
    console.error("Admin login error:", error);
    toast.error("Failed to log in as admin. Please try again.");
    return false;
  }
};

/**
 * Handle alumni login consistently across the application
 * 
 * @param {Object} navigate - React router navigate function
 * @param {string} email - Alumni email address
 * @param {string} password - Alumni password
 * @param {Function} onSuccess - Optional callback after successful login
 * @returns {Promise<boolean>} True if login successful
 */
export const handleAlumniLogin = async (navigate, email, password, onSuccess) => {
  try {
    console.log("Alumni login attempt:", { email });
    
    // Try API first (in a production environment)
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
        
        // Store auth data
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", "alumni");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", data.name || email.split('@')[0]);
        
        // Set verification status
        if (data.isVerified === false) {
          localStorage.setItem("pendingVerification", "true");
        } else {
          localStorage.removeItem("pendingVerification");
        }
        
        toast.success("Logged in successfully!");
        
        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Check verification status to decide redirect
        if (data.isVerified === false) {
          window.location.href = "/verification-pending";
        } else {
          window.location.href = "/alumni-dashboard";
        }
        
        return true;
      }
    } catch (apiError) {
      console.error("Alumni API login error:", apiError);
      // Continue to fallback login for development
    }
    
    // Development fallback (MOCK AUTH)
    console.log("Using development alumni login");
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
    
  } catch (error) {
    console.error("Alumni login error:", error);
    toast.error("Failed to log in. Please check your credentials.");
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
