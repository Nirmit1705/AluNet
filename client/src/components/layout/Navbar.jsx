import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Moon, Sun, User, MessageSquare, Briefcase, BarChart2, GraduationCap, ChevronDown, LogOut, Settings } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if user is logged in (this would be replaced with actual auth logic)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Check if user role exists in localStorage
    const storedRole = localStorage.getItem("userRole");
    if (storedRole) {
      setIsLoggedIn(true);
    }
  }, []);
  
  // Check if current page is dashboard
  const isDashboard = location.pathname === "/dashboard" || 
                      location.pathname === "/student-dashboard" || 
                      location.pathname === "/alumni-dashboard";

  // Get current user role
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem("userRole") || "student";
  });

  // Navigate to dashboard based on role
  const goToDashboard = () => {
    if (userRole === "student") {
      navigate("/student-dashboard");
    } else {
      navigate("/alumni-dashboard");
    }
    setUserMenuOpen(false);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  };

  // Check if link is active
  const isActive = (path) => {
    if (path === '/dashboard' || path === '/student-dashboard' || path === '/alumni-dashboard') {
      // Check if we're on any dashboard page
      return location.pathname === '/dashboard' || 
             location.pathname === '/student-dashboard' || 
             location.pathname === '/alumni-dashboard';
    }
    return location.pathname === path;
  };

  // On dashboard, we always show logged in navigation options
  const showLoggedInNav = isLoggedIn || isDashboard;

  // Handle click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/80 dark:bg-gray-950/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-800/50" 
          : "bg-transparent"
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-xl font-semibold flex items-center space-x-2 text-primary"
          >
            <span className="tracking-tight">AlumniConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {showLoggedInNav ? (
              <>
                {/* Home link for logged-in users */}
                <button 
                  onClick={() => goToDashboard()}
                  className={`nav-link ${
                    isActive("/dashboard") 
                      ? "text-primary" 
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Home
                </button>
                <Link 
                  to="/profile" 
                  className={`nav-link ${isActive("/profile") ? "text-primary" : "text-gray-700 dark:text-gray-300"}`}
                >
                  Profile
                </Link>
                <Link 
                  to="/messages" 
                  className={`nav-link ${isActive("/messages") ? "text-primary" : "text-gray-700 dark:text-gray-300"}`}
                >
                  Messages
                </Link>
                <Link 
                  to="/jobs" 
                  className={`nav-link ${isActive("/jobs") ? "text-primary" : "text-gray-700 dark:text-gray-300"}`}
                >
                  Jobs
                </Link>

                {/* User role selector */}
                <div className="relative user-menu-container">
                  <button 
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span className="capitalize">{userRole}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 animate-fade-in">
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium">Account</p>
                      </div>
                      <div className="p-2">
                        <div className="px-3 py-2 text-sm">
                          <p className="font-medium">Logged in as:</p>
                          <div className="flex items-center space-x-2 mt-1 text-primary">
                            {userRole === "student" ? (
                              <>
                                <User className="h-4 w-4" />
                                <span>Student</span>
                              </>
                            ) : (
                              <>
                                <GraduationCap className="h-4 w-4" />
                                <span>Alumni</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                        <button 
                          onClick={() => goToDashboard()}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-md text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <BarChart2 className="h-4 w-4" />
                          <span>Home</span>
                        </button>
                        <button 
                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-md text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </button>
                        <button 
                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-md text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-red-500"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Home link for non-logged-in users */}
                <Link 
                  to="/" 
                  className={`nav-link ${isActive("/") ? "text-primary" : "text-gray-700 dark:text-gray-300"}`}
                >
                  Home
                </Link>
                <Link 
                  to="/login" 
                  className={`nav-link ${isActive("/login") ? "text-primary" : "text-gray-700 dark:text-gray-300"}`}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="button-primary animate-fade-in"
                >
                  Register
                </Link>
              </>
            )}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleDarkMode}
              className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {showLoggedInNav ? (
              <>
                <button
                  onClick={() => {
                    goToDashboard();
                    setIsOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md font-medium ${
                    isActive("/dashboard") 
                      ? "text-primary bg-primary/10" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  } transition-colors`}
                >
                  <div className="flex items-center space-x-2">
                    <BarChart2 className="h-5 w-5" />
                    <span>Home</span>
                  </div>
                </button>
                <Link
                  to="/profile"
                  className={`block px-3 py-2 rounded-md font-medium ${
                    isActive("/profile") 
                      ? "text-primary bg-primary/10" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  } transition-colors`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </div>
                </Link>
                <Link
                  to="/messages"
                  className={`block px-3 py-2 rounded-md font-medium ${
                    isActive("/messages") 
                      ? "text-primary bg-primary/10" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  } transition-colors`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Messages</span>
                  </div>
                </Link>
                <Link
                  to="/jobs"
                  className={`block px-3 py-2 rounded-md font-medium ${
                    isActive("/jobs") 
                      ? "text-primary bg-primary/10" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  } transition-colors`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-5 w-5" />
                    <span>Jobs</span>
                  </div>
                </Link>

                {/* Account status for mobile */}
                <div className="mt-4 px-3 py-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-muted-foreground mb-2">Account Status</p>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-primary/10 rounded-md">
                    {userRole === "student" ? (
                      <>
                        <User className="h-4 w-4 text-primary" />
                        <span className="text-sm text-primary font-medium">Student Account</span>
                      </>
                    ) : (
                      <>
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <span className="text-sm text-primary font-medium">Alumni Account</span>
                      </>
                    )}
                  </div>
                  <div className="mt-2">
                    <button 
                      onClick={() => {
                        goToDashboard();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-md text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <BarChart2 className="h-4 w-4" />
                      <span>Go to Home</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className={`block px-3 py-2 rounded-md font-medium ${
                    isActive("/") 
                      ? "text-primary bg-primary/10" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  } transition-colors`}
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/login"
                  className={`block px-3 py-2 rounded-md font-medium ${
                    isActive("/login") 
                      ? "text-primary bg-primary/10" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  } transition-colors`}
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md bg-primary text-white font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;