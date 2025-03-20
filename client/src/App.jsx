import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AlumniSignup from './pages/AlumniSignup'
import StudentSignup from './pages/StudentSignup'
import LoginPage from './pages/LoginPage'
import ForgotPassword from './pages/ForgotPassword'
import AlumniDashboard from './pages/AlumniDashboard'
import StudentDashboard from './pages/StudentDashboard'
import ProfilePage from './pages/ProfilePage'
import JobListingsPage from './pages/JobListingsPage'
import MentorshipsPage from './pages/MentorshipsPage'
import MentorsPage from './pages/MentorsPage'
import PortfolioPage from './pages/PortfolioPage'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/alumni/signup" element={<AlumniSignup />} />
        <Route path="/student/signup" element={<StudentSignup />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected routes */}
        <Route path="/alumni/dashboard" element={
          <ProtectedRoute requiredRole="alumni">
            <AlumniDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/student/dashboard" element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="/jobs" element={
          <ProtectedRoute>
            <JobListingsPage />
          </ProtectedRoute>
        } />
        
        {/* Portfolio route */}
        <Route path="/portfolio" element={
          <ProtectedRoute requiredRole="student">
            <PortfolioPage />
          </ProtectedRoute>
        } />
        
        {/* Mentorship routes */}
        <Route path="/mentorships" element={
          <ProtectedRoute requiredRole="alumni">
            <MentorshipsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/mentors" element={
          <ProtectedRoute requiredRole="student">
            <MentorsPage />
          </ProtectedRoute>
        } />
        
        {/* Fallback route */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  )
}

export default App
