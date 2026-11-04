import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Upload, CheckSquare, BookOpen, ShieldAlert, FolderOpen, UserPlus } from 'lucide-react';
import { useCurrentOrg } from '@/hooks/useOrg';
import { fetchControls, setAssessmentStatus, setAssessmentOwner, fetchEvidence, fetchTasks, signedEvidenceUrl } from '@/services/api';
import { logActivity } from '@/lib/format';
import { controlLabel, controlTone, evidenceHealth, healthTone, healthLabel, fmtDate, taskLabel, taskTone, isOverdue, priorityTone } from '@/lib/format';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner, EmptyState } from '@/components/ui/States';
import { Tabs } from '@/components/ui/Tabs';

const STATUSES = ['not_started', 'in_progress', 'implemented', 'needs_review', 'non_compliant'] as const;
type Tab = 'description' | 'guidance' | 'evidence' | 'tasks';

export function ControlDetailPage() {
  const { frameworkId, controlId: assessmentId } = useParams();
  const { orgId, userId, role } = useCurrentOrg().data ?? { orgId: '', userId: '', role: 'staff' };
  const [tab, setTab] = useState<Tab>('description');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const controlsQ = useQuery({
    queryKey: ['controls', orgId, frameworkId],
    queryFn: () => fetchControls(orgId, frameworkId!),
    enabled: !!orgId && !!frameworkId,
  });
  const evidenceQ = useQuery({ queryKey: ['evidence', orgId], queryFn: () => fetchEvidence(orgId), enabled: !!orgId });
  const tasksQ = useQuery({ queryKey: ['tasks', orgId], queryFn: () => fetchTasks(orgId), enabled: !!orgId });

  const control = controlsQ.data?.controls.find((c) => c.assessmentId === assessmentId);

  const statusMut = useMutation({
    mutationFn: async (status: string) => {
      await setAssessmentStatus(assessmentId!, status);
      await logActivity(orgId, 'status_changed', 'control', assessmentId, { status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['controls', orgId, frameworkId] }),
  });

  const ownerMut = useMutation({
    mutationFn: async () => {
      await setAssessmentOwner(assessmentId!, userId);
      await logActivity(orgId, 'owner_assigned', 'control', assessmentId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['controls', orgId, frameworkId] }),
  });

  if (controlsQ.isLoading) return <Spinner />;
  if (!control) return <EmptyState icon={<ShieldAlert size={22} />} title="Control not found" message="This control is not in your register." action={<Button variant="secondary" size="sm" onClick={() => navigate(`/frameworks/${frameworkId}`)}>Back to controls</Button>} />

  const linkedEvidence = (evidenceQ.data ?? []).filter((e: any) => e.links?.some((l: any) => l.control_assessment_id === assessmentId));
  const linkedTasks = (tasksQ.data ?? []).filter((t: any) => t.linked_control_id === assessmentId);

  return (
    <div className="space-y-4">
      <div>
        <nav className="mb-1 text-[11px] text-slate-600">
          <Link to="/frameworks" className="hover:text-blue">Frameworks</Link> /{' '}
          <Link to={`/frameworks/${frameworkId}`} className="hover:text-blue">{controlsQ.data?.framework?.name}</Link> /{' '}
          <span className="font-mono">{control.controlCode}</span>
        </nav>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-lg font-bold text-navy">{control.title}</h1>
            <p className="text-xs text-slate-600">{control.category}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate('/ai', { state: { context: `${controlsQ.data?.framework?.name} ${control.controlCode}: ${control.title}` } })}>
              <Sparkles size={14} stroke="currentColor" /> Ask AI
            </Button>
            {!control.notes && <Button variant="secondary" size="sm" onClick={() => ownerMut.mutate()} loading={ownerMut.isPending}><UserPlus size={14} stroke="currentColor" /> Assign to me</Button>}
          </div>
        </div>
      </div>

      {/* Status switcher */}
      <Card className="p-4">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-600">Status</div>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => statusMut.mutate(s)}
              disabled={statusMut.isPending}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors focus-ring ${
                control.status === s ? 'border-transparent bg-navy text-white dark:bg-blue-dark dark:hover:bg-blue' : 'border-line bg-white dark:bg-black text-slate-600 dark:text-slate-300 hover:border-gray-300'
              }`}
            >
              {controlLabel(s)}
            </button>
          ))}
        </div>
        {control.updatedAt && <p className="mt-2 text-[10px] text-slate-600">Last assessed {fmtDate(control.updatedAt)}</p>}
      </Card>

      <Tabs<Tab>
        tabs={[
          { id: 'description', label: 'Description' },
          { id: 'guidance', label: 'Implementation Guidance' },
          { id: 'evidence', label: 'Evidence', badge: linkedEvidence.length },
          { id: 'tasks', label: 'Tasks', badge: linkedTasks.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'description' && (
        <Card className="p-5">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-navy dark:text-white"><BookOpen size={14} stroke="currentColor" /> Description</div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{control.description || 'No description provided.'}</p>
        </Card>
      )}

      {tab === 'guidance' && (
        <Card className="p-5">
          <p className="mb-2 text-xs font-bold text-navy">Implementation Guidance</p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{control.guidance || 'No guidance provided.'}</p>
        </Card>
      )}

      {tab === 'evidence' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => navigate(`/evidence/upload?assessmentId=${assessmentId}`)}><Upload size={14} stroke="currentColor" /> Upload Evidence</Button>
          </div>
          {linkedEvidence.length === 0 && <EmptyState icon={<FolderOpen size={22} />} title="No linked evidence" message="Upload evidence to demonstrate implementation of this control." />}
          {linkedEvidence.map((e: any) => {
            const health = evidenceHealth(e.expiry_date);
            return (
              <button
                key={e.id}
                onClick={async () => { try { setPreviewUrl(await signedEvidenceUrl(e.file_path)); } catch { /* ignore */ } }}
                className="flex w-full items-center justify-between gap-3 rounded-card border border-line bg-white px-4 py-3 text-left hover:border-blue focus-ring"
              >
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold text-navy">{e.title}</div>
                  <div className="text-[10px] text-slate-600">{e.type?.toUpperCase()} · added {fmtDate(e.created_at)} by {e.uploader?.full_name ?? '—'}</div>
                </div>
                <Badge label={healthLabel(health)} tone={healthTone(health)} />
              </button>
            );
          })}
          {previewUrl && (
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-4 py-2 text-xs font-semibold text-navy">
                Preview <button onClick={() => setPreviewUrl(null)} className="text-blue hover:underline">Close</button>
              </div>
              <iframe src={previewUrl} title="Evidence preview" className="h-96 w-full" />
            </Card>
          )}
        </div>
      )}

      {tab === 'tasks' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => navigate(`/tasks/new?assessmentId=${assessmentId}`)}><CheckSquare size={14} stroke="currentColor" /> Create Task</Button>
          </div>
          {linkedTasks.length === 0 && <EmptyState icon={<CheckSquare size={22} />} title="No linked tasks" message="Create a remediation task for this control." />}
          {linkedTasks.map((t: any) => (
            <Link key={t.id} to={`/tasks/${t.id}`} className={`flex items-center justify-between gap-3 rounded-card border border-line bg-white px-4 py-3 hover:border-blue focus-ring ${isOverdue(t.due_date) && t.status !== 'done' ? 'border-l-4 border-l-crimson' : ''}`}>
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-navy">{t.title}</div>
                <div className="mt-1 flex gap-1.5">
                  <Badge label={taskLabel(t.status)} tone={taskTone(t.status)} />
                  <Badge label={t.priority} tone={priorityTone(t.priority)} />
                </div>
              </div>
              <span className="shrink-0 text-[11px] text-slate-600">{fmtDate(t.due_date)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
