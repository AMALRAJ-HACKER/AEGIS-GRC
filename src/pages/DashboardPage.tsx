import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowUpRight,
  AlertTriangle,
  CheckSquare,
  FolderOpen,
  ShieldCheck,
  Plus,
  Upload,
  Activity,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/States';
import { ComplianceRing, StackedBar } from '@/components/ui/Charts';
import { useCurrentOrg } from '@/hooks/useOrg';
import { fetchFrameworkStats, fetchRisks, fetchTasks, fetchActivity, fetchEvidence } from '@/services/api';
import { evidenceHealth, severityLabel, timeAgo, taskLabel } from '@/lib/format';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function Kpi({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  to,
}: {
  label: string;
  value: number | string;
  hint: string;
  icon: typeof ShieldCheck;
  tone: 'navy' | 'red' | 'amber' | 'emerald';
  to: string;
}) {
  const tones = {
    navy: 'bg-navy/5 text-navy',
    red: 'bg-red-50 text-crimson',
    amber: 'bg-amber-50 text-amber',
    emerald: 'bg-emerald-50 text-emerald',
  } as const;

  return (
    <Link
      to={to}
      className="card group p-5 transition-shadow hover:shadow-soft"
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon size={19} strokeWidth={1.9} />
        </div>
        <ArrowUpRight size={16} className="text-slate-500 transition-colors group-hover:text-navy" />
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-navy">{value}</p>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p>
    </Link>
  );
}

export function DashboardPage() {
  const { data: orgCtx, isLoading: orgLoading, isError: orgError } = useCurrentOrg();
  const orgId = orgCtx?.orgId ?? '';
  const userId = orgCtx?.userId ?? '';
  const profile = orgCtx?.profile ?? null;
  const navigate = useNavigate();

  const enabled = !!orgId;

  const stats = useQuery({ queryKey: ['frameworkStats', orgId], queryFn: () => fetchFrameworkStats(orgId), enabled });
  const risks = useQuery({ queryKey: ['risks', orgId], queryFn: () => fetchRisks(orgId), enabled });
  const tasks = useQuery({ queryKey: ['tasks', orgId], queryFn: () => fetchTasks(orgId), enabled });
  const evidence = useQuery({ queryKey: ['evidence', orgId], queryFn: () => fetchEvidence(orgId), enabled });
  const activity = useQuery({ queryKey: ['activity', orgId], queryFn: () => fetchActivity(orgId), enabled });

  const data = useMemo(() => {
    const frameworks = (stats.data ?? []) as any[];
    const activated = frameworks.filter((f) => f.activated);
    const scored = activated.filter((f) => f.total > 0);
    const avgScore = scored.length
      ? Math.round(scored.reduce((sum, f) => sum + (f.score ?? 0), 0) / scored.length)
      : 0;

    const allRisks = (risks.data ?? []) as any[];
    const openRisks = allRisks.filter((r) => r.status !== 'closed');
    const countSev = (s: string) => openRisks.filter((r) => r.severity === s).length;

    const allTasks = (tasks.data ?? []) as any[];
    const myOpenTasks = allTasks.filter(
      (t) => t.status !== 'done' && t.status !== 'approved' && (!t.assigned_to || t.assigned_to === userId),
    );

    const allEvidence = (evidence.data ?? []) as any[];
    const expiring = allEvidence.filter((e) => {
      const h = evidenceHealth(e.expiry_date);
      return h === 'expiring' || h === 'expired';
    });

    return {
      activated,
      avgScore,
      openRisks,
      myOpenTasks,
      expiring,
      severity: {
        critical: countSev('critical'),
        high: countSev('high'),
        medium: countSev('medium'),
        low: countSev('low'),
      },
    };
  }, [stats.data, risks.data, tasks.data, evidence.data, userId]);

  if (orgLoading) return <Spinner />;

  if (orgError) {
    return (
      <Card>
        <CardBody className="py-12 text-center">
          <p className="text-sm font-semibold text-navy">Could not load your workspace</p>
          <p className="mt-1 text-xs text-slate-500">Check your connection and try again.</p>
          <Button className="mt-4" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardBody>
      </Card>
    );
  }

  const recentActivity = (activity.data ?? []).slice(0, 6) as any[];
  const upcomingTasks = data.myOpenTasks.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            {greeting()}, {profile?.full_name?.split(' ')[0] ?? 'there'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here is your compliance posture for {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate('/evidence/upload')}>
            <Upload size={15} stroke="currentColor" /> Upload evidence
          </Button>
          <Button size="sm" onClick={() => navigate('/risks/new')}>
            <Plus size={15} stroke="currentColor" /> Add risk
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Active frameworks"
          value={data.activated.length}
          hint={`Average score ${data.avgScore}%`}
          icon={ShieldCheck}
          tone="navy"
          to="/frameworks"
        />
        <Kpi
          label="Open risks"
          value={data.openRisks.length}
          hint={`${data.severity.critical} critical · ${data.severity.high} high`}
          icon={AlertTriangle}
          tone="red"
          to="/risks"
        />
        <Kpi
          label="My open tasks"
          value={data.myOpenTasks.length}
          hint="Assigned to you"
          icon={CheckSquare}
          tone="amber"
          to="/tasks"
        />
        <Kpi
          label="Evidence expiring"
          value={data.expiring.length}
          hint="Expired or due within 30 days"
          icon={FolderOpen}
          tone="emerald"
          to="/evidence"
        />
      </div>

      {/* Compliance + risk */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Compliance health"
            subtitle="Implementation progress across your active frameworks"
            action={
              <Link to="/frameworks" className="text-xs font-semibold text-blue hover:underline">
                View all
              </Link>
            }
          />
          <CardBody>
            {stats.isLoading ? (
              <Spinner />
            ) : data.activated.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line bg-slate-50/60 px-6 py-10 text-center">
                <ShieldCheck size={28} className="mx-auto text-slate-500" />
                <p className="mt-2 text-sm font-semibold text-navy">No frameworks activated yet</p>
                <p className="mt-1 text-xs text-slate-500">
                  Activate ISO 27001, SOC 2, NIST CSF and more to start tracking compliance.
                </p>
                <Button size="sm" className="mt-4" onClick={() => navigate('/frameworks')}>
                  Browse frameworks
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.activated.slice(0, 6).map((f) => (
                  <Link
                    key={f.id}
                    to={`/frameworks/${f.id}`}
                    className="flex items-center gap-3 rounded-xl border border-line p-3 transition-colors hover:border-navy/20 hover:bg-slate-50"
                  >
                    <ComplianceRing score={f.score ?? 0} size={64} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-navy">{f.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {f.implemented}/{f.total} controls
                      </p>
                      <Badge
                        label={f.score >= 70 ? 'On track' : f.score >= 40 ? 'In progress' : 'At risk'}
                        tone={f.score >= 70 ? 'success' : f.score >= 40 ? 'warning' : 'critical'}
                        className="mt-1"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Risk summary"
            subtitle="Open risks by severity"
            action={
              <Link to="/risks" className="text-xs font-semibold text-blue hover:underline">
                Register
              </Link>
            }
          />
          <CardBody className="space-y-5">
            {risks.isLoading ? (
              <Spinner />
            ) : (
              <>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-navy">{data.openRisks.length}</p>
                    <p className="text-xs text-slate-500">open risks</p>
                  </div>
                  <Badge
                    label={data.severity.critical > 0 ? `${data.severity.critical} critical` : 'No critical'}
                    tone={data.severity.critical > 0 ? 'critical' : 'success'}
                  />
                </div>
                <StackedBar
                  segments={[
                    { label: 'Critical', value: data.severity.critical, color: 'crimson' },
                    { label: 'High', value: data.severity.high, color: 'amber' },
                    { label: 'Medium', value: data.severity.medium, color: 'blue' },
                    { label: 'Low', value: data.severity.low, color: 'emerald' },
                  ]}
                />
              </>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Tasks + activity */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Tasks needing attention"
            subtitle="Your open assignments"
            action={
              <Link to="/tasks" className="text-xs font-semibold text-blue hover:underline">
                All tasks
              </Link>
            }
          />
          <CardBody className="p-0">
            {tasks.isLoading ? (
              <Spinner />
            ) : upcomingTasks.length === 0 ? (
              <p className="px-5 py-8 text-center text-xs text-slate-500">You're all caught up.</p>
            ) : (
              <ul className="divide-y divide-line">
                {upcomingTasks.map((t) => (
                  <li key={t.id}>
                    <Link
                      to={`/tasks/${t.id}`}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50"
                    >
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          t.priority === 'critical'
                            ? 'bg-crimson'
                            : t.priority === 'high'
                              ? 'bg-amber2'
                              : 'bg-blue'
                        }`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-navy">{t.title}</span>
                        <span className="block text-[11px] text-slate-500">
                          {taskLabel(t.status)} · due {t.due_date ? new Date(t.due_date).toLocaleDateString('en-GB') : '—'}
                        </span>
                      </span>
                      <ChevronRightSmall />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Recent activity"
            subtitle="Latest actions in your workspace"
            action={
              <Link to="/audit-log" className="text-xs font-semibold text-blue hover:underline">
                Audit log
              </Link>
            }
          />
          <CardBody className="p-0">
            {activity.isLoading ? (
              <Spinner />
            ) : recentActivity.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Activity size={24} className="mx-auto text-slate-500" />
                <p className="mt-2 text-xs text-slate-500">No activity yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {recentActivity.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 px-5 py-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <Activity size={13} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-700">
                        <span className="font-medium text-navy">{a.actor?.full_name ?? 'System'}</span>{' '}
                        {String(a.action ?? '').replace(/_/g, ' ')}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {a.resource_type ?? 'item'} · {timeAgo(a.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Risk severity legend helper for screen readers */}
      <p className="sr-only">
        Open risk severities: {severityLabel('critical')} {data.severity.critical}, {severityLabel('high')}{' '}
        {data.severity.high}, {severityLabel('medium')} {data.severity.medium}, {severityLabel('low')}{' '}
        {data.severity.low}.
      </p>
    </div>
  );
}

function ChevronRightSmall() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
