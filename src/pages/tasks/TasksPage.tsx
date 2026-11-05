import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, CheckSquare, ChevronRight, CalendarClock } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, Spinner } from '@/components/ui/States';
import { Tabs } from '@/components/ui/Tabs';
import { useCurrentOrg } from '@/hooks/useOrg';
import { fetchTasks } from '@/services/api';
import { taskLabel, taskTone, priorityLabel, priorityTone, fmtDate, isOverdue } from '@/lib/format';

type Filter = 'mine' | 'all' | 'todo' | 'in_progress' | 'pending_review' | 'done' | 'blocked';

export function TasksPage() {
  const { data: orgCtx } = useCurrentOrg();
  const orgId = orgCtx?.orgId ?? '';
  const userId = orgCtx?.userId ?? '';
  const navigate = useNavigate();

  const [filter, setFilter] = useState<Filter>('mine');
  const [q, setQ] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tasks', orgId],
    queryFn: () => fetchTasks(orgId),
    enabled: !!orgId,
  });

  const tasks = (data ?? []) as any[];

  const counts = useMemo(() => {
    const open = tasks.filter((t) => t.status !== 'done' && t.status !== 'approved');
    return {
      all: tasks.length,
      mine: open.filter((t) => !t.assigned_to || t.assigned_to === userId).length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      pending_review: tasks.filter((t) => t.status === 'pending_review').length,
      done: tasks.filter((t) => t.status === 'done' || t.status === 'approved').length,
      blocked: tasks.filter((t) => t.status === 'blocked').length,
    };
  }, [tasks, userId]);

  const visible = useMemo(() => {
    let list = tasks;
    if (filter === 'mine') {
      list = list.filter(
        (t) => (!t.assigned_to || t.assigned_to === userId) && t.status !== 'done' && t.status !== 'approved',
      );
    } else if (filter === 'done') {
      list = list.filter((t) => t.status === 'done' || t.status === 'approved');
    } else if (filter !== 'all') {
      list = list.filter((t) => t.status === filter);
    }

    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((t) =>
        `${t.title} ${t.description ?? ''} ${t.assignee?.full_name ?? ''}`.toLowerCase().includes(needle),
      );
    }
    return list;
  }, [tasks, filter, q, userId]);

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">Tasks</h1>
          <p className="mt-1 text-sm text-slate-500">
            {counts.mine} assigned to you · {counts.all} total in the workspace
          </p>
        </div>
        <Button size="sm" onClick={() => navigate('/tasks/new')}>
          <Plus size={15} stroke="currentColor" /> New task
        </Button>
      </div>

      <Tabs
        tabs={[
          { id: 'mine', label: 'My open', badge: counts.mine },
          { id: 'all', label: 'All', badge: counts.all },
          { id: 'todo', label: 'Open', badge: counts.todo },
          { id: 'in_progress', label: 'In progress', badge: counts.in_progress },
          { id: 'pending_review', label: 'Review', badge: counts.pending_review },
          { id: 'blocked', label: 'Blocked', badge: counts.blocked },
          { id: 'done', label: 'Closed', badge: counts.done },
        ]}
        active={filter}
        onChange={(id) => setFilter(id as Filter)}
      />

      <div className="relative max-w-sm">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tasks or assignee…"
          className="w-full rounded-lg border border-line bg-white py-2 pl-9 pr-3 text-sm text-ink placeholder:text-slate-500 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/15"
        />
      </div>

      {isError ? (
        <Card>
          <CardBody className="py-12 text-center">
            <p className="text-sm font-semibold text-navy">Could not load tasks</p>
            <Button className="mt-4" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </CardBody>
        </Card>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={22} stroke="currentColor" />}
          title={counts.all === 0 ? 'No tasks yet' : 'Nothing in this view'}
          message={
            counts.all === 0
              ? 'Create a task to assign remediation work to your team.'
              : 'Switch tabs or clear the search to see other tasks.'
          }
          action={
            counts.all === 0 ? (
              <Button size="sm" onClick={() => navigate('/tasks/new')}>
                Create task
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-line">
            {visible.map((t) => {
              const overdue = isOverdue(t.due_date) && t.status !== 'done' && t.status !== 'approved';
              return (
                <li key={t.id}>
                  <Link
                    to={`/tasks/${t.id}`}
                    className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-slate-50"
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        t.status === 'done' || t.status === 'approved'
                          ? 'bg-emerald2'
                          : t.status === 'blocked'
                            ? 'bg-crimson'
                            : t.status === 'in_progress'
                              ? 'bg-amber2'
                              : 'bg-blue'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-navy">{t.title}</p>
                        <Badge label={priorityLabel(t.priority)} tone={priorityTone(t.priority)} />
                        <Badge label={taskLabel(t.status)} tone={taskTone(t.status)} />
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                        {t.description || 'No description'}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                        <span>{t.assignee?.full_name ?? 'Unassigned'}</span>
                        <span className={overdue ? 'inline-flex items-center gap-1 font-semibold text-crimson' : 'inline-flex items-center gap-1'}>
                          <CalendarClock size={12} /> {fmtDate(t.due_date)}
                          {overdue ? ' · overdue' : ''}
                        </span>
                        {t.risk?.title && <span>Risk: {t.risk.title}</span>}
                      </div>
                    </div>
                    <ChevronRight size={15} className="mt-1 shrink-0 text-slate-500" />
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
