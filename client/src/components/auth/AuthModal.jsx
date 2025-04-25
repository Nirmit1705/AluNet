import React, { useState, useRef, useEffect } from "react";
import { X, Mail, ArrowLeft } from "lucide-react";
import AuthForm from "./AuthForm";

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
  const authFormRef = useRef(null);

  // Add effect to listen for messages from Google popup
  useEffect(() => {
    const handleMessage = (event) => {
      // Make sure the message is from our backend
      if (event.origin !== "http://localhost:5000") {
        return;
      }

      if (event.data.type === "googleAuthSuccess") {
        console.log("Received Google auth data in AuthModal:", event.data.userData);
        // Ensure googleId exists in the data
        if (!event.data.userData.googleId) {
          console.error("Missing googleId in received data");
        }
        setGoogleUserData(event.data.userData);
        setIsWaitingForGoogle(false);
        
        // For login, we can pass the data directly
        if (type === "login") {
          handleGoogleAuthSuccess(event.data.userData);
        }
        // For registration, we'll show the AuthForm in "google" mode
        // The form will be shown because authMethod is still "google"
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [type]);

  const handleGoogleSignIn = () => {
    setAuthMethod("google");
    setIsWaitingForGoogle(true);
    const backendUrl = "http://localhost:5000";
    
    // Open a popup window for Google auth
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;

    window.open(
      `${backendUrl}/api/auth/google`,
      'googleAuthPopup',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const handleGoogleAuthSuccess = (userData) => {
    // Pass the Google auth data to the AuthForm
    if (authFormRef.current) {
      authFormRef.current.handleGoogleAuthSuccess(userData);
    }
  };

  const handleBack = () => {
    setAuthMethod(null);
    setIsWaitingForGoogle(false);
    setGoogleUserData(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
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

        {(authMethod || isWaitingForGoogle) && (
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
          {!authMethod && !isWaitingForGoogle && (
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

          {!authMethod && !isWaitingForGoogle && (
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
                    src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"
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

          {authMethod === "email" && (
            <AuthForm
              ref={authFormRef}
              type={type}
              onSuccess={onClose}
              onSwitchType={onSwitchType}
            />
          )}
          
          {/* Add this new case for completed Google auth in register mode */}
          {authMethod === "google" && !isWaitingForGoogle && googleUserData && type === "register" && (
            <AuthForm
              ref={authFormRef}
              type={type}
              onSuccess={onClose}
              onSwitchType={onSwitchType}
              googleAuthData={googleUserData}
              initialStep={2} // Skip to step 2 directly
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;