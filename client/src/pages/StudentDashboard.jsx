import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import DashboardNavbar from '../components/DashboardNavbar';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  
  // Student mock data - guaranteed fallback
  const STUDENT_MOCK_DATA = {
    name: 'Student User',
    userType: 'student',
    year: '3rd Year',
    branch: 'Computer Engineering',
    enrollmentNumber: 'CE' + Math.floor(10000 + Math.random() * 90000),
    email: 'student@example.com',
    phone: '(555) 987-6543',
    bio: 'Computer Engineering student passionate about technology.'
  };
  
  // Function to guarantee student data shows
  const forceStudentDataReset = () => {
    // Clear any alumni data first
    try {
      const userType = localStorage.getItem('userType');
      const storedUserData = localStorage.getItem('userData');
      
      // Create new student data
      let studentName = 'Student User';
      
      // Try to preserve the user's name if possible
      if (storedUserData) {
        try {
          const parsedData = JSON.parse(storedUserData);
          if (parsedData.name) {
            studentName = parsedData.name;
          }
        } catch (e) {
          console.error('Error parsing stored userData:', e);
        }
      }
      
      // If we have userName in localStorage, use that
      const storedUserName = localStorage.getItem('userName');
      if (storedUserName) {
        studentName = storedUserName;
      }
      
      // Create fresh student data with the name
      const freshStudentData = {
        ...STUDENT_MOCK_DATA,
        name: studentName
      };
      
      // Update localStorage with student data
      localStorage.setItem('userType', 'student');
      localStorage.setItem('userName', studentName);
      localStorage.setItem('userData', JSON.stringify(freshStudentData));
      
      return freshStudentData;
    } catch (error) {
      console.error('Error in forceStudentDataReset:', error);
      return STUDENT_MOCK_DATA;
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
  
  // Helper function to extract field value with fallbacks
  const getFieldValue = (data, fieldOptions, defaultValue = '') => {
    if (!data) return defaultValue;
    
    for (const field of fieldOptions) {
      if (data[field] !== undefined && data[field] !== null) {
        return data[field];
      }
    }
    
    return defaultValue;
  };
  
  // Debug helper function
  const logDebugInfo = () => {
    console.log("Current userData in StudentDashboard:", userData);
    // We can't reference studentData here to avoid circular dependencies
    const nameValue = getFieldValue(userData, ['name', 'fullName', 'userName'], 'Student User');
    console.log("Name value extracted:", nameValue);
  };
  
  // Load user data from localStorage
  useEffect(() => {
    // Completely reset and enforce student data
    const studentData = forceStudentDataReset();
    console.log('Forced student data:', studentData);
    
    // Set the data and remove loading state
    setUserData(studentData);
    setIsLoading(false);
  }, []);
  
  // Now create studentData using useMemo after all helper functions are defined
  const studentData = useMemo(() => {
    // If userData is null, return default values to prevent errors
    if (!userData) {
      console.log("userData is null in useMemo, returning defaults");
      return STUDENT_MOCK_DATA;
    }
    
    // Create a clean student object
    return {
      // Basic student info
      name: userData.name || 'Student User',
      year: userData.year || '3rd Year',
      branch: userData.branch || 'Computer Engineering',
      enrollmentNumber: userData.enrollmentNumber || 'CE19456',
      email: userData.email || 'student@example.com',
      phone: userData.phone || '(555) 987-6543',
      
      // Stats
      stats: {
        mentorConnections: 2,
        savedJobs: 5,
        pendingApplications: 3
      },
      
      // Mentors
      mentors: [
        { id: 1, name: 'John Doe', company: 'Google', position: 'Senior Software Engineer', status: 'Active' },
        { id: 2, name: 'Lisa Wong', company: 'Microsoft', position: 'Product Manager', status: 'Pending' }
      ],
      
      // Jobs
      recentJobs: [
        { id: 1, title: 'Frontend Developer Intern', company: 'Google', location: 'Remote', deadline: '2 days left', saved: true },
        { id: 2, title: 'UX Research Assistant', company: 'Adobe', location: 'San Francisco', deadline: '5 days left', saved: true },
        { id: 3, title: 'Machine Learning Intern', company: 'Microsoft', location: 'Seattle', deadline: '1 week left', saved: false }
      ],
      
      // Events
      events: [
        { id: 1, title: 'Career Fair 2023', date: 'March 25, 2023', type: 'In-person', location: 'University Main Hall' },
        { id: 2, title: 'Tech Interview Workshop', date: 'March 30, 2023', type: 'Online', location: 'Zoom' }
      ]
    };
  }, [userData]);

  // Add this useEffect after the studentData useMemo
  useEffect(() => {
    if (studentData && studentData.name) {
      // This will help debug if we're correctly setting the student name
      document.title = `Student Dashboard - ${studentData.name}`;
      console.log("Dashboard rendered with name:", studentData.name);
    }
  }, [studentData]);

  // Function to handle profile edit
  const startEditing = () => {
    setEditedData({
      name: studentData.name,
      email: studentData.email,
      enrollmentNumber: studentData.enrollmentNumber,
      phone: studentData.phone || '',
      branch: studentData.branch,
      year: studentData.year
    });
    setIsEditing(true);
  };

  const saveProfileChanges = () => {
    // Update userData with edited values
    setUserData(prev => ({
      ...prev,
      ...editedData
    }));
    
    // Save to localStorage
    try {
      localStorage.setItem('userData', JSON.stringify({
        ...userData,
        ...editedData
      }));
      console.log('Updated profile saved to localStorage');
    } catch (err) {
      console.error('Error saving profile to localStorage:', err);
    }
    
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to reset all user data
  const resetStudentData = () => {
    if (window.confirm("This will reset your profile data. Continue?")) {
      // Generate a mock student name
      const mockNames = [
        "Sarah Johnson", "Michael Chen", "Emma Rodriguez", "David Kim", 
        "Olivia Smith", "James Wilson", "Sophia Williams", "Benjamin Davis"
      ];
      const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
      
      // Create fresh student data with random name
      const freshStudentData = {
        ...STUDENT_MOCK_DATA,
        name: randomName,
        email: randomName.toLowerCase().replace(' ', '.') + '@example.com',
        phone: '(555) ' + Math.floor(100 + Math.random() * 900) + '-' + Math.floor(1000 + Math.random() * 9000),
        enrollmentNumber: 'CE' + Math.floor(10000 + Math.random() * 90000),
      };
      
      // Update localStorage
      localStorage.setItem('userType', 'student');
      localStorage.setItem('userName', randomName);
      localStorage.setItem('userData', JSON.stringify(freshStudentData));
      
      // Update state
      setUserData(freshStudentData);
      
      // Force refresh
      window.location.reload();
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Mentor Connections</CardTitle>
                  <CardDescription>Active mentoring relationships</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary-blue">{studentData.stats.mentorConnections}</div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link to="/mentors" className="text-sm text-primary-blue hover:underline">Find more mentors</Link>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Saved Jobs</CardTitle>
                  <CardDescription>Opportunities you're interested in</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary-blue">{studentData.stats.savedJobs}</div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link to="/jobs" className="text-sm text-primary-blue hover:underline">View saved jobs</Link>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Applications</CardTitle>
                  <CardDescription>Jobs you've applied to</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary-blue">{studentData.stats.pendingApplications}</div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link to="/applications" className="text-sm text-primary-blue hover:underline">Track applications</Link>
                </CardFooter>
              </Card>
            </div>
            
            {/* Recent Events Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Connect with alumni and career opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentData.events.map(event => (
                    <div key={event.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <div className="flex items-center mt-1 text-sm text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            {event.date}
                          </div>
                          <div className="flex items-center mt-1 text-sm text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            {event.location} ({event.type})
                          </div>
                        </div>
                        <Button variant="rsvp" size="sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                          RSVP
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="ml-auto">
                  View All Events
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
      case 'jobs':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Job Opportunities</h3>
              <div className="flex gap-2">
                <Button variant="outline">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  Filter
                </Button>
                <Button variant="outline">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="21" y1="10" x2="7" y2="10"></line>
                    <line x1="21" y1="6" x2="3" y2="6"></line>
                    <line x1="21" y1="14" x2="3" y2="14"></line>
                    <line x1="21" y1="18" x2="7" y2="18"></line>
                  </svg>
                  Sort
                </Button>
              </div>
            </div>
            
            <div className="grid gap-4">
              {studentData.recentJobs.map(job => (
                <Card key={job.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-medium">{job.title}</h4>
                        <p className="text-gray-600">{job.company}</p>
                        <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            {job.deadline}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {job.saved ? (
                          <Button variant="outline" size="sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 fill-primary-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                            </svg>
                            Saved
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                            </svg>
                            Save
                          </Button>
                        )}
                        <Button size="sm">Apply</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      case 'mentors':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Your Mentors</h3>
              <Button>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="18" y1="8" x2="23" y2="13"></line>
                  <line x1="23" y1="8" x2="18" y2="13"></line>
                </svg>
                Find New Mentors
              </Button>
            </div>
            
            <div className="grid gap-4">
              {studentData.mentors.map(mentor => (
                <Card key={mentor.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="h-12 w-12 bg-primary-blue/10 rounded-full flex items-center justify-center">
                          <span className="text-primary-blue font-medium">
                            {mentor.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{mentor.name}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              mentor.status === 'Active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {mentor.status}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">{mentor.position}</p>
                          <p className="text-gray-600 text-sm">{mentor.company}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View Profile</Button>
                        <Button size="sm">Message</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      case 'profile':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Manage your personal information and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="text-lg font-medium mb-4">Personal Information</h4>
                  {isEditing ? (
                    // Editing mode - show form
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-1">
                        <label className="text-sm text-gray-500 font-medium">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={editedData.name}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm text-gray-500 font-medium">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={editedData.email}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm text-gray-500 font-medium">Enrollment Number</label>
                        <input
                          type="text"
                          name="enrollmentNumber"
                          value={editedData.enrollmentNumber}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm text-gray-500 font-medium">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={editedData.phone}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm text-gray-500 font-medium">Branch</label>
                        <input
                          type="text"
                          name="branch"
                          value={editedData.branch}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm text-gray-500 font-medium">Year</label>
                        <input
                          type="text"
                          name="year"
                          value={editedData.year}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                    </div>
                  ) : (
                    // View mode - show data
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 font-medium">Full Name</p>
                        <p className="text-base">{studentData.name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 font-medium">Email Address</p>
                        <p className="text-base">{studentData.email}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 font-medium">Enrollment Number</p>
                        <p className="text-base">{studentData.enrollmentNumber}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 font-medium">Phone Number</p>
                        <p className="text-base">{studentData.phone || 'Not provided'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 font-medium">Branch</p>
                        <p className="text-base">{studentData.branch}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 font-medium">Year</p>
                        <p className="text-base">{studentData.year}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end space-x-2">
                    {isEditing ? (
                      <>
                        <Button 
                          className="flex items-center" 
                          variant="outline"
                          onClick={cancelEditing}
                        >
                          Cancel
                        </Button>
                        <Button 
                          className="flex items-center" 
                          onClick={saveProfileChanges}
                        >
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button 
                        className="flex items-center" 
                        variant="outline"
                        onClick={startEditing}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Academic Information */}
                <div className="pt-4 border-t">
                  <h4 className="text-lg font-medium mb-4">Academic Information</h4>
                  <p className="text-gray-600 mb-4">Your academic achievements and activities will be visible to alumni who can help with mentorship opportunities.</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">No academic information added yet</span>
                      <Button size="sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 5v14M5 12h14"/>
                        </svg>
                        Add Details
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Career Interests */}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium">Career Interests</h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={resetStudentData}
                    >
                      Reset Profile Data
                    </Button>
                  </div>
                  <p className="text-gray-600 mb-4">Specify your career interests to receive personalized job recommendations and connect with relevant alumni.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    {['Software Development', 'Data Science', 'UI/UX Design'].map((interest, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-primary-blue/10 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span className="text-sm font-medium">{interest}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit Interests
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return <div>Content not found</div>;
    }
  };

  // One-time execution when component loads - clear any conflicting data
  (function cleanupLocalStorage() {
    try {
      // Preserve only specific student-related keys and clear others
      const keysToPreserve = ['userName', 'userId', 'userData', 'userType', 'token'];
      const allKeys = Object.keys(localStorage);
      
      // If userType is alumni but we're on student page, force reset it
      if (localStorage.getItem('userType') === 'alumni') {
        console.warn('Found alumni userType in localStorage while on student page - resetting');
        localStorage.setItem('userType', 'student');
      }
      
      // Look for keys that might have alumni data
      const alumniKeys = allKeys.filter(key => 
        key.toLowerCase().includes('alumni') || 
        key === 'company' || 
        key === 'position' || 
        key === 'gradYear'
      );
      
      if (alumniKeys.length > 0) {
        console.warn('Found potential alumni data keys in localStorage:', alumniKeys);
        alumniKeys.forEach(key => localStorage.removeItem(key));
      }
      
      console.log('Local storage cleanup complete');
    } catch (error) {
      console.error('Error in cleanup function:', error);
    }
  })();

  // Final check of student name right before rendering
  console.log('FINAL CHECK - Student name used for rendering:', studentData?.name);
  
  return (
    <div className="min-h-screen bg-gray-50 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22%3E%3Cg fill=%22%23e6e6e6%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/svg%3E')">
      <DashboardNavbar userType="student" />
      
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Header - Styled like the alumni dashboard */}
          <header className="bg-white shadow">
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div className="mb-4 md:mb-0">
                  <h1 className="text-2xl font-bold text-gray-800">Welcome back, {studentData.name}!</h1>
                  <p className="text-gray-600">{studentData.branch} - {studentData.year}</p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab('profile')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Profile
                  </Button>
                  <Button className="animate-pulse-button">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Connect with Alumni
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="container mx-auto px-4 py-8">
            {/* Tabs - Styled like the alumni dashboard */}
            <div className="border-b mb-8">
              <div className="flex justify-center space-x-8 mb-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-2 mb-px text-sm font-medium ${
                    activeTab === 'overview'
                      ? 'border-primary-blue text-white bg-primary-blue'
                      : 'bg-white text-primary-blue hover:text-white hover:bg-primary-blue border-primary-blue'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className={`px-2 mb-px text-sm font-medium ${
                    activeTab === 'jobs'
                      ? 'border-primary-blue text-white bg-primary-blue'
                      : 'bg-white text-primary-blue hover:text-white hover:bg-primary-blue border-primary-blue'
                  }`}
                >
                  Job Opportunities
                </button>
                <button
                  onClick={() => setActiveTab('mentors')}
                  className={`px-2 mb-px text-sm font-medium ${
                    activeTab === 'mentors'
                      ? 'border-primary-blue text-white bg-primary-blue'
                      : 'bg-white text-primary-blue hover:text-white hover:bg-primary-blue border-primary-blue'
                  }`}
                >
                  Mentors
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-2 mb-px text-sm font-medium ${
                    activeTab === 'profile'
                      ? 'border-primary-blue text-white bg-primary-blue'
                      : 'bg-white text-primary-blue hover:text-white hover:bg-primary-blue border-primary-blue'
                  }`}
                >
                  Profile
                </button>
              </div>
            </div>
            
            {/* Tab content - Keep student-specific content */}
            {renderTabContent()}
          </main>
        </>
      )}
    </div>
  );
};

export default StudentDashboard; 