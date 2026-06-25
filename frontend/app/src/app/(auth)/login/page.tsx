'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Eye, EyeOff, ChefHat } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0D1F15' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1A3A2A 0%, #0D1F15 50%, #0F1F2E 100%)' }}>
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, #2D7A4F 0%, transparent 60%), radial-gradient(circle at 70% 20%, #5B21B6 0%, transparent 50%)' }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #2D7A4F, #38966A)' }}>
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold" style={{ color: '#F0F5F0' }}>Servox</span>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: 'rgba(45,122,79,0.2)', border: '1px solid rgba(45,122,79,0.3)' }}>
            <ChefHat className="w-7 h-7" style={{ color: '#38966A' }} />
          </div>
          <h2 className="text-4xl font-bold leading-tight" style={{ color: '#F0F5F0' }}>
            Train smarter.<br />
            <span style={{ color: '#4DB882' }}>Serve better.</span>
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: '#6B8F7A' }}>
            AI-powered simulations that prepare hospitality professionals for real-world dining scenarios.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[['47', 'Sessions run'], ['82%', 'Avg score'], ['12', 'Scenarios']].map(([val, label]) => (
              <div key={label} className="p-4 rounded-xl"
                style={{ background: 'rgba(45,122,79,0.1)', border: '1px solid rgba(45,122,79,0.2)' }}>
                <div className="text-2xl font-bold" style={{ color: '#4DB882' }}>{val}</div>
                <div className="text-xs mt-1" style={{ color: '#6B8F7A' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-sm" style={{ color: '#3A5A45' }}>
          © 2025 Servox. All rights reserved.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2D7A4F, #38966A)' }}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: '#F0F5F0' }}>Servox</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#F0F5F0' }}>
              {isSignup ? 'Create account' : 'Welcome back'}
            </h1>
            <p className="text-sm" style={{ color: '#6B8F7A' }}>
              {isSignup ? 'Start your training journey today' : 'Sign in to continue your training'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#A8E0C1' }}>Full name</label>
                <input type="text" placeholder="Jamie Doe" required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: 'rgba(45,122,79,0.08)', border: '1px solid rgba(45,122,79,0.25)', color: '#F0F5F0' }}
                  onFocus={e => (e.target.style.borderColor = '#2D7A4F')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(45,122,79,0.25)')}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#A8E0C1' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@restaurant.com" required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: 'rgba(45,122,79,0.08)', border: '1px solid rgba(45,122,79,0.25)', color: '#F0F5F0' }}
                onFocus={e => (e.target.style.borderColor = '#2D7A4F')}
                onBlur={e => (e.target.style.borderColor = 'rgba(45,122,79,0.25)')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#A8E0C1' }}>Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all"
                  style={{ background: 'rgba(45,122,79,0.08)', border: '1px solid rgba(45,122,79,0.25)', color: '#F0F5F0' }}
                  onFocus={e => (e.target.style.borderColor = '#2D7A4F')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(45,122,79,0.25)')}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: '#6B8F7A' }}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 mt-2"
              style={{
                background: loading ? 'rgba(45,122,79,0.5)' : 'linear-gradient(135deg, #2D7A4F, #38966A)',
                color: '#F0F5F0',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isSignup ? 'Creating account...' : 'Signing in...'}
                </span>
              ) : (isSignup ? 'Create account' : 'Sign in')}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#6B8F7A' }}>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button onClick={() => setIsSignup(!isSignup)}
              className="font-medium transition-colors"
              style={{ color: '#4DB882' }}>
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
