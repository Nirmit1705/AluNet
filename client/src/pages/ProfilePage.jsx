import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { FormField } from '../components/ui/FormField';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import DashboardNavbar from '../components/DashboardNavbar';
import axios from 'axios';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);
  
  // Portfolio state management
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [activePortfolioItem, setActivePortfolioItem] = useState(null);
  
  // Sample user data - in a real app, this would be fetched from an API
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Get user type from localStorage
    const storedUserType = localStorage.getItem('userType');
    if (!storedUserType) {
      // Redirect to login if no user type is found
      navigate('/login');
      return;
    }
    
    setUserType(storedUserType);
    
    // Fetch user data from localStorage
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Get token and user type from localStorage
        const token = localStorage.getItem('token');
        const userTypeFromStorage = localStorage.getItem('userType');
        
        if (!token || !userTypeFromStorage) {
          console.error('Auth token or user type not found');
          setError('Please login to view your profile');
          setIsLoading(false);
          return;
        }
        
        setUserType(userTypeFromStorage);
        
        // Set up config with auth header
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };
        
        // Determine API endpoint based on user type
        const endpoint = userTypeFromStorage === 'alumni' 
          ? 'http://localhost:5000/api/alumni/profile'
          : 'http://localhost:5000/api/students/profile';
        
        // Fetch user profile from API
        const response = await axios.get(endpoint, config);
        
        if (response.data) {
          console.log(`${userTypeFromStorage} data from API:`, response.data);
          setUserData(response.data);
          setFormData(response.data);
        } else {
          throw new Error('No data received from server');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        
        if (error.response && error.response.status === 401) {
          setError('Your session has expired. Please login again.');
        } else {
          setError('Error loading profile data. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Set authorization header
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      // Determine API endpoint based on user type
      const endpoint = userType === 'alumni' 
        ? 'http://localhost:5000/api/alumni/profile'
        : 'http://localhost:5000/api/students/profile';
      
      // Send update request to API
      const response = await axios.put(endpoint, formData, config);
      
      if (response.data) {
        console.log('Profile updated successfully:', response.data);
        // Update local state with new data
        setUserData(response.data);
        setFormData(response.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Portfolio item functions
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (!files.length) return;
    
    const file = files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
      alert('File type not allowed. Please select an image, PDF, or document file.');
      return;
    }
    
    setIsUploading(true);
    
    // Simulate file upload with progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          const fileType = file.type.startsWith('image/') ? 'image' : 'document';
          let fileUrl;
          
          if (fileType === 'image') {
            fileUrl = URL.createObjectURL(file);
          } else {
            fileUrl = '#'; // In a real app, this would be the URL to the uploaded file
          }
          
          const newItem = {
            id: `p${Date.now()}`,
            title: file.name.split('.')[0],
            description: '',
            link: '',
            fileType,
            fileUrl,
            file, // Store the actual file for form submission
            uploadDate: new Date().toISOString().split('T')[0]
          };
          
          setPortfolioItems(prev => [...prev, newItem]);
          setActivePortfolioItem(newItem);
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);
      }
    }, 200);
  };
  
  const updatePortfolioItem = (id, updates) => {
    setPortfolioItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
    
    if (activePortfolioItem && activePortfolioItem.id === id) {
      setActivePortfolioItem(prev => ({ ...prev, ...updates }));
    }
  };
  
  const deletePortfolioItem = (id) => {
    if (window.confirm('Are you sure you want to delete this portfolio item?')) {
      setPortfolioItems(prev => prev.filter(item => item.id !== id));
      if (activePortfolioItem && activePortfolioItem.id === id) {
        setActivePortfolioItem(null);
      }
    }
  };
  
  // Helper function to get initials from name
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // Helper function to extract correct field values with proper fallbacks
  const getFieldValue = (data, fieldOptions, defaultValue = '') => {
    if (!data) return defaultValue;
    
    for (const field of fieldOptions) {
      if (data[field] !== undefined && data[field] !== null) {
        return data[field];
      }
    }
    
    return defaultValue;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Unable to load profile. Please log in again.</p>
          <Button className="mt-4" onClick={() => window.location.href = '/login'}>Go to Login</Button>
        </div>
      </div>
    );
  }

  // Show error message if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
          <div className="mb-6 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Profile Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => window.location.href = '/login'}
              className="py-2 px-4 bg-primary-blue text-white rounded hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
            <button
              onClick={() => window.location.reload()}
              className="py-2 px-4 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderAlumniProfileFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-500 text-left">Full Name</label>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
            />
          ) : (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <p className="text-gray-900 font-medium">{getFieldValue(userData, ['name', 'fullName', 'userName'], 'N/A')}</p>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-500 text-left">Email</label>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
            />
          ) : (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <p className="text-gray-900 font-medium">{getFieldValue(userData, ['email'], 'N/A')}</p>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-500 text-left">Graduation Year</label>
          {isEditing ? (
            <input
              type="text"
              name="batch"
              value={formData.batch || formData.graduationYear || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
            />
          ) : (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="7"></circle>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
              </svg>
              <p className="text-gray-900 font-medium">{getFieldValue(userData, ['batch', 'graduationYear'], 'N/A')}</p>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-500 text-left">Branch</label>
          {isEditing ? (
            <input
              type="text"
              name="branch"
              value={formData.branch || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
            />
          ) : (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 20V10"></path>
                <path d="M12 20V4"></path>
                <path d="M6 20v-6"></path>
              </svg>
              <p className="text-gray-900 font-medium">{getFieldValue(userData, ['branch'], 'N/A')}</p>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-500 text-left">Current Company</label>
          {isEditing ? (
            <input
              type="text"
              name="currentCompany"
              value={formData.currentCompany || formData.company || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
            />
          ) : (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <p className="text-gray-900 font-medium">{getFieldValue(userData, ['currentCompany', 'company', 'employer', 'organization'], 'N/A')}</p>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-500 text-left">Current Position</label>
          {isEditing ? (
            <input
              type="text"
              name="position"
              value={formData.position || formData.currentPosition || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
            />
          ) : (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              <p className="text-gray-900 font-medium">{getFieldValue(userData, ['position', 'currentPosition', 'designation', 'jobTitle'], 'N/A')}</p>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-500 text-left">Years of Experience</label>
          {isEditing ? (
            <input
              type="number"
              name="experience"
              value={formData.experience || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
            />
          ) : (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <p className="text-gray-900 font-medium">{getFieldValue(userData, ['experience', 'yearsOfExperience'], 'N/A')}</p>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-500 text-left">Phone</label>
          {isEditing ? (
            <input
              type="tel"
              name="phone"
              value={formData.phone || formData.phoneNumber || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
            />
          ) : (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <p className="text-gray-900 font-medium">{getFieldValue(userData, ['phone', 'phoneNumber', 'contact'], 'N/A')}</p>
            </div>
          )}
        </div>
      </div>
      <div className="mt-8 border-t pt-6">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-500 mb-2 text-left">Bio</label>
          {isEditing ? (
            <textarea
              name="bio"
              value={formData.bio || ''}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
            ></textarea>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-gray-700 leading-relaxed">{getFieldValue(userData, ['bio', 'about', 'description'], 'No bio available.')}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  const renderStudentProfileFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-500 text-left">Full Name</label>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
            />
          ) : (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <p className="text-gray-900 font-medium">{getFieldValue(userData, ['name', 'fullName', 'userName'], 'N/A')}</p>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-500 text-left">Email</label>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
            />
          ) : (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <p className="text-gray-900 font-medium">{getFieldValue(userData, ['email'], 'N/A')}</p>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-500 text-left">Current Year</label>
          {isEditing ? (
            <input
              type="text"
              name="currentYear"
              value={formData.currentYear || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
            />
          ) : (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-gray-900 font-medium">{getFieldValue(userData, ['currentYear', 'year', 'semester'], 'N/A')}</p>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-500 text-left">Branch</label>
          {isEditing ? (
            <input
              type="text"
              name="branch"
              value={formData.branch || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
            />
          ) : (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 20V10"></path>
                <path d="M12 20V4"></path>
                <path d="M6 20v-6"></path>
              </svg>
              <p className="text-gray-900 font-medium">{getFieldValue(userData, ['branch', 'department'], 'N/A')}</p>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-500 text-left">Skills</label>
          {isEditing ? (
            <input
              type="text"
              name="skills"
              value={formData.skills || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
              placeholder="Separate skills with commas"
            />
          ) : (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
              <p className="text-gray-900 font-medium">{getFieldValue(userData, ['skills', 'abilities'], 'N/A')}</p>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-500 text-left">Phone</label>
          {isEditing ? (
            <input
              type="tel"
              name="phone"
              value={formData.phone || formData.phoneNumber || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
            />
          ) : (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <p className="text-gray-900 font-medium">{getFieldValue(userData, ['phone', 'phoneNumber', 'contact'], 'N/A')}</p>
            </div>
          )}
        </div>
      </div>
      <div className="mt-8 border-t pt-6">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-500 mb-2 text-left">Bio</label>
          {isEditing ? (
            <textarea
              name="bio"
              value={formData.bio || ''}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
            ></textarea>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-gray-700 leading-relaxed">{getFieldValue(userData, ['bio', 'about', 'description'], 'No bio available.')}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar userType={userType} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header Card */}
          <Card className="mb-6 overflow-hidden">
            <div className={`h-32 ${userType === 'alumni' 
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600' 
              : 'bg-gradient-to-r from-gray-800 to-gray-100'
            }`}></div>
            <div className="px-6 pb-6 relative">
              <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-4">
                <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg mr-6">
                  <div className={`w-full h-full rounded-full flex items-center justify-center text-3xl font-bold ${
                    userType === 'alumni' 
                      ? 'bg-blue-200 text-blue-800' 
                      : 'bg-gray-200 text-gray-800'
                  }`}>
                    {getInitials(getFieldValue(userData, ['name', 'fullName', 'userName'], ''))}
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <h2 className="text-2xl font-bold text-gray-800">{getFieldValue(userData, ['name', 'fullName', 'userName'], 'User')}</h2>
                  <p className="text-gray-600">
                    {userType === 'alumni' 
                      ? `${getFieldValue(userData, ['position', 'currentPosition', 'designation'], 'Professional')} at ${getFieldValue(userData, ['currentCompany', 'company', 'employer'], 'Company')}`
                      : `${getFieldValue(userData, ['branch'], 'Student')} - Year ${getFieldValue(userData, ['currentYear', 'year'], '')}`
                    }
                  </p>
                </div>
                <div className="ml-auto mt-4 md:mt-0">
                  {isEditing ? (
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSubmit}>
                        Save Changes
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 mt-2">
                {userType === 'alumni' ? (
                  <>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      Alumni
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="7"></circle>
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                      </svg>
                      Class of {getFieldValue(userData, ['batch', 'graduationYear'], '2020')}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      Student
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Year {getFieldValue(userData, ['currentYear', 'year'], '3')}
                    </span>
                  </>
                )}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 20V10"></path>
                    <path d="M12 20V4"></path>
                    <path d="M6 20v-6"></path>
                  </svg>
                  {getFieldValue(userData, ['branch'], 'Computer Science')}
                </span>
              </div>
            </div>
          </Card>
          
          {/* Profile Details Card */}
          <Card>
            <CardHeader className="pb-6 border-b">
              <CardTitle className="text-xl flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Profile Information
              </CardTitle>
              <CardDescription>Your {userType === 'alumni' ? 'professional' : 'academic'} information and contact details</CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6">
              {userType === 'alumni' ? renderAlumniProfileFields() : renderStudentProfileFields()}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage; 