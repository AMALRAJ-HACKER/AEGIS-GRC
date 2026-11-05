import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Search, Check, Plus, Upload, Copy, Eye, Download, ArrowLeft, Trash2, X, FileText, Loader2 } from 'lucide-react';
import { useCurrentOrg } from '@/hooks/useOrg';
import { fetchFrameworkCatalog, fetchFrameworkStats, activateFramework, createFramework, cloneFramework, fetchControls, fetchActivity } from '@/services/api';
import { logActivity } from '@/lib/format';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { EmptyState, Spinner } from '@/components/ui/States';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal, Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { canActivateFramework, canCreateFramework } from '@/lib/permissions';
import { parseCsv, parseJson, groupByFramework, downloadText, toCsv, IMPORT_TEMPLATE, isStandardFramework, type ImportRow } from '@/lib/frameworkImport';

type View = 'library' | 'create' | 'import' | 'details';
type Status = 'draft' | 'published' | 'archived';
interface ControlDraft { controlId: string; title: string; description: string; guidance: string; owner: string; frequency: string; type: string; domain: string }
interface EvidenceDraft { controlId: string; name: string; type: string; frequency: string; retention: string; mandatory: boolean }
interface RiskDraft { controlId: string; risk: string }
interface QuestionDraft { controlId: string; text: string; answerType: string }
interface Meta { code?: string; owner?: string; effectiveDate?: string; reviewDate?: string; status?: Status; domains?: string[]; evidence?: EvidenceDraft[]; risks?: RiskDraft[]; questions?: QuestionDraft[] }

const META_KEY = 'aegis-framework-meta-v1';
const ARCHIVED_KEY = 'aegis-framework-archived-v1';
function loadMeta(): Record<string, Meta> { try { return JSON.parse(localStorage.getItem(META_KEY) ?? '{}'); } catch { return {}; } }
function loadArchived(): string[] { try { return JSON.parse(localStorage.getItem(ARCHIVED_KEY) ?? '[]'); } catch { return []; } }

const CATEGORIES = ['Compliance','Risk','Audit','Security','Privacy','Vendor Management','Business Continuity','Custom'];
const CTRL_TYPES = ['Preventive','Detective','Corrective','Automated','Manual'];

export function AddFrameworkPage() {
  const { data: orgCtx } = useCurrentOrg();
  const orgId = orgCtx?.orgId ?? '';
  const role = orgCtx?.role ?? 'staff';
  const canCreate = canCreateFramework(role);
  const canActivate = canActivateFramework(role);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>('library');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all'|'standard'|'custom'|'active'|'draft'|'archived'>('all');
  const [target, setTarget] = useState<any>(null);
  const [cloneTarget, setCloneTarget] = useState<any>(null);
  const [cloneName, setCloneName] = useState('');
  const [detailId, setDetailId] = useState<string>('');
  const [detailTab, setDetailTab] = useState<'overview'|'domains'|'controls'|'evidence'|'risks'|'assessments'|'reports'|'versions'>('overview');
  const [metaMap, setMetaMap] = useState<Record<string, Meta>>(loadMeta);
  const [archived, setArchived] = useState<string[]>(loadArchived);
  const saveMeta = (id: string, meta: Meta) => {
    const next = { ...metaMap, [id]: { ...(metaMap[id] ?? {}), ...meta } };
    setMetaMap(next); try { localStorage.setItem(META_KEY, JSON.stringify(next)); } catch {}
  };

  const catalog = useQuery({ queryKey: ['frameworkCatalog'], queryFn: fetchFrameworkCatalog });
  const stats = useQuery({ queryKey: ['frameworkStats', orgId], queryFn: () => fetchFrameworkStats(orgId), enabled: !!orgId });
  const detail = useQuery({ queryKey: ['frameworkControls', orgId, detailId], queryFn: () => fetchControls(orgId, detailId), enabled: !!detailId && !!orgId && view === 'details' });
  const activity = useQuery({ queryKey: ['activity', orgId], queryFn: () => fetchActivity(orgId), enabled: !!orgId && view === 'details' });

  const statById = useMemo(() => { const m = new Map<string, any>(); (stats.data ?? []).forEach((s) => m.set(s.id, s)); return m; }, [stats.data]);
  const activate = useMutation({
    mutationFn: async (fw: any) => { const n = await activateFramework(orgId, fw.id); await logActivity(orgId, 'framework_activated', 'framework', fw.id, { controls: n }); return n; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['frameworkStats', orgId] }); setTarget(null); navigate('/frameworks'); },
  });
  const doClone = useMutation({
    mutationFn: async () => { const r = await cloneFramework(orgId, cloneTarget.id, cloneName || `${cloneTarget.name} (Copy)`); await logActivity(orgId, 'framework_cloned', 'framework', r?.id, { from: cloneTarget.id }); return r; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['frameworkCatalog'] }); queryClient.invalidateQueries({ queryKey: ['frameworkStats', orgId] }); setCloneTarget(null); setView('library'); },
    onError: (e: any) => alert('Clone failed: ' + (e?.message ?? 'Unknown error')),
  });

  const all = (catalog.data ?? []) as any[];
  const list = all.filter((f) => {
    const active = !!statById.get(f.id)?.activated;
    const archivedF = archived.includes(f.id);
    const standard = isStandardFramework(f.name);
    if (filter === 'standard' && !standard) return false;
    if (filter === 'custom' && standard) return false;
    if (filter === 'active' && !active) return false;
    if (filter === 'draft' && (active || archivedF)) return false;
    if (filter === 'archived' && !archivedF) return false;
    if (q.trim()) { const n = q.trim().toLowerCase();
      if (!`${f.name} ${f.slug ?? ''} ${f.category ?? ''} ${f.description ?? ''} ${f.version ?? ''}`.toLowerCase().includes(n)) return false; }
    return true;
  });

  if (catalog.isLoading) return <Spinner />;
  const detailFw = detailId ? all.find((f) => f.id === detailId) : null;
  const dControls = detail.data?.controls ?? [];
  const dMeta = detailId ? (metaMap[detailId] ?? {}) : {};
  const implemented = dControls.filter((c: any) => c.status === 'implemented').length;
  const coverage = dControls.length ? Math.round((implemented / dControls.length) * 100) : 0;

  const exportReport = (kind: 'csv' | 'json') => {
    if (!detailFw) return;
    const summary = { framework: detailFw.name, version: detailFw.version, category: detailFw.category, controls: dControls.length, implemented, coverage: coverage + '%' };
    if (kind === 'json') downloadText(`${detailFw.name}-report.json`, JSON.stringify({ summary, controls: dControls }, null, 2), 'application/json');
    else downloadText(`${detailFw.name}-controls.csv`, toCsv(dControls.map((c: any) => ({ id: c.controlCode, title: c.title, category: c.category, status: c.status }))), 'text/csv');
  };

  return (
    <div className="space-y-4">
      {view === 'library' && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-navy">Framework Library</h1>
              <p className="mt-1 text-sm text-slate-500">{all.length} frameworks · {all.filter((f) => statById.get(f.id)?.activated).length} active — create, import, clone or activate.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={!canCreate} title={canCreate ? 'Create a custom framework' : 'Requires Super Admin / Administrator'} onClick={() => setView('create')}>
                <Plus size={15} /> Create Custom Framework
              </Button>
              <Button size="sm" variant="secondary" disabled={!canCreate} onClick={() => setView('import')}><Upload size={15} /> Import Framework</Button>
              <Button size="sm" variant="secondary" onClick={() => setFilter('standard')}>Browse Standards</Button>
            </div>
          </div>

          <Tabs tabs={[
            { id: 'all', label: 'All', badge: all.length }, { id: 'standard', label: 'Standard' },
            { id: 'custom', label: 'Custom' }, { id: 'active', label: 'Active', badge: all.filter((f) => statById.get(f.id)?.activated).length },
            { id: 'draft', label: 'Draft' }, { id: 'archived', label: 'Archived' },
          ]} active={filter} onChange={(id) => setFilter(id as typeof filter)} />

          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, code, category, version…" className="w-full rounded-lg border border-line bg-white py-2.5 pl-9 pr-3 text-sm focus-ring" />
          </div>

          {list.length === 0 ? (
            <EmptyState icon={<ShieldCheck size={22} />} title="No frameworks match" message="Try a different filter or search term." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((f: any) => {
                const active = !!statById.get(f.id)?.activated;
                const standard = isStandardFramework(f.name);
                const isArchived = archived.includes(f.id);
                return (
                  <Card key={f.id} className="flex flex-col gap-3 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy text-white"><ShieldCheck size={18} /></div>
                      <div className="flex gap-1">{active && <Badge label="Active" tone="success" />}{isArchived && <Badge label="Archived" tone="default" />}</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-navy">{f.name} <span className="font-medium text-slate-600">({f.version})</span></div>
                      <div className="text-[10px] font-medium text-blue-dark">{f.category} · {standard ? 'Standard' : 'Custom'}</div>
                    </div>
                    <p className="flex-1 text-xs text-slate-600">{f.description}</p>
                    <span className="text-[11px] text-slate-600">{f.controlCount} controls</span>
                    <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
                      <Button size="sm" variant="secondary" onClick={() => { setDetailId(f.id); setDetailTab('overview'); setView('details'); }}><Eye size={14} /> View</Button>
                      <Button size="sm" variant="ghost" disabled={!canCreate} onClick={() => { setCloneTarget(f); setCloneName(`${f.name} (Copy)`); }}><Copy size={14} /> Clone</Button>
                      {active
                        ? <Button size="sm" variant="secondary" disabled><Check size={14} /> Activated</Button>
                        : <Button size="sm" disabled={!canActivate || isArchived} title={canActivate ? 'Activate framework' : 'Requires Super Admin / Administrator'} onClick={() => setTarget(f)}>Activate</Button>}
                      {canCreate && !isArchived && (
                        <Button size="sm" variant="ghost" onClick={() => { const next = [...archived, f.id]; setArchived(next); try { localStorage.setItem(ARCHIVED_KEY, JSON.stringify(next)); } catch {} }}>
                          Archive
                        </Button>
                      )}
                      {canCreate && isArchived && (
                        <Button size="sm" variant="ghost" onClick={() => { const next = archived.filter((x) => x !== f.id); setArchived(next); try { localStorage.setItem(ARCHIVED_KEY, JSON.stringify(next)); } catch {} }}>
                          Restore
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {view === 'create' && <CreateWizard orgId={orgId} canCreate={canCreate} onCancel={() => setView('library')} onSaved={() => { queryClient.invalidateQueries({ queryKey: ['frameworkCatalog'] }); queryClient.invalidateQueries({ queryKey: ['frameworkStats', orgId] }); setView('library'); }} saveMeta={saveMeta} catalog={all} />}
      {view === 'import' && <ImportView orgId={orgId} canCreate={canCreate} onCancel={() => setView('library')} onDone={() => { queryClient.invalidateQueries({ queryKey: ['frameworkCatalog'] }); queryClient.invalidateQueries({ queryKey: ['frameworkStats', orgId] }); setView('library'); }} />}

      {view === 'details' && detailFw && (
        <div className="space-y-4">
          <Button size="sm" variant="ghost" onClick={() => setView('library')}><ArrowLeft size={15} /> Back to Framework Library</Button>
          <div>
            <h1 className="text-xl font-bold text-navy">{detailFw.name} <span className="text-sm font-medium text-slate-600">({detailFw.version})</span></h1>
            <p className="text-xs text-slate-600">{detailFw.category} · {dControls.length} controls · {coverage}% implemented</p>
          </div>
          <Tabs tabs={[
            { id: 'overview', label: 'Overview' }, { id: 'domains', label: 'Domains' }, { id: 'controls', label: 'Controls' },
            { id: 'evidence', label: 'Evidence' }, { id: 'risks', label: 'Risks' }, { id: 'assessments', label: 'Assessments' },
            { id: 'reports', label: 'Reports' }, { id: 'versions', label: 'Version History' },
          ]} active={detailTab} onChange={(id) => setDetailTab(id as typeof detailTab)} />
          {detail.isLoading ? <Spinner /> : (
            <Card><CardBody className="py-5">
              {detailTab === 'overview' && (
                <div className="space-y-2 text-sm text-slate-600">
                  <p><b className="text-navy">Description:</b> {detailFw.description || '—'}</p>
                  <p><b className="text-navy">Category:</b> {detailFw.category ?? '—'} · <b className="text-navy">Version:</b> {detailFw.version ?? '—'}</p>
                  <p><b className="text-navy">Code:</b> {dMeta.code ?? detailFw.slug ?? '—'} · <b className="text-navy">Owner:</b> {dMeta.owner ?? '—'}</p>
                </div>
              )}
              {detailTab === 'domains' && <ul className="space-y-2 text-sm">{(dMeta.domains?.length ? dMeta.domains : [...new Set(dControls.map((c: any) => c.category).filter(Boolean))]).map((d) => <li key={d} className="rounded-lg border border-line px-3 py-2">{d}</li>)}</ul>}
              {detailTab === 'controls' && <ul className="space-y-2 text-sm">{dControls.map((c: any) => <li key={c.controlId} className="flex justify-between rounded-lg border border-line px-3 py-2"><span><b className="text-navy">{c.controlCode}</b> — {c.title}</span><Badge label={c.status} tone="default" /></li>)}</ul>}
              {detailTab === 'evidence' && <ul className="space-y-2 text-sm">{(dMeta.evidence?.length ? dMeta.evidence.map((e) => `${e.name} (${e.type}) for ${e.controlId}`) : [{ key: 'none', message: 'No evidence requirements defined for the existing controls. Add them when creating a custom framework.' }]).map((e: any) => <li key={e.key ?? e} className="rounded-lg border border-line px-3 py-2">{e.message ?? e}</li>)}</ul>}
              {detailTab === 'risks' && <ul className="space-y-2 text-sm">{(dMeta.risks?.length ? dMeta.risks.map((r) => `${r.risk} → ${r.controlId}`) : ['No risk mappings defined.']).map((r, i) => <li key={i} className="rounded-lg border border-line px-3 py-2">{r}</li>)}</ul>}
              {detailTab === 'assessments' && <ul className="space-y-2 text-sm">{(dMeta.questions?.length ? dMeta.questions.map((x) => `${x.text} [${x.answerType}]`) : dControls.map((c: any) => `Assess ${c.controlCode}: ${c.title}`)).map((r, i) => <li key={i} className="rounded-lg border border-line px-3 py-2">{r}</li>)}</ul>}
              {detailTab === 'reports' && (
                <div className="space-y-3 text-sm text-slate-600">
                  <p>Coverage: {implemented}/{dControls.length} ({coverage}%)</p>
                  <div className="flex gap-2"><Button size="sm" onClick={() => exportReport('csv')}><Download size={14} /> Export controls (CSV)</Button><Button size="sm" variant="secondary" onClick={() => exportReport('json')}><FileText size={14} /> Export summary (JSON)</Button></div>
                </div>
              )}
              {detailTab === 'versions' && <ul className="space-y-2 text-sm">{((activity.data ?? []) as any[]).filter((a) => a.resource_id === detailId).map((a) => <li key={a.id} className="rounded-lg border border-line px-3 py-2">{a.action} — {a.actor?.full_name ?? 'system'} · {new Date(a.created_at).toLocaleString()}</li>)}{((activity.data ?? []) as any[]).filter((a) => a.resource_id === detailId).length === 0 && <li className="text-slate-500">No recorded changes yet. Actions in this app are audit-logged.</li>}</ul>}
            </CardBody></Card>
          )}
        </div>
      )}

      <ConfirmModal open={!!target} onClose={() => setTarget(null)} onConfirm={() => target && activate.mutate(target)}
        title="Confirm Activation" message={`Activate ${target?.name}? ${target?.controlCount} controls will be added to your register with status "Not Started".`}
        confirmLabel="Activate" loading={activate.isPending} />

      <Modal open={!!cloneTarget} onClose={() => setCloneTarget(null)} title={`Clone ${cloneTarget?.name ?? ''}`}>
        <div className="space-y-3">
          <p className="text-xs text-slate-600">Creates an independent copy — the original framework is unchanged.</p>
          <Input label="New framework name" value={cloneName} onChange={(e) => setCloneName(e.target.value)} required />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setCloneTarget(null)}>Cancel</Button>
            <Button size="sm" disabled={doClone.isPending || !cloneName.trim()} onClick={() => doClone.mutate()}>{doClone.isPending ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />} Clone</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ---------------- Create wizard (Steps 1–6) ----------------
function CreateWizard({ orgId, canCreate, onCancel, onSaved, saveMeta, catalog }: { orgId: string; canCreate: boolean; onCancel: () => void; onSaved: () => void; saveMeta: (id: string, m: Meta) => void; catalog: any[] }) {
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ name: '', code: '', version: '1.0', category: 'Custom', description: '', owner: '', effectiveDate: '', reviewDate: '', status: 'draft' as Status });
  const [domains, setDomains] = useState<string[]>(['Governance']);
  const [newDomain, setNewDomain] = useState('');
  const [controls, setControls] = useState<ControlDraft[]>([{ controlId: '', title: '', description: '', guidance: '', owner: '', frequency: '', type: 'Preventive', domain: 'Governance' }]);
  const [evidence, setEvidence] = useState<EvidenceDraft[]>([]);
  const [risks, setRisks] = useState<RiskDraft[]>([]);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [error, setError] = useState('');
  const create = useMutation({
    mutationFn: async () => {
      const fw: any = await createFramework(orgId, { name: f.name, category: f.category, version: f.version || undefined, description: f.description });
      if (fw?.id) {
        const rows = controls.filter((c) => c.controlId.trim() && c.title.trim()).map((c) => ({ control_id: c.controlId, title: c.title, description: c.description, category: c.domain, implementation_guidance: c.guidance }));
        if (rows.length) { try { const { addFrameworkControls } = await import('@/services/api'); await addFrameworkControls(fw.id, rows as any); } catch {} }
        saveMeta(fw.id, { code: f.code, owner: f.owner, effectiveDate: f.effectiveDate, reviewDate: f.reviewDate, status: f.status, domains, evidence, risks, questions });
        const { logActivity } = await import('@/lib/format'); await logActivity(orgId, 'framework_created', 'framework', fw.id, { name: f.name, controls: rows.length });
      }
      return fw;
    },
    onSuccess: onSaved,
    onError: (e: any) => setError(e?.message ?? 'Could not create framework.'),
  });
  const steps = ['Details', 'Domains', 'Controls', 'Evidence', 'Risk Mappings', 'Assessment'];
  const validStep1 = f.name.trim() && f.code.trim() && !catalog.some((x) => (x.slug ?? '').toLowerCase() === f.code.trim().toLowerCase());
  const next = () => {
    if (step === 0 && !validStep1) { setError(!f.name.trim() ? 'Framework name is required.' : !f.code.trim() ? 'Framework code is required.' : 'Framework code already exists in the catalog.'); return; }
    setError(''); setStep(Math.min(5, step + 1));
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={onCancel}><ArrowLeft size={15} /> Cancel</Button>
        <h1 className="text-xl font-bold text-navy">Create Custom Framework</h1>
      </div>
      <Tabs tabs={steps.map((s, i) => ({ id: String(i), label: `${i + 1}. ${s}` }))} active={String(step)} onChange={(id) => setStep(Number(id))} />
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-crimson">{error}</p>}
      <Card><CardBody className="space-y-4 py-5">
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Framework Name *" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
            <Input label="Framework Code *" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} placeholder="MY-ISO-001" required />
            <Select label="Category" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{['Compliance','Risk','Audit','Security','Privacy','Vendor Management','Business Continuity','Custom'].map((c) => <option key={c}>{c}</option>)}</Select>
            <Input label="Version" value={f.version} onChange={(e) => setF({ ...f, version: e.target.value })} />
            <Input label="Owner" value={f.owner} onChange={(e) => setF({ ...f, owner: e.target.value })} />
            <Select label="Status" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as Status })}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></Select>
            <Input label="Effective Date" type="date" value={f.effectiveDate} onChange={(e) => setF({ ...f, effectiveDate: e.target.value })} />
            <Input label="Review Date" type="date" value={f.reviewDate} onChange={(e) => setF({ ...f, reviewDate: e.target.value })} />
            <div className="sm:col-span-2"><Textarea label="Description" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} rows={3} /></div>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-3">
            <div className="flex gap-2"><Input label="Domain Name" value={newDomain} onChange={(e) => setNewDomain(e.target.value)} placeholder="e.g. Access Control" /><Button size="sm" onClick={() => { if (newDomain.trim()) { setDomains([...domains, newDomain.trim()]); setNewDomain(''); } }}>Add</Button></div>
            <ul className="space-y-2 text-sm">{domains.map((d) => <li key={d} className="flex items-center justify-between rounded-lg border border-line px-3 py-2">{d}<button onClick={() => setDomains(domains.filter((x) => x !== d))} className="text-slate-500 hover:text-crimson" aria-label={`Remove ${d}`}><Trash2 size={14} /></button></li>)}</ul>
            <p className="text-[11px] text-slate-500">Examples: Governance, Access Control, Operations Security, Vendor Management, Incident Management.</p>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            {controls.map((c, i) => (
              <div key={i} className="grid gap-2 rounded-lg border border-line p-3 sm:grid-cols-3">
                <Input label="Control ID" value={c.controlId} onChange={(e) => setControls(controls.map((x, j) => j === i ? { ...x, controlId: e.target.value } : x))} />
                <Input label="Control Name" value={c.title} onChange={(e) => setControls(controls.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} />
                <Select label="Domain" value={c.domain} onChange={(e) => setControls(controls.map((x, j) => j === i ? { ...x, domain: e.target.value } : x))}>{domains.map((d) => <option key={d}>{d}</option>)}</Select>
                <Textarea label="Description" value={c.description} onChange={(e) => setControls(controls.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} className="sm:col-span-2" />
                <Select label="Control Type" value={c.type} onChange={(e) => setControls(controls.map((x, j) => j === i ? { ...x, type: e.target.value } : x))}>{CTRL_TYPES.map((t) => <option key={t}>{t}</option>)}</Select>
                <Input label="Owner" value={c.owner} onChange={(e) => setControls(controls.map((x, j) => j === i ? { ...x, owner: e.target.value } : x))} />
                <Input label="Frequency" value={c.frequency} onChange={(e) => setControls(controls.map((x, j) => j === i ? { ...x, frequency: e.target.value } : x))} />
                <Textarea label="Implementation Guidance" value={c.guidance} onChange={(e) => setControls(controls.map((x, j) => j === i ? { ...x, guidance: e.target.value } : x))} />
                <button className="self-end text-slate-500 hover:text-crimson" onClick={() => setControls(controls.filter((_, j) => j !== i))} aria-label="Remove control"><Trash2 size={15} /></button>
              </div>
            ))}
            <Button size="sm" variant="secondary" onClick={() => setControls([...controls, { controlId: '', title: '', description: '', guidance: '', owner: '', frequency: '', type: 'Preventive', domain: domains[0] ?? 'Governance' }])}>Add control</Button>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-3">
            {evidence.map((e, i) => (
              <div key={i} className="grid gap-2 rounded-lg border border-line p-3 sm:grid-cols-3">
                <Input label="Evidence Name" value={e.name} onChange={(ev) => setEvidence(evidence.map((x, j) => j === i ? { ...x, name: ev.target.value } : x))} />
                <Select label="Control ID" value={e.controlId} onChange={(ev) => setEvidence(evidence.map((x, j) => j === i ? { ...x, controlId: ev.target.value } : x))}>{controls.map((c) => <option key={c.controlId} value={c.controlId}>{c.controlId}</option>)}</Select>
                <Input label="Type" value={e.type} onChange={(ev) => setEvidence(evidence.map((x, j) => j === i ? { ...x, type: ev.target.value } : x))} placeholder="Document / Screenshot / Policy" />
                <Input label="Review Frequency" value={e.frequency} onChange={(ev) => setEvidence(evidence.map((x, j) => j === i ? { ...x, frequency: ev.target.value } : x))} />
                <Input label="Retention Period" value={e.retention} onChange={(ev) => setEvidence(evidence.map((x, j) => j === i ? { ...x, retention: ev.target.value } : x))} />
                <label className="flex items-center gap-2 text-xs font-medium"><input type="checkbox" checked={e.mandatory} onChange={(ev) => setEvidence(evidence.map((x, j) => j === i ? { ...x, mandatory: ev.target.checked } : x))} /> Mandatory</label>
              </div>
            ))}
            <Button size="sm" variant="secondary" onClick={() => setEvidence([...evidence, { controlId: controls[0]?.controlId ?? '', name: '', type: '', frequency: '', retention: '', mandatory: true }])}>Add evidence requirement</Button>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-3">
            {risks.map((r, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-2">
                <Select label="Control ID" value={r.controlId} onChange={(e) => setRisks(risks.map((x, j) => j === i ? { ...x, controlId: e.target.value } : x))}>{controls.map((c) => <option key={c.controlId} value={c.controlId}>{c.controlId}</option>)}</Select>
                <Input label="Risk (e.g. Unauthorized Access)" value={r.risk} onChange={(e) => setRisks(risks.map((x, j) => j === i ? { ...x, risk: e.target.value } : x))} />
              </div>
            ))}
            <Button size="sm" variant="secondary" onClick={() => setRisks([...risks, { controlId: controls[0]?.controlId ?? '', risk: '' }])}>Map risk</Button>
          </div>
        )}
        {step === 5 && (
          <div className="space-y-3">
            {questions.map((x, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-3">
                <Select label="Control ID" value={x.controlId} onChange={(e) => setQuestions(questions.map((v, j) => j === i ? { ...v, controlId: e.target.value } : v))}>{controls.map((c) => <option key={c.controlId} value={c.controlId}>{c.controlId}</option>)}</Select>
                <div className="sm:col-span-2"><Textarea label="Question" value={x.text} onChange={(e) => setQuestions(questions.map((v, j) => j === i ? { ...v, text: e.target.value } : v))} /></div>
                <Select label="Answer Type" value={x.answerType} onChange={(e) => setQuestions(questions.map((v, j) => j === i ? { ...v, answerType: e.target.value } : v))}><option>Yes / No</option><option>Score</option><option>Text</option><option>File Upload</option></Select>
              </div>
            ))}
            <Button size="sm" variant="secondary" onClick={() => setQuestions([...questions, { controlId: controls[0]?.controlId ?? '', text: '', answerType: 'Yes / No' }])}>Add question</Button>
          </div>
        )}
      </CardBody></Card>
      <div className="flex justify-between">
        <Button variant="secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          {step < 5
            ? <Button onClick={next}>Next</Button>
            : <Button disabled={!canCreate || create.isPending} onClick={() => create.mutate()}>{create.isPending ? <Loader2 size={14} className="animate-spin" /> : null} Save Framework</Button>}
        </div>
      </div>
      {!canCreate && <p className="text-xs text-slate-500">Your role cannot create frameworks (requires Super Admin / Administrator).</p>}
    </div>
  );
}

// ---------------- Import ----------------
function ImportView({ orgId, canCreate, onCancel, onDone }: { orgId: string; canCreate: boolean; onCancel: () => void; onDone: () => void }) {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const doImport = async () => {
    setError(''); setBusy(true);
    try {
      const groups = groupByFramework(rows);
      if (!groups.size) throw new Error('No valid rows to import.');
      const { createFramework, addFrameworkControls } = await import('@/services/api');
      for (const [name, rs] of groups) {
        const fw: any = await createFramework(orgId, { name, category: rs[0].domain || 'Custom', version: '1.0', description: `Imported ${rs.length} controls` });
        if (fw?.id) {
          const ctrls = rs.map((r, i) => ({ control_id: r.controlId || `CTRL-${i + 1}`, title: r.controlName, description: r.description, category: r.domain, implementation_guidance: r.evidence ? `Evidence: ${r.evidence}` : '' }));
          try { await addFrameworkControls(fw.id, ctrls as any); } catch {}
        }
      }
      onDone();
    } catch (e: any) { setError(e?.message ?? 'Import failed.'); } finally { setBusy(false); }
  };
  const onFile = async (file?: File) => {
    if (!file) return;
    if (file.name.toLowerCase().endsWith('.xlsx')) { setError('Excel (.xlsx) is not parsed in-browser. Save the file as CSV (columns: Framework, Domain, Control ID, Control Name, Description, Evidence, Risk, Question) and upload the CSV.'); return; }
    try {
      const t = await file.text(); setText(t);
      setRows(file.name.toLowerCase().endsWith('.json') ? parseJson(t) : parseCsv(t)); setError('');
    } catch (e: any) { setError(e?.message ?? 'Could not parse file.'); }
  };
  return (
    <div className="space-y-4">
      <Button size="sm" variant="ghost" onClick={onCancel}><ArrowLeft size={15} /> Back</Button>
      <div><h1 className="text-xl font-bold text-navy">Import Framework</h1>
      <p className="text-xs text-slate-600">CSV or JSON with columns: Framework, Domain, Control ID, Control Name, Description, Evidence, Risk, Question.</p></div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => downloadText('aegis-framework-template.csv', IMPORT_TEMPLATE, 'text/csv')}><Download size={14} /> Download template</Button>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-xs font-semibold text-navy">Choose CSV / JSON<input type="file" accept=".csv,.json,text/csv,application/json" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} /></label>
      </div>
      <Textarea label="Or paste CSV / JSON" value={text} onChange={(e) => setText(e.target.value)} rows={6} />
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" disabled={!text.trim()} onClick={() => { try { setRows(text.trim().startsWith('[') || text.trim().startsWith('{') ? parseJson(text) : parseCsv(text)); setError(''); } catch (e: any) { setError(e?.message ?? 'Parse failed.'); } }}>Parse</Button>
        <Button size="sm" disabled={!canCreate || busy || !rows.length} onClick={doImport}>{busy ? <Loader2 size={14} className="animate-spin" /> : null} Import {rows.length} rows</Button>
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-crimson">{error}</p>}
      {rows.length > 0 && <p className="text-xs text-slate-600"><X size={12} className="inline" /> Preview: {rows.length} valid rows across {groupByFramework(rows).size} framework(s).</p>}
      {!canCreate && <p className="text-xs text-slate-500">Your role cannot import frameworks.</p>}
    </div>
  );
}
