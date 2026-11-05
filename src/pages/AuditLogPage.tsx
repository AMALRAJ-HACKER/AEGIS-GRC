import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ScrollText, Download } from 'lucide-react';
import { useCurrentOrg } from '@/hooks/useOrg';
import { fetchActivity } from '@/services/api';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner, EmptyState } from '@/components/ui/States';
import { downloadCsv, fmtDateTime } from '@/lib/format';

const TYPES = ['all', 'control', 'risk', 'evidence', 'task', 'framework', 'system'];

export function AuditLogPage() {
  const { orgId } = useCurrentOrg().data ?? { orgId: '' };
  const [filter, setFilter] = useState<(typeof TYPES)[number]>('all');
  const [q, setQ] = useState('');
  const { data, isLoading } = useQuery({ queryKey: ['activity', orgId], queryFn: () => fetchActivity(orgId), enabled: !!orgId });

  const list = useMemo(() => {
    let items = data ?? [];
    if (filter !== 'all') items = items.filter((a: any) => a.resource_type === filter);
    if (q) items = items.filter((a: any) => `${a.action} ${a.resource_type}`.toLowerCase().includes(q.toLowerCase()));
    return items;
  }, [data, filter, q]);

  const exportCsv = () => {
    downloadCsv('aegis-audit-log.csv', list.map((a: any) => ({
      timestamp: a.created_at, actor: a.actor?.full_name ?? '—', action: a.action, resource_type: a.resource_type, resource_id: a.resource_id ?? '',
    })));
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-navy">Audit Log</h1>
        <Button size="sm" onClick={exportCsv}>
          <Download size={14} stroke="currentColor" /> Export CSV
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="rounded-lg border border-border-focus/25 px-3 py-1.5 text-sm focus-ring">
          <option value="all">All</option>
          {TYPES.map((t) => <option key={t} value={t}>{t === 'all' ? 'All' : t.replace(/s$/, '')}</option>)}
        </select>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search actions…" className="flex-1 rounded-lg border border-border-focus/25 px-3 py-1.5 text-sm focus-ring" />
      </div>

      <div className="mt-3">
        {list.length === 0 ? (
          <EmptyState
            icon={<ScrollText size={22} stroke="currentColor" />}
            title="No activity yet"
            message="Activity will appear as you create, update, or upload items."
          />
        ) : (
          <Card className="divide-y divide-border-focus/10">
            <CardBody className="space-y-3">
              {list.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-navy">{a.actor?.full_name ?? 'System'}</span>{' '}
                    <span className="capitalize text-slate-400">{a.action.replace(/_/g, ' ')}</span>{' '}
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs uppercase text-navy">{a.resource_type}</span>
                  </div>
                  <span className="text-sm text-slate-500">{fmtDateTime(a.created_at)}</span>
                </div>
              ))}
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
