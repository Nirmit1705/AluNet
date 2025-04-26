import { toast } from "sonner";

/**
 * Direct admin login function that ensures proper redirection
 * 
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise<boolean>} Success indicator
 */
export const directAdminLogin = async (email, password) => {
  try {
    // Try API first
    try {
      const response = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Store all auth data
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", data.name || "Admin");
        
        toast.success("Admin authentication successful");
        
        // Force direct navigation
        window.location.href = "/admin-dashboard";
        return true;
      }
    } catch (apiError) {
      // Continue to fallback if API fails
    }
    
    // Development fallback if API fails
    if (email === "verify@admin.com" && password === "admin123") {
      localStorage.setItem("token", `admin-token-${Date.now()}`);
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", "System Admin");
      
      toast.success("Development admin access granted");
      
      // Force direct navigation
      window.location.href = "/admin-dashboard";
      return true;
    }
    
    throw new Error("Invalid admin credentials");
  } catch (error) {
    toast.error("Admin login failed. Please check your credentials.");
    return false;
  }
};

/**
 * Check if user has valid admin credentials
 */
export const validateAdminAccess = () => {
  const role = localStorage.getItem("userRole");
  const token = localStorage.getItem("token");
  return role === "admin" && !!token;
};
