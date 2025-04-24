import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const ResendVerification = () => {
  const [email, setEmail] = useState(localStorage.getItem("userEmail") || "");
  const [role, setRole] = useState(localStorage.getItem("userRole") || "student");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/auth/resend-verification/${role}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success("Verification email sent! Please check your inbox.");
        navigate("/verification-pending");
      } else {
        toast.error(data.message || "Failed to send verification email");
      }
    } catch (error) {
      console.error("Error resending verification:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <Link 
          to="/verification-pending" 
          className="inline-flex items-center text-sm text-muted-foreground mb-6 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Link>
        
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2 text-center">Resend Verification Email</h1>
        
        <p className="text-muted-foreground mb-6 text-center">
          Enter your email address and we'll send you a new verification link.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              placeholder="name@example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Account Type</label>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div
                className={`flex items-center border ${
                  role === "student" 
                    ? "border-primary bg-primary/5" 
                    : "border-gray-200 dark:border-gray-700"
                } rounded-md p-3 cursor-pointer transition-colors`}
                onClick={() => setRole("student")}
              >
                <input
                  type="radio"
                  id="student-role"
                  name="role"
                  checked={role === "student"}
                  onChange={() => setRole("student")}
                  className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                />
                <label
                  htmlFor="student-role"
                  className="ml-2 block text-sm font-medium cursor-pointer"
                >
                  Student
                </label>
              </div>
              <div
                className={`flex items-center border ${
                  role === "alumni" 
                    ? "border-primary bg-primary/5" 
                    : "border-gray-200 dark:border-gray-700"
                } rounded-md p-3 cursor-pointer transition-colors`}
                onClick={() => setRole("alumni")}
              >
                <input
                  type="radio"
                  id="alumni-role"
                  name="role"
                  checked={role === "alumni"}
                  onChange={() => setRole("alumni")}
                  className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                />
                <label
                  htmlFor="alumni-role"
                  className="ml-2 block text-sm font-medium cursor-pointer"
                >
                  Alumni
                </label>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full button-primary py-2.5 relative overflow-hidden group"
            disabled={isSubmitting}
          >
            <span className="relative z-10">
              {isSubmitting ? "Sending..." : "Resend Verification Email"}
            </span>
            <div className="absolute inset-0 bg-white/10 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResendVerification;