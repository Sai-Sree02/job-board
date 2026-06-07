import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Briefcase, Plus, Edit2, Trash2, Users, MapPin, Eye, EyeOff } from 'lucide-react';
import type { Job } from '../types';

const typeBadge: Record<string, string> = {
  'full-time': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'part-time': 'bg-amber-50 text-amber-700 border-amber-200',
  'contract': 'bg-sky-50 text-sky-700 border-sky-200',
  'remote': 'bg-violet-50 text-violet-700 border-violet-200',
  'internship': 'bg-rose-50 text-rose-700 border-rose-200',
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MyJobs() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [appCounts, setAppCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (profile?.role !== 'employer') { navigate('/jobs'); return; }
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) {
      setJobs(data);
      // Get application counts in a single query
      const jobIds = data.map(j => j.id);
      if (jobIds.length > 0) {
        const { data: appData } = await supabase
          .from('applications')
          .select('job_id')
          .in('job_id', jobIds);
        if (appData) {
          const counts: Record<string, number> = {};
          appData.forEach(a => { counts[a.job_id] = (counts[a.job_id] || 0) + 1; });
          setAppCounts(counts);
        }
      }
    }
    setLoading(false);
  };

  const toggleActive = async (job: Job) => {
    const { error } = await supabase.from('jobs').update({ is_active: !job.is_active }).eq('id', job.id);
    if (error) { toast(error.message, 'error'); return; }
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, is_active: !j.is_active } : j));
    toast(job.is_active ? 'Job paused' : 'Job activated', 'success');
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    const { error } = await supabase.from('jobs').delete().eq('id', jobId);
    if (error) { toast(error.message, 'error'); return; }
    setJobs(prev => prev.filter(j => j.id !== jobId));
    toast('Job deleted', 'success');
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          <p className="text-gray-500 text-sm">{jobs.length} jobs posted</p>
        </div>
        <Link to="/post-job" className="btn-primary gap-2 text-sm">
          <Plus className="w-4 h-4" />Post New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No jobs posted yet</p>
          <p className="text-sm">Post your first job to start receiving applications</p>
          <Link to="/post-job" className="btn-primary text-sm mt-4 inline-flex gap-2"><Plus className="w-4 h-4" />Post a Job</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map(job => (
            <div key={job.id} className={`card p-5 ${!job.is_active ? 'opacity-60' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <span className={`badge border ${typeBadge[job.type]}`}>{job.type.replace('-', ' ')}</span>
                    {!job.is_active && <span className="badge bg-gray-100 text-gray-500">Paused</span>}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                    <span>{formatDate(job.created_at)}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{appCounts[job.id] || 0} applicants</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/my-jobs/${job.id}/applicants`} className="btn-secondary text-sm gap-1">
                    <Users className="w-4 h-4" />Applicants
                  </Link>
                  <Link to={`/post-job?edit=${job.id}`} className="btn-secondary text-sm gap-1">
                    <Edit2 className="w-4 h-4" />Edit
                  </Link>
                  <button onClick={() => toggleActive(job)} className="btn-ghost text-sm gap-1 p-2">
                    {job.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => deleteJob(job.id)} className="btn-ghost text-red-500 hover:bg-red-50 p-2">
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
