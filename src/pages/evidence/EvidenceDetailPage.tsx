import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Download, ExternalLink, ArrowLeft } from 'lucide-react';
import { useCurrentOrg } from '@/hooks/useOrg';
import { fetchEvidence, signedEvidenceUrl } from '@/services/api';
import { fmtDate, fmtBytes, evidenceHealth, healthLabel, healthTone } from '@/lib/format';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/States';
import { Badge } from '@/components/ui/Badge';

export function EvidenceDetailPage() {
  const { evidenceId } = useParams();
  const { orgId } = useCurrentOrg().data ?? { orgId: '' };
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ['evidence', orgId], queryFn: () => fetchEvidence(orgId), enabled: !!orgId });
  const e = data?.find((x: any) => x.id === evidenceId);

  const open = async () => {
    if (!e?.file_path) return;
    const url = await signedEvidenceUrl(e.file_path);
    window.open(url, '_blank');
  };

  if (isLoading) return <Spinner />;
  if (!e) return <div className="p-6 text-center text-sm text-slate-600">Not found</div>;

  const h = evidenceHealth(e.expiry_date);
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-navy"><ArrowLeft size={14} stroke="currentColor" /> Back</button>
      <Card>
        <CardHeader title={e.title} subtitle={`${e.type?.toUpperCase()} • ${fmtBytes(e.file_size)}`} />
        <CardBody className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge label={healthLabel(h)} tone={healthTone(h)} />
            {e.expiry_date && <span className="text-xs text-slate-600 dark:text-slate-400">Expires {fmtDate(e.expiry_date)}</span>}
          </div>
          {e.description && <p className="text-sm text-slate-600 dark:text-slate-500">{e.description}</p>}
          <div className="text-xs text-slate-500 dark:text-slate-400">Uploaded {fmtDate(e.created_at)} by {e.uploader?.full_name ?? '—'}</div>
          <div className="flex gap-2">
            <Button onClick={open}><ExternalLink size={14} stroke="currentColor" /> Open / Preview</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
