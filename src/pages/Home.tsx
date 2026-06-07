import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Briefcase, Search, Sparkles, ArrowRight, Users, FileText, TrendingUp } from 'lucide-react';

export default function Home() {
  const { user, profile } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-brand-300" />
              <span className="text-sm text-white/90 font-medium">AI-Powered Job Matching</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Find Your Dream Job with <span className="text-brand-300">AI Intelligence</span>
            </h1>
            <p className="mt-6 text-lg text-brand-100/80 max-w-2xl mx-auto">
              Connect top talent with leading companies. Our AI analyzes resumes, generates cover letters, and matches you with the perfect opportunity.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/jobs" className="btn-primary bg-white text-brand-700 hover:bg-gray-100 gap-2 text-base px-6 py-3">
                  Browse Jobs<ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="btn-primary bg-white text-brand-700 hover:bg-gray-100 gap-2 text-base px-6 py-3">
                    Get Started Free<ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link to="/jobs" className="btn-primary bg-white/10 border border-white/30 text-white hover:bg-white/20 gap-2 text-base px-6 py-3">
                    <Search className="w-5 h-5" />Explore Jobs
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Briefcase, label: 'Active Jobs', value: '2,500+' },
              { icon: Users, label: 'Candidates', value: '15,000+' },
              { icon: TrendingUp, label: 'Hired', value: '3,200+' },
              { icon: FileText, label: 'AI Analyses', value: '8,500+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-8 h-8 text-brand-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">How HireAI Works</h2>
          <p className="text-gray-500 mt-2">Streamlined hiring powered by artificial intelligence</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Search,
              title: 'Smart Job Search',
              desc: 'Browse and filter thousands of positions by role, location, salary, and tech stack. Save jobs you love.',
            },
            {
              icon: Sparkles,
              title: 'AI-Powered Tools',
              desc: 'Analyze your resume for improvements. Generate tailored cover letters for any position in seconds.',
            },
            {
              icon: Users,
              title: 'Direct Applications',
              desc: 'Apply with one click. Track every application status in real-time. Get notified when employers respond.',
            },
          ].map((feature) => (
            <div key={feature.title} className="card p-6 text-center">
              <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="bg-brand-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h2 className="text-3xl font-bold text-white">Ready to start?</h2>
            <p className="text-brand-200 mt-2 mb-8">Create your free account today and let AI help you land your next role.</p>
            <Link to="/signup" className="btn-primary bg-white text-brand-700 hover:bg-gray-100 gap-2 text-base px-6 py-3">
              Create Free Account<ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
