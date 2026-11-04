import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput, Select } from '@/components/ui/Input';

const INDUSTRIES = ['Technology', 'Financial Services', 'Healthcare', 'Manufacturing', 'Retail', 'Telecommunications', 'Government', 'Education', 'Energy', 'Other'];
const COUNTRIES = ['India', 'United States', 'United Kingdom', 'United Arab Emirates', 'Singapore', 'Australia', 'Germany', 'Other'];

export function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '', orgName: '', industry: '', country: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const next = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    setStep(2);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error: authErr } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: { data: { full_name: form.fullName.trim(), organization_name: form.orgName.trim() } },
    });
    if (authErr) {
      setLoading(false);
      return setError(authErr.message);
    }

    // If email confirmation is disabled (session returned), finish setup client-side
    // (mirrors the mobile signup flow; with confirmation enabled, onboarding runs after login).
    if (data.user && data.session) {
      const slug = `${form.orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)}-${Math.random().toString(36).slice(2, 8)}`;
      const { data: org, error: orgErr } = await supabase
        .from('organizations')
        .insert({ name: form.orgName.trim(), slug, industry: form.industry || null, country: form.country || null, created_by: data.user.id })
        .select()
        .single();
      if (!orgErr && org) {
        await supabase.from('organization_memberships').insert({ organization_id: org.id, user_id: data.user.id, role: 'org_admin' });
      }
      setLoading(false);
      navigate('/dashboard', { replace: true });
      return;
    }

    setLoading(false);
    navigate('/verify', { state: { email: form.email.trim() } });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-5 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-white">
            <ShieldCheck size={26} stroke="currentColor" />
          </div>
          <h1 className="text-lg font-bold text-navy">Create your workspace</h1>
          <p className="text-xs text-slate-600">Step {step} of 2</p>
        </div>

        {step === 1 ? (
          <form onSubmit={next} className="card space-y-4 p-6">
            <Input label="Full Name" required value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Jane Doe" />
            <Input label="Work Email" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@company.com" />
            <PasswordInput label="Password" required value={form.password} onChange={(e) => set('password', e.target.value)} hint="Minimum 8 characters" />
            <PasswordInput label="Confirm Password" required value={form.confirm} onChange={(e) => set('confirm', e.target.value)} />
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-crimson">{error}</p>}
            <Button type="submit" className="w-full">Continue</Button>
            <p className="text-center text-xs text-slate-600">
              Already have an account? <Link to="/login" className="font-semibold text-blue hover:underline">Sign in</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={submit} className="card space-y-4 p-6">
            <Input label="Organization Name" required value={form.orgName} onChange={(e) => set('orgName', e.target.value)} placeholder="Acme Corp" />
            <Select label="Industry" value={form.industry} onChange={(e) => set('industry', e.target.value)}>
              <option value="">Select industry…</option>
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
            </Select>
            <Select label="Country" value={form.country} onChange={(e) => set('country', e.target.value)}>
              <option value="">Select country…</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-crimson">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">Create Workspace</Button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-center text-xs font-semibold text-slate-600 hover:text-navy">
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
