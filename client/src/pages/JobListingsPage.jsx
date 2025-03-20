import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import DashboardNavbar from '../components/DashboardNavbar';
import { formatDate } from '../lib/utils.jsx';

const JobListingsPage = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [jobListings, setJobListings] = useState([]);
  
  // Mock job listings data
  const mockJobListings = [
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'Google',
      location: 'Remote',
      type: 'Full-time',
      salary: '$80,000 - $100,000',
      description: 'We are looking for a skilled frontend developer with experience in React to join our team.',
      requirements: ['3+ years of experience with React', 'Strong knowledge of JavaScript', 'Experience with modern frontend tooling'],
      postedDate: '2023-03-01',
      postedBy: 'John Doe (Alumni)'
    },
    {
      id: 2,
      title: 'Backend Engineer',
      company: 'Microsoft',
      location: 'Seattle, WA',
      type: 'Full-time',
      salary: '$90,000 - $110,000',
      description: 'Join our backend team to build scalable and efficient services for our cloud platform.',
      requirements: ['Experience with Node.js', 'Knowledge of database systems', 'Understanding of RESTful APIs'],
      postedDate: '2023-03-03',
      postedBy: 'Lisa Wong (Alumni)'
    },
    {
      id: 3,
      title: 'UX/UI Design Intern',
      company: 'Adobe',
      location: 'San Francisco, CA',
      type: 'Internship',
      salary: '$25/hour',
      description: 'Looking for a talented design intern to help create beautiful and intuitive interfaces.',
      requirements: ['Current student in Design or related field', 'Portfolio demonstrating UI/UX skills', 'Knowledge of Figma or Adobe XD'],
      postedDate: '2023-03-05',
      postedBy: 'Mark Johnson (Alumni)'
    },
    {
      id: 4,
      title: 'Machine Learning Engineer',
      company: 'Amazon',
      location: 'Remote',
      type: 'Full-time',
      salary: '$100,000 - $130,000',
      description: 'Join our AI team to develop cutting-edge machine learning solutions.',
      requirements: ['MS or PhD in Computer Science', 'Experience with PyTorch or TensorFlow', 'Strong mathematics background'],
      postedDate: '2023-03-07',
      postedBy: 'Jessica Chen (Alumni)'
    },
    {
      id: 5,
      title: 'Data Science Intern',
      company: 'Netflix',
      location: 'Los Gatos, CA',
      type: 'Internship',
      salary: '$30/hour',
      description: 'Help our data science team analyze user behavior and recommend content optimization strategies.',
      requirements: ['Current student in Computer Science or Statistics', 'Experience with Python and data analysis libraries', 'Understanding of statistical methods'],
      postedDate: '2023-03-08',
      postedBy: 'Robert Garcia (Alumni)'
    },
  ];
  
  useEffect(() => {
    // Get user type from localStorage
    const storedUserType = localStorage.getItem('userType');
    if (!storedUserType) {
      // Redirect to login if no user type is found
      navigate('/login');
      return;
    }
    
    setUserType(storedUserType);
    
    // Simulate loading data
    const loadData = async () => {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setJobListings(mockJobListings);
      setIsLoading(false);
    };
    
    loadData();
  }, [navigate]);
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleLocationFilterChange = (e) => {
    setLocationFilter(e.target.value);
  };
  
  const handleTypeFilterChange = (e) => {
    setTypeFilter(e.target.value);
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setTypeFilter('');
  };
  
  // Filter jobs based on search and filters
  const filteredJobs = jobListings.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = locationFilter === '' || job.location.includes(locationFilter);
    const matchesType = typeFilter === '' || job.type === typeFilter;
    
    return matchesSearch && matchesLocation && matchesType;
  });
  
  // Get unique locations and job types for filters
  const locations = [...new Set(jobListings.map(job => job.location))];
  const jobTypes = [...new Set(jobListings.map(job => job.type))];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar userType={userType} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Job Opportunities</h1>
            <p className="text-gray-600">
              {userType === 'alumni' 
                ? 'Share and manage job opportunities with students' 
                : 'Discover and apply for jobs shared by alumni'}
            </p>
          </div>
          
          {userType === 'alumni' && (
            <Button className="mt-4 md:mt-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Post New Job
            </Button>
          )}
        </div>
        
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="search">Search Jobs</Label>
                <div className="relative">
                  <Input
                    id="search"
                    placeholder="Search by title, company, or keywords"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-10"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Select
                  id="location"
                  value={locationFilter}
                  onChange={handleLocationFilterChange}
                >
                  <option value="">All Locations</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </Select>
              </div>
              
              <div>
                <Label htmlFor="type">Job Type</Label>
                <Select
                  id="type"
                  value={typeFilter}
                  onChange={handleTypeFilterChange}
                >
                  <option value="">All Types</option>
                  {jobTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
              </div>
              
              <div className="md:col-span-4 flex justify-end">
                <Button variant="outline" onClick={resetFilters} className="px-4">
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Job Listings */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-blue"></div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No jobs found</h3>
              <p className="mt-1 text-gray-500">Try adjusting your search filters or check back later.</p>
            </div>
          ) : (
            filteredJobs.map(job => (
              <Card key={job.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className="border-l-4 border-primary-blue p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                        <p className="text-gray-700">{job.company}</p>
                        <div className="flex flex-wrap items-center mt-2 text-sm text-gray-500 gap-3">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                            </svg>
                            {job.type}
                          </div>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="1" x2="12" y2="23"></line>
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                            {job.salary}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">
                                Posted {formatDate(job.postedDate, 'relative')}
                              </span>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-500">
                                Posted by {job.postedBy.name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant={job.saved ? "saved" : "outline"}
                                size="sm"
                                className="flex items-center space-x-1"
                              >
                                {job.saved ? (
                                  <>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                    </svg>
                                    <span>Saved</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                    <span>Save</span>
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                className="flex items-center space-x-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <span>Apply</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex gap-2">
                        {userType === 'student' ? (
                          <>
                            {job.saved ? (
                              <Button variant="saved" size="sm" leftIcon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                </svg>
                              }>
                                Saved
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" leftIcon={
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                </svg>
                              }>
                                Save
                              </Button>
                            )}
                            <Button size="sm" rightIcon={
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                              </svg>
                            } iconPosition="right">
                              Apply
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">Delete</Button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-gray-600">{job.description}</p>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900">Requirements:</h4>
                        <ul className="mt-2 list-disc list-inside text-sm text-gray-600 space-y-1">
                          {job.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="mt-4 text-sm text-gray-500">
                        Posted by: {job.postedBy}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <Button variant="link" size="sm" className="text-primary-blue">
                        View Full Details
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        {/* Pagination */}
        {!isLoading && filteredJobs.length > 0 && (
          <div className="mt-8 flex justify-center">
            <nav className="inline-flex rounded-md shadow">
              <button className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-primary-blue">
                1
              </button>
              <button className="px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                3
              </button>
              <button className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Next
              </button>
            </nav>
          </div>
        )}
      </main>
    </div>
  );
};

export default JobListingsPage; 