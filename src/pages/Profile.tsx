import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { supabase } from '../lib/supabase';
import { User, Building2, FileText, Save } from 'lucide-react';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [companyName, setCompanyName] = useState(profile?.company_name || '');
  const [saving, setSaving] = useState(false);

  if (!user || !profile) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { toast('Name is required', 'error'); return; }
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      full_name: fullName,
      bio,
      company_name: profile.role === 'employer' ? companyName : null,
    }).eq('id', user.id);
    setSaving(false);
    if (error) { toast(error.message, 'error'); return; }
    await refreshProfile();
    toast('Profile updated!', 'success');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-3">
          <User className="w-8 h-8 text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{profile.full_name || 'Profile'}</h1>
        <p className="text-gray-500 text-sm">{profile.email}</p>
        <span className="badge bg-brand-50 text-brand-700 capitalize mt-2 inline-flex">{profile.role}</span>
      </div>

      <form onSubmit={handleSave} className="card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input-field pl-10" />
          </div>
        </div>

        {profile.role === 'employer' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="input-field pl-10" />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} className="input-field min-h-[120px]" placeholder="Tell us about yourself..." />
        </div>

        <button type="submit" disabled={saving} className="btn-primary gap-2">
          <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
