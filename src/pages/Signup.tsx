import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Mail, Lock, User, Building2, ArrowRight, Briefcase } from 'lucide-react';
import type { UserRole } from '../types';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('candidate');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) { toast('Please fill in all required fields', 'error'); return; }
    if (password.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    if (role === 'employer' && !companyName) { toast('Company name is required for employers', 'error'); return; }
    setLoading(true);
    const { error } = await signUp(email, password, role, fullName, role === 'employer' ? companyName : undefined);
    setLoading(false);
    if (error) { toast(error, 'error'); return; }
    toast('Account created successfully!', 'success');
    navigate('/jobs');
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1">Join HireAI today</p>
        </div>
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setRole('candidate')}
              className={`p-3 rounded-lg border-2 text-center transition-all ${role === 'candidate' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              <User className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm font-medium">Candidate</span>
            </button>
            <button type="button" onClick={() => setRole('employer')}
              className={`p-3 rounded-lg border-2 text-center transition-all ${role === 'employer' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              <Building2 className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm font-medium">Employer</span>
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input-field pl-10" placeholder="John Doe" />
            </div>
          </div>
          {role === 'employer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="input-field pl-10" placeholder="Acme Inc." />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field pl-10" placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field pl-10" placeholder="Min. 6 characters" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full gap-2">
            {loading ? 'Creating account...' : 'Create Account'}<ArrowRight className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account? <Link to="/login" className="text-brand-600 font-medium hover:text-brand-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
