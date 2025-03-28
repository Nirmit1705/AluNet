import React, { useState } from "react";
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

  const handleGoogleSignIn = () => {
    const backendUrl = "http://localhost:5000";
    if (!backendUrl) {
      console.error("Backend URL is not defined in the environment variables.");
      return;
    }
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  const handleRoleChange = (role) => {
    setFormData({ ...formData, role });
  };

  const handleBack = () => {
    setAuthMethod(null);
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
                : "Sign up to connect with alumni and find mentors"}
            </p>
          </div>

          {!authMethod && (
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

          {authMethod === "email" && (
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