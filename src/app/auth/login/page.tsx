'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient, hasSupabaseBrowserConfig } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabaseConfigured = hasSupabaseBrowserConfig();
  const supabase = useMemo(() => (supabaseConfigured ? createClient() : null), [supabaseConfigured]);

  useEffect(() => {
    if (!supabaseConfigured) {
      router.replace('/roles');
      return;
    }

    const query = new URLSearchParams(window.location.search);
    const callbackError = query.get('error');
    if (callbackError) {
      setError(callbackError);
    }
  }, [router, supabaseConfigured]);

  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 text-center text-white backdrop-blur-lg">
          <h1 className="text-2xl font-bold">Agent-Only Mode</h1>
          <p className="mt-3 text-sm text-white/70">Login is disabled for now. Redirecting you to the role selection flow.</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError('');
    setMessage('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      if (err.message.includes('not confirmed') || err.message.includes('Email not confirmed')) {
        setError(
          'Email not confirmed. Please check your inbox and click the confirmation link. ' +
          'If you didn\'t receive it, you can resend it below.'
        );
      } else {
        setError(err.message);
      }
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    const { error: err } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) {
      setError(err.message);
    } else {
      setError('');
      setMessage('Confirmation email sent. Please check your inbox.');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setMessage('');
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) {
      setError(oauthError.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-purple-200">Sign in to continue your career journey</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <form onSubmit={handleLogin} className="space-y-4">
            {message && (
              <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-lg text-sm">
                <p>{message}</p>
              </div>
            )}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
                <p>{error}</p>
                {(error.includes('not confirmed') || error.includes('Email not confirmed')) && (
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    className="mt-2 text-red-300 hover:text-red-200 underline text-xs"
                  >
                    Resend confirmation email
                  </button>
                )}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-4">
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-white/20 w-full" />
              <span className="bg-transparent px-4 text-sm text-white/50">or</span>
              <div className="border-t border-white/20 w-full" />
            </div>
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all border border-white/20"
            >
              Continue with Google
            </button>
          </div>
          <p className="text-center mt-6 text-purple-200 text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
