import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { UniversityProvider } from "./context/UniversityContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import AlumniDashboard from "./pages/AlumniDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard";
import MentoredStudentsPage from "./pages/MentoredStudentsPage.jsx";
import ConnectionsPage from "./pages/ConnectionsPage.jsx";
import Profile from "./pages/Profile.jsx";
import Messages from "./pages/Messages.jsx";
import Jobs from "./pages/Jobs.jsx";
import NotFound from "./pages/NotFound.jsx";
import StudentConnectionsPage from "./components/connections/StudentConnectionsPage";
import MentorshipRequestsPage from "./components/mentorship/MentorshipRequestsPage";
import CurrentMenteesPage from "./components/mentorship/CurrentMenteesPage";
import MentoredStudentsHistoryPage from "./components/mentorship/MentoredStudentsHistoryPage";
import ConnectedMentorsPage from "./components/mentorship/ConnectedMentorsPage";
import AlumniDirectory from "./pages/AlumniDirectory";
import MockLogin from "./components/auth/MockLogin.jsx";
import MentorshipsPage from "./pages/Mentorships.jsx";
import MenteesListPage from './components/dashboard/MenteesListPage';
import AlumniJobBoard from './components/jobs/AlumniJobBoard';
import VerificationPending from './pages/VerificationPending';
import ResendVerification from './pages/ResendVerification';

// Admin route imports
import AdminUserManagement from "./pages/admin/AdminUserManagement";
import AdminVerifications from "./pages/admin/AdminVerifications";
import AdminLogs from "./pages/admin/AdminLogs";
import { clearInvalidAuth } from './utils/loginHelper';

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    // Check and clear invalid auth tokens on application startup
    if (clearInvalidAuth()) {
      console.log("Cleared invalid authentication data");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <UniversityProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/verification-pending" element={<VerificationPending />} />
              <Route path="/resend-verification" element={<ResendVerification />} />
              <Route path="/mock-login" element={<MockLogin />} />
              
              {/* Protected routes with role & verification checks */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* Student routes */}
              <Route path="/student-dashboard" element={
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              
              {/* Alumni routes - require verification */}
              <Route path="/alumni-dashboard" element={
                <ProtectedRoute requiredRole="alumni" requireVerified={true}>
                  <AlumniDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/mentored-students" element={
                <ProtectedRoute requiredRole="alumni" requireVerified={true}>
                  <MentoredStudentsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/alumni-job-board" element={
                <ProtectedRoute requiredRole="alumni" requireVerified={true}>
                  <AlumniJobBoard />
                </ProtectedRoute>
              } />
              
              {/* Admin routes */}
              <Route path="/admin-dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/verifications" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminVerifications />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/users" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminUserManagement />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/logs" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLogs />
                </ProtectedRoute>
              } />
              
              {/* Other protected routes */}
              <Route path="/connections" element={
                <ProtectedRoute>
                  <ConnectionsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              <Route path="/messages" element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } />
              
              <Route path="/messages/:userId" element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } />
              
              <Route path="/jobs" element={
                <ProtectedRoute>
                  <Jobs />
                </ProtectedRoute>
              } />
              
              <Route path="/student-connections" element={
                <ProtectedRoute requiredRole="student">
                  <StudentConnectionsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/mentorship-requests" element={
                <ProtectedRoute requiredRole="alumni" requireVerified={true}>
                  <MentorshipRequestsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/current-mentees" element={
                <ProtectedRoute requiredRole="alumni" requireVerified={true}>
                  <CurrentMenteesPage />
                </ProtectedRoute>
              } />
              
              <Route path="/mentored-students-history" element={
                <ProtectedRoute requiredRole="alumni" requireVerified={true}>
                  <MentoredStudentsHistoryPage />
                </ProtectedRoute>
              } />
              
              <Route path="/connected-mentors" element={
                <ProtectedRoute requiredRole="student">
                  <ConnectedMentorsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/alumni-directory" element={
                <ProtectedRoute>
                  <AlumniDirectory />
                </ProtectedRoute>
              } />
              
              <Route path="/mentorships" element={
                <ProtectedRoute>
                  <MentorshipsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/mentees" element={
                <ProtectedRoute requiredRole="alumni" requireVerified={true}>
                  <MenteesListPage />
                </ProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </UniversityProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;