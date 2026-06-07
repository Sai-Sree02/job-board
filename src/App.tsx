import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './hooks/useToast';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BrowseJobs from './pages/BrowseJobs';
import JobDetail from './pages/JobDetail';
import SavedJobs from './pages/SavedJobs';
import Applications from './pages/Applications';
import MyJobs from './pages/MyJobs';
import EmployerDashboard from './pages/EmployerDashboard';
import PostJob from './pages/PostJob';
import ViewApplicants from './pages/ViewApplicants';
import Profile from './pages/Profile';
import AITools from './pages/AITools';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import CoverLetterGenerator from './pages/CoverLetterGenerator';
import { useAuth } from './hooks/useAuth';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'candidate' | 'employer' }) {
  const { user, profile, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (role && profile?.role !== role) return <Navigate to="/jobs" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/jobs" element={<BrowseJobs />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/saved" element={<ProtectedRoute role="candidate"><SavedJobs /></ProtectedRoute>} />
              <Route path="/applications" element={<ProtectedRoute role="candidate"><Applications /></ProtectedRoute>} />
              <Route path="/employer-dashboard" element={<ProtectedRoute role="employer"><EmployerDashboard /></ProtectedRoute>} />
              <Route path="/my-jobs" element={<ProtectedRoute role="employer"><MyJobs /></ProtectedRoute>} />
              <Route path="/post-job" element={<ProtectedRoute role="employer"><PostJob /></ProtectedRoute>} />
              <Route path="/my-jobs/:jobId/applicants" element={<ProtectedRoute role="employer"><ViewApplicants /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/ai-tools" element={<AITools />} />
              <Route path="/ai/resume-analyzer" element={<ProtectedRoute><ResumeAnalyzer /></ProtectedRoute>} />
              <Route path="/ai/cover-letter" element={<ProtectedRoute><CoverLetterGenerator /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
