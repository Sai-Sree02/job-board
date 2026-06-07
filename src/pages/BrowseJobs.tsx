import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Search, MapPin, Briefcase, DollarSign, Bookmark, BookmarkCheck, ChevronDown, Filter, X } from 'lucide-react';
import type { Job, JobType } from '../types';

const JOB_TYPES: JobType[] = ['full-time', 'part-time', 'contract', 'remote', 'internship'];
const CATEGORIES = ['Engineering', 'Design', 'Marketing', 'Sales', 'Finance', 'Operations', 'Product', 'Data Science', 'Customer Success', 'HR'];

const typeBadge: Record<JobType, string> = {
  'full-time': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'part-time': 'bg-amber-50 text-amber-700 border-amber-200',
  'contract': 'bg-sky-50 text-sky-700 border-sky-200',
  'remote': 'bg-violet-50 text-violet-700 border-violet-200',
  'internship': 'bg-rose-50 text-rose-700 border-rose-200',
};

function formatSalary(job: Job) {
  if (!job.salary_min && !job.salary_max) return null;
  const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
  if (job.salary_min && job.salary_max) return `${fmt(job.salary_min)} - ${fmt(job.salary_max)}`;
  if (job.salary_min) return `From ${fmt(job.salary_min)}`;
  return `Up to ${fmt(job.salary_max!)}`;
}

export default function BrowseJobs() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<JobType | ''>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
    if (user && profile?.role === 'candidate') fetchSaved();
  }, [location.key]);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (!error && data) setJobs(data);
    setLoading(false);
  };

  const fetchSaved = async () => {
    if (!user) return;
    const { data } = await supabase.from('saved_jobs').select('job_id').eq('candidate_id', user.id);
    if (data) setSavedIds(new Set(data.map(s => s.job_id)));
  };

  const toggleSave = async (jobId: string) => {
    if (!user || profile?.role !== 'candidate') { toast('Sign in as a candidate to save jobs', 'error'); return; }
    setSavingId(jobId);
    if (savedIds.has(jobId)) {
      await supabase.from('saved_jobs').delete().eq('candidate_id', user.id).eq('job_id', jobId);
      setSavedIds(prev => { const n = new Set(prev); n.delete(jobId); return n; });
      toast('Job removed from saved', 'info');
    } else {
      const { error: insertError } = await supabase.from('saved_jobs').insert({ candidate_id: user.id, job_id: jobId });
      if (insertError) { toast(insertError.message, 'error'); setSavingId(null); return; }
      setSavedIds(prev => new Set(prev).add(jobId));
      toast('Job saved!', 'success');
    }
    setSavingId(null);
  };

  const filtered = useMemo(() => {
    let result = jobs;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company_name.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.skills.some(s => s.toLowerCase().includes(q))
      );
    }
    if (typeFilter) result = result.filter(j => j.type === typeFilter);
    if (categoryFilter) result = result.filter(j => j.category === categoryFilter);
    return result;
  }, [jobs, search, typeFilter, categoryFilter]);

  const hasActiveFilters = typeFilter || categoryFilter || search;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Browse Jobs</h1>
          <p className="text-gray-500 text-sm">{filtered.length} positions available</p>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary gap-2 text-sm">
          <Filter className="w-4 h-4" />Filters{hasActiveFilters ? ` (${(typeFilter ? 1 : 0) + (categoryFilter ? 1 : 0)})` : ''}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" placeholder="Search by title, company, location, or skill..." />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card p-4 mb-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
              <div className="relative">
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as JobType | '')} className="input-field pr-8 appearance-none">
                  <option value="">All Types</option>
                  {JOB_TYPES.map(t => <option key={t} value={t}>{t.replace('-', ' ')}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <div className="relative">
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="input-field pr-8 appearance-none">
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          {hasActiveFilters && (
            <button onClick={() => { setTypeFilter(''); setCategoryFilter(''); setSearch(''); }} className="btn-ghost text-sm gap-1 mt-3">
              <X className="w-4 h-4" />Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Job list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No jobs found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(job => (
            <div key={job.id} className="card p-5 hover:border-brand-200">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <Link to={`/jobs/${job.id}`} className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-brand-600 transition-colors truncate">{job.title}</h3>
                    </Link>
                    {user && profile?.role === 'candidate' && (
                      <button onClick={() => toggleSave(job.id)} disabled={savingId === job.id} className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                        {savedIds.has(job.id) ? <BookmarkCheck className="w-5 h-5 text-brand-600" /> : <Bookmark className="w-5 h-5 text-gray-400" />}
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                    <span className="font-medium text-gray-700">{job.company_name}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                    {formatSalary(job) && <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{formatSalary(job)}</span>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className={`badge border ${typeBadge[job.type]}`}>{job.type.replace('-', ' ')}</span>
                    <span className="badge bg-gray-50 text-gray-600 border border-gray-200">{job.category}</span>
                    {job.skills.slice(0, 4).map(s => (
                      <span key={s} className="badge bg-brand-50 text-brand-700">{s}</span>
                    ))}
                    {job.skills.length > 4 && <span className="text-xs text-gray-400">+{job.skills.length - 4} more</span>}
                  </div>
                </div>
                <Link to={`/jobs/${job.id}`} className="btn-primary text-sm shrink-0">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
