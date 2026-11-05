import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Search, Check } from 'lucide-react';
import { useCurrentOrg } from '@/hooks/useOrg';
import { fetchFrameworkCatalog, fetchFrameworkStats, activateFramework } from '@/services/api';
import { logActivity } from '@/lib/format';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/States';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/Modal';

export function AddFrameworkPage() {
  const { orgId } = useCurrentOrg().data ?? { orgId: '' };
  const [q, setQ] = useState('');
  const [target, setTarget] = useState<any>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const catalog = useQuery({ queryKey: ['frameworkCatalog'], queryFn: fetchFrameworkCatalog });
  const stats = useQuery({ queryKey: ['frameworkStats', orgId], queryFn: () => fetchFrameworkStats(orgId), enabled: !!orgId });

  const activate = useMutation({
    mutationFn: async (frameworkId: string) => {
      await activateFramework(orgId, frameworkId);
      await logActivity(orgId, 'framework_activated', 'framework', frameworkId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['frameworkStats', orgId] });
      setTarget(null);
      navigate('/frameworks');
    },
  });

  if (catalog.isLoading) return <Spinner />;

  const activeIds = new Set((stats.data ?? []).filter((f) => f.activated).map((f) => f.id));
  const list = (catalog.data ?? []).filter((f: any) =>
    !q || f.name.toLowerCase().includes(q.toLowerCase()) || f.category?.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-navy">Add Framework</h1>
        <p className="text-xs text-slate-600">Activate a framework template — its controls seed into your register as "Not Started".</p>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search frameworks…" className="w-full rounded-lg border border-line bg-white py-2.5 pl-9 pr-3 text-sm focus-ring" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((f: any) => {
          const active = activeIds.has(f.id);
          return (
            <Card key={f.id} className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy text-white"><ShieldCheck size={18} /></div>
                {active && <Badge label="Active" tone="success" />}
              </div>
              <div>
                <div className="text-sm font-bold text-navy">{f.name} <span className="font-medium text-slate-600">({f.version})</span></div>
                <div className="text-[10px] font-medium text-blue-dark">{f.category}</div>
              </div>
              <p className="flex-1 text-xs text-slate-600">{f.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-600">{f.controlCount} controls</span>
                {active ? (
                  <Button variant="secondary" size="sm" disabled><Check size={14} /> Activated</Button>
                ) : (
                  <Button size="sm" onClick={() => setTarget(f)}>Activate</Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <ConfirmModal
        open={!!target}
        onClose={() => setTarget(null)}
        onConfirm={() => target && activate.mutate(target.id)}
        title="Confirm Activation"
        message={`Activate ${target?.name}? ${target?.controlCount} controls will be added to your register with status "Not Started".`}
        confirmLabel="Activate"
        loading={activate.isPending}
      />
    </div>
  );
}
