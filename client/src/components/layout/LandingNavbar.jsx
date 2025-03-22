import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";

const LandingNavbar = ({ onLoginClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
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

  // Check if dark mode preference is stored
  useEffect(() => {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
      localStorage.setItem("darkMode", "false");
    } else {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
      localStorage.setItem("darkMode", "true");
    }
  };

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

          {/* Right side with Sign In button and dark mode toggle */}
          <div className="flex items-center space-x-4">
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
            <button 
              onClick={onLoginClick}
              className="button-primary animate-fade-in"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar; 