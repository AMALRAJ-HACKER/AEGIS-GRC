import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Input';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setError('Your email is not confirmed yet.');
        await supabase.auth.resend({ type: 'signup', email: email.trim() });
        setInfo('We re-sent the confirmation link to your email.');
      } else if (error.message.includes('Invalid login')) {
        setError('Invalid email or password.');
      } else {
        setError(error.message);
      }
      return;
    }
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-white">
            <ShieldCheck size={30} stroke="currentColor" />
          </div>
          <h1 className="text-xl font-bold text-navy">AEGIS GRC</h1>
          <p className="mt-0.5 text-xs text-slate-600">Governance, Risk & Compliance — Simplified</p>
        </div>

        <form onSubmit={submit} className="card space-y-4 p-6">
          <h2 className="text-base font-bold text-navy">Sign In</h2>
          <Input label="Work Email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          <PasswordInput label="Password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-crimson">{error}</p>}
          {info && <p className="rounded-lg bg-blue-light px-3 py-2 text-xs font-medium text-blue-dark">{info}</p>}
          <Button type="submit" loading={loading} className="w-full">Sign In</Button>
          <div className="flex items-center justify-between text-xs">
            <Link to="/reset-password" className="font-semibold text-blue hover:underline">Forgot password?</Link>
            <Link to="/signup" className="font-semibold text-blue hover:underline">Create a new workspace</Link>
          </div>
        </form>
        <p className="mt-4 text-center text-[11px] text-slate-600">
          Demo data is labeled as sample. AEGIS GRC does not guarantee compliance or certification.
        </p>
      </div>
    </div>
  );
}
