import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import { useCurrentOrg } from '@/hooks/useOrg';
import { fetchFrameworkStats, fetchTasks, fetchRisks, fetchEvidence } from '@/services/api';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/States';
import { ComplianceRing, StackedBar } from '@/components/ui/Charts';
import { fmtDate, downloadCsv, evidenceHealth } from '@/lib/format';

const TYPES = ['Control Status Summary', 'Evidence Coverage', 'Risk Summary', 'Task Progress', 'Compliance Health'] as const;

export function ReportsPage() {
  const { orgId, role } = useCurrentOrg().data ?? { orgId: '', role: 'staff' };
  const [type, setType] = useState<(typeof TYPES)[number]>('Compliance Health');
  const [freq, setFreq] = useState<'off' | 'weekly' | 'monthly'>('off');
  const navigate = useNavigate();
  const enabled = !!orgId;

  const stats = useQuery({ queryKey: ['frameworkStats', orgId], queryFn: () => fetchFrameworkStats(orgId), enabled });
  const tasks = useQuery({ queryKey: ['tasks', orgId], queryFn: () => fetchTasks(orgId), enabled });
  const risks = useQuery({ queryKey: ['risks', orgId], queryFn: () => fetchRisks(orgId), enabled });
  const evidence = useQuery({ queryKey: ['evidence', orgId], queryFn: () => fetchEvidence(orgId), enabled });

  const allLoading = stats.isLoading || tasks.isLoading || risks.isLoading || evidence.isLoading;

  const controlCounts = useMemo(() => {
    const list = stats.data ?? [];
    return list.reduce((acc, f) => ({
      total: acc.total + f.total, implemented: acc.implemented + f.implemented, inProgress: acc.inProgress + f.inProgress,
      needsReview: acc.needsReview + f.needsReview, nonCompliant: acc.nonCompliant + f.nonCompliant, notStarted: acc.notStarted + f.notStarted,
    }), { total: 0, implemented: 0, inProgress: 0, notStarted: 0, needsReview: 0, nonCompliant: 0 });
  }, [stats.data]);

  const openRisks = useMemo(() => (risks.data ?? []).filter((x: any) => x.status !== 'closed'), [risks.data]);

  const evidenceCoverage = useMemo(() => {
    const ev = evidence.data ?? [];
    const byCtl = new Set(ev.flatMap((e: any) => e.links?.map((l: any) => l.control_assessment_id) ?? []));
    return { total: controlCounts.total, withEvidence: byCtl.size, withoutEvidence: Math.max(0, controlCounts.total - byCtl.size) };
  }, [evidence.data, controlCounts.total]);

  if (allLoading) return <Spinner />;

  const exportCsv = () => {
    if (type === 'Control Status Summary') {
      downloadCsv('aeigs-control-status.csv', (stats.data ?? []).map((f) => ({ framework: f.name, version: f.version, total: f.total, implemented: f.implemented, inProgress: f.inProgress, needsReview: f.needsReview, nonCompliant: f.nonCompliant, notStarted: f.notStarted, score: f.score })));
    } else if (type === 'Evidence Coverage') {
      const ev = evidence.data ?? [];
      const byCtl = new Set(ev.flatMap((e: any) => e.links?.map((l: any) => l.control_assessment_id) ?? []));
      downloadCsv('aegis-evidence-coverage.csv', [{ total_controls: controlCounts.total, controls_with_evidence: byCtl.size, controls_without_evidence: Math.max(0, controlCounts.total - byCtl.size) }]);
    } else if (type === 'Risk Summary') {
      const r = risks.data ?? [];
      const open = r.filter((x: any) => x.status !== 'closed');
      downloadCsv('aegis-risk-summary.csv', [{ total_risks: r.length, open_risks: open.length, critical: open.filter((x: any) => x.severity === 'critical').length, high: open.filter((x: any) => x.severity === 'high').length, medium: open.filter((x: any) => x.severity === 'medium').length, low: open.filter((x: any) => x.severity === 'low').length }]);
    } else if (type === 'Task Progress') {
      const t = tasks.data ?? [];
      downloadCsv('aegis-task-progress.csv', [{ total: t.length, todo: t.filter((x: any) => x.status === 'todo').length, in_progress: t.filter((x: any) => x.status === 'in_progress').length, pending_review: t.filter((x: any) => x.status === 'pending_review').length, approved: t.filter((x: any) => x.status === 'approved').length, done: t.filter((x: any) => x.status === 'done').length, blocked: t.filter((x: any) => x.status === 'blocked').length }]);
    } else {
      downloadCsv('aegis-compliance-health.csv', (stats.data ?? []).map((f) => ({ framework: f.name, activated: f.activated, score: f.score, total: f.total, implemented: f.implemented })));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-navy dark:text-navy">Reports & Audit</h1>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate('/audit-log')}>Audit Log</Button>
          <Button size="sm" onClick={exportCsv}>
            <Download size={14} stroke="currentColor" /> Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader title="Report Type" />
        <CardBody className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <Button
              key={t}
              onClick={() => setType(t)}
              className={type === t ? 'rounded-lg border border-navy bg-navy text-white' : 'rounded-lg border border-line bg-white px-3.5 py-1.5 text-xs font-semibold capitalize focus-ring hover:border-navy hover:text-navy dark:hover:text-navy dark:bg-navy/20'}
            >
              {t}
            </Button>
          ))}
        </CardBody>
      </Card>

      {type === 'Compliance Health' && (
        <Card>
          <CardHeader title="Compliance Health" subtitle="Per-framework score" />
          <CardBody className="space-y-3">
            {(stats.data ?? []).map((f: any) => (
              <div key={f.id} className="flex items-center justify-between rounded-xl border border-line border-slate-200 dark:border-navy/20 p-3">
                <div>
                  <div className="text-sm font-bold text-navy dark:text-navy">{f.name}</div>
                  <div className="text-sm text-slate-400 dark:text-slate-300">{f.implemented}/{f.total} implemented · {f.score}%</div>
                </div>
                <ComplianceRing score={f.score} size={40} />
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {type === 'Control Status Summary' && (
        <Card>
          <CardHeader title="Control Status Summary" />
          <CardBody>
            <StackedBar
              segments={[
                { label: 'Implemented', value: controlCounts.implemented, color: 'emerald' },
                { label: 'In Progress', value: controlCounts.inProgress, color: 'amber' },
                { label: 'Under Review', value: controlCounts.needsReview, color: 'blue' },
                { label: 'Non-Compliant', value: controlCounts.nonCompliant, color: 'crimson' },
                { label: 'Not Started', value: controlCounts.notStarted, color: 'slate-500' },
              ]}
            />
          </CardBody>
        </Card>
      )}

      {type === 'Evidence Coverage' && (
        <Card>
          <CardHeader title="Evidence Coverage" />
          <CardBody className="grid grid-cols-2 gap-3 text-center sm:grid-cols-3">
            <div className="rounded-xl border border-line border-slate-200 dark:border-navy/20 p-3">
              <div className="text-2xl font-bold text-emerald-500">{evidenceCoverage.withEvidence}</div>
              <div className="text-xs text-slate-400 dark:text-slate-300">Controls with evidence</div>
            </div>
            <div className="rounded-xl border border-line border-slate-200 dark:border-navy/20 p-3">
              <div className="text-2xl font-bold text-crimson">{evidenceCoverage.withoutEvidence}</div>
              <div className="text-xs text-slate-400 dark:text-slate-300">Controls without evidence</div>
            </div>
            <div className="rounded-xl border border-line border-slate-200 dark:border-navy/20 p-3">
              <div className="text-2xl font-bold text-navy">{evidenceCoverage.total}</div>
              <div className="text-xs text-slate-400 dark:text-slate-300">Total controls</div>
            </div>
          </CardBody>
        </Card>
      )}

      {type === 'Risk Summary' && (
        <Card>
          <CardHeader title="Risk Summary" subtitle={`${openRisks.length} open`} />
          <CardBody className="grid grid-cols-4 gap-2">
            {([['critical', 'crimson'], ['high', 'amber'], ['medium', 'blue'], ['low', 'emerald']] as const).map(([k, c]) => (
              <div key={k} className={`rounded-xl p-3 text-center ${c === 'crimson' ? 'bg-crimson/5' : c === 'amber' ? 'bg-amber/5' : c === 'blue' ? 'bg-blue/5' : 'bg-emerald/5'}`}>
                <div className="text-2xl font-bold">{openRisks.filter((x: any) => x.severity === k).length}</div>
                <div className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-300">{k}</div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {type === 'Task Progress' && (
        <Card>
          <CardHeader title="Task & Remediation Progress" />
          <CardBody className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {[['todo', 'Open'], ['in_progress', 'In Progress'], ['pending_review', 'Pending Review'], ['approved', 'Approved'], ['done', 'Closed'], ['blocked', 'Blocked']].map(([s, l]) => (
              <div key={s} className="rounded-xl border border-line border-slate-200 dark:border-navy/20 p-2 text-center">
                <div className="text-lg font-bold navy">{tasks.data?.filter((x: any) => x.status === s).length}</div>
                <div className="text-xs text-slate-400 dark:text-slate-300">{l}</div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="Schedule Report" subtitle="Informational — persistence mirrors mobile (stored on org settings when saved in mobile app)" />
        <CardBody className="flex flex-wrap items-center gap-3">
          <svg className="h-4 w-4 text-navy" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M18.36 18.36l1.41 1.41M1 12h2M21 12h-2M4.93 19.07l1.41-1.41M18.36 5.64l1.41-1.41" />
          </svg>
          {(['off', 'weekly', 'monthly'] as const).map((f) => (
            <Button key={f} onClick={() => setFreq(f)} className={
              freq === f ? 'rounded-lg border border-navy bg-navy text-white' : 'rounded-lg border border-line bg-white px-3.5 py-1.5 text-xs font-semibold capitalize focus-ring hover:border-navy hover:text-navy dark:hover:text-navy dark:bg-navy/20'
            }>{f === 'off' ? 'Off' : f}</Button>
          ))}
          <p className="text-xs text-slate-400">This web app reads the same org record; schedule settings persist in Supabase if you save from Settings → General/Notifications in the mobile app or extend this page.</p>
        </CardBody>
      </Card>
    </div>
  );
}