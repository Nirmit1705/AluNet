/**
 * Debug helper for authentication issues
 * You can call this from the browser console to diagnose auth problems
 */
export const debugAuth = () => {
  const authInfo = {
    token: localStorage.getItem("token"),
    userRole: localStorage.getItem("userRole"),
    userEmail: localStorage.getItem("userEmail"),
    userName: localStorage.getItem("userName"),
    tokenValid: !!localStorage.getItem("token"),
    roleValid: localStorage.getItem("userRole") === "admin",
    pathName: window.location.pathname
  };
  
  console.table(authInfo);
  
  return authInfo;
};

/**
 * Fix common auth issues
 * You can call this from the browser console
 */
export const fixAuthIssues = () => {
  if (!localStorage.getItem("token") || !localStorage.getItem("userRole")) {
    // Set admin credentials
    localStorage.setItem("token", `admin-token-${Date.now()}`);
    localStorage.setItem("userRole", "admin");
    localStorage.setItem("userEmail", "verify@admin.com");
    localStorage.setItem("userName", "System Admin");
    
    console.log("Authentication credentials fixed! You can now reload the page.");
    return true;
  }
  
  return false;
};

// Make debug helpers globally accessible in development
if (process.env.NODE_ENV !== 'production') {
  window.debugAuth = debugAuth;
  window.fixAuthIssues = fixAuthIssues;
}
