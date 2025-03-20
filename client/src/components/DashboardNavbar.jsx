import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { logout } from '../utils/api';

const DashboardNavbar = ({ userType = 'alumni' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Use the logout function from auth.js
    logout();
    // Redirect to login page
    navigate('/login', { state: { message: 'You have been logged out successfully.' } });
  };

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary-blue flex items-center">
              <span className="text-primary-blue mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </span>
              AluNet
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to={`/${userType}/dashboard`} 
              className="px-3 py-2 text-gray-700 hover:text-primary-blue transition-colors"
            >
              Dashboard
            </Link>
            
            {userType === 'alumni' ? (
              <>
                <Link 
                  to="/jobs" 
                  className="px-3 py-2 text-gray-700 hover:text-primary-blue transition-colors"
                >
                  Job Postings
                </Link>
                <Link 
                  to="/mentorships" 
                  className="px-3 py-2 text-gray-700 hover:text-primary-blue transition-colors"
                >
                  Mentorships
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/jobs" 
                  className="px-3 py-2 text-gray-700 hover:text-primary-blue transition-colors"
                >
                  Job Opportunities
                </Link>
                <Link 
                  to="/mentors" 
                  className="px-3 py-2 text-gray-700 hover:text-primary-blue transition-colors"
                >
                  Find Mentors
                </Link>
                <Link 
                  to="/portfolio" 
                  className="px-3 py-2 text-gray-700 hover:text-primary-blue transition-colors"
                >
                  Portfolio
                </Link>
              </>
            )}
            
            <Link 
              to="/messages" 
              className="px-3 py-2 text-gray-700 hover:text-primary-blue transition-colors"
            >
              Messages
            </Link>
            
            <div className="relative ml-3">
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Logout
                </Button>
                <Link to="/profile" className="some-class">
                  <Button variant="outline" size="sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-blue focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
            <Link
              to={`/${userType}/dashboard`}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-blue"
            >
              Dashboard
            </Link>
            
            {userType === 'alumni' ? (
              <>
                <Link
                  to="/jobs"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-blue"
                >
                  Job Postings
                </Link>
                <Link
                  to="/mentorships"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-blue"
                >
                  Mentorships
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/jobs"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-blue"
                >
                  Job Opportunities
                </Link>
                <Link
                  to="/mentors"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-blue"
                >
                  Find Mentors
                </Link>
                <Link
                  to="/portfolio"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-blue"
                >
                  Portfolio
                </Link>
              </>
            )}
            
            <Link
              to="/messages"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-blue"
            >
              Messages
            </Link>
            
            <Link
              to="/profile"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-blue"
            >
              Profile
            </Link>
            
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-blue"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default DashboardNavbar; 