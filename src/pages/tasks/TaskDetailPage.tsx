import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Send, ThumbsUp, ThumbsDown, CheckCircle2, MessageSquare, RotateCcw, AlertCircle } from 'lucide-react';
import { useCurrentOrg } from '@/hooks/useOrg';
import { fetchTasks, fetchComments, updateTask, addComment } from '@/services/api';
import { logActivity, taskLabel, taskTone, priorityLabel, priorityTone, fmtDate, fmtDateTime, initials } from '@/lib/format';
import { isAdmin } from '@/lib/permissions';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner, EmptyState } from '@/components/ui/States';
import { Avatar } from '@/components/ui/Avatar';
import { Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

export function TaskDetailPage() {
  const { taskId } = useParams();
  const { orgId, userId, role } = useCurrentOrg().data ?? { orgId: '', userId: '', role: 'staff' };
  const [comment, setComment] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const tasksQ = useQuery({ queryKey: ['tasks', orgId], queryFn: () => fetchTasks(orgId), enabled: !!orgId });
  const commentsQ = useQuery({ queryKey: ['comments', taskId], queryFn: () => fetchComments(taskId!), enabled: !!taskId });
  const task = tasksQ.data?.find((t: any) => t.id === taskId);
  const canReview = isAdmin(role);
  const canDelete = isAdmin(role);

  const patch = useMutation({
    mutationFn: async (fields: any) => {
      await updateTask(taskId!, fields, { orgId, actorId: userId });
      await logActivity(orgId, 'task_updated', 'task', taskId, fields);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', orgId] }),
  });

  const postComment = useMutation({
    mutationFn: async (e: FormEvent) => {
      e.preventDefault();
      if (!comment.trim()) return;
      await addComment(taskId!, userId, comment.trim());
      setComment('');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', taskId] }),
  });

  if (tasksQ.isLoading) return <Spinner />;
  if (!task) return <EmptyState icon={<AlertCircle size={22} stroke="currentColor" />} title="Task not found" message="It may have been removed or you don't have access." action={<Button variant="secondary" size="sm" onClick={() => navigate('/tasks')}>Back to tasks</Button>} />;

  const status = task.status;
  const isAssignee = task.assigned_to === userId;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <nav className="mb-1 text-[11px] text-slate-600"><Link to="/tasks" className="hover:text-blue">Tasks</Link> / Task Detail</nav>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge label={priorityLabel(task.priority)} tone={priorityTone(task.priority)} />
            <Badge label={taskLabel(status)} tone={taskTone(status)} />
          </div>
          <h1 className="mt-1.5 text-lg font-bold text-navy">{task.title}</h1>
          <p className="text-xs text-slate-600">
            Assigned to {task.assignee?.full_name ?? '—'} · Due {fmtDate(task.due_date)} · Created {fmtDate(task.created_at)}
          </p>
        </div>
      </div>

      {/* Approval workflow */}
      <Card>
        <CardHeader title="Workflow" subtitle="Submit → Review → Approve / Close" />
        <CardBody className="flex flex-wrap gap-2">
          {status === 'todo' && isAssignee && (
            <Button size="sm" onClick={() => patch.mutate({ status: 'in_progress' })}><Play size={14} stroke="currentColor" /> Start Work</Button>
          )}
          {status === 'in_progress' && isAssignee && (
            <>
              <Button size="sm" onClick={() => patch.mutate({ status: 'pending_review', review_requested_at: new Date().toISOString() })}><Send size={14} stroke="currentColor" /> Submit for Review</Button>
              <Button variant="secondary" size="sm" onClick={() => patch.mutate({ status: 'blocked' })}>Block</Button>
            </>
          )}
          {status === 'pending_review' && canReview && (
            <>
              <Button size="sm" onClick={() => patch.mutate({ status: 'approved', review_note: 'Approved' })}><ThumbsUp size={14} stroke="currentColor" /> Approve</Button>
              <Button variant="danger" size="sm" onClick={() => setRejectOpen(true)}><ThumbsDown size={14} stroke="currentColor" /> Reject</Button>
            </>
          )}
          {status === 'approved' && (isAssignee || canReview) && (
            <Button size="sm" onClick={() => patch.mutate({ status: 'done' })}><CheckCircle2 size={14} stroke="currentColor" /> Close Task</Button>
          )}
          {status === 'blocked' && isAssignee && (
            <Button size="sm" onClick={() => patch.mutate({ status: 'in_progress' })}><RotateCcw size={14} stroke="currentColor" /> Resume</Button>
          )}
          {status === 'done' && <span className="text-xs font-semibold text-emerald2">Task closed.</span>}
        </CardBody>
      </Card>

      {/* Links */}
      {(task.assessment || task.risk) && (
        <Card className="p-4">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-600">Linked To</div>
          <div className="flex flex-wrap gap-2">
            {task.assessment?.framework_controls && (
              <Link to={`/frameworks/${task.assessment.framework_controls.framework_id}/controls/${task.linked_control_id}`} className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold text-blue hover:border-blue">
                Control {task.assessment.framework_controls.control_id} — {task.assessment.framework_controls.title}
              </Link>
            )}
            {task.risk && (
              <Link to={`/risks/${task.linked_risk_id}`} className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold text-blue hover:border-blue">
                Risk: {task.risk.title}
              </Link>
            )}
          </div>
        </Card>
      )}

      {task.description && (
        <Card className="p-5">
          <div className="mb-1.5 text-xs font-bold text-navy">Description</div>
          <p className="whitespace-pre-wrap text-sm text-slate-600">{task.description}</p>
        </Card>
      )}

      {/* Comments */}
      <Card>
        <CardHeader title="Comments" subtitle="Discussion thread" />
        <CardBody className="space-y-4">
          <form onSubmit={postComment.mutate} className="flex gap-3">
            <Avatar name={null} size={32} />
            <div className="flex-1 space-y-2">
              <Textarea rows={2} placeholder="Add a comment…" value={comment} onChange={(e) => setComment(e.target.value)} />
              <Button size="sm" type="submit" disabled={!comment.trim()}>Post Comment</Button>
            </div>
          </form>
          <div className="space-y-3 border-t border-line pt-4">
            {(commentsQ.data ?? []).map((c: any) => (
              <div key={c.id} className="flex gap-3">
                <Avatar name={c.user?.full_name} size={32} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-navy">{c.user?.full_name ?? 'Unknown'}</span>
                    <span className="text-slate-600">{fmtDateTime(c.created_at)}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{c.comment}</p>
                </div>
              </div>
            ))}
            {(commentsQ.data ?? []).length === 0 && <p className="py-2 text-center text-xs text-slate-600"><MessageSquare size={16} className="mx-auto mb-1" />No comments yet.</p>}
          </div>
        </CardBody>
      </Card>

      {/* Reject modal */}
      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject Task">
        <div className="space-y-4">
          <Textarea label="Review Notes" placeholder="Explain what needs to be fixed…" value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => { patch.mutate({ status: 'in_progress', review_note: rejectNote || 'Changes requested' }); setRejectOpen(false); setRejectNote(''); }}>Reject</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
