import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, ListChecks, ChevronRight, ShieldCheck } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, Spinner } from '@/components/ui/States';
import { ComplianceRing } from '@/components/ui/Charts';
import { Tabs } from '@/components/ui/Tabs';
import { useCurrentOrg } from '@/hooks/useOrg';
import { fetchControls, fetchFrameworkStats } from '@/services/api';
import { controlLabel, controlTone } from '@/lib/format';

type Filter = 'all' | 'implemented' | 'in_progress' | 'not_started' | 'needs_review' | 'non_compliant';

export function ControlsPage() {
  const { frameworkId } = useParams();
  const { data: orgCtx } = useCurrentOrg();
  const orgId = orgCtx?.orgId ?? '';
  const navigate = useNavigate();

  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const stats = useQuery({
    queryKey: ['frameworkStats', orgId],
    queryFn: () => fetchFrameworkStats(orgId),
    enabled: !!orgId && !frameworkId,
  });

  const controlsQuery = useQuery({
    queryKey: ['controls', orgId, frameworkId],
    queryFn: () => fetchControls(orgId, frameworkId as string),
    enabled: !!orgId && !!frameworkId,
  });

  const controls = (controlsQuery.data?.controls ?? []) as any[];
  const framework = controlsQuery.data?.framework as any;

  const counts = useMemo(() => {
    const base: Record<string, number> = {
      all: controls.length,
      implemented: 0,
      in_progress: 0,
      not_started: 0,
      needs_review: 0,
      non_compliant: 0,
    };
    controls.forEach((c) => {
      base[c.status] = (base[c.status] ?? 0) + 1;
    });
    return base;
  }, [controls]);

  const visible = useMemo(() => {
    let list = controls;
    if (filter !== 'all') list = list.filter((c) => c.status === filter);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((c) =>
        `${c.controlCode} ${c.title} ${c.category}`.toLowerCase().includes(needle),
      );
    }
    return list;
  }, [controls, filter, q]);

  // ----- Framework picker (/controls) -----
  if (!frameworkId) {
    const activated = ((stats.data ?? []) as any[]).filter((f) => f.activated);

    if (stats.isLoading) return <Spinner />;

    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">Controls</h1>
          <p className="mt-1 text-sm text-slate-500">
            Pick an activated framework to review and update its controls.
          </p>
        </div>

        {activated.length === 0 ? (
          <EmptyState
            icon={<ListChecks size={22} stroke="currentColor" />}
            title="No controls to show yet"
            message="Activate a framework first — its controls will appear here automatically."
            action={
              <Button size="sm" onClick={() => navigate('/frameworks')}>
                Browse frameworks
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activated.map((f) => (
              <Link
                key={f.id}
                to={`/frameworks/${f.id}`}
                className="card flex items-center gap-4 p-5 transition-shadow hover:shadow-soft"
              >
                <ComplianceRing score={f.score ?? 0} size={62} />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold text-navy">{f.name}</h3>
                  <p className="text-[11px] text-slate-400">
                    {f.implemented}/{f.total} implemented
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">{f.category}</p>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ----- Framework control list -----
  if (controlsQuery.isLoading) return <Spinner />;

  if (controlsQuery.isError) {
    return (
      <Card>
        <CardBody className="py-12 text-center">
          <p className="text-sm font-semibold text-navy">Could not load controls</p>
          <p className="mt-1 text-xs text-slate-500">Please try again.</p>
          <Button className="mt-4" size="sm" onClick={() => controlsQuery.refetch()}>
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
          <nav className="mb-1 flex items-center gap-1 text-[11px] text-slate-400">
            <Link to="/frameworks" className="hover:text-navy">
              Frameworks
            </Link>
            <ChevronRight size={12} />
            <span className="text-slate-600">{framework?.name ?? 'Controls'}</span>
          </nav>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-navy">
            <ShieldCheck size={22} className="text-navy" />
            {framework?.name ?? 'Controls'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {controls.length} controls · {counts.implemented} implemented
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ComplianceRing
            score={controls.length ? Math.round((counts.implemented / controls.length) * 100) : 0}
            size={64}
            label="score"
          />
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'all', label: 'All', badge: counts.all },
          { id: 'implemented', label: 'Implemented', badge: counts.implemented },
          { id: 'in_progress', label: 'In progress', badge: counts.in_progress },
          { id: 'not_started', label: 'Not started', badge: counts.not_started },
          { id: 'needs_review', label: 'Review', badge: counts.needs_review },
          { id: 'non_compliant', label: 'Non-compliant', badge: counts.non_compliant },
        ]}
        active={filter}
        onChange={(id) => setFilter(id as Filter)}
      />

      <div className="relative max-w-sm">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by code, title or category…"
          className="w-full rounded-lg border border-line bg-white py-2 pl-9 pr-3 text-sm text-ink placeholder:text-slate-400 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/15"
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<ListChecks size={22} stroke="currentColor" />}
          title="No controls match"
          message="Adjust the filters or search term to see more controls."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden grid-cols-[120px_1fr_150px_130px_40px] gap-4 border-b border-line bg-slate-50 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 md:grid">
            <span>Control</span>
            <span>Title</span>
            <span>Category</span>
            <span>Status</span>
            <span />
          </div>
          <ul className="divide-y divide-line">
            {visible.map((c) => (
              <li key={c.controlId}>
                <Link
                  to={`/frameworks/${frameworkId}/controls/${c.controlId}`}
                  className="grid grid-cols-1 items-center gap-2 px-5 py-3.5 transition-colors hover:bg-slate-50 md:grid-cols-[120px_1fr_150px_130px_40px] md:gap-4"
                >
                  <span className="font-mono text-xs font-semibold text-navy">{c.controlCode}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-navy">{c.title}</span>
                    <span className="block truncate text-[11px] text-slate-400 md:hidden">{c.category}</span>
                  </span>
                  <span className="hidden truncate text-xs text-slate-500 md:block">{c.category}</span>
                  <span>
                    <Badge label={controlLabel(c.status)} tone={controlTone(c.status)} />
                  </span>
                  <ChevronRight size={15} className="hidden text-slate-300 md:block" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
