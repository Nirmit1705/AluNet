import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Briefcase, ChevronDown, Calendar, BookOpen, Building, School, Hash } from "lucide-react";
import { toast } from "sonner";

// Update your AuthForm component declaration
const AuthForm = forwardRef(({ 
  type, 
  onSuccess, 
  onSwitchType, 
  googleAuthData: initialGoogleData, 
  initialStep = 1 
}, ref) => {

  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [email, setEmail] = useState(initialGoogleData?.email || "");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(initialGoogleData?.name || "");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(initialStep); // Use initialStep
  const [googleAuthData, setGoogleAuthData] = useState(initialGoogleData || null);
  const [alumniDocument, setAlumniDocument] = useState(null);
  const [documentError, setDocumentError] = useState("");
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const navigate = useNavigate();
  
  // Set Google auth data when it changes through props
  useEffect(() => {
    if (initialGoogleData) {
      setEmail(initialGoogleData.email || "");
      setName(initialGoogleData.name || "");
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

  const selectRole = (newRole) => {
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
      // Check if it's admin login
      if (email === "verify@admin.com") {
        try {
          console.log("Attempting admin login...");
          
          // First try API login
          try {
            // Make API call to admin login endpoint
            const response = await fetch("http://localhost:5000/api/admin/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email,
                password
              }),
            });
            
            if (response.ok) {
              const data = await response.json();
              
              // Store admin data and token
              localStorage.setItem("token", data.token);
              localStorage.setItem("userRole", "admin");
              localStorage.setItem("userEmail", email);
              localStorage.setItem("userName", data.name || "Admin");
              
              toast.success("Logged in as administrator!");
              
              // Call the onSuccess callback if provided
              if (onSuccess) {
                onSuccess();
              }
              
              // Navigate to the admin dashboard
              navigate("/admin-dashboard");
              return;
            }
          } catch (apiError) {
            console.error("API admin login failed, falling back to local:", apiError);
          }
          
          // Fall back to local storage approach if API fails
          if (password === "admin123") {
            // Set admin role
            localStorage.setItem("token", `admin-token-${Date.now()}`);
            localStorage.setItem("userRole", "admin");
            localStorage.setItem("userEmail", email);
            localStorage.setItem("userName", "Admin");
            
            toast.success("Logged in as administrator (local)!");
            
            // Call the onSuccess callback if provided
            if (onSuccess) {
              onSuccess();
            }
            
            // Navigate to the admin dashboard
            navigate("/admin-dashboard");
          } else {
            toast.error("Invalid admin credentials");
          }
          return;
        } catch (error) {
          console.error("Admin login error:", error);
          toast.error("Failed to log in as admin. Please try again.");
          return;
        }
      }
      
      // Continue with existing student/alumni login logic
      // In a real application, this would be an API call
      const userData = {
        email,
        password,
        role
      };
      
      // Simulate API call
      console.log("Logging in with:", userData);
      
      // Store user data in localStorage (in real app, you'd store a token)
      localStorage.setItem("token", `mock-token-${Date.now()}`);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userEmail", email);
      
      toast.success("Logged in successfully!");
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Navigate to the dashboard
      navigate(role === "student" ? "/student-dashboard" : "/alumni-dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to log in. Please check your credentials.");
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

  // Update the handleFinalSubmit function for better alumni profile handling
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Basic validation
      if (role === "alumni" && !validateDocument(alumniDocument)) {
        return;
      }
      
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
        // Alumni validation
        if (!alumniForm.graduationYear) {
          toast.error("Graduation year is required");
          return;
        }
        
        if (!alumniForm.branch) {
          toast.error("Branch is required");
          return;
        }
        
        if (!alumniForm.university) {
          toast.error("University is required");
          return;
        }
        
        if (!alumniForm.college) {
          toast.error("College is required");
          return;
        }
        
        formattedData = {
          name,
          email,
          // For Google auth, include googleId and omit password entirely
          ...(googleAuthData ? { googleId: googleAuthData.googleId } : { password }),
          education: { // Structure education data properly
            branch: alumniForm.branch,
            university: alumniForm.university,
            college: alumniForm.college,
            graduationYear: parseInt(alumniForm.graduationYear) || 2020
          },
          currentPosition: alumniForm.position || "",
          company: alumniForm.company || "",
          skills: alumniForm.skills || [],
          isAlumni: true // Explicitly mark as alumni
        };
      }
      
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
      
      console.log("Sending registration data:", formattedData); // Log the data being sent
      
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
        // Store basic user info for UI needs
        localStorage.setItem("userRole", role);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", name);
        
        // Store token if provided
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        
        // Check if email is already verified (Google auth flow)
        if (data.isEmailVerified || googleAuthData) {
          toast.success("Account created successfully! You can now log in.");
          
          // Call the onSuccess callback if provided
          if (onSuccess) {
            onSuccess();
          }
          
          // Navigate directly to dashboard
          navigate(role === "student" ? "/student-dashboard" : "/alumni-dashboard");
        } else {
          // Show verification pending message
          toast.success("Account created successfully! Please check your email to verify your account.");
          
          // Navigate to verification pending page
          navigate("/verification-pending");
        }
      } else {
        // Extract and display meaningful error messages
        let errorMessage = "Registration failed. Please check your form and try again.";
        
        if (data.message) {
          // Handle specific validation errors
          if (data.message.includes("password") && data.message.includes("minimum allowed length")) {
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

  return (
    <div className="w-full max-w-md mx-auto glass-card rounded-2xl p-8 sm:p-10 animate-scale-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">
          {type === "login" 
            ? "Welcome Back" 
            : step === 1 
              ? "Create your account" 
              : role === "student" 
                ? "Student Registration" 
                : "Alumni Registration"}
        </h2>
        <p className="text-muted-foreground">
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

          {/* Role select is only shown for register, not for login */}
          {type === "register" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Register as</label>
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
              {type === "login" ? "Sign In" : "Continue"}
            </span>
            <div className="absolute inset-0 bg-white/10 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </form>
      )}

      {/* Step 2: Student Registration Form */}
      {type === "register" && step === 2 && role === "student" && (
        <form className="space-y-6" onSubmit={handleFinalSubmit}>
          {/* Registration Number */}
          <div className="space-y-2">
            <label htmlFor="registrationNumber" className="text-sm font-medium">
              Registration Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="registrationNumber"
                name="registrationNumber"
                type="text"
                required
                className="block w-full pl-10 px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                placeholder="ST12345"
                value={studentForm.registrationNumber}
                onChange={handleStudentFormChange}
              />
            </div>
          </div>

          {/* Current Year */}
          <div className="space-y-2">
            <label htmlFor="currentYear" className="text-sm font-medium">
              Current Year <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="currentYear"
                name="currentYear"
                required
                className="block w-full pl-10 px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
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

          {/* Branch */}
          <div className="space-y-2">
            <label htmlFor="branch" className="text-sm font-medium">
              Branch <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BookOpen className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="branch"
                name="branch"
                type="text"
                required
                className="block w-full pl-10 px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                placeholder="Computer Science"
                value={studentForm.branch}
                onChange={handleStudentFormChange}
              />
            </div>
          </div>

          {/* University */}
          <div className="space-y-2">
            <label htmlFor="university" className="text-sm font-medium">
              University <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <School className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="university"
                name="university"
                type="text"
                required
                className="block w-full pl-10 px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                placeholder="Your University"
                value={studentForm.university}
                onChange={handleStudentFormChange}
              />
            </div>
          </div>

          {/* College */}
          <div className="space-y-2">
            <label htmlFor="college" className="text-sm font-medium">
              College <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="college"
                name="college"
                type="text"
                required
                className="block w-full pl-10 px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                placeholder="Your College"
                value={studentForm.college}
                onChange={handleStudentFormChange}
              />
            </div>
          </div>

          {/* Graduation Year */}
          <div className="space-y-2">
            <label htmlFor="graduationYear" className="text-sm font-medium">
              Expected Graduation Year <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="graduationYear"
                name="graduationYear"
                type="number"
                min={new Date().getFullYear()}
                max={new Date().getFullYear() + 5}
                required
                className="block w-full pl-10 px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                placeholder={new Date().getFullYear() + 4}
                value={studentForm.graduationYear}
                onChange={handleStudentFormChange}
              />
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <label htmlFor="skills" className="text-sm font-medium">
              Skills
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {studentForm.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
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
            <div className="flex gap-2">
              <input
                id="newSkill"
                name="newSkill"
                type="text"
                className="flex-1 px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                placeholder="Add a skill..."
                value={studentForm.newSkill}
                onChange={handleStudentFormChange}
                onKeyDown={(e) => handleKeyDown(e, true)}
              />
              <button
                type="button"
                onClick={() => addSkill(true)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 py-2.5 bg-gray-200 dark:bg-gray-700 text-foreground rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 button-primary py-2.5 relative overflow-hidden group"
            >
              <span className="relative z-10">Create Account</span>
              <div className="absolute inset-0 bg-white/10 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        </form>
      )}

      {/* Step 2: Alumni Registration Form */}
      {type === "register" && step === 2 && role === "alumni" && (
        <form className="space-y-4" onSubmit={handleFinalSubmit}>
          {/* Educational Background */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <h3 className="font-medium text-blue-800 dark:text-blue-300 text-sm mb-2">Educational Background</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Branch */}
              <div className="space-y-1">
                <label htmlFor="branch" className="text-xs font-medium">
                  Field of Study <span className="text-red-500">*</span>
                </label>
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
                    placeholder="Computer Science, etc."
                    value={alumniForm.branch}
                    onChange={handleAlumniFormChange}
                  />
                </div>
              </div>

              {/* Graduation Year */}
              <div className="space-y-1">
                <label htmlFor="graduationYear" className="text-xs font-medium">
                  Graduation Year <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="graduationYear"
                    name="graduationYear"
                    type="number"
                    min={1950}
                    max={new Date().getFullYear()}
                    required
                    className="block w-full pl-8 px-3 py-2 text-sm bg-background border border-input rounded-md focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    placeholder="2020"
                    value={alumniForm.graduationYear}
                    onChange={handleAlumniFormChange}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {/* University */}
              <div className="space-y-1">
                <label htmlFor="university" className="text-xs font-medium">
                  University <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <School className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="university"
                    name="university"
                    type="text"
                    required
                    className="block w-full pl-8 px-3 py-2 text-sm bg-background border border-input rounded-md focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    placeholder="University name"
                    value={alumniForm.university}
                    onChange={handleAlumniFormChange}
                  />
                </div>
              </div>

              {/* College */}
              <div className="space-y-1">
                <label htmlFor="college" className="text-xs font-medium">
                  College <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <Building className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="college"
                    name="college"
                    type="text"
                    required
                    className="block w-full pl-8 px-3 py-2 text-sm bg-background border border-input rounded-md focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    placeholder="College name"
                    value={alumniForm.college}
                    onChange={handleAlumniFormChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <h3 className="font-medium text-green-800 dark:text-green-300 text-sm mb-2">Professional Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Current Company */}
              <div className="space-y-1">
                <label htmlFor="company" className="text-xs font-medium">
                  Current Company
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <Building className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    className="block w-full pl-8 px-3 py-2 text-sm bg-background border border-input rounded-md focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    placeholder="Google, Microsoft, etc."
                    value={alumniForm.company}
                    onChange={handleAlumniFormChange}
                  />
                </div>
              </div>

              {/* Current Position */}
              <div className="space-y-1">
                <label htmlFor="position" className="text-xs font-medium">
                  Current Position
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="position"
                    name="position"
                    type="text"
                    className="block w-full pl-8 px-3 py-2 text-sm bg-background border border-input rounded-md focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    placeholder="Software Engineer, etc."
                    value={alumniForm.position}
                    onChange={handleAlumniFormChange}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {/* Years of Experience */}
              <div className="space-y-1">
                <label htmlFor="experience" className="text-xs font-medium">
                  Years of Experience
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="experience"
                    name="experience"
                    type="number"
                    min={0}
                    max={50}
                    className="block w-full pl-8 px-3 py-2 text-sm bg-background border border-input rounded-md focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    placeholder="5"
                    value={alumniForm.experience || ""}
                    onChange={handleAlumniFormChange}
                  />
                </div>
              </div>

              {/* Industry */}
              <div className="space-y-1">
                <label htmlFor="industry" className="text-xs font-medium">
                  Industry
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <Building className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="industry"
                    name="industry"
                    type="text"
                    className="block w-full pl-8 px-3 py-2 text-sm bg-background border border-input rounded-md focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                    placeholder="Technology, Finance, etc."
                    value={alumniForm.industry || ""}
                    onChange={handleAlumniFormChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-1">
            <label htmlFor="skills" className="text-xs font-medium">
              Professional Skills
            </label>
            <div className="flex flex-wrap gap-1 mb-2">
              {alumniForm.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
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
            <div className="flex gap-2">
              <input
                id="newSkill"
                name="newSkill"
                type="text"
                className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                placeholder="Add skills (JavaScript, Python, etc.)"
                value={alumniForm.newSkill}
                onChange={handleAlumniFormChange}
                onKeyDown={(e) => handleKeyDown(e, false)}
              />
              <button
                type="button"
                onClick={() => addSkill(false)}
                className="px-3 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Bio / About - Optional and collapsible */}
          <details className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
            <summary className="text-xs font-medium cursor-pointer">
              Professional Bio (Optional)
            </summary>
            <textarea
              id="bio"
              name="bio"
              rows={2}
              className="mt-2 block w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              placeholder="Tell students about your professional journey..."
              value={alumniForm.bio || ""}
              onChange={handleAlumniFormChange}
            ></textarea>
          </details>

          {/* Mentorship Areas */}
          <details className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
            <summary className="text-xs font-medium cursor-pointer">
              Areas You Can Mentor In (Optional)
            </summary>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
              {[
                'Career Guidance',
                'Technical Skills',
                'Interview Preparation',
                'Resume Review',
                'Industry Insights',
                'Project Feedback',
                'Networking',
                'Graduate Studies'
              ].map((area) => (
                <label key={area} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="mentorshipAreas"
                    value={area}
                    checked={alumniForm.mentorshipAreas?.includes(area) || false}
                    onChange={(e) => {
                      const areas = alumniForm.mentorshipAreas || [];
                      if (e.target.checked) {
                        setAlumniForm(prev => ({
                          ...prev,
                          mentorshipAreas: [...areas, area]
                        }));
                      } else {
                        setAlumniForm(prev => ({
                          ...prev,
                          mentorshipAreas: areas.filter(a => a !== area)
                        }));
                      }
                    }}
                    className="h-3 w-3 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-xs">{area}</span>
                </label>
              ))}
            </div>
          </details>

          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-foreground rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 button-primary py-2 text-sm relative overflow-hidden group"
            >
              <span className="relative z-10">Create Profile</span>
              <div className="absolute inset-0 bg-white/10 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        </form>
      )}

      {/* Add this to the alumni registration form (step 2) */}
      {type === "register" && step === 2 && role === "alumni" && !registrationComplete && (
        <div className="space-y-2 mt-4">
          <label htmlFor="alumniDocument" className="text-sm font-medium">
            Alumni Verification Document <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="alumniDocument"
              name="alumniDocument"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="block w-full px-4 py-2.5 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setAlumniDocument(e.target.files[0]);
                  validateDocument(e.target.files[0]);
                }
              }}
              required
            />
          </div>
          {documentError && (
            <p className="text-sm text-red-500 mt-1">{documentError}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Please upload a copy of your degree certificate, transcript, or any other document that proves you're an alumni of this institution. Supported formats: PDF, JPG, PNG (max 5MB).
          </p>
        </div>
      )}

      {/* Add this for showing completion message for alumni registration */}
      {type === "register" && step === 2 && role === "alumni" && registrationComplete && (
        <div className="space-y-6 text-center py-8">
          <div className="mx-auto rounded-full bg-green-100 dark:bg-green-900/20 p-3 w-16 h-16 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h3 className="text-xl font-bold">Registration Submitted</h3>
          <p className="text-muted-foreground">
            Thank you for registering as an alumni. Your document has been submitted for verification by our administrators. You'll receive an email once your account is verified.
          </p>
          <button
            type="button"
            onClick={() => {
              // Reset the form and navigate to login
              setEmail("");
              setPassword("");
              setName("");
              setConfirmPassword("");
              setAlumniDocument(null);
              setStep(1);
              setRegistrationComplete(false);
              if (onSwitchType) {
                onSwitchType("login");
              }
            }}
            className="w-full button-primary py-2.5 relative overflow-hidden group"
          >
            <span className="relative z-10">Go to Login</span>
            <div className="absolute inset-0 bg-white/10 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </div>
      )}

      {/* Switch between login and register forms */}
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
});

// Add displayName for better debugging
AuthForm.displayName = "AuthForm";

export default AuthForm;