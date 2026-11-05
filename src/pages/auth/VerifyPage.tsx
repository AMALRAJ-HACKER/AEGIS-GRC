import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, MailWarning } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

export function VerifyPage() {
  const location = useLocation() as { state?: { email?: string } };
  const email = location.state?.email ?? '';
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resend = async () => {
    setError(null);
    if (!email) return setError('No email on file — sign up again.');
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) return setError(error.message);
    setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-white"><ShieldCheck size={26} stroke="currentColor" /></div>
          <h1 className="text-lg font-bold text-navy">Confirm your email</h1>
        </div>
        <div className="card flex flex-col items-center p-6 text-center">
          <MailWarning size={36} className="mb-3 text-amber-700" />
          <p className="text-sm text-slate-600">
            We sent a confirmation link to <span className="font-bold text-navy">{email || 'your inbox'}</span>. Click it, then sign in.
          </p>
          {sent && <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">Confirmation email re-sent.</p>}
          {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-crimson">{error}</p>}
          <div className="mt-5 flex w-full flex-col gap-2">
            <Button variant="secondary" onClick={resend}>Resend link</Button>
            <Link to="/login" className="text-center text-xs font-semibold text-blue hover:underline">← Back to sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
