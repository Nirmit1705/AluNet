import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { UniversityProvider } from "./context/UniversityContext";
import Index from "./pages/Index.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import AlumniDashboard from "./pages/AlumniDashboard.jsx";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <UniversityProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/alumni-dashboard" element={<AlumniDashboard />} />
            <Route path="/mentored-students" element={<MentoredStudentsPage />} />
            <Route path="/connections" element={<ConnectionsPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/:userId" element={<Messages />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/student-connections" element={<StudentConnectionsPage />} />
            <Route path="/mentorship-requests" element={<MentorshipRequestsPage />} />
            <Route path="/current-mentees" element={<CurrentMenteesPage />} />
            <Route path="/mentored-students-history" element={<MentoredStudentsHistoryPage />} />
            <Route path="/connected-mentors" element={<ConnectedMentorsPage />} />
            <Route path="/alumni-directory" element={<AlumniDirectory />} />
            <Route path="/mock-login" element={<MockLogin />} />
            <Route path="/mentorships" element={<MentorshipsPage />} />
            <Route path="/mentees" element={<MenteesListPage />} />
            <Route path="/alumni-job-board" element={<AlumniJobBoard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </UniversityProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;