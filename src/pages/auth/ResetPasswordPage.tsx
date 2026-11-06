import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, CheckCircle2, Lock, ArrowLeft, Check, X, KeyRound, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Input';

export function ResetPasswordPage() {
  const navigate = useNavigate();

  // Mode: 
  // 'request'    -> Step 1: Enter email to request reset code
  // 'enter_code' -> Step 2: Enter the 6-digit OTP code received in email
  // 'set_new'    -> Step 3: Set and confirm new password
  // 'success'    -> Step 4: Password reset completed successfully
  const [mode, setMode] = useState<'request' | 'enter_code' | 'set_new' | 'success'>('request');

  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend cooldown timer countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Check if incoming via URL link/hash as fallback
  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;

    if (hash.includes('error=')) {
      const params = new URLSearchParams(hash.substring(1));
      const desc = params.get('error_description') || 'Password reset link is invalid or has expired.';
      setError(decodeURIComponent(desc.replace(/\+/g, ' ')));
      if (window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      return;
    }

    const hasRecoveryHash = hash.includes('type=recovery') || hash.includes('access_token');
    const hasRecoveryCode = new URLSearchParams(search).has('code');

    if (hasRecoveryHash || hasRecoveryCode) {
      setMode('set_new');
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('set_new');
        setError(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Password validation rules
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isFormValid = hasMinLength && hasUpper && hasLower && hasNumber && passwordsMatch;

  // -------------------------------------------------------------
  // STEP 1: Send Reset Code to Email
  // -------------------------------------------------------------
  const handleSendCode = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) {
      setError('Please enter your work email address.');
      return;
    }

    setLoading(true);
    try {
      const { error: sendErr } = await supabase.auth.resetPasswordForEmail(targetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (sendErr) {
        setError(sendErr.message);
      } else {
        setResendCooldown(45); // 45-second cooldown
        setMode('enter_code');
        setError(null);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract clean token if user pastes a code, hex token, or full URL
  const parseTokenOrUrl = (rawInput: string): string => {
    const trimmed = rawInput.trim();
    if (!trimmed) return '';

    // If user pasted a URL with token= or token_hash=
    if (trimmed.includes('token=') || trimmed.includes('token_hash=')) {
      try {
        const urlObj = new URL(trimmed);
        const tokenParam = urlObj.searchParams.get('token') || urlObj.searchParams.get('token_hash');
        if (tokenParam) return tokenParam.trim();
      } catch {
        const match = trimmed.match(/(?:token|token_hash)=([a-zA-Z0-9_-]+)/);
        if (match) return match[1].trim();
      }
    }

    // If user pasted a URL hash containing access_token=
    if (trimmed.includes('access_token=')) {
      const match = trimmed.match(/access_token=([a-zA-Z0-9._-]+)/);
      if (match) return match[1].trim();
    }

    return trimmed;
  };

  // -------------------------------------------------------------
  // STEP 2: Verify OTP Code or Token
  // -------------------------------------------------------------
  const handleVerifyCode = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const rawInput = otpCode.trim();
    if (!rawInput) {
      setError('Please enter the reset code, token, or link from your email.');
      return;
    }

    const targetEmail = email.trim().toLowerCase();
    setLoading(true);

    try {
      // 1. If user pasted a URL containing access_token & refresh_token (from the redirected tab)
      if (rawInput.includes('access_token')) {
        try {
          const hashPart = rawInput.includes('#')
            ? rawInput.split('#')[1]
            : rawInput.includes('?')
            ? rawInput.split('?')[1]
            : rawInput;
          const params = new URLSearchParams(hashPart);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token') || '';
          if (accessToken) {
            const { error: sessionErr } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (!sessionErr) {
              setMode('set_new');
              setLoading(false);
              return;
            }
          }
        } catch {
          // continue to next method
        }
      }

      // 2. If user pasted the Supabase verification URL
      if (rawInput.includes('/auth/v1/verify')) {
        try {
          const urlObj = new URL(rawInput);
          urlObj.searchParams.set('redirect_to', `${window.location.origin}/reset-password`);
          window.location.href = urlObj.toString();
          return;
        } catch {
          // continue
        }
      }

      const cleanToken = parseTokenOrUrl(rawInput);

      // 3. Multi-strategy verification against Supabase Auth:
      
      // Strategy A: Recovery OTP with email
      if (targetEmail) {
        const resA = await supabase.auth.verifyOtp({
          email: targetEmail,
          token: cleanToken,
          type: 'recovery',
        });
        if (!resA.error) {
          setMode('set_new');
          setLoading(false);
          return;
        }
      }

      // Strategy B: Token Hash (for hexadecimal token strings)
      if (cleanToken.length >= 15) {
        const resB = await supabase.auth.verifyOtp({
          token_hash: cleanToken,
          type: 'recovery',
        });
        if (!resB.error) {
          setMode('set_new');
          setLoading(false);
          return;
        }
      }

      // Strategy C: Email OTP type
      if (targetEmail) {
        const resC = await supabase.auth.verifyOtp({
          email: targetEmail,
          token: cleanToken,
          type: 'email',
        });
        if (!resC.error) {
          setMode('set_new');
          setLoading(false);
          return;
        }
      }

      // Strategy D: Magiclink OTP type
      if (targetEmail) {
        const resD = await supabase.auth.verifyOtp({
          email: targetEmail,
          token: cleanToken,
          type: 'magiclink',
        });
        if (!resD.error) {
          setMode('set_new');
          setLoading(false);
          return;
        }
      }

      // If token verification didn't succeed with standard attempts:
      setError(
        'This reset code or token could not be verified directly. Please copy the URL from the redirected tab or request a new code.',
      );
    } catch (err: any) {
      setError(err?.message || 'Failed to verify reset code or token.');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STEP 3: Set and Confirm New Password
  // -------------------------------------------------------------
  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isFormValid) {
      setError('Please satisfy all password complexity requirements.');
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
        {/* STEP 1: Enter Email to Request Reset Code */}
        {/* ------------------------------------------------------------- */}
        {mode === 'request' && (
          <form onSubmit={handleSendCode} className="card space-y-4 p-6">
            <div className="flex items-center gap-2 pb-1 border-b border-line">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy/5 text-navy">
                <Mail size={16} stroke="currentColor" />
              </div>
              <div>
                <h2 className="text-base font-bold text-navy">Reset Password</h2>
                <p className="text-[11px] text-slate-500">We'll email you a 6-digit reset code</p>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs text-crimson">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
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
              Send Reset Code
            </Button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('enter_code');
                }}
                className="font-semibold text-blue hover:underline"
              >
                Already have a code?
              </button>
              <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-navy">
                <ArrowLeft size={12} /> Sign in
              </Link>
            </div>
          </form>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 2: Enter Reset Code (OTP) */}
        {/* ------------------------------------------------------------- */}
        {mode === 'enter_code' && (
          <form onSubmit={handleVerifyCode} className="card space-y-4 p-6">
            <div className="flex items-center gap-2 pb-1 border-b border-line">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy/5 text-navy">
                <KeyRound size={16} stroke="currentColor" />
              </div>
              <div>
                <h2 className="text-base font-bold text-navy">Enter Reset Code</h2>
                <p className="text-[11px] text-slate-500">Check your inbox for the verification code</p>
              </div>
            </div>

            {email && (
              <div className="rounded-lg bg-canvas border border-line p-2.5 text-xs text-slate-700 flex items-center justify-between">
                <span className="truncate font-medium">{email}</span>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('request');
                  }}
                  className="text-[11px] font-semibold text-blue hover:underline shrink-0 ml-2"
                >
                  Change
                </button>
              </div>
            )}

            {!email && (
              <Input
                label="Work Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs text-crimson">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="otp-code">
                Security Code, Token, or Link
              </label>
              <input
                id="otp-code"
                type="text"
                required
                autoFocus
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.trim())}
                placeholder="Paste 6-digit code, token, or reset link"
                className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-medium text-navy placeholder:text-slate-400 focus-ring focus:border-blue"
              />
              <span className="mt-1 block text-[11px] text-slate-500">
                You can enter the 6-digit code, the recovery token, or paste the full link from your email.
              </span>
            </div>

            <Button type="submit" loading={loading} className="w-full">
              Verify Code or Token
            </Button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={() => handleSendCode()}
                className="inline-flex items-center gap-1 font-semibold text-blue hover:underline disabled:opacity-50 disabled:no-underline"
              >
                <RefreshCw size={12} className={resendCooldown > 0 ? 'animate-spin' : ''} />
                {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend code'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('request');
                }}
                className="font-semibold text-slate-500 hover:text-navy"
              >
                Back
              </button>
            </div>
          </form>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 3: Create New Password */}
        {/* ------------------------------------------------------------- */}
        {mode === 'set_new' && (
          <form onSubmit={handleUpdatePassword} className="card space-y-4 p-6">
            <div className="flex items-center gap-2 pb-1 border-b border-line">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy/5 text-navy">
                <Lock size={16} stroke="currentColor" />
              </div>
              <div>
                <h2 className="text-base font-bold text-navy">Create New Password</h2>
                <p className="text-[11px] text-slate-500">Choose a secure password for your workspace</p>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs text-crimson">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
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

            {/* Password Criteria Checklist */}
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
              Save New Password
            </Button>

            <p className="text-center text-xs">
              <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-blue hover:underline">
                <ArrowLeft size={12} /> Cancel & Sign In
              </Link>
            </p>
          </form>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 4: Reset Success View */}
        {/* ------------------------------------------------------------- */}
        {mode === 'success' && (
          <div className="card space-y-4 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={32} stroke="currentColor" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy">Password Updated!</h2>
              <p className="mt-1.5 text-xs text-slate-600">
                Your password has been changed successfully. You can now log in to your account with your new credentials.
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
      </div>
    </div>
  );
}
