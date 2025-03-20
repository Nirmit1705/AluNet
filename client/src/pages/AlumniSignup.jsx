import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { FormField } from '../components/ui/FormField';

const AlumniSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    graduationYear: '',
    branch: '',
    company: '',
    position: '',
    linkedInProfile: '',
    skills: '',
    mentorshipAvailable: true,
    mentorshipAreas: '',
    industry: '',
    location: '',
    bio: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing again
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.graduationYear) {
      newErrors.graduationYear = 'Graduation year is required';
    }
    
    if (!formData.branch) {
      newErrors.branch = 'Branch is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setServerError('');
    
    try {
      // Remove confirmPassword as it's not needed in the API call
      const { confirmPassword, ...apiData } = formData;
      
      // Format all data for both controller and model
      const formattedData = {
        // Required by both controller and model
        name: apiData.name,
        email: apiData.email,
        password: apiData.password,
        
        // Required by model but not expected by controller
        branch: apiData.branch,
        
        // Expected by controller
        graduationYear: parseInt(apiData.graduationYear),
        phone: '',
        University: '',
        College: '',
        degree: '',
        specialization: '',
        currentPosition: apiData.position || '',
        company: apiData.company || '',
        linkedin: apiData.linkedInProfile || '',
        experience: 0,
        skills: apiData.skills ? apiData.skills.split(',').map(skill => skill.trim()).filter(Boolean) : [],
        mentorshipAvailable: apiData.mentorshipAvailable || false,
        bio: apiData.bio || ''
      };
      
      console.log('Sending registration data:', formattedData);
      
      // Call the API to register the alumni
      const response = await fetch('/api/alumni/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
        credentials: 'include' // Include cookies
      });
      
      console.log('Server response status:', response.status);
      
      // Handle the response
      let data;
      let responseText = '';
      
      try {
        responseText = await response.text();
        console.log('Raw response text:', responseText);
        
        if (responseText) {
          try {
            data = JSON.parse(responseText);
            console.log('Parsed JSON data:', data);
          } catch (jsonError) {
            console.error('JSON parsing error:', jsonError);
            throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
          }
        } else {
          throw new Error('Empty response from server');
        }
      } catch (textError) {
        console.error('Error reading response:', textError);
        throw new Error(`Failed to read server response: ${textError.message}`);
      }
      
      if (!response.ok) {
        throw new Error(data?.message || `Server error: ${response.status}`);
      }
      
      // Success - store auth data and redirect
      console.log('Account created successfully:', data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userType', 'alumni');
      navigate('/alumni/dashboard');
      
    } catch (error) {
      console.error('Registration error:', error);
      setServerError(error.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-blue">AluNet</h1>
          <p className="text-gray-600 mt-2">Create your alumni account</p>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary-blue/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900">Join as Alumni</h2>
            <p className="text-sm text-center text-gray-500">Share your experiences and mentor students</p>
          </CardHeader>
          
          {serverError && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
              {serverError}
            </div>
          )}
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="Full Name"
                name="name"
                error={errors.name}
              >
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  error={errors.name}
                />
              </FormField>
              
              <FormField
                label="Email Address"
                name="email"
                error={errors.email}
              >
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  error={errors.email}
                />
              </FormField>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Password"
                  name="password"
                  error={errors.password}
                >
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    error={errors.password}
                  />
                </FormField>
                
                <FormField
                  label="Confirm Password"
                  name="confirmPassword"
                  error={errors.confirmPassword}
                >
                  <Input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    error={errors.confirmPassword}
                  />
                </FormField>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Graduation Year"
                  name="graduationYear"
                  error={errors.graduationYear}
                >
                  <Select
                    id="graduationYear"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    error={errors.graduationYear}
                  >
                    <option value="">Select year</option>
                    {graduationYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </Select>
                </FormField>
                
                <FormField
                  label="Branch"
                  name="branch"
                  error={errors.branch}
                >
                  <Select
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    error={errors.branch}
                  >
                    <option value="">Select branch</option>
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics Engineering">Electronics Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Chemical Engineering">Chemical Engineering</option>
                    <option value="Aerospace Engineering">Aerospace Engineering</option>
                    <option value="Biomedical Engineering">Biomedical Engineering</option>
                  </Select>
                </FormField>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Company"
                  name="company"
                >
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your current company"
                  />
                </FormField>
                
                <FormField
                  label="Position"
                  name="position"
                >
                  <Input
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="Your current position"
                  />
                </FormField>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Industry"
                  name="industry"
                >
                  <Input
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="Your industry"
                  />
                </FormField>
                
                <FormField
                  label="Location"
                  name="location"
                >
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Your location"
                  />
                </FormField>
              </div>
              
              <FormField
                label="Skills (comma-separated)"
                name="skills"
              >
                <Input
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g., JavaScript, Python, React"
                />
              </FormField>
              
              <FormField
                label="Mentorship Areas (comma-separated)"
                name="mentorshipAreas"
              >
                <Input
                  id="mentorshipAreas"
                  name="mentorshipAreas"
                  value={formData.mentorshipAreas}
                  onChange={handleChange}
                  placeholder="e.g., Career Guidance, Technical Skills"
                />
              </FormField>
              
              <FormField
                label="LinkedIn Profile"
                name="linkedInProfile"
              >
                <Input
                  id="linkedInProfile"
                  name="linkedInProfile"
                  value={formData.linkedInProfile}
                  onChange={handleChange}
                  placeholder="Your LinkedIn profile URL"
                />
              </FormField>
              
              <FormField
                label="Bio"
                name="bio"
              >
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="A brief introduction about yourself"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  rows="3"
                ></textarea>
              </FormField>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
            
            <p className="text-sm text-center text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-blue hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AlumniSignup; 