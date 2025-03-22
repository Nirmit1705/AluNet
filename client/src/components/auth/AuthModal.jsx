import React from "react";
import { X } from "lucide-react";
import AuthForm from "./AuthForm";

const AuthModal = ({ isOpen, onClose, type, onSwitchType }) => {
  if (!isOpen) return null;

  const handleSwitchType = (newType) => {
    if (onSwitchType) {
      onSwitchType(newType);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur effect */}
      <div 
        className="fixed inset-0 bg-black/40 animate-fade-in animate-blur-in"
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
        
        <div className="px-8 py-10">
          <AuthForm 
            type={type} 
            onSuccess={onClose}
            onSwitchType={handleSwitchType} 
          />
        </div>
      </div>
    </div>
  );
};

export default AuthModal; 