import React, { useState } from "react";
import { X, Mail, ArrowLeft } from "lucide-react";
import AuthForm from "./AuthForm";
import GoogleAuthButton from "./GoogleAuthButton";
import { jwtDecode } from "jwt-decode";

const AuthModal = ({ isOpen, onClose, type, onSwitchType }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "student", // Default role
  });
  
  // Track the selected auth method
  const [authMethod, setAuthMethod] = useState(null); // null, 'google', 'email'

  // Handle Google login success
  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      // Get user info from the access token
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      });
      
      const userInfo = await userInfoResponse.json();
      
      // Create user data object
      const userData = {
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
        googleId: userInfo.sub,
        role: formData.role // Use the selected role
      };
      
      // Store in localStorage (in a real app, you would send to your backend)
      localStorage.setItem("token", tokenResponse.access_token);
      localStorage.setItem("userRole", userData.role);
      localStorage.setItem("userName", userData.name);
      localStorage.setItem("userEmail", userData.email);
      
      // Show success and close modal
      console.log("Successfully signed in with Google:", userData);
      onClose();
      
      // Navigate to appropriate dashboard based on role
      window.location.href = userData.role === "student" ? "/student-dashboard" : "/alumni-dashboard";
    } catch (error) {
      console.error("Error handling Google login:", error);
      alert("Failed to process Google login");
    }
  };

  // Handle Google login error
  const handleGoogleError = (error) => {
    console.error("Google login error:", error);
    alert("Google login failed. Please try again.");
  };

  // Handle role selection 
  const handleRoleChange = (role) => {
    setFormData({...formData, role});
  };
  
  // Go back to auth method selection
  const handleBack = () => {
    setAuthMethod(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur effect */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div className="relative z-10 bg-white dark:bg-gray-900 max-w-md w-full rounded-xl shadow-xl animate-fade-in-up">
        <div className="p-1 absolute right-2 top-2">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {authMethod && (
          <div className="p-1 absolute left-2 top-2">
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back</span>
            </button>
          </div>
        )}
        
        <div className="px-8 py-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">
              {type === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {type === "login" 
                ? "Enter your credentials to access your account" 
                : "Sign up to connect with alumni and find mentors"
              }
            </p>
          </div>
          
          {/* Method Selection */}
          {!authMethod && (
            <>
              
              
              <div className="flex flex-col gap-3 mt-8">
                <h3 className="text-sm text-center font-medium mb-2">Select how you want to {type === "login" ? "sign in" : "sign up"}</h3>
                
                <button
                  onClick={() => setAuthMethod('google')}
                  className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 border border-gray-300 rounded-md py-2.5 px-4 hover:bg-gray-50 transition-colors"
                >
                  <GoogleAuthButton 
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    text={type === "login" ? "Sign in with Google" : "Sign up with Google"}
                  />
                </button>
                
                <button
                  onClick={() => setAuthMethod('email')}
                  className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 border border-gray-300 rounded-md py-2.5 px-4 hover:bg-gray-50 transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  <span>{type === "login" ? "Sign in with Email" : "Sign up with Email"}</span>
                </button>
              </div>
            </>
          )}
          
          {/* Google Authentication Form */}
          {authMethod === 'google' && (
            <>
              <div className="mb-6">
                <GoogleAuthButton 
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text={type === "login" ? "Sign in with Google" : "Sign up with Google"}
                />
              </div>
              
              <p className="text-sm text-center text-muted-foreground mt-4">
                {type === "login" 
                  ? "Don't have an account? " 
                  : "Already have an account? "
                }
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => onSwitchType(type === "login" ? "register" : "login")}
                >
                  {type === "login" ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </>
          )}
          
          {/* Email Authentication Form */}
          {authMethod === 'email' && (
            <>
              <AuthForm 
                type={type} 
                onSuccess={onClose}
                onSwitchType={onSwitchType}  
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;