import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Boxes, Trash2, Laptop, Server, Cloud, Smartphone } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/States';
import { Tabs } from '@/components/ui/Tabs';

export type AssetType = 'laptop' | 'server' | 'cloud' | 'mobile' | 'other';
export type Criticality = 'critical' | 'high' | 'medium' | 'low';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  owner: string;
  criticality: Criticality;
  status: 'active' | 'retired' | 'maintenance';
  notes?: string;
}

const STORAGE_KEY = 'aegis-assets-v1';

const SEED: Asset[] = [
  { id: 'a1', name: 'Production API cluster', type: 'cloud', owner: 'IT / Security', criticality: 'critical', status: 'active' },
  { id: 'a2', name: 'Finance file server', type: 'server', owner: 'Finance', criticality: 'high', status: 'active' },
  { id: 'a3', name: 'HR laptops (batch 2025)', type: 'laptop', owner: 'People Ops', criticality: 'medium', status: 'active' },
  { id: 'a4', name: 'Executive mobiles', type: 'mobile', owner: 'Leadership', criticality: 'high', status: 'maintenance' },
];

const TYPE_ICON: Record<AssetType, typeof Boxes> = {
  laptop: Laptop,
  server: Server,
  cloud: Cloud,
  mobile: Smartphone,
  other: Boxes,
};

const critTone = (c: Criticality) =>
  c === 'critical' ? 'critical' : c === 'high' ? 'warning' : c === 'medium' ? 'info' : 'success';

const statusTone = (s: string) => (s === 'active' ? 'success' : s === 'maintenance' ? 'warning' : 'default');

export function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Asset[];
    } catch {
      /* ignore corrupt storage */
    }
    return SEED;
  });
  const [tab, setTab] = useState<'all' | 'active' | 'maintenance' | 'retired'>('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Asset, 'id'>>({
    name: '',
    type: 'laptop',
    owner: '',
    criticality: 'medium',
    status: 'active',
    notes: '',
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
    } catch {
      /* storage may be unavailable */
    }
  }, [assets]);

  const counts = useMemo(
    () => ({
      all: assets.length,
      active: assets.filter((a) => a.status === 'active').length,
      maintenance: assets.filter((a) => a.status === 'maintenance').length,
      retired: assets.filter((a) => a.status === 'retired').length,
    }),
    [assets],
  );

  const visible = useMemo(() => {
    let list = assets;
    if (tab !== 'all') list = list.filter((a) => a.status === tab);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((a) => `${a.name} ${a.owner} ${a.type}`.toLowerCase().includes(needle));
    }
    return list;
  }, [assets, tab, q]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setAssets((prev) => [{ ...form, id: crypto.randomUUID?.() ?? String(Date.now()) }, ...prev]);
    setForm({ name: '', type: 'laptop', owner: '', criticality: 'medium', status: 'active', notes: '' });
    setOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">Assets</h1>
          <p className="mt-1 text-sm text-slate-500">
            {counts.all} assets · {counts.active} active · {counts.maintenance} in maintenance
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus size={15} stroke="currentColor" /> Add asset
        </Button>
      </div>

      <Tabs
        tabs={[
          { id: 'all', label: 'All', badge: counts.all },
          { id: 'active', label: 'Active', badge: counts.active },
          { id: 'maintenance', label: 'Maintenance', badge: counts.maintenance },
          { id: 'retired', label: 'Retired', badge: counts.retired },
        ]}
        active={tab}
        onChange={(id) => setTab(id as typeof tab)}
      />

      <div className="relative max-w-sm">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search assets…"
          className="w-full rounded-lg border border-line bg-white py-2 pl-9 pr-3 text-sm text-ink placeholder:text-slate-400 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/15"
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<Boxes size={22} stroke="currentColor" />}
          title={assets.length === 0 ? 'No assets tracked yet' : 'No assets match this view'}
          message={
            assets.length === 0
              ? 'Add the systems, devices and cloud services that support your controls.'
              : 'Try a different tab or clear the search.'
          }
          action={
            assets.length === 0 ? (
              <Button size="sm" onClick={() => setOpen(true)}>
                Add asset
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden grid-cols-[1fr_120px_150px_110px_110px_40px] gap-3 border-b border-line bg-slate-50 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 md:grid">
            <span>Asset</span>
            <span>Type</span>
            <span>Owner</span>
            <span>Criticality</span>
            <span>Status</span>
            <span />
          </div>
          <ul className="divide-y divide-line">
            {visible.map((a) => {
              const Icon = TYPE_ICON[a.type] ?? Boxes;
              return (
                <li
                  key={a.id}
                  className="grid grid-cols-1 items-center gap-2 px-5 py-3.5 hover:bg-slate-50 md:grid-cols-[1fr_120px_150px_110px_110px_40px] md:gap-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy/5 text-navy">
                      <Icon size={16} strokeWidth={1.9} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-navy">{a.name}</p>
                      <p className="truncate text-[11px] text-slate-400 md:hidden">
                        {a.type} · {a.owner}
                      </p>
                    </div>
                  </div>
                  <span className="hidden text-xs capitalize text-slate-500 md:block">{a.type}</span>
                  <span className="hidden truncate text-xs text-slate-500 md:block">{a.owner || '—'}</span>
                  <span className="hidden md:block">
                    <Badge label={a.criticality} tone={critTone(a.criticality) as any} />
                  </span>
                  <span className="hidden md:block">
                    <Badge label={a.status} tone={statusTone(a.status) as any} />
                  </span>
                  <button
                    onClick={() => setConfirmId(a.id)}
                    className="hidden rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-crimson md:block"
                    aria-label={`Remove ${a.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add asset">
        <form onSubmit={add} className="space-y-4">
          <Input
            label="Asset name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Production API cluster"
          />
          <Select
            label="Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as AssetType })}
          >
            <option value="laptop">Laptop</option>
            <option value="server">Server</option>
            <option value="cloud">Cloud service</option>
            <option value="mobile">Mobile device</option>
            <option value="other">Other</option>
          </Select>
          <Input
            label="Owner"
            value={form.owner}
            onChange={(e) => setForm({ ...form, owner: e.target.value })}
            placeholder="Team or person responsible"
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
            onChange={(e) => setForm({ ...form, status: e.target.value as Asset['status'] })}
          >
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="retired">Retired</option>
          </Select>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save asset
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => {
          setAssets((prev) => prev.filter((a) => a.id !== confirmId));
          setConfirmId(null);
        }}
        title="Remove asset"
        message="This removes the asset from your register. This cannot be undone."
        confirmLabel="Remove"
        danger
      />
    </div>
  );
}
