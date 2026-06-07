import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Briefcase, Plus, Users, TrendingUp, Eye, Clock, ArrowRight, User, Building2 } from 'lucide-react';
import type { Job, Application } from '../types';

interface AppRow extends Application {
  jobs: { id: string; title: string; company_name: string };
  profiles: { id: string; full_name: string | null; email: string } | null;
}

export default function EmployerDashboard() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalApps, setTotalApps] = useState(0);
  const [recentApps, setRecentApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role !== 'employer') { navigate('/jobs'); return; }
    fetchDashboard();
  }, [profile]);

  const fetchDashboard = async () => {
    if (!user) return;

    // Fetch employer's jobs
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', user.id)
      .order('created_at', { ascending: false });
    if (jobError) { toast(jobError.message, 'error'); setLoading(false); return; }
    setJobs(jobData || []);

    // Fetch recent applications across all jobs
    const jobIds = (jobData || []).map(j => j.id);
    if (jobIds.length > 0) {
      const { data: appData, error: appError } = await supabase
        .from('applications')
        .select('*, jobs(id, title, company_name), profiles(id, full_name, email)')
        .in('job_id', jobIds)
        .order('created_at', { ascending: false })
        .limit(10);
      if (!appError && appData) {
        setRecentApps(appData as unknown as AppRow[]);
        setTotalApps(appData.length);
      }
    }

    setLoading(false);
  };

  const activeJobs = jobs.filter(j => j.is_active).length;
  const totalViews = jobs.reduce((sum, j) => sum + (j.is_active ? 1 : 0), 0); // proxy metric
  const pendingApps = recentApps.filter(a => a.status === 'pending').length;

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile?.company_name || profile?.full_name || 'Employer'}
          </h1>
          <p className="text-gray-500 mt-1">Manage your job listings and applications</p>
        </div>
        <Link to="/post-job" className="btn-primary gap-2 shrink-0">
          <Plus className="w-4 h-4" />Post New Job
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
              <p className="text-sm text-gray-500">Total Jobs</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Eye className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeJobs}</p>
              <p className="text-sm text-gray-500">Active Jobs</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{recentApps.length}</p>
              <p className="text-sm text-gray-500">Applications</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingApps}</p>
              <p className="text-sm text-gray-500">Pending Review</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Jobs - 2 cols */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Job Listings</h2>
            <Link to="/my-jobs" className="text-brand-600 text-sm font-medium flex items-center gap-1 hover:text-brand-700">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {jobs.length === 0 ? (
            <div className="card p-8 text-center">
              <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-600">No jobs posted yet</p>
              <p className="text-sm text-gray-400 mt-1">Post your first job to start receiving applications</p>
              <Link to="/post-job" className="btn-primary text-sm mt-4 inline-flex gap-2">
                <Plus className="w-4 h-4" />Post a Job
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 5).map(job => (
                <div key={job.id} className={`card p-4 ${!job.is_active ? 'opacity-60' : ''}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
                        {!job.is_active && <span className="badge bg-gray-100 text-gray-500">Paused</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span>{job.location}</span>
                        <span className="capitalize">{job.type.replace('-', ' ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/my-jobs/${job.id}/applicants`} className="btn-secondary text-xs gap-1 py-1.5">
                        <Users className="w-3.5 h-3.5" />Applicants
                      </Link>
                      <Link to={`/post-job?edit=${job.id}`} className="btn-ghost text-xs py-1.5">Edit</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications - 1 col */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
          </div>
          {recentApps.length === 0 ? (
            <div className="card p-8 text-center">
              <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-600">No applications yet</p>
              <p className="text-sm text-gray-400 mt-1">They will appear here once candidates apply</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApps.slice(0, 6).map(app => {
                const statusColor: Record<string, string> = {
                  pending: 'bg-amber-50 text-amber-700',
                  reviewed: 'bg-sky-50 text-sky-700',
                  shortlisted: 'bg-emerald-50 text-emerald-700',
                  rejected: 'bg-red-50 text-red-700',
                  hired: 'bg-brand-50 text-brand-700',
                };
                return (
                  <div key={app.id} className="card p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-brand-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {app.profiles?.full_name || 'Anonymous'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          for {app.jobs?.title}
                        </p>
                      </div>
                      <span className={`badge ${statusColor[app.status] || 'bg-gray-50 text-gray-600'}`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link to="/post-job" className="card p-5 group hover:border-brand-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                <Plus className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Create New Job</p>
                <p className="text-sm text-gray-500">Post a new position</p>
              </div>
            </div>
          </Link>
          <Link to="/my-jobs" className="card p-5 group hover:border-brand-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Jobs</p>
                <p className="text-sm text-gray-500">Edit, pause, or delete</p>
              </div>
            </div>
          </Link>
          <Link to="/profile" className="card p-5 group hover:border-brand-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Company Profile</p>
                <p className="text-sm text-gray-500">Update your info</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
