import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentOrg } from '@/hooks/useOrg';
import { createTask, fetchMembers, fetchRisks, fetchControls } from '@/services/api';
import { logActivity } from '@/lib/format';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';

const PRIORITIES = ['critical', 'high', 'medium', 'low'] as const;

export function TaskFormPage() {
  const [params] = useSearchParams();
  const preAssessmentId = params.get('assessmentId') ?? '';
  const preRiskId = params.get('riskId') ?? '';
  const { orgId, userId } = useCurrentOrg().data ?? { orgId: '', userId: '' };
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const members = useQuery({ queryKey: ['members', orgId], queryFn: () => fetchMembers(orgId), enabled: !!orgId });
  const risks = useQuery({ queryKey: ['risks', orgId], queryFn: () => fetchRisks(orgId), enabled: !!orgId });
  const [fwId, setFwId] = useState('');
  const controls = useQuery({
    queryKey: ['assessmentsForTask', orgId],
    queryFn: async () => {
      const { supabase } = await import('@/lib/supabase');
      const { data } = await supabase
        .from('compliance_assessments')
        .select('id, status, framework_controls(control_id, title, framework_id, frameworks(name))')
        .eq('organization_id', orgId);
      return data ?? [];
    },
    enabled: !!orgId,
  });

  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium', due_date: '',
    assigned_to: userId, linked_control_id: preAssessmentId, linked_risk_id: preRiskId,
  });
  const [error, setError] = useState<string | null>(null);
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const create = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title.trim(),
        description: form.description?.trim() || null,
        priority: form.priority,
        due_date: form.due_date || null,
        assigned_to: form.assigned_to || userId,
        linked_control_id: form.linked_control_id || null,
        linked_risk_id: form.linked_risk_id || null,
      };

      const task = await createTask(orgId, userId, payload);
      await logActivity(orgId, 'task_created', 'task', task.id, { title: form.title });
      return { taskId: task.id, assigned_to: payload.assigned_to };
    },
    onSuccess: ({ taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', orgId] });
      alert('New task added successfully');
      navigate(`/tasks/${taskId}`);
    },
    onError: (e: any) => setError(e?.message ?? 'Could not create task.'),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    create.mutate();
  };

  const frameworks = Array.from(
    new Map(
      (controls.data ?? [])
        .filter((a: any) => a.framework_controls?.framework_id)
        .map((a: any) => [a.framework_controls.framework_id, a.framework_controls.frameworks?.name ?? '']),
    ).entries(),
  ) as [string, string][];

  const controlOptions = (controls.data ?? []).filter((a: any) => !fwId || a.framework_controls?.framework_id === fwId);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-lg font-bold text-navy">Create Task</h1>
        <p className="text-xs text-slate-600">Assign remediation work with a due date and review flow.</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Card className="space-y-4 p-5">
          <Input label="Title" required value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Enable MFA on all admin accounts" />
          <Textarea label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="What needs to be done…" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Priority" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
              {PRIORITIES.map((p) => <option key={p} value={p} className="capitalize">{p[0].toUpperCase() + p.slice(1)}</option>)}
            </Select>
            <Input label="Due Date" type="date" value={form.due_date} onChange={(e) => set('due_date', e.target.value)} />
          </div>
          <Select label="Assign To" value={form.assigned_to} onChange={(e) => set('assigned_to', e.target.value)}>
            {(members.data ?? []).map((m: any) => (
              <option key={m.user_id} value={m.user_id}>{m.profile?.full_name ?? m.user_id} ({m.profile?.email})</option>
            ))}
          </Select>
        </Card>

        <Card className="space-y-4 p-5">
          <div className="text-xs font-bold text-navy">Links (optional)</div>
          {frameworks.length > 0 && (
            <Select label="Filter controls by framework" value={fwId} onChange={(e) => setFwId(e.target.value)}>
              <option value="">All frameworks</option>
              {frameworks.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </Select>
          )}
          <Select label="Linked Control" value={form.linked_control_id} onChange={(e) => set('linked_control_id', e.target.value)}>
            <option value="">None</option>
            {controlOptions.map((a: any) => (
              <option key={a.id} value={a.id}>{a.framework_controls?.control_id} — {a.framework_controls?.title}</option>
            ))}
          </Select>
          <Select label="Linked Risk" value={form.linked_risk_id} onChange={(e) => set('linked_risk_id', e.target.value)}>
            <option value="">None</option>
            {(risks.data ?? []).map((r: any) => <option key={r.id} value={r.id}>{r.title}</option>)}
          </Select>
        </Card>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-crimson">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={create.isPending}>Create Task</Button>
        </div>
      </form>
    </div>
  );
}
