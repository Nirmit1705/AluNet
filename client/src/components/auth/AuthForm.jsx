import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Briefcase, ChevronDown, Calendar, BookOpen, Building, School, Hash, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { directAdminLogin } from "../../utils/adminAuth";
import axios from "axios";

// Update your AuthForm component declaration
const AuthForm = forwardRef(({ 
  type, 
  onSuccess, 
  onSwitchType, 
  googleAuthData: initialGoogleData, 
  initialStep = 1,
  initialRole = "student" // Add initialRole parameter with default value
}, ref) => {

  const [showPassword, setShowPassword] = useState(false);
  // Initialize role with the initialRole prop if provided
  const [role, setRole] = useState(initialRole || "student");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [email, setEmail] = useState(initialGoogleData?.email || "");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(initialGoogleData?.name || "");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(initialStep); // Use initialStep
  const [googleAuthData, setGoogleAuthData] = useState(initialGoogleData || null);
  const [alumniDocument, setAlumniDocument] = useState(null);
  const [documentError, setDocumentError] = useState("");
  const [registrationComplete, setIsRegistrationComplete] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // ADD THIS MISSING STATE
  const [formData, setFormData] = useState({
    branch: "",
    university: "",
    college: "",
    graduationYear: "",
    skills: [],
    newSkill: "",
    documentURL: ""
  });
  const navigate = useNavigate();
  
  // Add useEffect to update role when initialRole changes
  useEffect(() => {
    if (initialRole) {
      console.log("Setting role from initialRole prop:", initialRole);
      setRole(initialRole);
    }
  }, [initialRole]);
  
  // Update Google auth data effect to also set role if available in the Google data
  useEffect(() => {
    if (initialGoogleData) {
      setEmail(initialGoogleData.email || "");
      setName(initialGoogleData.name || "");
      
      // If role is provided in Google data, set it
      if (initialGoogleData.role) {
        console.log("Setting role from Google auth data:", initialGoogleData.role);
        setRole(initialGoogleData.role);
      }
      
      setGoogleAuthData(initialGoogleData);
      setStep(2); // Skip to step 2 automatically
    }
  }, [initialGoogleData]);

  // Expose methods to parent component through the ref
  useImperativeHandle(ref, () => ({
    handleGoogleAuthSuccess: (userData) => {
      if (type === "register") {
        // For registration, we got name and email from Google,
        // but need to collect additional info
        setName(userData.name || "");
        setEmail(userData.email || "");
        
        // Set the role from userData if provided
        if (userData.role) {
          console.log("Setting role from Google auth callback:", userData.role);
          setRole(userData.role);
        }
        
        setGoogleAuthData(userData);
        
        // Skip to step 2 directly since we have basic info
        setStep(2);
      } else {
        // For login, attempt direct login with Google credentials
        console.log("Logging in with Google:", userData);
        
        // Store user data
        localStorage.setItem("token", userData.token || `google-token-${Date.now()}`);
        localStorage.setItem("userRole", role);
        localStorage.setItem("userEmail", userData.email);
        localStorage.setItem("userName", userData.name);
        
        toast.success("Logged in with Google successfully!");
        
        if (onSuccess) {
          onSuccess();
        }
        
        // Navigate to the dashboard
        navigate(role === "student" ? "/student-dashboard" : "/alumni-dashboard");
      }
    }
  }));

  // Student-specific form fields
  const [studentForm, setStudentForm] = useState({
    registrationNumber: "",
    currentYear: "",
    branch: "",
    university: "",
    college: "",
    graduationYear: "",
    skills: [],
    newSkill: ""
  });
  
  // Alumni-specific form fields
  const [alumniForm, setAlumniForm] = useState({
    graduationYear: "",
    branch: "",
    company: "",
    position: "",
    university: "",
    college: "",
    skills: [],
    newSkill: ""
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Add additional debugging to selectRole function
  const selectRole = (newRole) => {
    console.log("Selecting role:", newRole, "Previous role:", role);
    setRole(newRole);
    setIsDropdownOpen(false);
  };

  const handleStudentFormChange = (e) => {
    const { name, value } = e.target;
    setStudentForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAlumniFormChange = (e) => {
    const { name, value } = e.target;
    setAlumniForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const addSkill = (isStudent) => {
    if (isStudent) {
      if (studentForm.newSkill.trim()) {
        setStudentForm((prev) => ({
          ...prev,
          skills: [...prev.skills, prev.newSkill.trim()],
          newSkill: ""
        }));
      }
    } else {
      if (alumniForm.newSkill.trim()) {
        setAlumniForm((prev) => ({
          ...prev,
          skills: [...prev.skills, prev.newSkill.trim()],
          newSkill: ""
        }));
      }
    }
  };

  const removeSkill = (skillToRemove, isStudent) => {
    if (isStudent) {
      setStudentForm((prev) => ({
        ...prev,
        skills: prev.skills.filter((skill) => skill !== skillToRemove)
      }));
    } else {
      setAlumniForm((prev) => ({
        ...prev,
        skills: prev.skills.filter((skill) => skill !== skillToRemove)
      }));
    }
  };

  const handleKeyDown = (e, isStudent) => {
    if (e.key === "Enter" && (isStudent ? studentForm.newSkill.trim() : alumniForm.newSkill.trim())) {
      e.preventDefault();
      addSkill(isStudent);
    }
  };

  // Handler for step 1 form submission
  const handleInitialSubmit = (e) => {
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
      
      // Add password length validation
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }
      
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      
      // Move to step 2 for registration
      setStep(2);
    } else {
      // Login flow - handle login directly
      handleLogin();
    }
  };
  
  // Handler for login
  const handleLogin = async () => {
    try {
      // Show loading state
      setIsSubmitting(true);
      
      console.log("Login attempt:", { email, role });
      
      // Check if email matches known admin email pattern
      if (email.toLowerCase() === "verify@admin.com") {
        console.log("Admin email detected - attempting admin login directly");
        
        // Import and use the admin login handler
        const { handleAdminLogin } = await import("../../utils/loginHelper.js");
        const adminSuccess = await handleAdminLogin(navigate, email, password, onSuccess);
        
        if (adminSuccess) {
          return; // Admin login handled successfully
        }
        
        // If admin login fails with known admin email, don't try other roles
        console.log("Admin login failed with admin email - stopping authentication flow");
        setIsSubmitting(false);
        return;
      }
      
      // If we reach here, it's not a known admin email, try admin login first
      try {
        const adminResponse = await fetch("http://localhost:5000/api/admin/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password
          }),
        });
        
        if (adminResponse.ok) {
          const adminData = await adminResponse.json();
          
          console.log("Admin credentials detected - overriding selected role");
          
          // Store admin auth data
          localStorage.setItem("token", adminData.token);
          localStorage.setItem("userRole", "admin");
          localStorage.setItem("userEmail", email);
          localStorage.setItem("userName", adminData.name || "Admin");
          
          toast.success("Logged in as administrator!");
          
          if (onSuccess) {
            onSuccess();
          }
          
          // Direct navigation to admin dashboard, regardless of selected role in the form
          window.location.href = "/admin-dashboard";
          return;
        }
        
        // If response is not ok, proceed with normal authentication flow
        console.log("Not admin credentials, continuing with normal authentication flow");
      } catch (adminCheckError) {
        // If admin check fails, log and continue with normal flow
        console.error("Admin check error:", adminCheckError);
        console.log("Continuing with normal authentication flow");
      }
      
      // Continue with role-specific authentication
      
      // Alumni login flow
      if (role === "alumni") {
        try {
          // Import the alumni login helper
          const { handleAlumniLogin } = await import("../../utils/loginHelper.js");
          const success = await handleAlumniLogin(navigate, email, password, onSuccess);
          
          if (success) {
            return; // The helper will handle navigation
          }
        } catch (alumniError) {
          console.error("Alumni login attempt failed:", alumniError);
          // Don't show error yet, we might try student login as fallback in dev mode
        }
      } else if (role === "student") {
        try {
          // Student login flow
          const { handleStudentLogin } = await import("../../utils/loginHelper.js");
          const success = await handleStudentLogin(navigate, email, password, onSuccess);
          
          if (success) {
            return; // The helper would handle navigation
          }
        } catch (studentError) {
          console.error("Student login attempt failed:", studentError);
          // Don't show error yet, we might try fallback in dev mode
        }
      }

      // If we get here and haven't succeeded, show appropriate error
      toast.error(`Invalid ${role} credentials. Please check your email and password.`);
      
      // We should only reach here in development mode or if the API calls fail
      // Add a check for development mode
      if (process.env.NODE_ENV === 'development') {
        console.warn("Using development fallback login - this should NOT happen in production");
        
        // Fallback login logic - ONLY FOR DEVELOPMENT
        // Check if the email follows a valid pattern at minimum
        if (!email.includes('@') || password.length < 4) {
          toast.error("Invalid credentials. Even in development mode, you need valid inputs.");
          return;
        }
        
        // Simulate API call
        console.log("DEV MODE: Using mock login for:", { email, role });
        
        // Store user data in localStorage
        localStorage.setItem("token", `mock-token-${Date.now()}`);
        localStorage.setItem("userRole", role);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", name || email.split('@')[0]);
        
        toast.success(`[DEV MODE] Logged in as ${role}`);
        
        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Force direct navigation to the appropriate dashboard using window.location
        window.location.href = role === "student" ? "/student-dashboard" : "/alumni-dashboard";
      } else {
        // In production, if we get here, it means the API calls failed
        toast.error("Authentication service is currently unavailable. Please try again later.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to log in. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add this function to validate the uploaded document
  const validateDocument = (file) => {
    if (!file) {
      setDocumentError("Please upload your alumni verification document");
      return false;
    }
    
    // Check file type (PDF, JPG, PNG)
    const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setDocumentError("Please upload a PDF, JPG, or PNG file");
      return false;
    }
    
    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setDocumentError("File size must be less than 5MB");
      return false;
    }
    
    setDocumentError("");
    return true;
  };

  // Fix the handleFinalSubmit function to better handle errors
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    
    // Check documentURL from both states to ensure we have the value
    const documentURLToSubmit = formData.documentURL || alumniForm.documentURL;
    
    if (role === "alumni" && !documentURLToSubmit) {
      toast.error("Please upload a verification document");
      return;
    }
    
    // Show loading state
    setIsSubmitting(true);
    
    try {
      // Log form data for debugging
      console.log("Submitting form data:", formData);
      console.log("Alumni form data:", alumniForm);
      console.log("Document URL being sent:", documentURLToSubmit);
      
      // Convert form values to proper types
      let formattedData;
      
      if (role === "student") {
        // Student validation logic remains the same
        if (!studentForm.registrationNumber) {
          toast.error("Registration number is required");
          return;
        }
        
        formattedData = {
          name,
          email,
          // For Google auth, include googleId and omit password entirely
          ...(googleAuthData ? { googleId: googleAuthData.googleId } : { password }),
          registrationNumber: studentForm.registrationNumber,
          currentYear: parseInt(studentForm.currentYear) || 1,
          branch: studentForm.branch,
          university: studentForm.university,
          college: studentForm.college,
          graduationYear: parseInt(studentForm.graduationYear) || new Date().getFullYear() + 4,
          skills: studentForm.skills || [],
        };
      } else { // Alumni
        // Alumni validation - ensure fields are passed correctly
        if (!alumniForm.graduationYear) {
          toast.error("Graduation year is required");
          setIsSubmitting(false);
          return;
        }
        
        if (!alumniForm.branch) {
          toast.error("Branch is required");
          setIsSubmitting(false);
          return;
        }
        
        // Create alumni data object with all required fields at the top level
        formattedData = {
          name,
          email,
          // For Google auth, include googleId and omit password entirely
          ...(googleAuthData ? { googleAuthData: googleAuthData.googleId } : { password }),
          // Important: These fields need to be at the top level, not in a nested object
          graduationYear: parseInt(alumniForm.graduationYear) || 2020,
          branch: alumniForm.branch,
          university: alumniForm.university || "",
          college: alumniForm.college || "",
          documentURL: documentURLToSubmit, // Use the combined value
          currentPosition: alumniForm.position || "",
          company: alumniForm.company || "",
          skills: alumniForm.skills || [],
        };
      }
      
      console.log("Formatted data being sent:", formattedData);
      
      // Endpoint URL based on role and auth type
      let url;
      if (googleAuthData) {
        url = role === "student" 
          ? "http://localhost:5000/api/students/register-google" 
          : "http://localhost:5000/api/alumni/register-google";
      } else {
        url = role === "student" 
          ? "http://localhost:5000/api/students/register" 
          : "http://localhost:5000/api/alumni/register";
      }
      
      // Make the API call
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });
      
      // Get the raw response text first
      const responseText = await response.text();
      console.log(`Server response (${response.status}):`, responseText);
      
      // Then try to parse it as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Error parsing response as JSON:", e);
        data = { message: responseText || "Unknown server error" };
      }
      
      if (response.ok) {
        // Add more debugging logs
        console.log("Registration response received:", data);
        
        // Store authentication data
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", role);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", name);
        
        // For alumni, set the pending verification flag
        if (role === "alumni") {
          // Set the verification pending flag
          localStorage.setItem("pendingVerification", "true");
          toast.success("Registration successful! Your account is pending verification.");
          
          // Redirect to verification pending page immediately
          window.location.href = "/verification-pending";
        } else {
          // For students, redirect to student dashboard
          toast.success("Registration successful!");
          setTimeout(() => {
            window.location.href = "/student-dashboard";
          }, 1000);
        }
      } else {
        // Extract and display meaningful error messages
        let errorMessage = "Registration failed. Please check your form and try again.";
        
        if (data.message) {
          // Handle specific error cases
          if (data.message.includes("duplicate key error") && data.message.includes("email")) {
            errorMessage = "This email is already registered or has a pending verification request";
          } else if (data.message.includes("password") && data.message.includes("minimum allowed length")) {
            errorMessage = "Password must be at least 6 characters long";
          } else if (data.message.includes("already registered")) {
            errorMessage = "This email is already registered";
          } else {
            // Remove technical details from error messages
            errorMessage = data.message.split('.')[0]; // Just take the first sentence
          }
        }
        
        toast.error(errorMessage);
        console.error("Registration failed:", data);
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Switch between login and register forms
  const handleSwitchType = () => {
    // Reset step when switching form types
    setStep(1);
    if (onSwitchType) {
      onSwitchType(type === "login" ? "register" : "login");
    }
  };

  // Fix the handleAlumniVerificationUpload function
  const handleAlumniVerificationUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file first
    if (!validateDocument(file)) {
      return;
    }

    // Add visual feedback that upload is starting
    toast.info("Uploading document...");
    setIsUploading(true);

    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('verificationDocument', file);

      console.log("Uploading file:", file.name, file.type, file.size);

      // Use absolute URL to ensure we're hitting the right endpoint
      const response = await axios.post('http://localhost:5000/api/upload/verification', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      console.log("Upload response:", response.data);

      if (response.data && response.data.documentURL) {
        const documentURL = response.data.documentURL;
        
        // Save the document
        setAlumniDocument(file);
        
        // Update both state objects with the document URL
        setAlumniForm(prev => ({
          ...prev,
          documentURL: documentURL
        }));
        
        setFormData(prev => ({
          ...prev,
          documentURL: documentURL
        }));
        
        // Provide clear feedback to the user
        toast.success('Document uploaded successfully');
        console.log("Document URL set to:", documentURL);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error(error.response?.data?.message || 'Failed to upload document');
      
      // Clear the file input in case of error
      const fileInput = document.getElementById('verification-document');
      if (fileInput) fileInput.value = '';
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full mx-auto rounded-xl animate-scale-in">
      <div className="text-center mb-5">
        <h2 className="text-xl font-bold mb-1">
          {type === "login" 
            ? "Welcome Back" 
            : step === 1 
              ? "Create your account" 
              : role === "student" 
                ? "Student Registration" 
                : "Alumni Registration"}
        </h2>
        <p className="text-muted-foreground text-sm">
          {type === "login" 
            ? "Enter your credentials to access your account" 
            : step === 1 
              ? "Join the alumni-student community" 
              : "Please complete your profile information"}
        </p>
      </div>

      {/* Step 1: Basic Info Form */}
      {(type === "login" || (type === "register" && step === 1)) && (
        <form className="space-y-6" onSubmit={handleInitialSubmit}>
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

          {/* Role select for both login and register */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{type === "login" ? "Login as" : "Register as"}</label>
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
              {type === "login" ? "Sign In" : "Continue"}
            </span>
            <div className="absolute inset-0 bg-white/10 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </form>
      )}

      {/* Step 2: Student Registration Form - Add debugging log */}
      {type === "register" && step === 2 && role === "student" && (
        <>
          {console.log("Rendering STUDENT form with role:", role)}
          <form className="space-y-4" onSubmit={handleFinalSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Registration Number */}
            <div className="space-y-1">
              <label htmlFor="registrationNumber" className="text-xs font-medium">Registration No. <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <Hash className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="registrationNumber"
                  name="registrationNumber"
                  type="text"
                  required
                  className="block w-full pl-8 px-3 py-2 text-sm bg-background border border-input rounded-md focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  placeholder="ST12345"
                  value={studentForm.registrationNumber}
                  onChange={handleStudentFormChange}
                />
              </div>
            </div>

            {/* Current Year */}
            <div className="space-y-1">
              <label htmlFor="currentYear" className="text-xs font-medium">Current Year <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  id="currentYear"
                  name="currentYear"
                  required
                  className="block w-full pl-8 px-3 py-2 text-sm bg-background border border-input rounded-md focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  value={studentForm.currentYear}
                  onChange={handleStudentFormChange}
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="5">5th Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* University & College Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Branch */}
            <div className="space-y-1">
              <label htmlFor="branch" className="text-xs font-medium">Branch <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="branch"
                  name="branch"
                  type="text"
                  required
                  className="block w-full pl-8 px-3 py-2 text-sm bg-background border border-input rounded-md focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  placeholder="Computer Science"
                  value={studentForm.branch}
                  onChange={handleStudentFormChange}
                />
              </div>
            </div>

            {/* University & College */}
            <div className="space-y-1">
              <label htmlFor="university" className="text-xs font-medium">University <span className="text-red-500">*</span></label>
              <input
                id="university"
                name="university"
                type="text"
                required
                className="block w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                placeholder="Your University"
                value={studentForm.university}
                onChange={handleStudentFormChange}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="college" className="text-xs font-medium">College <span className="text-red-500">*</span></label>
              <input
                id="college"
                name="college"
                type="text"
                required
                className="block w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                placeholder="Your College"
                value={studentForm.college}
                onChange={handleStudentFormChange}
              />
            </div>
          </div>

          {/* Skills - Simplified */}
          <div className="space-y-1">
            <label htmlFor="skills" className="text-xs font-medium">Skills (Optional)</label>
            <div className="flex gap-2">
              <input
                id="newSkill"
                name="newSkill"
                type="text"
                className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                placeholder="Add skills (press Enter)"
                value={studentForm.newSkill}
                onChange={handleStudentFormChange}
                onKeyDown={(e) => handleKeyDown(e, true)}
              />
              <button
                type="button"
                onClick={() => addSkill(true)}
                className="px-3 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Add
              </button>
            </div>
            {studentForm.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {studentForm.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill, true)}
                      className="ml-1 hover:text-red-500"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-foreground rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create Account
            </button>
          </div>
        </form>
        </>
      )}

      {/* Step 2: Alumni Registration Form - COMPLETELY REDESIGNED */}
      {type === "register" && step === 2 && role === "alumni" && (
        <>
          {console.log("Rendering ALUMNI form with role:", role)}
          <form className="space-y-3" onSubmit={handleFinalSubmit}>
          <div className="space-y-3">
            <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg">
              <h3 className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-2">Education</h3>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label htmlFor="branch" className="text-xs font-medium">Field of Study *</label>
                  <input
                    id="branch"
                    name="branch"
                    type="text"
                    required
                    className="block w-full px-2 py-1.5 text-xs bg-white border border-input rounded-md"
                    placeholder="Computer Science"
                    value={alumniForm.branch}
                    onChange={handleAlumniFormChange}
                  />
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="graduationYear" className="text-xs font-medium">Graduation Year *</label>
                  <input
                    id="graduationYear"
                    name="graduationYear"
                    type="number"
                    min={1950}
                    max={new Date().getFullYear()}
                    required
                    className="block w-full px-2 py-1.5 text-xs bg-white border border-input rounded-md"
                    placeholder="2020"
                    value={alumniForm.graduationYear}
                    onChange={handleAlumniFormChange}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="space-y-1">
                <label htmlFor="university" className="text-xs font-medium">University *</label>
                <input
                  id="university"
                  name="university"
                  type="text"
                  required
                  className="block w-full px-2 py-1.5 text-xs bg-white border border-input rounded-md"
                  placeholder="University name"
                  value={alumniForm.university}
                  onChange={handleAlumniFormChange}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="college" className="text-xs font-medium">College *</label>
                <input
                  id="college"
                  name="college"
                  type="text"
                  required
                  className="block w-full px-2 py-1.5 text-xs bg-white border border-input rounded-md"
                  placeholder="College name"
                  value={alumniForm.college}
                  onChange={handleAlumniFormChange}
                />
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg">
              <h3 className="text-xs font-medium text-green-800 dark:text-green-300 mb-2">Professional Information</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label htmlFor="company" className="text-xs font-medium">Company</label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    className="block w-full px-2 py-1.5 text-xs bg-white border border-input rounded-md"
                    placeholder="E.g., Google"
                    value={alumniForm.company}
                    onChange={handleAlumniFormChange}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="position" className="text-xs font-medium">Position</label>
                  <input
                    id="position"
                    name="position"
                    type="text"
                    className="block w-full px-2 py-1.5 text-xs bg-white border border-input rounded-md"
                    placeholder="E.g., Software Engineer"
                    value={alumniForm.position}
                    onChange={handleAlumniFormChange}
                  />
                </div>
              </div>
            </div>

            {/* Skills - Simplified */}
            <div className="space-y-1">
              <label htmlFor="newSkill" className="text-xs font-medium">Skills (Optional)</label>
              <div className="flex gap-2">
                <input
                  id="newSkill"
                  name="newSkill"
                  type="text"
                  className="flex-1 px-3 py-2 text-xs bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  placeholder="Add skills (press Enter)"
                  value={alumniForm.newSkill}
                  onChange={handleAlumniFormChange}
                  onKeyDown={(e) => handleKeyDown(e, false)}
                />
                <button
                  type="button"
                  onClick={() => addSkill(false)}
                  className="px-3 py-2 text-xs bg-primary text-white rounded-md"
                >
                  Add
                </button>
              </div>
              {alumniForm.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {alumniForm.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill, false)}
                        className="ml-1 hover:text-red-500"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Verification Document - Simplified */}
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-3">
            <div className="flex items-center justify-between">
              <label htmlFor="verification-document" className="block text-xs font-medium mb-1">
                Verification Document <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500">Upload degree certificate or alumni ID</p>
            </div>
            
            {/* Add visual upload status indicator */}
            {(formData.documentURL || alumniForm.documentURL) ? (
              <div className="mt-2 mb-2">
                <div className="flex items-center p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400 mr-2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span className="text-xs text-green-700 dark:text-green-400">Document uploaded successfully</span>
                  <button 
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, documentURL: "" }));
                      setAlumniForm(prev => ({ ...prev, documentURL: "" }));
                    }}
                    className="ml-auto text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {/* Show filename if available */}
                  {alumniDocument ? alumniDocument.name : "Document ready for submission"}
                </p>
              </div>
            ) : (
              <>
                <label
                  htmlFor="verification-document"
                  className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    isUploading
                      ? "bg-gray-200 text-gray-500"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </label>
                {documentError && (
                  <p className="text-xs text-red-500 mt-1">{documentError}</p>
                )}
              </>
            )}
            
            <input
              type="file"
              id="verification-document"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleAlumniVerificationUpload}
              disabled={isUploading || formData.documentURL || alumniForm.documentURL}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-foreground rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              disabled={isUploading || isSubmitting}
            >
              {isSubmitting ? "Creating Profile..." : "Create Profile"}
            </button>
          </div>
        </form>
        </>
      )}

      {/* Registration completion message */}
      {type === "register" && step === 2 && role === "alumni" && isSubmitting && (
        <div className="space-y-6 text-center py-4">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-sm text-muted-foreground">Creating your profile...</p>
        </div>
      )}
    </div>
  );
});

// Add displayName for better debugging
AuthForm.displayName = "AuthForm";

export default AuthForm;