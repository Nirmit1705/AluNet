import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { FormField } from '../components/ui/FormField';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userType, setUserType] = useState('alumni'); // Default to alumni

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      setError('Email is invalid');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // In a real app, you would call your API here
      // For demo purposes, we'll simulate a successful response
      
      // Example API call:
      // const response = await fetch(`/api/${userType}/forgot-password`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      
      // if (!response.ok) {
      //   const error = await response.json();
      //   throw new Error(error.message || 'Failed to send reset link');
      // }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Password reset link sent to:', email);
      
      // Show success message
      setIsSubmitted(true);
      
    } catch (error) {
      console.error('Reset error:', error);
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeChange = (e) => {
    setUserType(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-blue">AluNet</h1>
          <p className="text-gray-600 mt-2">Reset your password</p>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary-blue/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900">Forgot Password</h2>
            <p className="text-sm text-center text-gray-500">
              {isSubmitted 
                ? "We've sent a password reset link to your email" 
                : "Enter your email and we'll send you a reset link"}
            </p>
          </CardHeader>
          
          <CardContent>
            {isSubmitted ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md text-center">
                <p className="text-green-700 mb-4">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-gray-600 text-sm">
                  Please check your email and follow the instructions to reset your password.
                  If you don't see the email, please check your spam folder.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-center space-x-4 mb-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="userType"
                        value="alumni"
                        checked={userType === 'alumni'}
                        onChange={handleTypeChange}
                        className="form-radio h-4 w-4 text-primary-blue"
                      />
                      <span className="ml-2 text-gray-700">Alumni</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="userType"
                        value="student"
                        checked={userType === 'student'}
                        onChange={handleTypeChange}
                        className="form-radio h-4 w-4 text-primary-dark"
                      />
                      <span className="ml-2 text-gray-700">Student</span>
                    </label>
                  </div>
                </div>
                
                <FormField
                  label="Email Address"
                  name="email"
                  error={error}
                >
                  <Input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="you@example.com"
                    error={!!error}
                    autoComplete="email"
                  />
                </FormField>
                
                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center border-t p-6">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link to="/login" className="text-primary-blue font-medium hover:underline">
                Back to login
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

export default ForgotPassword; 