import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload } from 'lucide-react';
import { useCurrentOrg } from '@/hooks/useOrg';
import { uploadEvidence } from '@/services/api';
import { logActivity } from '@/lib/format';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';

export function EvidenceUploadPage() {
  const { orgId, userId } = useCurrentOrg().data ?? { orgId: '', userId: '' };
  const [params] = useSearchParams();
  const preAssessmentId = params.get('assessmentId') ?? '';
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expiry, setExpiry] = useState('');
  const [assessmentId, setAssessmentId] = useState(preAssessmentId);
  const [fwId, setFwId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const frameworks = Array.from(
    new Map(
      (controls.data ?? [])
        .filter((a: any) => a.framework_controls?.framework_id)
        .map((a: any) => [a.framework_controls.framework_id, a.framework_controls.frameworks?.name ?? '']),
    ).entries(),
  ) as [string, string][];

  const controlOptions = (controls.data ?? []).filter((a: any) => !fwId || a.framework_controls?.framework_id === fwId);

  const upload = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Select a file to upload.');
      const t = title.trim() || file.name;
      const uploaded = await uploadEvidence(
        orgId,
        userId,
        { blob: file, name: file.name, mimeType: file.type || 'application/octet-stream', size: file.size },
        { title: t, description: description || undefined, expiry: expiry || undefined, assessmentId: assessmentId || null },
      );
      await logActivity(orgId, 'evidence_uploaded', 'evidence', uploaded.id, { name: t });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidence', orgId] });
      queryClient.invalidateQueries({ queryKey: ['controls', orgId] });
      navigate('/evidence');
    },
    onError: (e: any) => setError(e?.message ?? 'Upload failed.'),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    upload.mutate();
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <h1 className="text-lg font-bold text-navy">Upload Evidence</h1>
        <p className="text-xs text-slate-600">Private files linked to controls. Max 25 MB.</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Card className="p-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">File</label>
            <input
              type="file"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFile(f);
                if (f && !title) setTitle(f.name);
              }}
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink file:mr-4 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-navy-dark"
            />
            {file && <p className="mt-1 text-[10px] text-slate-600">{file.name} • {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'unknown'}</p>}
          </div>
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. MFA access control policy" />
          <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input label="Review / Expiry Date" type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} hint="Evidence health tracks expiry (≤30 days = expiring soon)" />
        </Card>

        <Card className="p-5 space-y-4">
          <div className="text-xs font-bold text-navy">Link to Control (optional)</div>
          {frameworks.length > 0 && (
            <Select label="Filter by framework" value={fwId} onChange={(e) => setFwId(e.target.value)}>
              <option value="">All frameworks</option>
              {frameworks.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </Select>
          )}
          <Select label="Control" value={assessmentId} onChange={(e) => setAssessmentId(e.target.value)}>
            <option value="">None</option>
            {controlOptions.map((a: any) => (
              <option key={a.id} value={a.id}>{a.framework_controls?.control_id} — {a.framework_controls?.title}</option>
            ))}
          </Select>
        </Card>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-crimson">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={upload.isPending}><Upload size={15} /> Upload</Button>
        </div>
      </form>
    </div>
  );
}
