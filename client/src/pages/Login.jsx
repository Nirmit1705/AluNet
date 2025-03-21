import React from "react";
import Navbar from "../components/layout/Navbar";
import AuthForm from "../components/auth/AuthForm";

const Login = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-32 pb-20 flex items-center justify-center">
        <AuthForm type="login" />
      </div>
    </div>
  );
};

export default Login; 