import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { MapPin, Briefcase, DollarSign, Bookmark, BookmarkCheck, ArrowLeft, Clock, Send, CheckCircle2, XCircle } from 'lucide-react';
import type { Job, JobType, Application } from '../types';

const typeBadge: Record<JobType, string> = {
  'full-time': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'part-time': 'bg-amber-50 text-amber-700 border-amber-200',
  'contract': 'bg-sky-50 text-sky-700 border-sky-200',
  'remote': 'bg-violet-50 text-violet-700 border-violet-200',
  'internship': 'bg-rose-50 text-rose-700 border-rose-200',
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  reviewed: 'bg-sky-50 text-sky-700',
  shortlisted: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
  hired: 'bg-brand-50 text-brand-700',
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatSalary(job: Job) {
  if (!job.salary_min && !job.salary_max) return null;
  const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
  if (job.salary_min && job.salary_max) return `${fmt(job.salary_min)} - ${fmt(job.salary_max)}/yr`;
  if (job.salary_min) return `From ${fmt(job.salary_min)}/yr`;
  return `Up to ${fmt(job.salary_max!)}/yr`;
}

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [existingApplication, setExistingApplication] = useState<Application | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchJob();
    if (user) checkStatus();
  }, [id, user]);

  const fetchJob = async () => {
    const { data, error } = await supabase.from('jobs').select('*').eq('id', id).single();
    if (error || !data) { toast('Job not found', 'error'); navigate('/jobs'); return; }
    setJob(data);
    setLoading(false);
  };

  const checkStatus = async () => {
    if (!user || !id) return;
    const { data: savedData } = await supabase.from('saved_jobs').select('id').eq('candidate_id', user.id).eq('job_id', id!).maybeSingle();
    setSaved(!!savedData);

    const { data: appData } = await supabase.from('applications').select('*').eq('candidate_id', user.id).eq('job_id', id!).maybeSingle();
    if (appData) { setApplied(true); setExistingApplication(appData); }
  };

  const toggleSave = async () => {
    if (!user || profile?.role !== 'candidate') { toast('Sign in as a candidate to save jobs', 'error'); return; }
    if (saved) {
      await supabase.from('saved_jobs').delete().eq('candidate_id', user.id).eq('job_id', id!);
      setSaved(false);
      toast('Job removed from saved', 'info');
    } else {
      const { error: saveError } = await supabase.from('saved_jobs').insert({ candidate_id: user.id, job_id: id! });
      if (saveError) { toast(saveError.message, 'error'); return; }
      setSaved(true);
      toast('Job saved!', 'success');
    }
  };

  const handleApply = async () => {
    if (!user || profile?.role !== 'candidate') { toast('Sign in as a candidate to apply', 'error'); return; }
    if (!coverLetter.trim()) { toast('Please write a cover letter', 'error'); return; }
    setApplying(true);
    const { error } = await supabase.from('applications').insert({
      candidate_id: user.id,
      job_id: id!,
      cover_letter: coverLetter,
    });
    setApplying(false);
    if (error) { toast(error.message, 'error'); return; }
    setApplied(true);
    setShowApply(false);
    toast('Application submitted!', 'success');
    checkStatus();
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!job) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="btn-ghost text-sm gap-1 mb-6">
        <ArrowLeft className="w-4 h-4" />Back
      </button>

      <div className="card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
              <span className="font-medium text-gray-700">{job.company_name}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDate(job.created_at)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className={`badge border ${typeBadge[job.type]}`}>{job.type.replace('-', ' ')}</span>
              <span className="badge bg-gray-50 text-gray-600 border border-gray-200">{job.category}</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {profile?.role === 'candidate' && (
              <button onClick={toggleSave} className={`btn-secondary gap-2 text-sm ${saved ? 'border-brand-200 text-brand-600' : ''}`}>
                {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}{saved ? 'Saved' : 'Save'}
              </button>
            )}
          </div>
        </div>

        {formatSalary(job) && (
          <div className="flex items-center gap-2 mb-6 p-4 bg-emerald-50 rounded-lg">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-emerald-700">{formatSalary(job)}</span>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
          <div className="text-gray-600 whitespace-pre-wrap leading-relaxed">{job.description}</div>
        </div>

        {job.requirements.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h2>
            <ul className="space-y-2">
              {job.requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {job.skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map(s => (
                <span key={s} className="badge bg-brand-50 text-brand-700 border border-brand-200">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Application section */}
        {profile?.role === 'candidate' && (
          <div className="border-t border-gray-200 pt-6">
            {applied ? (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="font-medium text-emerald-700">Application submitted</p>
                  {existingApplication && (
                    <p className="text-sm text-emerald-600 mt-1">Status: <span className={`badge ${statusColors[existingApplication.status]}`}>{existingApplication.status}</span></p>
                  )}
                </div>
              </div>
            ) : showApply ? (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Apply for this position</h2>
                <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} className="input-field min-h-[200px] mb-4" placeholder="Write your cover letter..." />
                <div className="flex gap-3">
                  <button onClick={handleApply} disabled={applying} className="btn-primary gap-2">
                    <Send className="w-4 h-4" />{applying ? 'Submitting...' : 'Submit Application'}
                  </button>
                  <button onClick={() => setShowApply(false)} className="btn-secondary">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowApply(true)} className="btn-primary gap-2">
                <Briefcase className="w-4 h-4" />Apply Now
              </button>
            )}
          </div>
        )}

        {profile?.role === 'employer' && job.employer_id === user?.id && (
          <div className="border-t border-gray-200 pt-6">
            <Link to={`/my-jobs/${job.id}/applicants`} className="btn-primary gap-2">
              <Briefcase className="w-4 h-4" />View Applicants
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
