import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { FormField } from '../components/ui/FormField';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'alumni' // Default to alumni login
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  
  // Check if there's a success message from a previous action (like signup)
  const successMessage = location.state?.message || '';

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
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      // Determine which endpoint to use based on user type
      const endpoint = formData.userType === 'alumni' ? '/api/alumni/login' : '/api/students/login';
      
      console.log('Sending login request to:', endpoint);
      
      // Call the API to authenticate the user
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error('JSON parsing error:', jsonError);
          throw new Error('Invalid response from server. Please try again.');
        }
      } else {
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse);
        throw new Error('Invalid response format from server');
      }
      
      if (!response.ok) {
        throw new Error(data?.message || 'Invalid email or password');
      }
      
      // Store auth data in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userType', formData.userType);
      localStorage.setItem('userId', data._id);
      localStorage.setItem('userName', data.name);
      
      console.log('Logged in successfully as:', formData.userType);
      
      // Redirect to dashboard based on user type
      navigate(`/${formData.userType}/dashboard`);
      
    } catch (error) {
      console.error('Login error:', error);
      setServerError(error.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-blue">AluNet</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>
        
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md">
            {successMessage}
          </div>
        )}
        
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary-blue/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900">Welcome Back</h2>
            <p className="text-sm text-center text-gray-500">Enter your credentials to access your account</p>
          </CardHeader>
          
          {serverError && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
              {serverError}
            </div>
          )}
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-center space-x-4 mb-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="userType"
                      value="alumni"
                      checked={formData.userType === 'alumni'}
                      onChange={handleChange}
                      className="form-radio h-4 w-4 text-primary-blue"
                    />
                    <span className="ml-2 text-gray-700">Alumni</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="userType"
                      value="student"
                      checked={formData.userType === 'student'}
                      onChange={handleChange}
                      className="form-radio h-4 w-4 text-primary-dark"
                    />
                    <span className="ml-2 text-gray-700">Student</span>
                  </label>
                </div>
              </div>
              
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
                  autoComplete="email"
                />
              </FormField>
              
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
                  autoComplete="current-password"
                />
              </FormField>
              
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-primary-blue hover:underline">
                  Forgot your password?
                </Link>
              </div>
              
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t p-6">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/" className="text-primary-blue font-medium hover:underline">
                Create one
              </Link>
            </p>
          </CardFooter>
        </Card>
        
        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-gray-600 hover:text-primary-blue inline-flex items-center">
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

export default LoginPage; 