import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Briefcase, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const AuthForm = ({ type, onSuccess, onSwitchType }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectRole = (newRole) => {
    setRole(newRole);
    setIsDropdownOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (type === "register") {
      if (!name) {
        toast.error("Please enter your name");
        return;
      }
      
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }
    
    // In a real app, this would be an API call to authenticate the user
    // For now, we'll simulate successful authentication
    
    // Generate a mock token
    const mockToken = `mock-token-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

    // Store user data in localStorage
    localStorage.setItem("token", mockToken);
    localStorage.setItem("userRole", role);
    localStorage.setItem("userEmail", email);
    if (type === "register" && name) {
      localStorage.setItem("userName", name);
    }
    
    if (type === "register") {
      toast.success("Account created successfully!");
    } else {
      toast.success("Logged in successfully!");
    }
    
    // Call the onSuccess callback if provided
    if (onSuccess) {
      onSuccess();
    }
    
    // Navigate to the appropriate home page based on role
    if (role === "student") {
      navigate("/student-dashboard");
    } else {
      navigate("/alumni-dashboard");
    }
  };

  // Switch between login and register forms
  const handleSwitchType = () => {
    if (onSwitchType) {
      onSwitchType(type === "login" ? "register" : "login");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto glass-card rounded-2xl p-8 sm:p-10 animate-scale-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">
          {type === "login" ? "Welcome back" : "Create your account"}
        </h2>
        <p className="text-muted-foreground">
          {type === "login"
            ? "Enter your credentials to access your account"
            : "Join the alumni-student community"}
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {type === "register" && (
          <>
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="block w-full pl-10 px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                I am a
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleDropdown}
                  className="flex items-center justify-between w-full pl-10 px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                >
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 text-gray-400 absolute left-3" />
                    <span className="ml-2 capitalize">{role}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
                    <ul className="py-1">
                      <li
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => selectRole("student")}
                      >
                        Student
                      </li>
                      <li
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => selectRole("alumni")}
                      >
                        Alumni
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              placeholder="name@example.com"
            />
          </div>
        </div>

        {type === "login" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Login as</label>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div
                className={`flex items-center border ${
                  role === "student" 
                    ? "border-primary bg-primary/5" 
                    : "border-gray-200 dark:border-gray-700"
                } rounded-md p-3 cursor-pointer transition-colors`}
                onClick={() => selectRole("student")}
              >
                <input
                  type="radio"
                  id="student-role"
                  name="role"
                  checked={role === "student"}
                  onChange={() => selectRole("student")}
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
                onClick={() => selectRole("alumni")}
              >
                <input
                  type="radio"
                  id="alumni-role"
                  name="role"
                  checked={role === "alumni"}
                  onChange={() => selectRole("alumni")}
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
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            {type === "login" && (
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary hover:text-primary/80"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={type === "login" ? "current-password" : "new-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              placeholder="••••••••"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {type === "register" && (
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                className="block w-full pl-10 px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full button-primary py-2.5 relative overflow-hidden group"
        >
          <span className="relative z-10">
            {type === "login" ? "Sign In" : "Create Account"}
          </span>
          <div className="absolute inset-0 bg-white/10 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300"></div>
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          {type === "login" ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={handleSwitchType}
            className="ml-1 font-medium text-primary hover:text-primary/80"
          >
            {type === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;