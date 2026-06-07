import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { LogOut, Briefcase, User, Menu, X, Sparkles, ArrowRightLeft } from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, profile, signOut, switchRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSwitchRole = async (targetRole: 'candidate' | 'employer') => {
    const { error } = await switchRole(targetRole);
    if (error) { toast(error, 'error'); return; }
    toast(`Switched to ${targetRole} mode`, 'success');
    navigate(targetRole === 'employer' ? '/employer-dashboard' : '/jobs');
  };

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      location.pathname === path
        ? 'bg-brand-50 text-brand-700'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`;

  const isEmployer = profile?.role === 'employer';
  const isCandidate = profile?.role === 'candidate';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Hire<span className="text-brand-600">AI</span></span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {user ? (
                <>
                  <Link to="/jobs" className={linkClass('/jobs')}>Browse Jobs</Link>
                  {isCandidate && (
                    <>
                      <Link to="/saved" className={linkClass('/saved')}>Saved</Link>
                      <Link to="/applications" className={linkClass('/applications')}>Applications</Link>
                    </>
                  )}
                  {isEmployer && (
                    <>
                      <Link to="/employer-dashboard" className={linkClass('/employer-dashboard')}>Dashboard</Link>
                      <Link to="/my-jobs" className={linkClass('/my-jobs')}>My Jobs</Link>
                      <Link to="/post-job" className={linkClass('/post-job')}>Post Job</Link>
                    </>
                  )}
                  <Link to="/ai-tools" className={linkClass('/ai-tools')}>
                    <span className="flex items-center gap-1"><Sparkles className="w-4 h-4" />AI Tools</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/jobs" className={linkClass('/jobs')}>Browse Jobs</Link>
                </>
              )}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  {isCandidate && (
                    <button onClick={() => handleSwitchRole('employer')} className="btn-secondary text-sm gap-1.5 border-brand-200 text-brand-700 hover:bg-brand-50">
                      <ArrowRightLeft className="w-4 h-4" />Switch to Employer
                    </button>
                  )}
                  {isEmployer && (
                    <button onClick={() => handleSwitchRole('candidate')} className="btn-secondary text-sm gap-1.5 border-gray-200 text-gray-600 hover:bg-gray-50">
                      <ArrowRightLeft className="w-4 h-4" />Switch to Candidate
                    </button>
                  )}
                  <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-brand-600" />
                    </div>
                    <span className="font-medium">{profile?.full_name || profile?.email}</span>
                    <span className="badge bg-brand-50 text-brand-700 capitalize">{profile?.role}</span>
                  </Link>
                  <button onClick={handleSignOut} className="btn-ghost text-sm gap-1.5">
                    <LogOut className="w-4 h-4" />Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
                  <Link to="/signup" className="btn-primary text-sm">Get Started</Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-gray-600" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white px-4 pb-4 pt-2">
            <nav className="flex flex-col gap-1">
              {user ? (
                <>
                  <Link to="/jobs" className={linkClass('/jobs')} onClick={() => setMobileOpen(false)}>Browse Jobs</Link>
                  {isCandidate && (
                    <>
                      <Link to="/saved" className={linkClass('/saved')} onClick={() => setMobileOpen(false)}>Saved</Link>
                      <Link to="/applications" className={linkClass('/applications')} onClick={() => setMobileOpen(false)}>Applications</Link>
                      <button onClick={() => { setMobileOpen(false); handleSwitchRole('employer'); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-brand-700 hover:bg-brand-50 w-full text-left">
                        <ArrowRightLeft className="w-4 h-4" />Switch to Employer
                      </button>
                    </>
                  )}
                  {isEmployer && (
                    <>
                      <Link to="/employer-dashboard" className={linkClass('/employer-dashboard')} onClick={() => setMobileOpen(false)}>Dashboard</Link>
                      <Link to="/my-jobs" className={linkClass('/my-jobs')} onClick={() => setMobileOpen(false)}>My Jobs</Link>
                      <Link to="/post-job" className={linkClass('/post-job')} onClick={() => setMobileOpen(false)}>Post Job</Link>
                      <button onClick={() => { setMobileOpen(false); handleSwitchRole('candidate'); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 w-full text-left">
                        <ArrowRightLeft className="w-4 h-4" />Switch to Candidate
                      </button>
                    </>
                  )}
                  <Link to="/ai-tools" className={linkClass('/ai-tools')} onClick={() => setMobileOpen(false)}>AI Tools</Link>
                  <Link to="/profile" className={linkClass('/profile')} onClick={() => setMobileOpen(false)}>Profile</Link>
                  <button onClick={handleSignOut} className="btn-ghost text-sm gap-1.5 justify-start mt-2">
                    <LogOut className="w-4 h-4" />Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/jobs" className={linkClass('/jobs')} onClick={() => setMobileOpen(false)}>Browse Jobs</Link>
                  <Link to="/login" className="btn-ghost text-sm justify-start" onClick={() => setMobileOpen(false)}>Sign In</Link>
                  <Link to="/signup" className="btn-primary text-sm justify-start" onClick={() => setMobileOpen(false)}>Get Started</Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          HireAI - AI-Powered Job Board. Built with React, Supabase & Tailwind CSS.
        </div>
      </footer>
    </div>
  );
}
