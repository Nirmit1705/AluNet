import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import DashboardNavbar from '../components/DashboardNavbar';

const AlumniDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Function to get initials from a name
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };
  
  useEffect(() => {
    // Fetch user data from the backend
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('userData'));
        
        if (userData) {
          // Use locally stored user data if available (from signup/login)
          console.log('Using locally stored user data:', userData);
          setUserData(userData);
          setIsLoading(false);
          return;
        }
        
        if (!token) {
          console.error('No token found');
          setIsLoading(false);
          return;
        }

        // Make the API call with the token in the headers
        const response = await fetch('/api/alumni/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        console.log('Fetched profile data:', data);
        
        // Store the user data in localStorage for future use
        localStorage.setItem('userData', JSON.stringify(data));
        
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        
        // Try to get user data from localStorage as fallback
        const storedData = localStorage.getItem('userData');
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData);
            console.log('Using stored user data as fallback:', parsedData);
            setUserData(parsedData);
            setIsLoading(false);
            return;
          } catch (e) {
            console.error('Error parsing stored user data:', e);
          }
        }
        
        // Ultimate fallback - mock data
        setUserData({
          name: 'Alumni User',
          email: 'alumni@example.com',
          batch: '2018',
          branch: 'Computer Science',
          currentCompany: 'Tech Company',
          position: 'Senior Developer',
          stats: {
            mentorships: 0,
            jobsPosted: 0,
            messagesReceived: 0
          },
          recentMessages: [],
          recentJobs: [],
          mentorships: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

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

  // Create testimonials data using the logged-in user's information with improved field access
  const testimonialsData = useMemo(() => {
    if (!userData) return [];
    
    // Add console log to inspect userData properties
    console.log('User data for testimonials:', userData);
    
    // Extract fields with flexibility for different field names
    const name = getFieldValue(userData, ['name', 'fullName', 'userName'], 'Alumni User');
    const position = getFieldValue(userData, ['currentPosition', 'position', 'designation', 'jobTitle'], 'Professional');
    const company = getFieldValue(userData, ['company', 'currentCompany', 'employer', 'organization'], 'Company');
    const batch = getFieldValue(userData, ['batch', 'graduationYear', 'yearOfGraduation'], '2020');
    const initials = getInitials(name);
    
    return [
      {
        id: 1,
        quote: "Mentoring students has been incredibly rewarding. I've seen my mentees grow and achieve great things in their careers. The connections we build here last a lifetime.",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        color: "blue",
        name,
        position,
        company,
        batch: `Class of ${batch}`,
        initials
      },
      {
        id: 2,
        quote: "As an alumnus, I love giving back to my alma mater. Helping students navigate the early stages of their career is both fulfilling and a great way to stay connected to emerging talent.",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        color: "green",
        name,
        position,
        company,
        batch: `Class of ${batch}`,
        initials
      },
      {
        id: 3,
        quote: "The mentorship program helped me establish valuable industry connections. Now as a mentor, I strive to provide the same guidance that was so crucial to my own success.",
        image: "https://randomuser.me/api/portraits/men/67.jpg",
        color: "purple",
        name,
        position,
        company,
        batch: `Class of ${batch}`,
        initials
      }
    ];
  }, [userData]);
  
  const renderTabContent = () => {
    if (isLoading) return <div>Loading...</div>;
    
    // Add a safety check for userData
    if (!userData) {
      return <div>Unable to load user data. Please try refreshing the page.</div>;
    }
    
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Mentorships</CardTitle>
                  <CardDescription>Active mentoring relationships</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary-blue stat-value stat-value-delay-1">{userData.stats?.mentorships || 0}</div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link to="/mentorships" className="text-sm text-primary-blue hover:underline">View all mentorships</Link>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Job Postings</CardTitle>
                  <CardDescription>Opportunities you've shared</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary-blue stat-value stat-value-delay-2">{userData.stats?.jobsPosted || 0}</div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link to="/jobs" className="text-sm text-primary-blue hover:underline">Manage job postings</Link>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Messages</CardTitle>
                  <CardDescription>Recent student inquiries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary-blue stat-value stat-value-delay-3">{userData.stats?.messagesReceived || 0}</div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link to="/messages" className="text-sm text-primary-blue hover:underline">View inbox</Link>
                </CardFooter>
              </Card>
            </div>
            
            <div className="md:col-span-2 bg-white rounded-lg shadow p-6 border border-gray-200">
              {/* Right Panel - Testimonial Slider */}
              <div className="w-full h-full bg-white rounded-lg">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">Success Stories</h3>
                  <p className="text-sm text-gray-600 mt-1">See how alumni mentorship has helped others succeed.</p>
                </div>
                
                <div className="flex flex-col justify-between h-full">
                  {/* <div className="flex-grow mb-4">
                    <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <h4 className="font-semibold mb-2 text-gray-800">Mentorship Impact</h4>
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">97%</div>
                          <p className="text-xs text-gray-600">Satisfaction Rate</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">250+</div>
                          <p className="text-xs text-gray-600">Successful Matches</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">83%</div>
                          <p className="text-xs text-gray-600">Career Advancement</p>
                        </div>
                      </div>
                    </div>
                  </div> */}
                  
                  {/* Testimonial slider positioned at bottom */}
                  <div className="relative h-64">
                    {userData && testimonialsData.length > 0 ? (
                      <>
                        {/* Testimonial 1 */}
                        <div className="absolute inset-0 flex flex-col justify-end animate-fade-in-out testimonial-card rounded-lg z-10 overflow-hidden shadow-md">
                          <div className="absolute inset-0 bg-cover bg-center ml-4 mr-4 opacity-40" 
                               style={{backgroundImage: `url('${testimonialsData[0].image}')`}}></div>
                          <div className="relative p-3 bg-gradient-to-t from-blue-50 via-blue-50 to-transparent">
                            <p className="text-gray-700 italic text-sm">
                              {testimonialsData[0].quote}
                            </p>
                            <div className="mt-3 flex items-center">
                              <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center border-2 border-blue-300">
                                <span className="text-blue-700 font-bold text-xs">{testimonialsData[0].initials}</span>
                              </div>
                              <div className="ml-3">
                                <p className="font-semibold text-gray-800 text-sm">{testimonialsData[0].name}</p>
                                <p className="text-xs text-gray-600">{testimonialsData[0].position} at {testimonialsData[0].company} | {testimonialsData[0].batch}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Testimonial 2 */}
                        <div className="absolute inset-0 flex flex-col justify-end animate-fade-in-out delay-5000 testimonial-card rounded-lg z-20 overflow-hidden shadow-md">
                          <div className="absolute inset-0 bg-cover bg-center opacity-40"
                               style={{backgroundImage: `url('${testimonialsData[1].image}')`}}></div>
                          <div className="relative p-5 bg-gradient-to-t from-green-50 via-green-50 to-transparent">
                            <p className="text-gray-700 italic text-sm">
                              {testimonialsData[1].quote}
                            </p>
                            <div className="mt-3 flex items-center">
                              <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center border-2 border-green-300">
                                <span className="text-green-700 font-bold text-xs">{testimonialsData[1].initials}</span>
                              </div>
                              <div className="ml-3">
                                <p className="font-semibold text-gray-800 text-sm">{testimonialsData[1].name}</p>
                                <p className="text-xs text-gray-600">{testimonialsData[1].position} at {testimonialsData[1].company} | {testimonialsData[1].batch}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Testimonial 3 */}
                        <div className="absolute inset-0 flex flex-col justify-end animate-fade-in-out delay-10000 testimonial-card rounded-lg z-30 overflow-hidden shadow-md">
                          <div className="absolute inset-0 bg-cover bg-center opacity-40"
                               style={{backgroundImage: `url('${testimonialsData[2].image}')`}}></div>
                          <div className="relative p-5 bg-gradient-to-t from-purple-50 via-purple-50 to-transparent">
                            <p className="text-gray-700 italic text-sm">
                              {testimonialsData[2].quote}
                            </p>
                            <div className="mt-3 flex items-center">
                              <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center border-2 border-purple-300">
                                <span className="text-purple-700 font-bold text-xs">{testimonialsData[2].initials}</span>
                              </div>
                              <div className="ml-3">
                                <p className="font-semibold text-gray-800 text-sm">{testimonialsData[2].name}</p>
                                <p className="text-xs text-gray-600">{testimonialsData[2].position} at {testimonialsData[2].company} | {testimonialsData[2].batch}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Indicator dots */}
                        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 z-40">
                          <div className="h-2 w-2 rounded-full bg-blue-500 animate-fade-in-out"></div>
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-fade-in-out delay-5000"></div>
                          <div className="h-2 w-2 rounded-full bg-purple-500 animate-fade-in-out delay-10000"></div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Loading testimonials...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'messages':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
              <CardDescription>Messages from students and fellow alumni</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(userData.recentMessages || []).map(message => (
                  <div key={message.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium">{message.from}</h4>
                      <span className="text-xs text-gray-500">{message.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{message.preview}</p>
                    <div className="mt-2">
                      <Button variant="outline" size="sm">Reply</Button>
                    </div>
                  </div>
                ))}
                {(!userData.recentMessages || userData.recentMessages.length === 0) && (
                  <p className="text-gray-500">No messages found.</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="ml-auto">
                View All Messages
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Button>
            </CardFooter>
          </Card>
        );
      case 'jobs':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Your Job Postings</h3>
              <Button>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Post New Job
              </Button>
            </div>
            
            <div className="grid gap-4">
              {(userData.recentJobs || []).map(job => (
                <Card key={job.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-medium">{job.title}</h4>
                        <p className="text-gray-600">{job.company}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <span>Posted {job.postedDate}</span>
                          <span className="mx-2">•</span>
                          <span>{job.applications} applications</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!userData.recentJobs || userData.recentJobs.length === 0) && (
                <p className="text-gray-500">No job postings found.</p>
              )}
            </div>
          </div>
        );
      case 'mentorships':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Active Mentorships</h3>
              <Button>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Offer Mentorship
              </Button>
            </div>
            
            <div className="grid gap-4">
              {(userData.mentorships || []).map(mentorship => (
                <Card key={mentorship.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{mentorship.student}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            mentorship.status === 'Ongoing' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {mentorship.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{mentorship.topic}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                          </svg>
                          Next: {mentorship.nextSession}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Message</Button>
                        <Button size="sm">Schedule</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!userData.mentorships || userData.mentorships.length === 0) && (
                <p className="text-gray-500">No mentorships found.</p>
              )}
            </div>
          </div>
        );
      default:
        return <div>Content not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22%3E%3Cg fill=%22%23e6e6e6%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/svg%3E')">
      {/* Add the navbar */}
      <DashboardNavbar userType="alumni" />
      
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold text-gray-800">Welcome back, {getFieldValue(userData, ['name', 'fullName', 'userName'], 'Alumni')}!</h1>
              <p className="text-gray-600">{getFieldValue(userData, ['currentPosition', 'position', 'designation', 'jobTitle'], 'Professional')} at {getFieldValue(userData, ['company', 'currentCompany', 'employer', 'organization'], 'Company')}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
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
                New Post
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Tabs */}
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
              onClick={() => setActiveTab('messages')}
              className={`px-2 mb-px text-sm font-medium ${
                activeTab === 'messages'
                  ? 'border-primary-blue text-white bg-primary-blue'
                  : 'bg-white text-primary-blue hover:text-white hover:bg-primary-blue border-primary-blue'
              }`}
            >
              Messages
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-2 mb-px text-sm font-medium ${
                activeTab === 'jobs'
                  ? 'border-primary-blue text-white bg-primary-blue'
                  : 'bg-white text-primary-blue hover:text-white hover:bg-primary-blue border-primary-blue'
              }`}
            >
              Job Postings
            </button>
            <button
              onClick={() => setActiveTab('mentorships')}
              className={`px-2 mb-px text-sm font-medium ${
                activeTab === 'mentorships'
                  ? 'border-primary-blue text-white bg-primary-blue'
                  : 'bg-white text-primary-blue hover:text-white hover:bg-primary-blue border-primary-blue'
              }`}
            >
              Mentorships
            </button>
          </div>
        </div>

        {/* Tab content */}
        {renderTabContent()}
      </main>
    </div>
  );
};

export default AlumniDashboard; 