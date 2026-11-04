import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, CheckSquare, History, Archive } from 'lucide-react';
import { useCurrentOrg } from '@/hooks/useOrg';
import { fetchRisks, fetchRiskHistory, updateRisk, addRiskHistory } from '@/services/api';
import { logActivity, severityLabel, fmtDate, fmtDateTime } from '@/lib/format';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner, EmptyState } from '@/components/ui/States';
import { ConfirmModal } from '@/components/ui/Modal';
import { canAddRisk, isAdmin } from '@/lib/permissions';

const STATUSES = ['open', 'mitigating', 'accepted', 'closed'] as const;
const TONE: Record<string, any> = { critical: 'critical', high: 'warning', medium: 'info', low: 'success' };

export function RiskDetailPage() {
  const { riskId } = useParams();
  const { orgId, userId, role } = useCurrentOrg().data ?? { orgId: '', userId: '', role: 'staff' };
  const [confirmClose, setConfirmClose] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const risksQ = useQuery({ queryKey: ['risks', orgId], queryFn: () => fetchRisks(orgId), enabled: !!orgId });
  const historyQ = useQuery({ queryKey: ['riskHistory', riskId], queryFn: () => fetchRiskHistory(riskId!), enabled: !!riskId });
  const risk = risksQ.data?.find((r: any) => r.id === riskId);

  const statusMut = useMutation({
    mutationFn: async (status: string) => {
      const old = risk?.status;
      await updateRisk(riskId!, { status, ...(status === 'accepted' ? { accepted_at: new Date().toISOString(), accepted_by: userId } : {}) });
      await addRiskHistory(riskId!, userId, 'status', old, status);
      await logActivity(orgId, 'risk_status_changed', 'risk', riskId, { from: old, to: status });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['risks', orgId] }); setConfirmClose(false); },
  });

  if (risksQ.isLoading) return <Spinner />;
  if (!risk) return <EmptyState icon={<Archive size={22} />} title="Risk not found" message="It may have been removed." action={<Button variant="secondary" size="sm" onClick={() => navigate('/risks')}>Back to register</Button>} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <nav className="mb-1 text-[11px] text-slate-600"><Link to="/risks" className="hover:text-blue">Risk Register</Link> / {risk.category ?? 'Risk'}</nav>
          <div className="flex items-center gap-2">
            <Badge label={severityLabel(risk.severity)} tone={TONE[risk.severity]} />
            {risk.category && <Badge label={risk.category} />}
          </div>
          <h1 className="mt-1.5 text-lg font-bold text-navy">{risk.title}</h1>
          <p className="text-xs text-slate-600">Owner: {risk.owner?.full_name ?? 'Unassigned'} · Target {fmtDate(risk.target_date)} · Status: <span className="font-semibold capitalize">{risk.status}</span></p>
        </div>
        <div className="flex gap-2">
          {canAddRisk(role) && <Button variant="secondary" size="sm" onClick={() => navigate(`/risks/${riskId}/edit`)}><Pencil size={14} /> Edit</Button>}
          <Button size="sm" onClick={() => navigate(`/tasks/new?riskId=${riskId}`)}><CheckSquare size={14} /> Create Task</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-600">Inherent Score</div>
          <div className="my-1 text-4xl font-bold text-navy">{risk.inherent_score}</div>
          <div className="text-xs text-slate-600">Likelihood {risk.likelihood} × Impact {risk.impact}</div>
        </Card>
        <Card className="p-5 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-600">Residual Score</div>
          <div className="my-1 text-4xl font-bold text-slate-600">{risk.residual_score ?? '—'}</div>
          <div className="text-xs text-slate-500">{risk.residual_likelihood && risk.residual_impact ? `Likelihood ${risk.residual_likelihood} × Impact ${risk.residual_impact}` : 'Not assessed'}</div>
        </Card>
      </div>

      {risk.description && (
        <Card className="p-5">
          <div className="mb-1.5 text-xs font-bold text-navy">Description</div>
          <p className="whitespace-pre-wrap text-sm text-slate-600">{risk.description}</p>
        </Card>
      )}
      {risk.existing_safeguards && (
        <Card className="p-5">
          <div className="mb-1.5 text-xs font-bold text-navy">Existing Safeguards</div>
          <p className="whitespace-pre-wrap text-sm text-slate-600">{risk.existing_safeguards}</p>
        </Card>
      )}
      {risk.mitigation_plan && (
        <Card className="p-5">
          <div className="mb-1.5 text-xs font-bold text-navy">Mitigation Plan</div>
          <p className="whitespace-pre-wrap text-sm text-slate-600">{risk.mitigation_plan}</p>
        </Card>
      )}

      {canAddRisk(role) && (
        <Card>
          <CardHeader title="Update Status" />
          <CardBody>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => (s === 'closed' ? setConfirmClose(true) : statusMut.mutate(s))}
                  disabled={statusMut.isPending || risk.status === s}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors focus-ring ${
                    risk.status === s ? 'border-transparent bg-navy text-white dark:bg-blue-dark dark:hover:bg-blue' : 'border-line bg-white dark:bg-black text-slate-600 dark:text-slate-500 hover:border-gray-300 disabled:opacity-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="History" subtitle="Status changes and updates" />
        <CardBody className="space-y-3">
          {(historyQ.data ?? []).length === 0 && <p className="py-2 text-xs text-slate-600">No history recorded yet.</p>}
          {(historyQ.data ?? []).map((h: any) => (
            <div key={h.id} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-slate-600 dark:text-slate-500"><History size={13} stroke="currentColor" /></span>
              <div className="text-xs">
                <span className="font-semibold text-navy dark:text-white">{h.actor?.full_name ?? 'System'}</span>{' '}
                changed <span className="font-mono text-[11px] text-blue-dark dark:text-blue-400">{h.field_changed}</span> from{' '}
                <span className="font-semibold">{h.old_value ?? '—'}</span> to <span className="font-semibold">{h.new_value ?? '—'}</span>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">{fmtDateTime(h.created_at)}</div>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <ConfirmModal
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        onConfirm={() => statusMut.mutate('closed')}
        title="Close this risk?"
        message="Closing a risk removes it from the open register. You can reopen it later from the status controls."
        confirmLabel="Close Risk"
        loading={statusMut.isPending}
      />
    </div>
  );
}
