import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, MailCheck, CheckCircle2, Lock, ArrowLeft, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Input';

export function ResetPasswordPage() {
  const navigate = useNavigate();

  // Mode: 'request' | 'set_new' | 'success'
  const [mode, setMode] = useState<'request' | 'set_new' | 'success'>('request');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if user reached this page via recovery email link
  useEffect(() => {
    // 1. Check URL hash for type=recovery or access_token
    const hash = window.location.hash;
    const search = window.location.search;
    const hasRecoveryHash = hash.includes('type=recovery') || hash.includes('access_token');
    const hasRecoveryCode = new URLSearchParams(search).has('code');

    if (hasRecoveryHash || hasRecoveryCode) {
      setMode('set_new');
    }

    // 2. Listen for Supabase PASSWORD_RECOVERY auth event
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('set_new');
        setError(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Validation rules for enterprise password compliance
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isFormValid = hasMinLength && hasUpper && hasLower && hasNumber && passwordsMatch;

  // Handler for Phase 1: Request Password Reset Link
  const handleRequestReset = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetErr) {
        setError(resetErr.message);
      } else {
        setSent(true);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  // Handler for Phase 2: Set New Password
  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isFormValid) {
      setError('Please ensure all password requirements are satisfied.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateErr) {
        setError(updateErr.message);
      } else {
        // Clean URL fragment
        if (window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname);
        }
        setMode('success');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <Link
            to="/"
            className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-white shadow-soft transition-transform hover:scale-105"
          >
            <ShieldCheck size={30} stroke="currentColor" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-navy">AEGIS GRC</h1>
          <p className="mt-0.5 text-xs text-slate-600">Governance, Risk & Compliance — Simplified</p>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* View 1: Password Successfully Reset */}
        {/* ------------------------------------------------------------- */}
        {mode === 'success' && (
          <div className="card space-y-4 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={32} stroke="currentColor" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy">Password Reset Complete</h2>
              <p className="mt-1.5 text-xs text-slate-600">
                Your password has been successfully updated. You can now sign in to your workspace with your new credentials.
              </p>
            </div>
            <Button
              className="w-full mt-2"
              onClick={() => navigate('/login', { replace: true })}
            >
              Sign In to Your Workspace
            </Button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* View 2: Set New Password Form (When opening email recovery link) */}
        {/* ------------------------------------------------------------- */}
        {mode === 'set_new' && (
          <form onSubmit={handleUpdatePassword} className="card space-y-4 p-6">
            <div className="flex items-center gap-2 pb-1 border-b border-line">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy/5 text-navy">
                <Lock size={16} stroke="currentColor" />
              </div>
              <div>
                <h2 className="text-base font-bold text-navy">Create New Password</h2>
                <p className="text-[11px] text-slate-500">Enter a secure replacement password</p>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs font-medium text-crimson">
                {error}
              </p>
            )}

            <PasswordInput
              label="New Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />

            <PasswordInput
              label="Confirm New Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />

            {/* Password Strength Checklist */}
            <div className="rounded-xl border border-line bg-canvas/60 p-3 space-y-1.5 text-[11px]">
              <span className="block font-semibold text-slate-700 mb-1">Security Requirements:</span>
              <div className="flex items-center gap-2">
                {hasMinLength ? <Check size={13} className="text-emerald-700 font-bold" /> : <X size={13} className="text-slate-400" />}
                <span className={hasMinLength ? 'text-emerald-800 font-medium' : 'text-slate-500'}>At least 8 characters long</span>
              </div>
              <div className="flex items-center gap-2">
                {hasUpper ? <Check size={13} className="text-emerald-700 font-bold" /> : <X size={13} className="text-slate-400" />}
                <span className={hasUpper ? 'text-emerald-800 font-medium' : 'text-slate-500'}>At least one uppercase letter (A-Z)</span>
              </div>
              <div className="flex items-center gap-2">
                {hasLower ? <Check size={13} className="text-emerald-700 font-bold" /> : <X size={13} className="text-slate-400" />}
                <span className={hasLower ? 'text-emerald-800 font-medium' : 'text-slate-500'}>At least one lowercase letter (a-z)</span>
              </div>
              <div className="flex items-center gap-2">
                {hasNumber ? <Check size={13} className="text-emerald-700 font-bold" /> : <X size={13} className="text-slate-400" />}
                <span className={hasNumber ? 'text-emerald-800 font-medium' : 'text-slate-500'}>At least one number (0-9)</span>
              </div>
              <div className="flex items-center gap-2">
                {passwordsMatch ? <Check size={13} className="text-emerald-700 font-bold" /> : <X size={13} className="text-slate-400" />}
                <span className={passwordsMatch ? 'text-emerald-800 font-medium' : 'text-slate-500'}>Passwords match</span>
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              disabled={!isFormValid || loading}
              className="w-full"
            >
              Update Password
            </Button>

            <p className="text-center text-xs">
              <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-blue hover:underline">
                <ArrowLeft size={12} /> Back to sign in
              </Link>
            </p>
          </form>
        )}

        {/* ------------------------------------------------------------- */}
        {/* View 3: Request Reset Link Form (Default State) */}
        {/* ------------------------------------------------------------- */}
        {mode === 'request' && (
          sent ? (
            <div className="card flex flex-col items-center p-6 text-center space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <MailCheck size={32} stroke="currentColor" />
              </div>
              <div>
                <h2 className="text-base font-bold text-navy">Check Your Email</h2>
                <p className="mt-1 text-xs text-slate-600">
                  We sent a secure password reset link to <span className="font-semibold text-navy">{email}</span>.
                </p>
              </div>
              <p className="text-[11px] text-slate-500">
                Click the link in your email to choose a new password. If you don't see it within a couple of minutes, check your spam or junk folder.
              </p>
              <div className="pt-2 w-full space-y-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setSent(false)}
                >
                  Send another link
                </Button>
                <Link
                  to="/login"
                  className="block text-xs font-semibold text-blue hover:underline text-center pt-1"
                >
                  ← Back to sign in
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRequestReset} className="card space-y-4 p-6">
              <div>
                <h2 className="text-base font-bold text-navy">Reset Password</h2>
                <p className="mt-1 text-xs text-slate-600">
                  Enter your registered work email and we'll send you a secure link to reset your password.
                </p>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs font-medium text-crimson">
                  {error}
                </p>
              )}

              <Input
                label="Work Email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />

              <Button type="submit" loading={loading} className="w-full">
                Send Reset Link
              </Button>

              <p className="text-center text-xs">
                <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-blue hover:underline">
                  <ArrowLeft size={12} /> Back to sign in
                </Link>
              </p>
            </form>
          )
        )}
      </div>
    </div>
  );
}
