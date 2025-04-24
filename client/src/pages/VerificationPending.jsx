import React from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";

const VerificationPending = () => {
  // Get the user's email from localStorage
  const userEmail = localStorage.getItem("userEmail");

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
        
        <p className="text-muted-foreground mb-6">
          We've sent a verification link to{" "}
          <span className="font-medium text-foreground">{userEmail}</span>.
          Please check your inbox and click the link to verify your account.
        </p>
        
        <div className="bg-primary/5 rounded-lg p-4 mb-6 text-sm">
          <p>
            <strong>Didn't receive an email?</strong> Check your spam folder or request a new verification link.
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <Link 
            to="/resend-verification" 
            className="inline-flex items-center justify-center px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/5 transition-colors"
          >
            Resend Verification Email
          </Link>
          
          <Link 
            to="/login" 
            className="inline-flex items-center justify-center gap-1 text-sm text-primary hover:underline"
          >
            Return to Login <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;