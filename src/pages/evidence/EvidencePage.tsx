import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Upload, FolderOpen, Search } from 'lucide-react';
import { useCurrentOrg } from '@/hooks/useOrg';
import { fetchEvidence, signedEvidenceUrl } from '@/services/api';
import { evidenceHealth, healthLabel, healthTone, fmtDate, fmtBytes } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner, EmptyState } from '@/components/ui/States';
import { Card } from '@/components/ui/Card';

const FILTERS = ['all', 'valid', 'expiring', 'expired', 'pending', 'approved', 'rejected'] as const;

export function EvidencePage() {
  const { orgId } = useCurrentOrg().data ?? { orgId: '' };
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
  const [preview, setPreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ['evidence', orgId], queryFn: () => fetchEvidence(orgId), enabled: !!orgId });

  const list = useMemo(() => {
    let items = data ?? [];
    if (filter !== 'all') {
      items = items.filter((e: any) => {
        if (filter === 'valid' || filter === 'expiring' || filter === 'expired') return evidenceHealth(e.expiry_date) === filter;
        return e.status === filter;
      });
    }
    if (q) items = items.filter((e: any) => (e.title + e.description).toLowerCase().includes(q.toLowerCase()));
    return items;
  }, [data, filter, q]);

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold text-navy">Evidence Library</h1>
          <p className="text-xs text-slate-600">{(data ?? []).length} files</p>
        </div>
        <Button size="sm" onClick={() => navigate('/evidence/upload')}><Upload size={15} /> Upload Evidence</Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search evidence…" className="w-full rounded-lg border border-line bg-white dark:bg-black py-2 pl-9 pr-3 text-xs text-ink placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500 focus-ring" />
        </div>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold capitalize focus-ring ${filter === f ? 'border-blue bg-blue-light text-blue-dark' : 'border-line bg-white dark:bg-black text-slate-600'}`}
          >
            {f === 'all' ? 'All' : f === 'expiring' ? 'Expiring' : f}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon={<FolderOpen size={22} />} title="No evidence yet" message="Upload documents to prove control implementation." action={<Button size="sm" onClick={() => navigate('/evidence/upload')}>Upload Evidence</Button>} />
      ) : (
        <div className="space-y-2.5">
          {list.map((e: any) => {
            const h = evidenceHealth(e.expiry_date);
            return (
              <button
                key={e.id}
                onClick={async () => { try { setPreview(await signedEvidenceUrl(e.file_path)); } catch { /* no-op */ } }}
                className="flex w-full items-center justify-between gap-3 rounded-card border border-line bg-white px-4 py-3 text-left hover:border-blue focus-ring"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-navy">{e.title}</div>
                  <div className="mt-1 text-[11px] text-slate-600">
                    {e.type?.toUpperCase()} · {fmtBytes(e.file_size)} · added {fmtDate(e.created_at)} by {e.uploader?.full_name ?? '—'}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Badge label={healthLabel(h)} tone={healthTone(h)} />
                  <span className="text-[10px] text-slate-600">{e.expiry_date ? `Expires ${fmtDate(e.expiry_date)}` : 'No expiry'}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {preview && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-2 text-xs font-semibold text-navy">
            Evidence Preview <button onClick={() => setPreview(null)} className="text-blue hover:underline">Close</button>
          </div>
          <iframe src={preview} title="Evidence preview" className="h-[70vh] w-full" />
        </Card>
      )}
    </div>
  );
}
