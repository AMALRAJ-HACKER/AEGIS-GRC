import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, AlertTriangle, ChevronRight, ShieldAlert } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, Spinner } from '@/components/ui/States';
import { Tabs } from '@/components/ui/Tabs';
import { useCurrentOrg } from '@/hooks/useOrg';
import { fetchRisks } from '@/services/api';
import { canAddRisk } from '@/lib/permissions';
import { severityLabel, severityFromScore, fmtDate } from '@/lib/format';

type Filter = 'all' | 'open' | 'critical' | 'high' | 'medium' | 'low' | 'closed';

const severityTone = (s: string) =>
  s === 'critical' ? 'critical' : s === 'high' ? 'warning' : s === 'medium' ? 'info' : 'success';

export function RisksPage() {
  const { data: orgCtx } = useCurrentOrg();
  const orgId = orgCtx?.orgId ?? '';
  const role = orgCtx?.role ?? 'staff';
  const navigate = useNavigate();

  const [filter, setFilter] = useState<Filter>('open');
  const [q, setQ] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['risks', orgId],
    queryFn: () => fetchRisks(orgId),
    enabled: !!orgId,
  });

  const risks = (data ?? []) as any[];

  const counts = useMemo(() => {
    const open = risks.filter((r) => r.status !== 'closed');
    return {
      all: risks.length,
      open: open.length,
      critical: open.filter((r) => r.severity === 'critical').length,
      high: open.filter((r) => r.severity === 'high').length,
      medium: open.filter((r) => r.severity === 'medium').length,
      low: open.filter((r) => r.severity === 'low').length,
      closed: risks.filter((r) => r.status === 'closed').length,
    };
  }, [risks]);

  const visible = useMemo(() => {
    let list = risks;
    if (filter === 'open') list = list.filter((r) => r.status !== 'closed');
    else if (filter === 'closed') list = list.filter((r) => r.status === 'closed');
    else if (filter !== 'all') list = list.filter((r) => r.status !== 'closed' && r.severity === filter);

    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((r) =>
        `${r.title} ${r.category ?? ''} ${r.owner?.full_name ?? ''}`.toLowerCase().includes(needle),
      );
    }
    return list;
  }, [risks, filter, q]);

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">Risk Register</h1>
          <p className="mt-1 text-sm text-slate-500">
            {counts.open} open · {counts.critical} critical · {counts.high} high
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => navigate('/risks/new')}
          disabled={!canAddRisk(role)}
          title={canAddRisk(role) ? 'Add a risk' : 'Your role cannot add risks'}
        >
          <Plus size={15} stroke="currentColor" /> Add risk
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { key: 'critical', label: 'Critical', value: counts.critical, color: 'bg-crimson' },
          { key: 'high', label: 'High', value: counts.high, color: 'bg-amber2' },
          { key: 'medium', label: 'Medium', value: counts.medium, color: 'bg-blue' },
          { key: 'low', label: 'Low', value: counts.low, color: 'bg-emerald2' },
        ].map((s) => (
          <Card key={s.key} className="flex items-center gap-3 p-4">
            <span className={`h-9 w-1 rounded-full ${s.color}`} />
            <div>
              <p className="text-xl font-bold text-navy">{s.value}</p>
              <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Tabs
        tabs={[
          { id: 'open', label: 'Open', badge: counts.open },
          { id: 'critical', label: 'Critical', badge: counts.critical },
          { id: 'high', label: 'High', badge: counts.high },
          { id: 'medium', label: 'Medium', badge: counts.medium },
          { id: 'low', label: 'Low', badge: counts.low },
          { id: 'closed', label: 'Closed', badge: counts.closed },
          { id: 'all', label: 'All', badge: counts.all },
        ]}
        active={filter}
        onChange={(id) => setFilter(id as Filter)}
      />

      <div className="relative max-w-sm">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search risks, category or owner…"
          className="w-full rounded-lg border border-line bg-white py-2 pl-9 pr-3 text-sm text-ink placeholder:text-slate-500 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/15"
        />
      </div>

      {isError ? (
        <Card>
          <CardBody className="py-12 text-center">
            <p className="text-sm font-semibold text-navy">Could not load risks</p>
            <Button className="mt-4" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </CardBody>
        </Card>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<ShieldAlert size={22} stroke="currentColor" />}
          title={counts.all === 0 ? 'No risks in the register yet' : 'No risks match this view'}
          message={
            counts.all === 0
              ? 'Add your first risk to start tracking likelihood, impact and mitigation.'
              : 'Try another severity tab or clear the search.'
          }
          action={
            counts.all === 0 && canAddRisk(role) ? (
              <Button size="sm" onClick={() => navigate('/risks/new')}>
                Add risk
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden grid-cols-[1fr_130px_100px_90px_150px_130px_36px] gap-3 border-b border-line bg-slate-50 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 lg:grid">
            <span>Risk</span>
            <span>Category</span>
            <span>Severity</span>
            <span>Score</span>
            <span>Owner</span>
            <span>Target</span>
            <span />
          </div>
          <ul className="divide-y divide-line">
            {visible.map((r) => {
              const score = r.residual_score ?? (Number(r.likelihood) || 0) * (Number(r.impact) || 0);
              const sev = r.severity ?? severityFromScore(score);
              return (
                <li key={r.id}>
                  <Link
                    to={`/risks/${r.id}`}
                    className="grid grid-cols-1 items-center gap-2 px-5 py-3.5 transition-colors hover:bg-slate-50 lg:grid-cols-[1fr_130px_100px_90px_150px_130px_36px] lg:gap-3"
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <AlertTriangle
                          size={14}
                          className={
                            sev === 'critical'
                              ? 'shrink-0 text-crimson'
                              : sev === 'high'
                                ? 'shrink-0 text-amber'
                                : 'shrink-0 text-slate-500'
                          }
                        />
                        <span className="truncate text-sm font-medium text-navy">{r.title}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-slate-500 lg:hidden">
                        {r.category ?? 'Uncategorised'} · {severityLabel(sev)} · score {score}
                      </span>
                    </span>
                    <span className="hidden truncate text-xs text-slate-500 lg:block">{r.category ?? '—'}</span>
                    <span className="hidden lg:block">
                      <Badge label={severityLabel(sev)} tone={severityTone(sev) as any} />
                    </span>
                    <span className="hidden text-xs font-semibold text-navy lg:block">{score}</span>
                    <span className="hidden truncate text-xs text-slate-500 lg:block">
                      {r.owner?.full_name ?? 'Unassigned'}
                    </span>
                    <span className="hidden text-xs text-slate-500 lg:block">{fmtDate(r.target_date)}</span>
                    <ChevronRight size={15} className="hidden text-slate-500 lg:block" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
