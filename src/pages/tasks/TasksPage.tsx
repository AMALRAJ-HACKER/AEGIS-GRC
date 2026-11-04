import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner, EmptyState } from '@/components/ui/States';
import { useCurrentOrg } from '@/hooks/useOrg';
import { fetchTasks } from '@/services/api';

type Task = {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'pending_review' | 'done' | 'blocked';
  priority: 'critical' | 'high' | 'medium' | 'low';
  due_date?: string;
  assigned_to?: string;
};

export function TasksPage() {
  const { data: orgCtx } = useCurrentOrg();
  const orgId = orgCtx?.orgId ?? '';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTasks(orgId).then((data) => {
      setTasks(data as Task[]);
      setIsLoading(false);
    });
  }, [orgId]);

  if (isLoading) return <Spinner />;

  const todoCount = tasks.filter((t: Task) => t.status === 'todo').length;
  const inProgressCount = tasks.filter((t: Task) => t.status === 'in_progress').length;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-navy">Tasks</h1>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-slate-500">Todo</h3>
          <p className="text-3xl font-bold">{todoCount}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-500">In Progress</h3>
          <p className="text-3xl font-bold">{inProgressCount}</p>
        </div>
      </div>

      <div className="mt-4">
        <EmptyState
          icon={<svg className="h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 5v14M5 12h14" />
          </svg>}
          title="No tasks here"
          message="Tasks assigned to you will appear here."
          action={<Button size="sm">Create Task</Button>}
        />
      </div>
    </div>
  );
}