import React, { useState, useRef, useEffect } from "react";
import { X, Mail, ArrowLeft, GraduationCap, User } from "lucide-react";
import AuthForm from "./AuthForm";
import { toast } from "sonner";

const AuthModal = ({ isOpen, onClose, type, onSwitchType }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "student", // Default role
  });

  const [authMethod, setAuthMethod] = useState(null); // null, 'google', 'email'
  const [isWaitingForGoogle, setIsWaitingForGoogle] = useState(false);
  const [googleUserData, setGoogleUserData] = useState(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [selectedRole, setSelectedRole] = useState("student");
  const authFormRef = useRef(null);

  // Add effect to listen for messages from Google popup
  useEffect(() => {
    const handleMessage = (event) => {
      // Allow messages from the backend URL or its development variations 
      const allowedOrigins = [
        "http://localhost:5000", 
        "https://localhost:5000",
        process.env.REACT_APP_BACKEND_URL,
        process.env.BACKEND_URL
      ];
      
      if (!allowedOrigins.includes(event.origin)) {
        console.warn("Received message from unauthorized origin:", event.origin);
        return;
      }

      console.log("Received postMessage event:", event.data);

      if (event.data?.type === "googleAuthSuccess") {
        console.log("Google auth data received:", event.data.userData);
        
        const userData = event.data.userData;
        
        // Ensure required fields exist
        if (!userData || !userData.email) {
          console.error("Invalid Google auth data:", userData);
          toast.error("Google authentication failed: Invalid user data");
          setIsWaitingForGoogle(false);
          return;
        }
        
        setGoogleUserData(userData);
        setIsWaitingForGoogle(false);
        
        // For login, we can pass the data directly
        if (type === "login") {
          handleGoogleAuthSuccess(userData);
        } else {
          // For registration, show role selection first
          setShowRoleSelection(true);
        }
      } else if (event.data?.type === "googleAuthError") {
        console.error("Google auth error:", event.data.error);
        toast.error(`Google authentication failed: ${event.data.error || "Unknown error"}`);
        setIsWaitingForGoogle(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [type]);

  const handleGoogleSignIn = () => {
    setAuthMethod("google");
    setIsWaitingForGoogle(true);
    
    // Get the backend URL with fallback to localhost
    // Using Vite's environment variable format which is import.meta.env.VITE_*
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 
                       import.meta.env.VITE_API_URL || 
                       "http://localhost:5000";
    
    // Open a popup window for Google auth
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;

    const popup = window.open(
      `${backendUrl}/api/auth/google`,
      'googleAuthPopup',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    
    // Check if popup was blocked
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      toast.error("Popup blocked! Please allow popups for this site.");
      setIsWaitingForGoogle(false);
      setAuthMethod(null);
    }
  };

  const handleGoogleAuthSuccess = (userData) => {
    console.log("Processing Google auth success data:", userData);
    
    // Set the role from selection if in register mode
    if (type === "register" && selectedRole) {
      userData.role = selectedRole;
    }
    
    // Check if we got a valid token - this means the user already exists
    if (userData.token && typeof userData.token === 'string') {
      // Store auth data for existing users
      localStorage.setItem("token", userData.token);
      localStorage.setItem("userRole", userData.userType || selectedRole);
      localStorage.setItem("userEmail", userData.email);
      localStorage.setItem("userName", userData.name);
      
      // For alumni, check verified status
      if (userData.userType === 'alumni' && userData.isVerified === false) {
        localStorage.setItem("pendingVerification", "true");
        window.location.href = "/verification-pending";
      } else {
        // Direct navigation based on role
        const dashboardPath = userData.userType === 'student' || selectedRole === 'student' 
          ? "/student-dashboard" 
          : userData.userType === 'admin' 
            ? "/admin-dashboard" 
            : "/alumni-dashboard";
            
        window.location.href = dashboardPath;
      }
      
      if (onClose) {
        onClose();
      }
    } else if (type === "register") {
      // For registration, pass the Google auth data to the AuthForm
      if (authFormRef.current) {
        authFormRef.current.handleGoogleAuthSuccess(userData);
      }
    } else {
      // For login with no token (user doesn't exist)
      toast.error("No account found with this Google email. Please register first.");
      setAuthMethod(null);
    }
  };

  const handleRoleSelect = (role) => {
    console.log("Role selected in modal:", role);
    // Just set the selected role but don't proceed yet
    setSelectedRole(role);
  };

  const handleContinueWithRole = () => {
    console.log("Continuing with selected role:", selectedRole);
    
    // Update the Google userData with the selected role
    if (googleUserData) {
      const updatedUserData = { ...googleUserData, role: selectedRole };
      console.log("Updated Google user data with role:", updatedUserData);
      setGoogleUserData(updatedUserData);
      
      // Proceed to next step
      setShowRoleSelection(false);
      
      // Show the registration form with the selected role
      handleGoogleAuthSuccess(updatedUserData);
    }
  };

  const handleBack = () => {
    setAuthMethod(null);
    setIsWaitingForGoogle(false);
    setGoogleUserData(null);
    setShowRoleSelection(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative z-10 bg-white dark:bg-gray-900 max-w-md w-full rounded-xl shadow-xl animate-fade-in-up max-h-[90vh] overflow-y-auto my-4">
        <div className="p-1 absolute right-2 top-2 z-20">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {(authMethod || isWaitingForGoogle || showRoleSelection) && (
          <div className="p-1 absolute left-2 top-2 z-20">
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back</span>
            </button>
          </div>
        )}

        <div className="px-6 py-8 overflow-y-auto">
          {/* Show role selection screen after successful Google auth for registration */}
          {showRoleSelection && (
            <div className="text-center">
              <h2 className="text-xl font-bold mb-6">Select Your Role</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Please select whether you are a student or alumni to continue with Google registration
              </p>
              
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => handleRoleSelect("student")}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-3 text-primary" />
                    <div className="text-left">
                      <h3 className="font-medium">Student</h3>
                      <p className="text-sm text-muted-foreground">Current student looking for mentorship</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 border-primary ${selectedRole === "student" ? "bg-primary" : "bg-transparent"}`}></div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleRoleSelect("alumni")}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-center">
                    <GraduationCap className="h-5 w-5 mr-3 text-primary" />
                    <div className="text-left">
                      <h3 className="font-medium">Alumni</h3>
                      <p className="text-sm text-muted-foreground">Graduate looking to mentor students</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 border-primary ${selectedRole === "alumni" ? "bg-primary" : "bg-transparent"}`}></div>
                </button>
                
                <button
                  type="button"
                  onClick={handleContinueWithRole}
                  className="mt-4 w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Continue as {selectedRole}
                </button>
              </div>
            </div>
          )}

          {!authMethod && !isWaitingForGoogle && !showRoleSelection && (
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">
                {type === "login" ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {type === "login"
                  ? "Enter your credentials to access your account"
                  : "Sign up to connect with alumni and find mentors"}
              </p>
            </div>
          )}

          {!authMethod && !isWaitingForGoogle && !showRoleSelection && (
            <>
              <div className="flex flex-col gap-3 mt-8">
                <h3 className="text-sm text-center font-medium mb-2">
                  Select how you want to {type === "login" ? "sign in" : "sign up"}
                </h3>

                <button
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 border border-gray-300 rounded-md py-2.5 px-4 hover:bg-gray-50 transition-colors"
                >
                  <img
                    src="https://www.gstatic.com/marketing-cms/assets/images/d5/dc/cfe9ce8b4425b410b49b7f2dd3f3/g.webp=s96-fcrop64=1,00000000ffffffff-rw"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  <span>
                    {type === "login" ? "Sign in with Google" : "Sign up with Google"}
                  </span>
                </button>

                <button
                  onClick={() => setAuthMethod("email")}
                  className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 border border-gray-300 rounded-md py-2.5 px-4 hover:bg-gray-50 transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  <span>
                    {type === "login" ? "Sign in with Email" : "Sign up with Email"}
                  </span>
                </button>
              </div>
            </>
          )}

          {isWaitingForGoogle && (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
              <p className="text-center text-muted-foreground">
                Waiting for Google authentication...
              </p>
              <p className="text-center text-sm text-muted-foreground mt-2">
                A popup window should have opened. Please complete the Google sign-in process there.
              </p>
            </div>
          )}

          {/* Make sure to pass initialRole correctly for email auth method too */}
          {authMethod === "email" && (
            <AuthForm
              ref={authFormRef}
              type={type}
              onSuccess={onClose}
              onSwitchType={onSwitchType}
              initialRole={selectedRole} // Pass the selected role
            />
          )}
          
          {/* Modal render section for AuthForm (when Google auth completed) */}
          {authMethod === "google" && !isWaitingForGoogle && !showRoleSelection && googleUserData && type === "register" && (
            <AuthForm
              ref={authFormRef}
              type={type}
              onSuccess={onClose}
              onSwitchType={onSwitchType}
              googleAuthData={googleUserData}
              initialStep={2} // Skip to step 2 directly
              initialRole={googleUserData.role || selectedRole} // Explicitly pass the role
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;