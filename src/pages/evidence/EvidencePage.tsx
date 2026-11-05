import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, FolderOpen, FileText, ChevronRight, CalendarClock } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, Spinner } from '@/components/ui/States';
import { Tabs } from '@/components/ui/Tabs';
import { useCurrentOrg } from '@/hooks/useOrg';
import { fetchEvidence } from '@/services/api';
import { evidenceHealth, healthLabel, healthTone, fmtBytes, fmtDate } from '@/lib/format';

type Filter = 'all' | 'valid' | 'expiring' | 'expired' | 'none';

export function EvidencePage() {
  const { data: orgCtx } = useCurrentOrg();
  const orgId = orgCtx?.orgId ?? '';
  const navigate = useNavigate();

  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['evidence', orgId],
    queryFn: () => fetchEvidence(orgId),
    enabled: !!orgId,
  });

  const items = (data ?? []) as any[];

  const withHealth = useMemo(
    () => items.map((e) => ({ ...e, health: evidenceHealth(e.expiry_date) })),
    [items],
  );

  const counts = useMemo(
    () => ({
      all: withHealth.length,
      valid: withHealth.filter((e) => e.health === 'valid').length,
      expiring: withHealth.filter((e) => e.health === 'expiring').length,
      expired: withHealth.filter((e) => e.health === 'expired').length,
      none: withHealth.filter((e) => e.health === 'none').length,
    }),
    [withHealth],
  );

  const visible = useMemo(() => {
    let list = withHealth;
    if (filter !== 'all') list = list.filter((e) => e.health === filter);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((e) =>
        `${e.title} ${e.description ?? ''} ${e.file_name ?? ''} ${e.uploader?.full_name ?? ''}`
          .toLowerCase()
          .includes(needle),
      );
    }
    return list;
  }, [withHealth, filter, q]);

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">Evidence Library</h1>
          <p className="mt-1 text-sm text-slate-500">
            {counts.all} items · {counts.expiring} expiring soon · {counts.expired} expired
          </p>
        </div>
        <Button size="sm" onClick={() => navigate('/evidence/upload')}>
          <Plus size={15} stroke="currentColor" /> Upload evidence
        </Button>
      </div>

      <Tabs
        tabs={[
          { id: 'all', label: 'All', badge: counts.all },
          { id: 'valid', label: 'Valid', badge: counts.valid },
          { id: 'expiring', label: 'Expiring soon', badge: counts.expiring },
          { id: 'expired', label: 'Expired', badge: counts.expired },
          { id: 'none', label: 'No expiry', badge: counts.none },
        ]}
        active={filter}
        onChange={(id) => setFilter(id as Filter)}
      />

      <div className="relative max-w-sm">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search evidence…"
          className="w-full rounded-lg border border-line bg-white py-2 pl-9 pr-3 text-sm text-ink placeholder:text-slate-400 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/15"
        />
      </div>

      {isError ? (
        <Card>
          <CardBody className="py-12 text-center">
            <p className="text-sm font-semibold text-navy">Could not load evidence</p>
            <Button className="mt-4" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </CardBody>
        </Card>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<FolderOpen size={22} stroke="currentColor" />}
          title={counts.all === 0 ? 'No evidence uploaded yet' : 'No evidence matches this view'}
          message={
            counts.all === 0
              ? 'Upload policies, screenshots and certificates to support your controls.'
              : 'Try another health filter or clear the search.'
          }
          action={
            counts.all === 0 ? (
              <Button size="sm" onClick={() => navigate('/evidence/upload')}>
                Upload evidence
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((e) => (
            <Link
              key={e.id}
              to={`/evidence/${e.id}`}
              className="card flex flex-col p-5 transition-shadow hover:shadow-soft"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy/5 text-navy">
                  <FileText size={19} strokeWidth={1.9} />
                </div>
                <Badge label={healthLabel(e.health)} tone={healthTone(e.health) as any} />
              </div>
              <h3 className="mt-3 truncate text-sm font-bold text-navy">{e.title}</h3>
              <p className="mt-0.5 line-clamp-2 min-h-[32px] text-xs text-slate-500">
                {e.description || e.file_name || 'No description'}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[11px] text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <CalendarClock size={12} /> {fmtDate(e.expiry_date)}
                </span>
                <span>{fmtBytes(e.file_size)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate">{e.uploader?.full_name ?? 'Unknown uploader'}</span>
                <ChevronRight size={14} className="text-slate-300" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
