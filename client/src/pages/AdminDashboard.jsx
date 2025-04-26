import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashboardPage from "../components/dashboard/AdminDashboardPage";
import { directAdminLogin } from "../utils/adminAuth";
import { toast } from "sonner";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [adminEmail, setAdminEmail] = useState("verify@admin.com");
  const [adminPassword, setAdminPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Admin dashboard access check
    const checkAdminAccess = () => {
      try {
        const storedRole = localStorage.getItem("userRole");
        const token = localStorage.getItem("token");
        
        // If no valid admin role is found, show the admin login form
        if (storedRole !== "admin" || !token) {
          setShowLoginForm(true);
          setIsLoading(false);
          return;
        }
        
        setUserRole("admin");
        setIsLoading(false);
      } catch (error) {
        setShowLoginForm(true);
        setIsLoading(false);
      }
    };
    
    checkAdminAccess();
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      // directAdminLogin will handle the redirection itself
      await directAdminLogin(adminEmail, adminPassword);
      // We don't need to set state here as the page will redirect
    } catch (error) {
      toast.error("Admin login failed. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary/50 mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (showLoginForm) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full glass-card p-8 rounded-xl text-center">
          <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
          <p className="mb-6">Please enter your admin credentials to access the dashboard</p>
          
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="text-left">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input 
                type="email" 
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                required
              />
            </div>
            
            <div className="text-left">
              <label className="block text-sm font-medium mb-1">Password</label>
              <input 
                type="password" 
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                required
              />
            </div>
            
            <button 
              type="submit"
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Login
            </button>
          </form>
          
          <div className="mt-6">
            <button 
              onClick={() => navigate("/")} 
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminDashboardPage />
    </div>
  );
};

export default AdminDashboard;
