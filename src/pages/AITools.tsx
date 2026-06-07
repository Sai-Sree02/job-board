import { Link } from 'react-router-dom';
import { FileText, Sparkles, ArrowRight } from 'lucide-react';

export default function AITools() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6 text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">AI Tools</h1>
        <p className="text-gray-500 mt-1">Boost your job search with AI-powered features</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <Link to="/ai/resume-analyzer" className="card p-6 group hover:border-brand-200">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Resume Analyzer</h3>
          <p className="text-sm text-gray-500 mb-4">Get instant AI feedback on your resume. Analyze structure, keywords, ATS compatibility, and get actionable improvement suggestions.</p>
          <span className="text-brand-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            Try it now <ArrowRight className="w-4 h-4" />
          </span>
        </Link>

        <Link to="/ai/cover-letter" className="card p-6 group hover:border-brand-200">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Cover Letter Generator</h3>
          <p className="text-sm text-gray-500 mb-4">Generate a tailored, professional cover letter in seconds. Select a job from our listings and let AI craft the perfect letter.</p>
          <span className="text-brand-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            Try it now <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>
    </div>
  );
}
