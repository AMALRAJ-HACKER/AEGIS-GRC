import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, ShieldCheck, Plus, Check, Layers } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, Spinner } from '@/components/ui/States';
import { ComplianceRing } from '@/components/ui/Charts';
import { Tabs } from '@/components/ui/Tabs';
import { useCurrentOrg } from '@/hooks/useOrg';
import { fetchFrameworkCatalog, fetchFrameworkStats, activateFramework } from '@/services/api';
import { canActivateFramework } from '@/lib/permissions';
import { logActivity } from '@/lib/format';

type Tab = 'all' | 'active';

export function FrameworksPage() {
  const { data: orgCtx } = useCurrentOrg();
  const orgId = orgCtx?.orgId ?? '';
  const role = orgCtx?.role ?? 'staff';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<Tab>('all');
  const [q, setQ] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const catalog = useQuery({ queryKey: ['frameworkCatalog'], queryFn: fetchFrameworkCatalog });
  const stats = useQuery({
    queryKey: ['frameworkStats', orgId],
    queryFn: () => fetchFrameworkStats(orgId),
    enabled: !!orgId,
  });

  const statById = useMemo(() => {
    const map = new Map<string, any>();
    (stats.data ?? []).forEach((s: any) => map.set(s.id, s));
    return map;
  }, [stats.data]);

  const activate = useMutation({
    mutationFn: async (framework: any) => {
      setBusyId(framework.id);
      const count = await activateFramework(orgId, framework.id);
      await logActivity(orgId, 'framework_activated', 'framework', framework.id, { controls: count });
      return count;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['frameworkStats', orgId] });
      queryClient.invalidateQueries({ queryKey: ['activity', orgId] });
    },
    onSettled: () => setBusyId(null),
  });

  const frameworks = useMemo(() => {
    let list = (catalog.data ?? []) as any[];
    if (tab === 'active') list = list.filter((f) => statById.get(f.id)?.activated);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((f) =>
        `${f.name} ${f.category ?? ''} ${f.description ?? ''}`.toLowerCase().includes(needle),
      );
    }
    return list;
  }, [catalog.data, tab, q, statById]);

  const activeCount = (stats.data ?? []).filter((s: any) => s.activated).length;

  if (catalog.isLoading) return <Spinner />;

  if (catalog.isError) {
    return (
      <Card>
        <CardBody className="py-12 text-center">
          <p className="text-sm font-semibold text-navy">Could not load the framework catalog</p>
          <p className="mt-1 text-xs text-slate-500">Please check your connection and try again.</p>
          <Button className="mt-4" size="sm" onClick={() => catalog.refetch()}>
            Retry
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">Frameworks</h1>
          <p className="mt-1 text-sm text-slate-500">
            {activeCount} activated · {(catalog.data ?? []).length} available in the catalog
          </p>
        </div>
        <Button size="sm" onClick={() => navigate('/frameworks/add')}>
          <Plus size={15} stroke="currentColor" /> Add framework
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          tabs={[
            { id: 'all', label: 'All frameworks', badge: (catalog.data ?? []).length },
            { id: 'active', label: 'Activated', badge: activeCount },
          ]}
          active={tab}
          onChange={setTab}
          className="flex-1"
        />
        <div className="relative w-full sm:w-72">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search frameworks…"
            className="w-full rounded-lg border border-line bg-white py-2 pl-9 pr-3 text-sm text-ink placeholder:text-slate-500 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/15"
          />
        </div>
      </div>

      {frameworks.length === 0 ? (
        <EmptyState
          icon={<Layers size={22} stroke="currentColor" />}
          title={tab === 'active' ? 'No activated frameworks' : 'No frameworks found'}
          message={
            tab === 'active'
              ? 'Activate a framework from the catalog to start assessing controls.'
              : 'Try a different search term, or add a custom framework.'
          }
          action={
            tab === 'active' ? (
              <Button size="sm" onClick={() => setTab('all')}>
                Browse catalog
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {frameworks.map((f) => {
            const stat = statById.get(f.id);
            const isActive = !!stat?.activated;
            return (
              <Card key={f.id} className="flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-navy">
                      <ShieldCheck size={19} strokeWidth={1.9} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-navy">{f.name}</h3>
                      <p className="text-[11px] text-slate-500">
                        {f.version ? `v${f.version} · ` : ''}
                        {f.controlCount ?? 0} controls
                      </p>
                    </div>
                  </div>
                  {isActive ? (
                    <ComplianceRing score={stat?.score ?? 0} size={52} />
                  ) : (
                    <Badge label="Available" tone="info" />
                  )}
                </div>

                <p className="mt-3 line-clamp-2 min-h-[32px] text-xs leading-relaxed text-slate-500">
                  {f.description || 'No description provided.'}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {f.category && <Badge label={f.category} tone="default" />}
                  {isActive && (
                    <Badge
                      label={stat?.score >= 70 ? 'On track' : stat?.score >= 40 ? 'In progress' : 'At risk'}
                      tone={stat?.score >= 70 ? 'success' : stat?.score >= 40 ? 'warning' : 'critical'}
                    />
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-line pt-4">
                  {isActive ? (
                    <>
                      <Button size="sm" className="flex-1" onClick={() => navigate(`/frameworks/${f.id}`)}>
                        Open controls
                      </Button>
                      <Link to={`/reports`} className="text-xs font-semibold text-blue hover:underline">
                        Report
                      </Link>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      disabled={!canActivateFramework(role) || busyId === f.id}
                      loading={busyId === f.id}
                      onClick={() => activate.mutate(f)}
                      title={canActivateFramework(role) ? 'Activate framework' : 'Requires admin or GRC analyst role'}
                    >
                      <Check size={14} stroke="currentColor" /> Activate
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
