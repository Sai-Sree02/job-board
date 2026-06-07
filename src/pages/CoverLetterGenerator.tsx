import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Sparkles, Copy, FileText, Briefcase, ChevronDown, Download } from 'lucide-react';
import type { Job } from '../types';

const CATEGORIES = ['Engineering', 'Design', 'Marketing', 'Sales', 'Finance', 'Operations', 'Product', 'Data Science', 'Customer Success', 'HR'];

function generateCoverLetter(data: {
  fullName: string;
  email: string;
  company: string;
  jobTitle: string;
  skills: string;
  experience: string;
  motivation: string;
  category: string;
}): string {
  const { fullName, email, company, jobTitle, skills, experience, motivation, category } = data;
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const skillList = skills.split(',').map(s => s.trim()).filter(Boolean);
  const expLines = experience.split('\n').filter(l => l.trim());

  return `${fullName}
${email}
${today}

Hiring Manager
${company}

Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${company}. ${motivation || `With my background in ${category} and passion for delivering impactful results, I am confident I would be a valuable addition to your team.`}

${expLines.length > 0 ? `Throughout my career, I have developed expertise that directly aligns with this role:\n\n${expLines.map(e => `- ${e.trim()}`).join('\n')}\n\nThese experiences have equipped me with the skills and perspective needed to excel as a ${jobTitle}.` : `My professional experience has equipped me with the analytical thinking, collaborative spirit, and technical proficiency needed to make an immediate impact in this role.`}

${skillList.length > 0 ? `My technical skill set includes ${skillList.slice(0, 5).join(', ')}${skillList.length > 5 ? `, and ${skillList.slice(5).join(', ')}` : ''}, which I have applied across multiple projects to drive measurable outcomes. I am particularly drawn to ${company}'s commitment to innovation and believe my ${category.toLowerCase()} expertise can contribute meaningfully to your goals.` : `I bring a versatile skill set and a track record of adapting quickly to new challenges, which I believe makes me an excellent fit for this position.`}

I would welcome the opportunity to discuss how my background, skills, and enthusiasm can benefit ${company}. I am available for an interview at your convenience and look forward to your response.

Thank you for considering my application.

Best regards,
${fullName}`;
}

export default function CoverLetterGenerator() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [motivation, setMotivation] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [generating, setGenerating] = useState(false);
  const [letter, setLetter] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchJobs();
    if (profile) {
      setFullName(profile.full_name || '');
      setEmail(profile.email || '');
    }
  }, [profile]);

  const fetchJobs = async () => {
    const { data } = await supabase.from('jobs').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(50);
    if (data) setJobs(data);
  };

  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setCompany(job.company_name);
      setJobTitle(job.title);
      setCategory(job.category);
      setSkills(job.skills.join(', '));
    }
  };

  const handleGenerate = async () => {
    if (!user) { toast('Please sign in to use AI tools', 'error'); return; }
    if (!fullName || !company || !jobTitle) { toast('Please fill in required fields', 'error'); return; }
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1200));
    const result = generateCoverLetter({ fullName, email, company, jobTitle, skills, experience, motivation, category });
    setLetter(result);
    setGenerating(false);
    toast('Cover letter generated!', 'success');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    toast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([letter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${company.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6 text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Cover Letter Generator</h1>
        <p className="text-gray-500 mt-1">Generate a tailored cover letter with AI</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input form */}
        <div className="card p-6 space-y-4">
          {/* Job selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select a Job (optional)</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select value={selectedJobId} onChange={e => handleJobSelect(e.target.value)} className="input-field pl-10 appearance-none">
                <option value="">Choose a job to auto-fill...</option>
                {jobs.map(j => <option key={j.id} value={j.id}>{j.title} at {j.company_name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
              <input type="text" value={company} onChange={e => setCompany(e.target.value)} className="input-field" placeholder="Target company" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
              <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="input-field" placeholder="Position title" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="input-field">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Key Skills</label>
            <input type="text" value={skills} onChange={e => setSkills(e.target.value)} className="input-field" placeholder="React, TypeScript, Node.js (comma-separated)" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Relevant Experience</label>
            <textarea value={experience} onChange={e => setExperience(e.target.value)} className="input-field min-h-[100px]" placeholder="List your relevant experience, one per line..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Why this role? (optional)</label>
            <textarea value={motivation} onChange={e => setMotivation(e.target.value)} className="input-field min-h-[80px]" placeholder="What excites you about this position?" />
          </div>

          <button onClick={handleGenerate} disabled={generating} className="btn-primary w-full gap-2">
            <Sparkles className="w-4 h-4" />{generating ? 'Generating...' : 'Generate Cover Letter'}
          </button>
        </div>

        {/* Output */}
        <div>
          {generating ? (
            <div className="card p-8 flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Generating your cover letter...</p>
              <p className="text-sm text-gray-400">AI is crafting a personalized letter</p>
            </div>
          ) : letter ? (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2"><FileText className="w-5 h-5" />Your Cover Letter</h3>
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="btn-secondary text-sm gap-1">
                    <Copy className="w-4 h-4" />{copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleDownload} className="btn-secondary text-sm gap-1">
                    <Download className="w-4 h-4" />Download
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-5 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto">
                {letter}
              </div>
            </div>
          ) : (
            <div className="card p-8 flex flex-col items-center justify-center min-h-[300px] text-gray-400">
              <FileText className="w-12 h-12 mb-3" />
              <p className="font-medium text-gray-500">Your cover letter will appear here</p>
              <p className="text-sm">Fill in the form and click Generate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
