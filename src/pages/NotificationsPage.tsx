import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, AlertTriangle, CheckSquare, FileText, Sparkles } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState, Spinner } from '@/components/ui/States';
import { useCurrentOrg } from '@/hooks/useOrg';
import { fetchNotifications, markAllRead, markRead } from '@/services/api';
import { timeAgo } from '@/lib/format';

const ICONS: Record<string, typeof Bell> = {
  task: CheckSquare,
  risk: AlertTriangle,
  evidence: FileText,
  ai: Sparkles,
};

export function NotificationsPage() {
  const { data: orgCtx } = useCurrentOrg();
  const userId = orgCtx?.userId ?? '';
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => fetchNotifications(userId),
    enabled: !!userId,
  });

  const readAll = useMutation({
    mutationFn: () => markAllRead(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', userId] }),
  });

  const readOne = useMutation({
    mutationFn: (id: string) => markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', userId] }),
  });

  const items = (data ?? []) as any[];
  const unread = items.filter((n) => !n.is_read).length;

  if (isLoading) return <Spinner />;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">
            {unread > 0 ? `${unread} unread` : 'You are all caught up'}
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          disabled={unread === 0 || readAll.isPending}
          loading={readAll.isPending}
          onClick={() => readAll.mutate()}
        >
          <CheckCheck size={15} stroke="currentColor" /> Mark all read
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<Bell size={22} stroke="currentColor" />}
          title="No notifications"
          message="Task assignments, risk escalations and evidence reminders will appear here."
        />
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-line">
            {items.map((n) => {
              const Icon = ICONS[n.type] ?? Bell;
              return (
                <li key={n.id}>
                  <Link
                    to={n.resource_id ? `/${n.resource_type ?? 'dashboard'}/${n.resource_id}` : '/dashboard'}
                    className={`flex items-start gap-3 px-5 py-4 transition-colors hover:bg-slate-50 ${
                      n.is_read ? '' : 'bg-blue-light/40'
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        n.is_read ? 'bg-slate-100 text-slate-500' : 'bg-blue-light text-blue-dark'
                      }`}
                    >
                      <Icon size={17} strokeWidth={1.9} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-navy">{n.title}</p>
                        {!n.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-blue" />}
                      </div>
                      {n.body && <p className="mt-0.5 text-xs text-slate-500">{n.body}</p>}
                      <p className="mt-1 text-[11px] text-slate-500">{timeAgo(n.created_at)}</p>
                    </div>
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
