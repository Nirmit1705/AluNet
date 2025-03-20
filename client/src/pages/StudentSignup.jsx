import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { FormField } from '../components/ui/FormField';

const StudentSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    registrationNumber: '',
    currentYear: '',
    branch: '',
    graduationYear: '',
    university: '',
    college: '',
    skills: '',
    interests: ''
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
    
    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = 'Registration number is required';
    }
    
    if (!formData.currentYear) {
      newErrors.currentYear = 'Current year is required';
    }
    
    if (!formData.branch) {
      newErrors.branch = 'Branch is required';
    }
    
    if (!formData.graduationYear) {
      newErrors.graduationYear = 'Graduation year is required';
    }
    
    if (!formData.university.trim()) {
      newErrors.university = 'University is required';
    }
    
    if (!formData.college.trim()) {
      newErrors.college = 'College is required';
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
      // Process skills and interests as arrays and remove confirmPassword
      const { confirmPassword, skills, interests, ...restData } = formData;
      
      const formattedData = {
        ...restData,
        skills: skills.split(',').map(skill => skill.trim()).filter(Boolean),
        interests: interests.split(',').map(interest => interest.trim()).filter(Boolean)
      };
      
      // In a real app, you would call your API here
      // For demo purposes, we'll simulate a successful response
      
      // Example API call:
      // const response = await fetch('/api/students/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formattedData)
      // });
      
      // if (!response.ok) {
      //   const error = await response.json();
      //   throw new Error(error.message || 'Failed to register');
      // }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Account created successfully:', formattedData);
      
      // Redirect to success page or login
      // navigate('/login', { state: { message: 'Account created successfully! Please verify your email to login.' } });
      
      // For demo, just reset the form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        registrationNumber: '',
        currentYear: '',
        branch: '',
        graduationYear: '',
        university: '',
        college: '',
        skills: '',
        interests: ''
      });
      
      // Show success message
      alert('Account created successfully! In a real app, you would be redirected to login or verification page.');
      
    } catch (error) {
      console.error('Registration error:', error);
      setServerError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from({ length: 10 }, (_, i) => currentYear + i);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-blue">AluNet</h1>
          <p className="text-gray-600 mt-2">Create your student account</p>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary-dark/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900">Join as Student</h2>
            <p className="text-sm text-center text-gray-500">Find mentors and discover opportunities</p>
          </CardHeader>
          
          {serverError && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
              {serverError}
            </div>
          )}
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
              
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
                  label="Registration Number"
                  name="registrationNumber"
                  error={errors.registrationNumber}
                >
                  <Input
                    id="registrationNumber"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    placeholder="Your registration number"
                    error={errors.registrationNumber}
                  />
                </FormField>
                
                <FormField
                  label="Current Year"
                  name="currentYear"
                  error={errors.currentYear}
                >
                  <Select
                    id="currentYear"
                    name="currentYear"
                    value={formData.currentYear}
                    onChange={handleChange}
                    error={errors.currentYear}
                  >
                    <option value="">Select year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="5">5th Year</option>
                  </Select>
                </FormField>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <option value="Electronics">Electronics</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="Other">Other</option>
                  </Select>
                </FormField>
                
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
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="University"
                  name="university"
                  error={errors.university}
                >
                  <Input
                    id="university"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    placeholder="Your university"
                    error={errors.university}
                  />
                </FormField>
                
                <FormField
                  label="College"
                  name="college"
                  error={errors.college}
                >
                  <Input
                    id="college"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    placeholder="Your college"
                    error={errors.college}
                  />
                </FormField>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Skills"
                  name="skills"
                  optional
                >
                  <Input
                    id="skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="Java, Python, React, etc."
                  />
                </FormField>
                
                <FormField
                  label="Interests"
                  name="interests"
                  optional
                >
                  <Input
                    id="interests"
                    name="interests"
                    value={formData.interests}
                    onChange={handleChange}
                    placeholder="Web Dev, AI, ML, etc."
                  />
                </FormField>
              </div>
              
              <div className="pt-2">
                <Button 
                  type="submit" 
                  variant="secondary" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t p-6">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-dark font-medium hover:underline">
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
        
        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-gray-600 hover:text-primary-dark inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentSignup; 