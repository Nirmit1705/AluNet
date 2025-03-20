import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AlumniSignup from './pages/AlumniSignup'
import StudentSignup from './pages/StudentSignup'
import LoginPage from './pages/LoginPage'
import ForgotPassword from './pages/ForgotPassword'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/alumni/signup" element={<AlumniSignup />} />
        <Route path="/student/signup" element={<StudentSignup />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Add more routes as needed */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  )
}

export default App
