import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import DashboardNavbar from '../components/DashboardNavbar';
import axios from 'axios';

const AlumniDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Alumni mock data - guaranteed fallback
  const ALUMNI_MOCK_DATA = null;

  // Function to get initials from a name
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };
  
  // Load user data from MongoDB instead of localStorage
  useEffect(() => {
    const fetchUserFromAPI = async () => {
      setIsLoading(true);
      
      try {
        // Simulate API call
        const mockResponse = {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          company: 'Tech Innovations Inc.',
          position: 'Senior Software Engineer',
          graduationYear: '2015',
          branch: 'Computer Engineering',
          bio: "I'm a senior software engineer with expertise in React, Node.js, and cloud technologies. I'm passionate about mentoring new graduates and helping them navigate their early career challenges.",
          yearsOfExperience: 8,
          skills: ['React', 'Node.js', 'AWS', 'Python', 'DevOps'],
          socialLinks: {
            linkedin: 'https://linkedin.com/in/johndoe',
            github: 'https://github.com/johndoe',
            twitter: 'https://twitter.com/johndoe'
          },
          stats: {
            pendingRequests: 0,
            connections: 42,
            profileViews: 156,
            jobPostings: 3
          },
          // ADD MOCK MENTORSHIP REQUESTS
          mentorshipRequests: [
            {
              id: "13865a6b-9544-4c4f-b30a-ab1d9d21fef3",
              mentorId: "alumni123",
              mentorName: "John Doe",
              mentorEmail: "john.doe@example.com",
              status: 'pending',
              sentDate: new Date().toISOString(),
              message: "I would like to request mentorship from you for career guidance in software development. I'm particularly interested in your experience with React and cloud technologies.",
              requestType: 'mentorship',
              studentId: 'student123',
              studentName: 'Nirmit Patel',
              studentYear: '3rd Year',
              studentBranch: 'Computer Engineering',
              studentEmail: 'nirmit@example.com'
            },
            {
              id: "24976c5d-8732-4e1a-b09c-ab3e82fdec78",
              mentorId: "alumni123",
              mentorName: "John Doe",
              mentorEmail: "john.doe@example.com",
              status: 'pending',
              sentDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
              message: "Hello! I'm interested in learning more about career opportunities in DevOps and cloud infrastructure. Would you be willing to mentor me?",
              requestType: 'mentorship',
              studentId: 'student456',
              studentName: 'Raj Kumar',
              studentYear: '4th Year',
              studentBranch: 'Information Technology',
              studentEmail: 'raj.kumar@example.com'
            }
          ]
        };
        
        // Update user data with mock data
        mockResponse.stats.pendingRequests = mockResponse.mentorshipRequests.filter(req => req.status === 'pending').length;
        
        setUserData(mockResponse);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsLoading(false);
        setError('Failed to load user data. Please refresh the page and try again.');
      }
    };
    
    fetchUserFromAPI();
  }, []);

  // Add debugging function to trace mentorship events
  const debug = {
    logMentorshipEvents: true,
    checkRequests: () => {
      try {
        const requestsJson = localStorage.getItem('mentorshipRequests');
        console.warn('💬 DEBUG - Mentorship requests in localStorage:', requestsJson);
        if (requestsJson) {
          const allRequests = JSON.parse(requestsJson);
          console.warn('💬 DEBUG - Parsed mentorship requests:', allRequests);
          return allRequests;
        }
      } catch (error) {
        console.error('Error in checkRequests:', error);
      }
      return null;
    }
  };
  
  // Set up event listener for real-time mentorship requests
  useEffect(() => {
    // Function to handle incoming mentorship requests
    const handleMentorshipRequest = (event) => {
      console.warn('✉️ MENTORSHIP EVENT - Received mentorshipRequestSent event!');
      console.warn('✉️ Event details:', event.detail);
      
      // Check if we have direct pass data
      if (window.directMentorshipRequestPass && window.directMentorshipRequestPass.requests) {
        try {
          const requests = window.directMentorshipRequestPass.requests;
          console.warn('✉️ Direct mentorship requests:', requests);
          
          if (Array.isArray(requests) && requests.length > 0) {
            // Manually refresh userData with the new request
            setUserData(prevData => {
              if (!prevData) return prevData;
              
              const pendingRequests = requests.filter(req => req.status === 'pending');
              
              console.warn('✉️ Updating userData with direct requests, pending count:', pendingRequests.length);
              
              // Force UI update with new data
              const updatedData = {
                ...prevData,
                mentorshipRequests: requests,
                stats: {
                  ...(prevData.stats || {}),
                  pendingRequests: pendingRequests.length
                }
              };
              
              // Immediately show notification for the new request
              if (pendingRequests.length > 0) {
                // Use setTimeout to ensure this happens after state update
                setTimeout(() => {
                  if (!document.getElementById('mentorship-notification')) {
                    console.warn('✉️ Showing notification for', pendingRequests.length, 'pending requests');
                    showMentorshipNotification(pendingRequests.length);
                  }
                }, 100);
              }
              
              return updatedData;
            });
          }
        } catch (e) {
          console.error('Error processing direct mentorship requests:', e);
        }
      } else {
        console.warn('✉️ No direct mentorship requests available');
      }
    };
    
    // Add event listener
    window.addEventListener('mentorshipRequestSent', handleMentorshipRequest);
    console.warn('🎧 Added event listener for mentorshipRequestSent');
    
    // Check for requests periodically (every 15 seconds)
    const intervalId = setInterval(() => {
      console.warn('⏱️ Periodic check of mentorship requests');
      checkMentorshipRequests();
    }, 15000);
    
    // Immediate check on mount
    console.warn('🚀 Initial check of mentorship requests');
    checkMentorshipRequests();
    
    // Clean up
    return () => {
      window.removeEventListener('mentorshipRequestSent', handleMentorshipRequest);
      clearInterval(intervalId);
    };
  }, []);
  
  // Update the check mentorship function to include direct pass approach
  const checkMentorshipRequests = async () => {
    try {
      console.warn('💬 DEBUG - Checking for mentorship requests');
      
      // In a real implementation, this would make an API call to get pending requests
      // For now, we'll check the direct pass variable
      if (window.directMentorshipRequestPass && window.directMentorshipRequestPass.requests) {
        const allRequests = window.directMentorshipRequestPass.requests;
        
        if (!allRequests || !Array.isArray(allRequests) || allRequests.length === 0) {
          console.warn('💬 DEBUG - No valid mentorship requests array found');
          return;
        }
        
        console.warn('💬 DEBUG - Found mentorship requests:', allRequests);
        
        // Filter requests that are for this alumni (in real app, would check alumni ID)
        const myRequests = allRequests.filter(req => {
          // This is a temporary solution - in a real app we would match the alumni ID
          // but for demo purposes, we'll just show all requests
          return true;
        });
        
        // Filter for pending requests that haven't been handled
        const pendingRequests = myRequests.filter(req => req.status === 'pending');
        console.warn('💬 DEBUG - Pending mentorship requests:', pendingRequests.length);
        
        if (myRequests.length > 0) {
          // Add requests to userData
          setUserData(prevData => {
            if (!prevData) return prevData;
            
            console.warn('💬 DEBUG - Updating userData with mentorship requests');
            return {
              ...prevData,
              mentorshipRequests: myRequests,
              stats: {
                ...(prevData.stats || {}),
                pendingRequests: pendingRequests.length
              }
            };
          });
          
          // Show notification for new requests if this is the first load
          // and we have pending requests
          if (pendingRequests.length > 0 && !document.getElementById('mentorship-notification')) {
            console.warn('💬 DEBUG - Showing mentorship notification for', pendingRequests.length, 'requests');
            showMentorshipNotification(pendingRequests.length);
          }
        }
      } else {
        console.warn('💬 DEBUG - No direct mentorship requests found');
      }
    } catch (error) {
      console.error('Error checking mentorship requests:', error);
    }
  };
  
  // Show notification for new mentorship requests
  const showMentorshipNotification = (count) => {
    try {
      console.warn('🔔 Showing notification for', count, 'mentorship requests');
      
      // Check if notification already exists
      if (document.getElementById('mentorship-notification')) {
        console.warn('🔔 Notification already exists, not creating duplicate');
        return;
      }
      
      const notification = document.createElement('div');
      notification.id = 'mentorship-notification';
      notification.className = 'fixed top-4 right-4 bg-white border border-blue-200 shadow-lg rounded-lg p-4 flex items-center transition-all duration-500 z-50 transform translate-y-0';
      notification.innerHTML = `
        <div class="mr-3 bg-blue-100 p-2 rounded-full text-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <p class="font-medium text-gray-800">New Mentorship Requests</p>
          <p class="text-sm text-gray-600">You have ${count} pending student ${count === 1 ? 'request' : 'requests'}</p>
        </div>
        <button id="close-notification" class="ml-4 text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      `;
      
      // Force visibility with !important styles
      notification.style.cssText = 'display: flex !important; opacity: 1 !important;';
      
      document.body.appendChild(notification);
      console.warn('🔔 Notification element added to DOM');
      
      // Add event listener for close button
      const closeButton = document.getElementById('close-notification');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          notification.style.opacity = '0';
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 500);
        });
      }
      
      // Auto-hide notification after 8 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.style.opacity = '0';
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 500);
        }
      }, 8000);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };
  
  // Function to handle mentorship request action (accept/reject)
  const handleMentorshipRequest = (requestId, action) => {
    console.log(`${action} mentorship request ${requestId}`);
    
    // Update UI immediately for better user experience
    setUserData(prevData => {
      if (!prevData || !prevData.mentorshipRequests) return prevData;
      
      // Find the request and update its status
      const updatedRequests = prevData.mentorshipRequests.map(req => {
        if (req.id === requestId) {
          return { ...req, status: action === 'accept' ? 'accepted' : 'rejected' };
        }
        return req;
      });
      
      // Count new pending requests
      const pendingCount = updatedRequests.filter(req => req.status === 'pending').length;
      
      // Create a success toast message
      const toastMsg = document.createElement('div');
      toastMsg.className = 'fixed bottom-4 right-4 bg-white border shadow-lg rounded-lg p-4 flex items-center z-50';
      toastMsg.innerHTML = `
        <div class="mr-3 p-2 rounded-full ${action === 'accept' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            ${action === 'accept' 
              ? '<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />'
              : '<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />'}
          </svg>
        </div>
        <div>
          <p class="font-medium text-gray-800">Request ${action === 'accept' ? 'Accepted' : 'Declined'}</p>
          <p class="text-sm text-gray-600">
            ${action === 'accept' 
              ? 'You have accepted the mentorship request' 
              : 'You have declined the mentorship request'}
          </p>
        </div>
      `;
      document.body.appendChild(toastMsg);
      
      // Remove toast after 3 seconds
      setTimeout(() => {
        toastMsg.style.opacity = '0';
        toastMsg.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
          if (toastMsg.parentNode) {
            toastMsg.parentNode.removeChild(toastMsg);
          }
        }, 500);
      }, 3000);
      
      // Return updated user data
      return {
        ...prevData,
        mentorshipRequests: updatedRequests,
        stats: {
          ...prevData.stats,
          pendingRequests: pendingCount
        }
      };
    });
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
              
              <Card className={userData.stats?.pendingRequests > 0 ? 'border-blue-300 shadow-md animate-pulse' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Mentorship Requests</CardTitle>
                    {userData.stats?.pendingRequests > 0 && (
                      <span className="bg-primary-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {userData.stats.pendingRequests}
                      </span>
                    )}
                  </div>
                  <CardDescription>Students seeking your guidance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary-blue stat-value stat-value-delay-3">{userData.stats?.pendingRequests || 0}</div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    variant="link" 
                    className="text-sm text-primary-blue hover:underline p-0"
                    onClick={() => setActiveTab('mentorRequests')}
                  >
                    View pending requests
                  </Button>
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
      case 'mentorRequests':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Mentorship Requests</h3>
              <Button 
                variant="outline"
                onClick={() => setActiveTab('overview')}
              >
                Back to Overview
              </Button>
            </div>
            
            {userData.mentorshipRequests && userData.mentorshipRequests.length > 0 ? (
              <div className="space-y-4">
                {userData.mentorshipRequests
                  .filter(request => request.status === 'pending')
                  .map(request => (
                    <Card key={request.id} className="border-l-4 border-l-blue-400">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                          <div>
                            <div className="flex items-center mb-2">
                              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-blue-600 font-medium">
                                  {getInitials(request.studentName || 'Student User')}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium">{request.studentName || 'Student User'}</h4>
                                <p className="text-sm text-gray-600">
                                  {request.studentBranch || 'Computer Engineering'} - {request.studentYear || '3rd Year'}
                                </p>
                                {request.studentEmail && (
                                  <p className="text-xs text-gray-500">{request.studentEmail}</p>
                                )}
                              </div>
                            </div>
                            <div className="mb-3">
                              <div className="flex items-center text-sm text-gray-600 mb-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                  <line x1="16" y1="2" x2="16" y2="6"></line>
                                  <line x1="8" y1="2" x2="8" y2="6"></line>
                                  <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                Request sent: {new Date(request.sentDate).toLocaleString()}
                              </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-md mb-4 border border-gray-100">
                              <p className="text-gray-700">{request.message || "I'm interested in receiving mentorship from you."}</p>
                            </div>
                            <div className="text-sm text-gray-600 flex items-center mb-4">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Mentorship involves periodic guidance calls and career advice</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 md:min-w-[150px]">
                            <Button 
                              className="w-full"
                              onClick={() => handleMentorshipRequest(request.id, 'accept')}
                            >
                              Accept Request
                            </Button>
                            <Button 
                              variant="outline"
                              className="w-full text-red-500 hover:text-red-700"
                              onClick={() => handleMentorshipRequest(request.id, 'reject')}
                            >
                              Decline
                            </Button>
                            <Button 
                              variant="outline"
                              className="w-full"
                              onClick={() => window.open(`mailto:${request.studentEmail || 'student@example.com'}?subject=Regarding%20Your%20Mentorship%20Request&body=Hi%20${request.studentName?.split(' ')[0] || 'there'}%2C%0A%0AI%20received%20your%20mentorship%20request%20and%20would%20like%20to%20discuss%20it%20further.%0A%0ABest%20regards%2C%0A${userData.name}`)}
                            >
                              Message Student
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  You don't have any pending mentorship requests at this time. When students request your mentorship, they'll appear here.
                </p>
              </div>
            )}
            
            {userData.mentorshipRequests && userData.mentorshipRequests.some(req => req.status === 'accepted') && (
              <>
                <h3 className="text-lg font-medium mt-8 mb-4">Accepted Requests</h3>
                <div className="grid gap-4">
                  {userData.mentorshipRequests
                    .filter(request => request.status === 'accepted')
                    .map(request => (
                      <Card key={`accepted-${request.id}`} className="border-l-4 border-l-green-400">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-green-600 font-medium">SU</span>
                              </div>
                              <div>
                                <h4 className="font-medium">Student User</h4>
                                <p className="text-sm text-gray-600">Computer Engineering - 3rd Year</p>
                                <p className="text-xs text-green-600 mt-1">Accepted on {new Date().toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`mailto:student@example.com`)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                  <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                                Email
                              </Button>
                              <Button size="sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                </svg>
                                Message
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </>
            )}
          </div>
        );
      default:
        return <div>Content not found</div>;
    }
  };

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
          <h2 className="text-2xl font-bold mb-4">Connection Error</h2>
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