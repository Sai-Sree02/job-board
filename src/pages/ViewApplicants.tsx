import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { ArrowLeft, User, Mail, FileText, Clock } from 'lucide-react';
import type { Application } from '../types';

interface AppRow extends Application {
  profiles: { id: string; full_name: string | null; email: string; bio: string | null } | null;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  reviewed: 'bg-sky-50 text-sky-700 border-sky-200',
  shortlisted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  hired: 'bg-brand-50 text-brand-700 border-brand-200',
};

const statusOptions: Application['status'][] = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ViewApplicants() {
  const { jobId } = useParams<{ jobId: string }>();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = useState('');
  const [applications, setApplications] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.role !== 'employer') { navigate('/jobs'); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!user || !jobId) return;

    const { data: jobData, error: jobError } = await supabase.from('jobs').select('title, employer_id').eq('id', jobId).single();
    if (jobError || !jobData) { toast('Job not found', 'error'); navigate('/my-jobs'); return; }
    if (jobData.employer_id !== user.id) { toast('Not authorized', 'error'); navigate('/my-jobs'); return; }
    setJobTitle(jobData.title);

    const { data, error } = await supabase
      .from('applications')
      .select('*, profiles(id, full_name, email, bio)')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });
    if (!error && data) setApplications(data as unknown as AppRow[]);
    setLoading(false);
  };

  const updateStatus = async (appId: string, status: Application['status']) => {
    const { error } = await supabase.from('applications').update({ status }).eq('id', appId);
    if (error) { toast(error.message, 'error'); return; }
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    toast(`Application ${status}`, 'success');
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="btn-ghost text-sm gap-1 mb-6">
        <ArrowLeft className="w-4 h-4" />Back
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
        <p className="text-gray-500 text-sm">for {jobTitle} ({applications.length} total)</p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No applicants yet</p>
          <p className="text-sm">Applicants will appear here when they apply</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map(app => {
            const isExpanded = expandedApp === app.id;
            return (
              <div key={app.id} className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{app.profiles?.full_name || 'Anonymous'}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{app.profiles?.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`badge border ${statusColors[app.status]}`}>{app.status}</span>
                    <select value={app.status} onChange={e => updateStatus(app.id, e.target.value as Application['status'])}
                      className="input-field py-1.5 text-sm w-auto">
                      {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => setExpandedApp(isExpanded ? null : app.id)} className="btn-ghost text-sm">
                      {isExpanded ? 'Hide' : 'View Cover Letter'}
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Clock className="w-3.5 h-3.5" />Applied {formatDate(app.created_at)}
                    </div>
                    {app.cover_letter ? (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Cover Letter</p>
                        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 whitespace-pre-wrap">{app.cover_letter}</div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No cover letter provided</p>
                    )}
                    {app.profiles?.bio && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Bio</p>
                        <p className="text-sm text-gray-600">{app.profiles.bio}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
