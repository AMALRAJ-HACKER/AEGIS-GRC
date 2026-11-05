import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Building2, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/States';
import { Tabs } from '@/components/ui/Tabs';

type Criticality = 'critical' | 'high' | 'medium' | 'low';
type VendorStatus = 'active' | 'under_review' | 'offboarded';

interface Vendor {
  id: string;
  name: string;
  service: string;
  category: string;
  criticality: Criticality;
  status: VendorStatus;
  contact: string;
  dpaSigned: boolean;
}

const STORAGE_KEY = 'aegis-vendors-v1';

const SEED: Vendor[] = [
  { id: 'v1', name: 'Supabase', service: 'Database & authentication', category: 'Cloud infrastructure', criticality: 'critical', status: 'active', contact: 'support@supabase.io', dpaSigned: true },
  { id: 'v2', name: 'Vercel', service: 'Web hosting & CDN', category: 'Cloud infrastructure', criticality: 'high', status: 'active', contact: 'support@vercel.com', dpaSigned: true },
  { id: 'v3', name: 'Stripe', service: 'Payments', category: 'Finance', criticality: 'high', status: 'under_review', contact: 'support@stripe.com', dpaSigned: false },
  { id: 'v4', name: 'Google Workspace', service: 'Email & collaboration', category: 'Productivity', criticality: 'medium', status: 'active', contact: 'admin@company.com', dpaSigned: true },
];

const critTone = (c: Criticality) =>
  c === 'critical' ? 'critical' : c === 'high' ? 'warning' : c === 'medium' ? 'info' : 'success';

const statusTone = (s: VendorStatus) =>
  s === 'active' ? 'success' : s === 'under_review' ? 'warning' : 'default';

export function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Vendor[];
    } catch {
      /* ignore corrupt storage */
    }
    return SEED;
  });
  const [tab, setTab] = useState<'all' | VendorStatus>('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Vendor, 'id'>>({
    name: '',
    service: '',
    category: '',
    criticality: 'medium',
    status: 'active',
    contact: '',
    dpaSigned: false,
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vendors));
    } catch {
      /* storage may be unavailable */
    }
  }, [vendors]);

  const counts = useMemo(
    () => ({
      all: vendors.length,
      active: vendors.filter((v) => v.status === 'active').length,
      under_review: vendors.filter((v) => v.status === 'under_review').length,
      offboarded: vendors.filter((v) => v.status === 'offboarded').length,
    }),
    [vendors],
  );

  const visible = useMemo(() => {
    let list = vendors;
    if (tab !== 'all') list = list.filter((v) => v.status === tab);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((v) => `${v.name} ${v.service} ${v.category}`.toLowerCase().includes(needle));
    }
    return list;
  }, [vendors, tab, q]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setVendors((prev) => [{ ...form, id: crypto.randomUUID?.() ?? String(Date.now()) }, ...prev]);
    setForm({ name: '', service: '', category: '', criticality: 'medium', status: 'active', contact: '', dpaSigned: false });
    setOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">Vendors</h1>
          <p className="mt-1 text-sm text-slate-500">
            {counts.all} third parties · {counts.under_review} under review
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus size={15} stroke="currentColor" /> Add vendor
        </Button>
      </div>

      <Tabs
        tabs={[
          { id: 'all', label: 'All', badge: counts.all },
          { id: 'active', label: 'Active', badge: counts.active },
          { id: 'under_review', label: 'Under review', badge: counts.under_review },
          { id: 'offboarded', label: 'Offboarded', badge: counts.offboarded },
        ]}
        active={tab}
        onChange={(id) => setTab(id as typeof tab)}
      />

      <div className="relative max-w-sm">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search vendors…"
          className="w-full rounded-lg border border-line bg-white py-2 pl-9 pr-3 text-sm text-ink placeholder:text-slate-500 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/15"
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<Building2 size={22} stroke="currentColor" />}
          title={vendors.length === 0 ? 'No vendors tracked yet' : 'No vendors match this view'}
          message={
            vendors.length === 0
              ? 'Track third parties, their criticality and data-processing agreements.'
              : 'Try a different tab or clear the search.'
          }
          action={
            vendors.length === 0 ? (
              <Button size="sm" onClick={() => setOpen(true)}>
                Add vendor
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((v) => (
            <Card key={v.id} className="overflow-hidden hover:border-blue/40 transition-colors group">
              <div className="px-5 py-4 border-b border-line bg-slate-50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-navy">
                      <Building2 size={19} strokeWidth={1.9} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-navy">{v.name}</h3>
                      <p className="truncate text-[11px] text-slate-500">{v.category || 'Uncategorised'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmId(v.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-crimson transition-colors"
                    aria-label={`Remove ${v.name}`}
                  >
                    <Trash2 size={15} strokeWidth={2} />
                  </button>
                </div>
              </div>

              <div className="px-5 py-4">
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide mb-2">
                  Service
                </p>
                <p className="line-clamp-2 min-h-[32px] text-sm text-slate-600 leading-relaxed">
                  {v.service || 'No service description'}
                </p>
              </div>

              <div className="px-5 py-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge label={v.criticality} tone={critTone(v.criticality) as any} />
                  <Badge label={v.status.replace('_', ' ')} tone={statusTone(v.status) as any} />
                  <Badge
                    label={v.dpaSigned ? 'DPA signed' : 'DPA missing'}
                    tone={v.dpaSigned ? 'success' : 'critical'}
                  />
                </div>
              </div>

              <div className="px-5 py-4 border-t border-line bg-white/50">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  {v.dpaSigned ? (
                    <ShieldCheck size={13} className="text-emerald" />
                  ) : (
                    <ShieldAlert size={13} className="text-crimson" />
                  )}
                  <span className="truncate">{v.contact || 'No contact on file'}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add vendor">
        <form onSubmit={add} className="space-y-4">
          <Input
            label="Vendor name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Supabase"
          />
          <Input
            label="Service provided"
            value={form.service}
            onChange={(e) => setForm({ ...form, service: e.target.value })}
            placeholder="e.g. Database & authentication"
          />
          <Input
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="e.g. Cloud infrastructure"
          />
          <Select
            label="Criticality"
            value={form.criticality}
            onChange={(e) => setForm({ ...form, criticality: e.target.value as Criticality })}
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as VendorStatus })}
          >
            <option value="active">Active</option>
            <option value="under_review">Under review</option>
            <option value="offboarded">Offboarded</option>
          </Select>
          <Input
            label="Contact"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            placeholder="security@vendor.com"
          />
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <input
              type="checkbox"
              checked={form.dpaSigned}
              onChange={(e) => setForm({ ...form, dpaSigned: e.target.checked })}
              className="h-4 w-4 rounded border-line text-navy focus:ring-blue"
            />
            Data-processing agreement signed
          </label>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save vendor
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => {
          setVendors((prev) => prev.filter((v) => v.id !== confirmId));
          setConfirmId(null);
        }}
        title="Remove vendor"
        message="This removes the vendor from your register. This cannot be undone."
        confirmLabel="Remove"
        danger
      />
    </div>
  );
}
