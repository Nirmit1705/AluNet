import React from "react";
import Navbar from "../components/layout/Navbar";
import AuthForm from "../components/auth/AuthForm";

const Register = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-32 pb-20 flex items-center justify-center">
        <AuthForm type="register" />
      </div>
    </div>
  );
};

export default Register; 