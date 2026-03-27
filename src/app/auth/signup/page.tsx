'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient, hasSupabaseBrowserConfig } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAgeTier, type AgeTier } from '@/utils/helpers';
import { cn } from '@/utils/helpers';

const TIER_LABELS: Record<AgeTier, string> = {
  explorer: 'Explorer (5-12)',
  discoverer: 'Discoverer (13-18)',
  navigator: 'Navigator (19-25)',
  pivoter: 'Pivoter (26-30)',
};

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentName, setParentName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabaseConfigured = hasSupabaseBrowserConfig();
  const supabase = useMemo(() => (supabaseConfigured ? createClient() : null), [supabaseConfigured]);

  const ageTier = dateOfBirth ? getAgeTier(dateOfBirth) : null;

  useEffect(() => {
    if (!supabaseConfigured) {
      router.replace('/roles');
    }
  }, [router, supabaseConfigured]);

  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-700/20 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 text-center text-white backdrop-blur-lg">
          <h1 className="text-2xl font-bold">Agent-Only Mode</h1>
          <p className="mt-3 text-sm text-white/70">Sign up is disabled for now. Redirecting you to the role selection flow.</p>
        </div>
      </div>
    );
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError('');
    setSuccess(false);
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName,
          date_of_birth: dateOfBirth,
          parent_email: parentEmail || undefined,
          parent_name: parentName || undefined,
        },
      },
    });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    // Check if email confirmation is required
    if (data.user && !data.session) {
      // Email confirmation required
      setSuccess(true);
      setLoading(false);
    } else {
      // Auto-confirmed (development mode) or already has session
      router.push('/dashboard');
      router.refresh();
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-700/20 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Get Started</h1>
          <p className="text-primary-100">Create your account and discover your ideal career</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          {success ? (
            <div className="space-y-4">
              <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-lg text-sm">
                <p className="font-semibold mb-1">✓ Account created successfully!</p>
                <p>Please check your email ({email}) and click the confirmation link to activate your account.</p>
              </div>
              <div className="text-center space-y-3">
                <p className="text-primary-100 text-sm">
                  Didn&apos;t receive the email? Check your spam folder or{' '}
                  <button
                    type="button"
                    onClick={async () => {
                      const { error } = await supabase.auth.resend({
                        type: 'signup',
                        email,
                        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
                      });
                      if (error) {
                        setError(error.message);
                        setSuccess(false);
                      } else {
                        alert('Confirmation email resent!');
                      }
                    }}
                    className="text-accent-400 hover:text-accent-300 font-semibold underline"
                  >
                    resend confirmation email
                  </button>
                </p>
                <Link
                  href="/auth/login"
                  className="inline-block px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all"
                >
                  Go to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
            <div>
              <label className="block text-sm font-medium text-primary-100 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-100 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-100 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-100 mb-1">Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              {ageTier && (
                <p className={cn("mt-1 text-xs font-medium", "text-accent-400")}>
                  Tier: {TIER_LABELS[ageTier]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-100 mb-1">Parent / Guardian Email (optional)</label>
              <input
                type="email"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="parent@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-100 mb-1">Parent / Guardian Name (optional)</label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Guardian name"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          )}
          <p className="text-center mt-6 text-primary-100 text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-accent-400 hover:text-accent-300 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
