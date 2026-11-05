import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentOrg } from '@/hooks/useOrg';
import { createRisk, updateRisk, fetchRisks } from '@/services/api';
import { logActivity, severityFromScore, severityLabel } from '@/lib/format';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select, Field } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/States';
import { Badge } from '@/components/ui/Badge';

const CATEGORIES = ['Operational', 'Technical', 'Compliance', 'Strategic', 'Financial', 'Other'];
const LIKELIHOOD = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
const IMPACT = ['Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic'];

function Scale({ label, value, onChange, hints }: { label: string; value: number; onChange: (n: number) => void; hints: string[] }) {
  return (
    <Field label={label}>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 rounded-lg border px-1 py-2.5 text-center transition-colors focus-ring ${
              value === n ? 'border-navy bg-navy text-white' : 'border-line bg-white text-slate-600 hover:border-gray-300'
            }`}
          >
            <div className="text-sm font-bold">{n}</div>
            <div className={`text-[9px] leading-tight ${value === n ? 'text-white' : 'text-slate-500'}`}>{hints[n - 1]}</div>
          </button>
        ))}
      </div>
    </Field>
  );
}

export function RiskFormPage() {
  const { riskId } = useParams(); // present when editing
  const { orgId, userId } = useCurrentOrg().data ?? { orgId: '', userId: '' };
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const existing = useQuery({
    queryKey: ['risks', orgId],
    queryFn: () => fetchRisks(orgId),
    enabled: !!orgId && !!riskId,
  });
  const risk = riskId ? existing.data?.find((r: any) => r.id === riskId) : null;

  const [form, setForm] = useState({
    title: '', description: '', category: 'Technical', likelihood: 3, impact: 3,
    residual_likelihood: 3, residual_impact: 3, existing_safeguards: '', mitigation_plan: '', target_date: '',
  });
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  if (riskId && existing.isLoading) return <Spinner />;
  if (riskId && risk && !loaded) {
    setLoaded(true);
    setForm({
      title: risk.title, description: risk.description ?? '', category: risk.category ?? 'Technical',
      likelihood: risk.likelihood, impact: risk.impact,
      residual_likelihood: risk.residual_likelihood ?? 3, residual_impact: risk.residual_impact ?? 3,
      existing_safeguards: risk.existing_safeguards ?? '', mitigation_plan: risk.mitigation_plan ?? '',
      target_date: risk.target_date ?? '',
    });
  }

  const save = useMutation({
    mutationFn: async () => {
      if (riskId) {
        await updateRisk(riskId, { ...form, target_date: form.target_date || null });
        await logActivity(orgId, 'risk_updated', 'risk', riskId, { title: form.title });
      } else {
        const created = await createRisk(orgId, userId, form);
        await logActivity(orgId, 'risk_created', 'risk', created.id, { title: form.title });
        return created.id;
      }
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['risks', orgId] });
      navigate(id ? `/risks/${id}` : '/risks');
    },
    onError: (e: any) => setError(e?.message ?? 'Could not save risk.'),
  });

  const inherent = form.likelihood * form.impact;
  const residual = form.residual_likelihood * form.residual_impact;
  const sev = severityFromScore(inherent);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    save.mutate();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-lg font-bold text-navy">{riskId ? 'Edit Risk' : 'New Risk'}</h1>
        <p className="text-xs text-slate-600">Score likelihood × impact to derive the inherent severity.</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Card className="p-5 space-y-4">
          <Input label="Title" required value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Unencrypted customer data at rest" />
          <Textarea label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="What could happen, how, and to what assets…" />
          <Field label="Category">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button key={c} type="button" onClick={() => set('category', c)} className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold focus-ring ${form.category === c ? 'border-navy bg-navy text-white' : 'border-line bg-white text-slate-600'}`}>{c}</button>
              ))}
            </div>
          </Field>
        </Card>

        <Card>
          <CardHeader title="Inherent Risk" subtitle="Likelihood × Impact" action={<Badge label={severityLabel(sev)} tone={sev === 'critical' ? 'critical' : sev === 'high' ? 'warning' : sev === 'medium' ? 'info' : 'success'} />} />
          <CardBody className="space-y-4">
            <Scale label={`Likelihood (${form.likelihood})`} value={form.likelihood} onChange={(n) => set('likelihood', n)} hints={LIKELIHOOD} />
            <Scale label={`Impact (${form.impact})`} value={form.impact} onChange={(n) => set('impact', n)} hints={IMPACT} />
            <div className="rounded-xl bg-canvas px-4 py-3 text-center">
              <span className="text-2xl font-bold text-navy">{inherent}</span>
              <span className="ml-2 text-xs font-semibold text-slate-500">Inherent Score → {severityLabel(sev)}</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Residual Risk (after controls)" subtitle="Score again once safeguards are applied" />
          <CardBody className="space-y-4">
            <Scale label={`Residual Likelihood (${form.residual_likelihood})`} value={form.residual_likelihood} onChange={(n) => set('residual_likelihood', n)} hints={LIKELIHOOD} />
            <Scale label={`Residual Impact (${form.residual_impact})`} value={form.residual_impact} onChange={(n) => set('residual_impact', n)} hints={IMPACT} />
            <div className="rounded-xl bg-canvas px-4 py-3 text-center">
              <span className="text-2xl font-bold text-slate-600">{residual}</span>
              <span className="ml-2 text-xs font-semibold text-slate-500">Residual Score → {severityLabel(severityFromScore(residual))}</span>
            </div>
          </CardBody>
        </Card>

        <Card className="p-5 space-y-4">
          <Textarea label="Existing Safeguards" value={form.existing_safeguards} onChange={(e) => set('existing_safeguards', e.target.value)} placeholder="Controls already in place…" />
          <Textarea label="Mitigation Plan" value={form.mitigation_plan} onChange={(e) => set('mitigation_plan', e.target.value)} placeholder="Steps to reduce the risk…" />
          <Input label="Target Date" type="date" value={form.target_date} onChange={(e) => set('target_date', e.target.value)} />
        </Card>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-crimson">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={save.isPending}>{riskId ? 'Save Changes' : 'Create Risk'}</Button>
        </div>
      </form>
    </div>
  );
}
