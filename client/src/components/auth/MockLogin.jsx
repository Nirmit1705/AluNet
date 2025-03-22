import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUniversity } from '../../context/UniversityContext';
import { School, LogIn, User, GraduationCap } from 'lucide-react';

const universities = [
  "Stanford University",
  "University of Washington",
  "Columbia University",
  "Carnegie Mellon University",
  "MIT",
  "Harvard University",
  "UC Berkeley"
];

const MockLogin = () => {
  const navigate = useNavigate();
  const { setUserUniversityInfo, userUniversity } = useUniversity();
  const [selectedUniversity, setSelectedUniversity] = useState(
    userUniversity || (localStorage.getItem('userUniversity') || '')
  );
  const [userRole, setUserRole] = useState(
    localStorage.getItem('userRole') || 'student'
  );
  const [userName, setUserName] = useState(
    localStorage.getItem('userName') || ''
  );
  const [userEmail, setUserEmail] = useState(
    localStorage.getItem('userEmail') || ''
  );

  const handleUniversityChange = (e) => {
    setSelectedUniversity(e.target.value);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Set university context and localStorage
    setUserUniversityInfo(selectedUniversity);
    
    // Set other user info in localStorage
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('userName', userName || 'Test User');
    localStorage.setItem('userEmail', userEmail || 'user@example.com');
    
    // Navigate to dashboard
    navigate(userRole === 'student' ? '/student-dashboard' : '/alumni-dashboard');
  };

  return (
    <div className="max-w-lg mx-auto mt-16 p-8 border rounded-xl shadow-sm">
      <div className="flex items-center justify-center mb-8">
        <School className="w-10 h-10 text-primary mr-3" />
        <h1 className="text-2xl font-bold">University Network</h1>
      </div>
      
      <h2 className="text-xl font-semibold mb-6 text-center">Test Login</h2>
      
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Name</label>
          <div className="relative">
            <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your Name"
              className="pl-10 w-full py-2 px-3 border rounded-lg"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="w-full py-2 px-3 border rounded-lg"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">
            University <span className="text-gray-500">(for filtering)</span>
          </label>
          <div className="relative">
            <GraduationCap className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedUniversity}
              onChange={handleUniversityChange}
              className="pl-10 w-full py-2 px-3 border rounded-lg appearance-none"
            >
              <option value="">Select a university</option>
              {universities.map((university) => (
                <option key={university} value={university}>
                  {university}
                </option>
              ))}
            </select>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            This will filter alumni/mentors to your university
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Account Type</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="student"
                checked={userRole === 'student'}
                onChange={() => setUserRole('student')}
                className="mr-2"
              />
              <span>Student</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="alumni"
                checked={userRole === 'alumni'}
                onChange={() => setUserRole('alumni')}
                className="mr-2"
              />
              <span>Alumni</span>
            </label>
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full py-2 px-4 bg-primary text-white rounded-lg flex items-center justify-center"
        >
          <LogIn className="w-5 h-5 mr-2" />
          Sign In
        </button>
      </form>
    </div>
  );
};

export default MockLogin; 