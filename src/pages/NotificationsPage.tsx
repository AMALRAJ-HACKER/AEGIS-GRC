import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { useCurrentOrg } from '@/hooks/useOrg';
import { fetchNotifications, markAllRead, markRead } from '@/services/api';
import { fmtDateTime } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Spinner, EmptyState } from '@/components/ui/States';
import { Tabs } from '@/components/ui/Tabs';

type Tab = 'all' | 'tasks' | 'risks' | 'evidence' | 'approvals' | 'system';

export function NotificationsPage() {
  const { userId } = useCurrentOrg().data ?? { userId: '' };
  const [tab, setTab] = useState<Tab>('all');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['notifications', userId], queryFn: () => fetchNotifications(userId), enabled: !!userId });

  const markAll = useMutation({
    mutationFn: () => markAllRead(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', userId] }),
  });
  const markOne = useMutation({
    mutationFn: (id: string) => markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', userId] }),
  });

  const list = useMemo(() => {
    let items = data ?? [];
    if (tab !== 'all') {
      items = items.filter((n: any) => n.type?.startsWith(tab) || n.resource_type?.includes(tab) || (tab === 'system' && !n.resource_type));
    }
    return items;
  }, [data, tab]);

  const go = (n: any) => {
    if (!n.is_read) markOne.mutate(n.id);
    if (n.resource_type === 'task' && n.resource_id) navigate(`/tasks/${n.resource_id}`);
    if (n.resource_type === 'risk' && n.resource_id) navigate(`/risks/${n.resource_id}`);
    if (n.resource_type === 'evidence' && n.resource_id) navigate(`/evidence/${n.resource_id}`);
    else if (n.resource_type === 'evidence') navigate('/evidence');
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold text-navy">Notifications</h1>
          <p className="text-xs text-slate-600">Updates on tasks, risks, approvals and more</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => markAll.mutate()} loading={markAll.isPending}>
          <CheckCheck size={14} /> Mark All as Read
        </Button>
      </div>

      <Tabs<Tab>
        tabs={[
          { id: 'all', label: 'All' },
          { id: 'tasks', label: 'Tasks' },
          { id: 'risks', label: 'Risks' },
          { id: 'evidence', label: 'Evidence' },
          { id: 'approvals', label: 'Approvals' },
          { id: 'system', label: 'System' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {list.length === 0 ? (
        <EmptyState icon={<Bell size={22} />} title="No notifications" message="You're all caught up." />
      ) : (
        <Card>
          <CardBody className="divide-y divide-line">
            {list.map((n: any) => (
              <button key={n.id} onClick={() => go(n)} className="flex w-full items-start justify-between gap-3 py-3 text-left hover:bg-gray-50 focus-ring">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!n.is_read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-crimson" />}
                    <span className="truncate text-xs font-semibold text-navy">{n.title}</span>
                  </div>
                  {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{n.body}</p>}
                  <span className="text-[10px] text-slate-600">{fmtDateTime(n.created_at)}</span>
                </div>
              </button>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
