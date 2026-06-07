import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { ArrowLeft, Plus, X, Briefcase, Building2 } from 'lucide-react';
import type { JobType } from '../types';

const JOB_TYPES: JobType[] = ['full-time', 'part-time', 'contract', 'remote', 'internship'];
const CATEGORIES = ['Engineering', 'Design', 'Marketing', 'Sales', 'Finance', 'Operations', 'Product', 'Data Science', 'Customer Success', 'HR'];

export default function PostJob() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<JobType>('full-time');
  const [category, setCategory] = useState('Engineering');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  useEffect(() => {
    if (profile?.role !== 'employer') { navigate('/jobs'); return; }
    setCompanyName(profile?.company_name || profile?.full_name || '');
    if (editId) fetchJob();
  }, [editId, profile]);

  const fetchJob = async () => {
    const { data, error } = await supabase.from('jobs').select('*').eq('id', editId).single();
    if (error || !data) { toast('Job not found', 'error'); navigate('/my-jobs'); return; }
    setTitle(data.title);
    setCompanyName(data.company_name);
    setLocation(data.location);
    setType(data.type);
    setCategory(data.category);
    setSalaryMin(data.salary_min?.toString() || '');
    setSalaryMax(data.salary_max?.toString() || '');
    setDescription(data.description);
    setRequirements(data.requirements || []);
    setSkills(data.skills || []);
    setInitialLoading(false);
  };

  const addRequirement = () => {
    if (!newRequirement.trim()) return;
    setRequirements(prev => [...prev, newRequirement.trim()]);
    setNewRequirement('');
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setSkills(prev => [...prev, newSkill.trim()]);
    setNewSkill('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !companyName || !location || !description || !category) {
      toast('Please fill in all required fields', 'error'); return;
    }

    setLoading(true);
    const jobData = {
      title,
      company_name: companyName,
      location,
      type,
      category,
      salary_min: salaryMin ? parseInt(salaryMin) : null,
      salary_max: salaryMax ? parseInt(salaryMax) : null,
      description,
      requirements,
      skills,
    };

    let error;
    if (isEditing) {
      ({ error } = await supabase.from('jobs').update(jobData).eq('id', editId));
    } else {
      ({ error } = await supabase.from('jobs').insert({
        ...jobData,
        employer_id: user!.id,
      }));
    }

    setLoading(false);
    if (error) { toast(error.message, 'error'); return; }
    toast(isEditing ? 'Job updated!' : 'Job posted!', 'success');
    navigate('/my-jobs');
  };

  if (initialLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="btn-ghost text-sm gap-1 mb-6">
        <ArrowLeft className="w-4 h-4" />Back
      </button>

      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-6 h-6 text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Job' : 'Post a New Job'}</h1>
        <p className="text-gray-500 mt-1">{isEditing ? 'Update your job listing' : 'Find the perfect candidate'}</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="Senior React Developer" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="input-field pl-10" placeholder="Acme Inc." />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="input-field" placeholder="San Francisco, CA" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
            <select value={type} onChange={e => setType(e.target.value as JobType)} className="input-field">
              {JOB_TYPES.map(t => <option key={t} value={t}>{t.replace('-', ' ')}</option>)}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="input-field">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range (annual)</label>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} className="input-field" placeholder="Min" />
              <input type="number" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} className="input-field" placeholder="Max" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="input-field min-h-[160px]" placeholder="Describe the role, responsibilities, and what makes it great..." />
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
          <div className="flex gap-2 mb-2">
            <input type="text" value={newRequirement} onChange={e => setNewRequirement(e.target.value)} className="input-field flex-1" placeholder="Add a requirement" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRequirement())} />
            <button type="button" onClick={addRequirement} className="btn-secondary gap-1"><Plus className="w-4 h-4" />Add</button>
          </div>
          <div className="space-y-1">
            {requirements.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                <span className="flex-1">{r}</span>
                <button type="button" onClick={() => setRequirements(prev => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
          <div className="flex gap-2 mb-2">
            <input type="text" value={newSkill} onChange={e => setNewSkill(e.target.value)} className="input-field flex-1" placeholder="Add a skill" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
            <button type="button" onClick={addSkill} className="btn-secondary gap-1"><Plus className="w-4 h-4" />Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((s, i) => (
              <span key={i} className="badge bg-brand-50 text-brand-700 border border-brand-200 flex items-center gap-1">
                {s}
                <button type="button" onClick={() => setSkills(prev => prev.filter((_, j) => j !== i))} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full gap-2">
          {loading ? 'Saving...' : isEditing ? 'Update Job' : 'Post Job'}
        </button>
      </form>
    </div>
  );
}
