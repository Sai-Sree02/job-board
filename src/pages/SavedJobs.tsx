import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Bookmark, MapPin, Briefcase, Trash2 } from 'lucide-react';
import type { Job } from '../types';

interface SavedJobRow {
  id: string;
  job_id: string;
  created_at: string;
  jobs: Job;
}

export default function SavedJobs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saved, setSaved] = useState<SavedJobRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSaved(); }, []);

  const fetchSaved = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('saved_jobs')
      .select('id, job_id, created_at, jobs(*)')
      .eq('candidate_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setSaved(data as unknown as SavedJobRow[]);
    setLoading(false);
  };

  const unsave = async (saveId: string, jobId: string) => {
    const { error } = await supabase.from('saved_jobs').delete().eq('id', saveId);
    if (error) { toast(error.message, 'error'); return; }
    setSaved(prev => prev.filter(s => s.id !== saveId));
    toast('Job removed from saved', 'info');
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Saved Jobs</h1>
      {saved.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Bookmark className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No saved jobs yet</p>
          <p className="text-sm">Browse jobs and save the ones you like</p>
          <Link to="/jobs" className="btn-primary text-sm mt-4 inline-flex">Browse Jobs</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {saved.map(s => (
            <div key={s.id} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <Link to={`/jobs/${s.jobs.id}`} className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-brand-600 transition-colors">{s.jobs.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="font-medium text-gray-700">{s.jobs.company_name}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{s.jobs.location}</span>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <Link to={`/jobs/${s.jobs.id}`} className="btn-primary text-sm">View</Link>
                  <button onClick={() => unsave(s.id, s.job_id)} className="btn-ghost text-red-500 hover:bg-red-50 p-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
