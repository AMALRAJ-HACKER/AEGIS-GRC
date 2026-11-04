import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MailCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
    setLoading(false);
    if (error) return setError(error.message);
    setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-white"><ShieldCheck size={26} stroke="currentColor" /></div>
          <h1 className="text-lg font-bold text-navy">Reset Password</h1>
        </div>
        {sent ? (
          <div className="card flex flex-col items-center p-6 text-center">
            <MailCheck size={36} className="mb-3 text-emerald2" />
            <p className="text-sm font-semibold text-navy">Check your inbox</p>
            <p className="mt-1 text-xs text-slate-600">We sent a password reset link to <span className="font-semibold">{email}</span>.</p>
            <Link to="/login" className="mt-4 text-xs font-semibold text-blue hover:underline">← Back to sign in</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="card space-y-4 p-6">
            <p className="text-xs text-slate-600">Enter your work email and we'll send you a reset link.</p>
            <Input label="Work Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-crimson">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">Send Reset Link</Button>
            <p className="text-center text-xs"><Link to="/login" className="font-semibold text-blue hover:underline">← Back to sign in</Link></p>
          </form>
        )}
      </div>
    </div>
  );
}
