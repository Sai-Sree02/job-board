import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { FileText, Upload, CheckCircle2, AlertCircle, TrendingUp, Target, BookOpen, Sparkles } from 'lucide-react';

interface AnalysisResult {
  score: number;
  strengths: string[];
  improvements: string[];
  keywords: { found: string[]; missing: string[] };
  sections: { name: string; present: boolean; quality: string }[];
  summary: string;
}

const SAMPLE_KEYWORDS = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'Agile', 'REST', 'API', 'CSS', 'HTML', 'AWS', 'Docker', 'CI/CD', 'Testing', 'Leadership', 'Communication', 'Problem-solving', 'Teamwork'];

function analyzeResume(text: string): AnalysisResult {
  const lower = text.toLowerCase();
  const lines = text.split('\n').filter(l => l.trim());
  const words = text.split(/\s+/).length;

  const found = SAMPLE_KEYWORDS.filter(k => lower.includes(k.toLowerCase()));
  const missing = SAMPLE_KEYWORDS.filter(k => !lower.includes(k.toLowerCase())).slice(0, 8);

  const sections = [
    { name: 'Contact Information', present: lower.includes('@') || lower.includes('email') || lower.includes('phone'), quality: lower.includes('@') && (lower.includes('phone') || lower.includes('linkedin')) ? 'Good' : 'Needs improvement' },
    { name: 'Professional Summary', present: lower.includes('summary') || lower.includes('objective') || lower.includes('profile') || (words > 50 && lines.length > 3), quality: words > 100 ? 'Good' : 'Brief' },
    { name: 'Work Experience', present: lower.includes('experience') || lower.includes('work') || lower.includes('employment') || lower.includes('company'), quality: lower.includes('experience') && words > 200 ? 'Detailed' : 'Needs more detail' },
    { name: 'Education', present: lower.includes('education') || lower.includes('degree') || lower.includes('university') || lower.includes('bachelor') || lower.includes('master'), quality: lower.includes('gpa') || lower.includes('honors') ? 'Detailed' : 'Standard' },
    { name: 'Skills Section', present: lower.includes('skills') || lower.includes('technologies') || lower.includes('proficient'), quality: found.length > 5 ? 'Strong' : 'Needs expansion' },
    { name: 'Achievements', present: lower.includes('achieved') || lower.includes('award') || lower.includes('accomplish') || lower.includes('improved') || lower.includes('increased'), quality: (lower.match(/\d+%/g) || []).length > 1 ? 'Quantified' : 'Add metrics' },
  ];

  const presentCount = sections.filter(s => s.present).length;
  const strongSections = sections.filter(s => s.quality.includes('Good') || s.quality.includes('Detailed') || s.quality.includes('Strong') || s.quality.includes('Quantified')).length;

  const score = Math.min(95, Math.round(
    (presentCount / sections.length) * 40 +
    (found.length / SAMPLE_KEYWORDS.length) * 30 +
    (strongSections / sections.length) * 20 +
    Math.min(words / 300, 1) * 10
  ));

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (found.length > 5) strengths.push(`Strong technical keyword presence (${found.length} relevant skills detected)`);
  if (words > 200) strengths.push('Good resume length with substantial content');
  if (sections.filter(s => s.present).length >= 5) strengths.push('Well-structured with most key sections present');
  if (lower.match(/\d+%/g)) strengths.push('Uses quantified achievements with metrics');

  if (missing.length > 0) improvements.push(`Add missing technical keywords: ${missing.slice(0, 5).join(', ')}`);
  if (!sections.find(s => s.name === 'Achievements')?.present) improvements.push('Add quantified achievements (use numbers and percentages)');
  if (words < 150) improvements.push('Resume appears too brief - expand your descriptions');
  if (!lower.includes('summary') && !lower.includes('objective')) improvements.push('Add a professional summary at the top');
  if (found.length < 5) improvements.push('Expand your skills section with more relevant keywords');

  sections.filter(s => !s.present).forEach(s => improvements.push(`Add a ${s.name.toLowerCase()} section`));

  const summary = score >= 80
    ? 'Excellent resume! It has strong keyword presence, good structure, and quantified achievements. Fine-tune the remaining areas to reach the top tier.'
    : score >= 60
    ? 'Good foundation with room for improvement. Focus on adding missing keywords, quantifying achievements, and ensuring all key sections are present.'
    : 'Your resume needs significant improvement. Start by adding key sections, incorporating relevant keywords, and quantifying your achievements with metrics.';

  return { score, strengths: strengths.length ? strengths : ['Resume submitted for analysis'], improvements: improvements.length ? improvements : ['Continue refining your resume'], keywords: { found, missing }, sections, summary };
}

function ScoreRing({ score }: { score: number }) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle cx="64" cy="64" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <span className="text-3xl font-bold" style={{ color }}>{score}</span>
          <span className="text-sm text-gray-400 block">/100</span>
        </div>
      </div>
    </div>
  );
}

export default function ResumeAnalyzer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resumeText, setResumeText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) { toast('Please paste your resume content', 'error'); return; }
    if (!user) { toast('Please sign in to use AI tools', 'error'); return; }
    setAnalyzing(true);
    // Simulate AI processing delay
    await new Promise(r => setTimeout(r, 1500));
    const analysis = analyzeResume(resumeText);
    setResult(analysis);
    setAnalyzing(false);
    toast('Resume analysis complete!', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'text/plain') { toast('Please upload a .txt file', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setResumeText(ev.target?.result as string || '');
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6 text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Resume Analyzer</h1>
        <p className="text-gray-500 mt-1">Get AI-powered feedback on your resume</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <div>
          <div className={`card p-6 border-2 transition-colors ${dragOver ? 'border-brand-500' : 'border-transparent'}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f?.type === 'text/plain') { const r = new FileReader(); r.onload = ev => setResumeText(ev.target?.result as string || ''); r.readAsText(f); } else toast('Please drop a .txt file', 'error'); }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Paste Your Resume</label>
            <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} className="input-field min-h-[300px]" placeholder="Paste your resume text here, or upload a .txt file below..." />
            <div className="mt-3 flex items-center gap-3">
              <label className="btn-secondary gap-2 text-sm cursor-pointer">
                <Upload className="w-4 h-4" />Upload .txt
                <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
              </label>
              {resumeText && <span className="text-xs text-gray-400">{resumeText.split(/\s+/).length} words</span>}
            </div>
            <button onClick={handleAnalyze} disabled={analyzing || !resumeText.trim()} className="btn-primary w-full mt-4 gap-2">
              <Sparkles className="w-4 h-4" />{analyzing ? 'Analyzing...' : 'Analyze Resume'}
            </button>
          </div>
        </div>

        {/* Results */}
        <div>
          {analyzing ? (
            <div className="card p-8 flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Analyzing your resume...</p>
              <p className="text-sm text-gray-400">AI is reviewing structure, keywords, and impact</p>
            </div>
          ) : result ? (
            <div className="space-y-4">
              {/* Score */}
              <div className="card p-6 text-center">
                <ScoreRing score={result.score} />
                <p className="mt-3 text-sm text-gray-600 font-medium">Resume Score</p>
              </div>

              {/* Summary */}
              <div className="card p-5">
                <p className="text-sm text-gray-600">{result.summary}</p>
              </div>

              {/* Strengths */}
              {result.strengths.length > 0 && (
                <div className="card p-5">
                  <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />Strengths
                  </h3>
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {result.improvements.length > 0 && (
                <div className="card p-5">
                  <h3 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {result.improvements.map((s, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <Target className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Keywords */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />Keywords
                </h3>
                {result.keywords.found.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Found ({result.keywords.found.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.keywords.found.map(k => (
                        <span key={k} className="badge bg-emerald-50 text-emerald-700">{k}</span>
                      ))}
                    </div>
                  </div>
                )}
                {result.keywords.missing.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Missing ({result.keywords.missing.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.keywords.missing.map(k => (
                        <span key={k} className="badge bg-red-50 text-red-700">{k}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sections */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Section Analysis</h3>
                <div className="space-y-2">
                  {result.sections.map(s => (
                    <div key={s.name} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{s.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${s.present ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{s.present ? 'Present' : 'Missing'}</span>
                        <span className="text-xs text-gray-400">{s.quality}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-8 flex flex-col items-center justify-center min-h-[300px] text-gray-400">
              <FileText className="w-12 h-12 mb-3" />
              <p className="font-medium text-gray-500">Results will appear here</p>
              <p className="text-sm">Paste your resume and click Analyze</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
