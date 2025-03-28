import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { GoogleLogo } from './GoogleLogo';

const GoogleAuthButton = ({ onSuccess, onError, text = "Sign in with Google", className = "" }) => {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      onSuccess(tokenResponse);
    },
    onError: (error) => {
      console.error("Google login failed:", error);
      onError && onError(error);
    }
  });

  return (
    <div className={`w-full ${className}`} onClick={() => login()}>
      <div className="flex items-center justify-center gap-2 cursor-pointer">
        <GoogleLogo className="w-5 h-5" />
        <span>{text}</span>
      </div>
    </div>
  );
};

export default GoogleAuthButton;