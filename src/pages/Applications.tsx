import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { FileText, MapPin, Briefcase } from 'lucide-react';
import type { Application } from '../types';

interface AppRow extends Application {
  jobs: { id: string; title: string; company_name: string; location: string; type: string };
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  reviewed: 'bg-sky-50 text-sky-700 border-sky-200',
  shortlisted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  hired: 'bg-brand-50 text-brand-700 border-brand-200',
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Applications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('applications')
      .select('*, jobs(id, title, company_name, location, type)')
      .eq('candidate_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setApplications(data as unknown as AppRow[]);
    setLoading(false);
  };

  const filtered = statusFilter
    ? applications.filter(a => a.status === statusFilter)
    : applications;

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-500 text-sm">{applications.length} total</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', 'pending', 'reviewed', 'shortlisted', 'rejected', 'hired'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${statusFilter === s ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No applications yet</p>
          <p className="text-sm">Apply to jobs to track your progress</p>
          <Link to="/jobs" className="btn-primary text-sm mt-4 inline-flex">Browse Jobs</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(app => (
            <div key={app.id} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <Link to={`/jobs/${app.jobs.id}`} className="text-lg font-semibold text-gray-900 hover:text-brand-600 transition-colors">
                      {app.jobs.title}
                    </Link>
                    <span className={`badge border ${statusColors[app.status]}`}>{app.status}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="font-medium text-gray-700">{app.jobs.company_name}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{app.jobs.location}</span>
                    <span>Applied {formatDate(app.created_at)}</span>
                  </div>
                </div>
                <Link to={`/jobs/${app.jobs.id}`} className="btn-secondary text-sm shrink-0">View Job</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
