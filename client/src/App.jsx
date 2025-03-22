import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/alumni-dashboard" element={<AlumniDashboard />} />
          <Route path="/mentored-students" element={<MentoredStudentsPage />} />
          <Route path="/connections" element={<ConnectionsPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/student-connections" element={<StudentConnectionsPage />} />
          <Route path="/mentorship-requests" element={<MentorshipRequestsPage />} />
          <Route path="/current-mentees" element={<CurrentMenteesPage />} />
          <Route path="/mentored-students-history" element={<MentoredStudentsHistoryPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App; 