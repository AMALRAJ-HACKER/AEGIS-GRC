import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Building2, Ticket, ShieldCheck, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { acceptInvitation } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function OnboardingPage() {
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [orgName, setOrgName] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { session, signOut } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createOrg = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const user = session?.user;
    if (!user) return;
    const slug = `${orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)}-${Math.random().toString(36).slice(2, 8)}`;
    const { data: org, error: orgErr } = await supabase
      .from('organizations')
      .insert({ name: orgName.trim(), slug, created_by: user.id })
      .select()
      .single();
    if (orgErr || !org) {
      setLoading(false);
      return setError(orgErr?.message ?? 'Could not create organization.');
    }
    const { error: mErr } = await supabase.from('organization_memberships').insert({ organization_id: org.id, user_id: user.id, role: 'org_admin' });
    if (mErr) {
      setLoading(false);
      return setError(mErr.message);
    }
    await queryClient.invalidateQueries({ queryKey: ['currentOrg'] });
    setLoading(false);
    navigate('/dashboard', { replace: true });
  };

  const join = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await acceptInvitation(token.trim());
      await queryClient.invalidateQueries({ queryKey: ['currentOrg'] });
      setLoading(false);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setLoading(false);
      setError(err?.message ?? 'Invalid or expired invitation token.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 py-10">
      <div className="mb-6 flex flex-col items-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-white"><ShieldCheck size={30} stroke="currentColor" /></div>
        <h1 className="text-xl font-bold text-navy">Welcome to AEGIS GRC</h1>
        <p className="mt-1 text-xs text-slate-600">Set up your workspace to get started</p>
      </div>

      {mode === 'choose' && (
        <div className="grid w-full max-w-lg gap-4 sm:grid-cols-2">
          <button onClick={() => setMode('create')} className="card flex flex-col items-start gap-3 p-6 text-left transition-shadow hover:shadow-pop focus-ring">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-light text-blue"><Building2 size={20} stroke="currentColor" /></div>
            <div>
              <div className="text-sm font-bold text-navy">Create organization</div>
              <p className="mt-1 text-xs text-slate-600">Start a new compliance workspace. You'll be the Administrator.</p>
            </div>
          </button>
          <button onClick={() => setMode('join')} className="card flex flex-col items-start gap-3 p-6 text-left transition-shadow hover:shadow-pop focus-ring">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Ticket size={20} stroke="currentColor" /></div>
            <div>
              <div className="text-sm font-bold text-navy">Join with invitation</div>
              <p className="mt-1 text-xs text-slate-600">Enter the invite token shared by your administrator.</p>
            </div>
          </button>
        </div>
      )}

      {mode === 'create' && (
        <form onSubmit={createOrg} className="card w-full max-w-md space-y-4 p-6">
          <Input label="Organization Name" required value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Acme Corp" />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-crimson">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">Create Workspace</Button>
          <button type="button" onClick={() => setMode('choose')} className="w-full text-center text-xs font-semibold text-slate-600 hover:text-navy">← Back</button>
        </form>
      )}

      {mode === 'join' && (
        <form onSubmit={join} className="card w-full max-w-md space-y-4 p-6">
          <Input label="Invitation Token" required value={token} onChange={(e) => setToken(e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" hint="Ask your administrator for the invite token" />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-crimson">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">Join Workspace</Button>
          <button type="button" onClick={() => setMode('choose')} className="w-full text-center text-xs font-semibold text-slate-600 hover:text-navy">← Back</button>
        </form>
      )}

      <button onClick={() => signOut()} className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-navy">
        <LogOut size={14} stroke="currentColor" /> Sign out
      </button>
    </div>
  );
}
