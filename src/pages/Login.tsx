import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Mail, Lock, ArrowRight, Briefcase } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast('Please fill in all fields', 'error'); return; }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) { toast(error, 'error'); return; }
    toast('Welcome back!', 'success');
    navigate('/jobs');
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
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
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field pl-10" placeholder="Your password" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full gap-2">
            {loading ? 'Signing in...' : 'Sign In'}<ArrowRight className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account? <Link to="/signup" className="text-brand-600 font-medium hover:text-brand-700">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
