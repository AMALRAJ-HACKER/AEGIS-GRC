import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Plug, Copy, Send, Plus, Play, Link2 } from 'lucide-react';
import { useCurrentOrg } from '@/hooks/useOrg';
import { fetchMembers, createInvitation, updateOrg, updateProfile, fetchInvitations } from '@/services/api';
import { canEditOrg, canManageTeam, ROLE_OPTIONS } from '@/lib/permissions';
import { logActivity, roleLabel } from '@/lib/format';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { Avatar } from '@/components/ui/Avatar';
import { fetchIntegrations, fetchConnections, createConnection, fetchChecks, upsertCheck, runConnection, fetchRuns } from '@/services/integrations';

type Tab = 'general' | 'team' | 'notifications' | 'integrations';

const copyToClipboard = async (text: string) => {
  try {
    if (navigator.clipboard && (window as any).isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  } catch {
    return false;
  }
};

export function SettingsPage() {
  const { orgId, role, org, profile, userId } = useCurrentOrg().data ?? { orgId: '', role: 'staff', org: null, profile: null, userId: '' };
  const [tab, setTab] = useState<Tab>('general');
  const queryClient = useQueryClient();

  const members = useQuery({ queryKey: ['members', orgId], queryFn: () => fetchMembers(orgId), enabled: !!orgId });
  const invites = useQuery({ queryKey: ['invitations', orgId], queryFn: () => fetchInvitations(orgId), enabled: !!orgId && canManageTeam(role) });

  const [orgForm, setOrgForm] = useState({ name: org?.name ?? '', industry: org?.industry ?? '', country: org?.country ?? '', timezone: org?.timezone ?? '' });
  const [prefs, setPrefs] = useState((profile?.notification_prefs as any) ?? {});
  const [invite, setInvite] = useState({ email: '', role: 'staff' });
  const [copied, setCopied] = useState(false);
  const [lastToken, setLastToken] = useState<string | null>(null);

  const integrations = useQuery({ queryKey: ['integrations'], queryFn: fetchIntegrations });
  const connections = useQuery({ queryKey: ['int-conns', orgId], queryFn: () => fetchConnections(orgId), enabled: !!orgId });
  const runs = useQuery({ queryKey: ['int-runs', orgId], queryFn: () => fetchRuns(orgId), enabled: !!orgId });
  const [showConnect, setShowConnect] = useState(false);
  const [activeConn, setActiveConn] = useState<any>(null);
  const [connForm, setConnForm] = useState({ integration_id: '', name: '', base_url: '', auth_type: 'api_key', api_key_header: 'x-api-key', api_key_value: '', bearer_token: '' });
  const [checkForm, setCheckForm] = useState({ name: '', endpoint: '/health', method: 'GET', path: 'status', operator: 'eq', value: 'ok', map_to_assessment_id: '' });
  const checksQ = useQuery({ queryKey: ['int-checks', activeConn?.id], queryFn: () => fetchChecks(activeConn.id), enabled: !!activeConn?.id });

  const updateOrgMut = useMutation({
    mutationFn: () => updateOrg(orgId, orgForm),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['currentOrg'] }); logActivity(orgId, 'org_updated', 'org', orgId); },
  });
  const updatePrefs = useMutation({
    mutationFn: () => updateProfile(userId, { notification_prefs: prefs }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['currentOrg'] }),
  });
  const inviteMut = useMutation({
    mutationFn: () => createInvitation(orgId, invite.email, invite.role, userId),
    onSuccess: async (d: any) => {
      queryClient.invalidateQueries({ queryKey: ['invitations', orgId] });
      setInvite({ email: '', role: 'staff' });
      if (d?.token) {
        setLastToken(d.token);
        await copyToClipboard(d.token);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    },
  });

  const createConn = useMutation({
    mutationFn: async () => {
      const payload = {
        integration_id: connForm.integration_id,
        name: connForm.name,
        auth_type: connForm.auth_type,
        config: { base_url: connForm.base_url },
        credentials:
          connForm.auth_type === 'bearer'
            ? { bearer_token: connForm.bearer_token }
            : connForm.auth_type === 'api_key'
            ? { api_key_header: connForm.api_key_header, api_key_value: connForm.api_key_value }
            : {},
      };
      return createConnection(orgId, userId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['int-conns', orgId] });
      setShowConnect(false);
    },
  });

  const addCheck = useMutation({
    mutationFn: async () => {
      const payload = {
        connection_id: activeConn.id,
        organization_id: orgId,
        name: checkForm.name,
        endpoint: checkForm.endpoint,
        method: checkForm.method,
        rule: { path: checkForm.path, operator: checkForm.operator, value: checkForm.value },
        map_to_assessment_id: checkForm.map_to_assessment_id || null,
        enabled: true,
      };
      return upsertCheck(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['int-checks', activeConn.id] });
    },
  });

  const runNow = useMutation({
    mutationFn: (id: string) => runConnection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['int-conns', orgId] });
      queryClient.invalidateQueries({ queryKey: ['int-runs', orgId] });
    },
  });

  const submitOrg = (e: FormEvent) => { e.preventDefault(); updateOrgMut.mutate(); };
  const submitInvite = (e: FormEvent) => { e.preventDefault(); inviteMut.mutate(); };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-navy">Organization Settings</h1>
        <p className="text-xs text-slate-600">Manage workspace, team, and notifications</p>
      </div>

      <Tabs<Tab>
        tabs={[
          { id: 'general', label: 'General' },
          { id: 'team', label: 'Team' },
          { id: 'notifications', label: 'Notifications' },
          { id: 'integrations', label: 'Integrations' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'general' && (
        <form onSubmit={submitOrg}>
          <Card>
            <CardHeader title="General Settings" subtitle="Workspace details" />
            <CardBody className="space-y-4">
              <Input label="Organization Name" value={orgForm.name} onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })} disabled={!canEditOrg(role)} />
              <Input label="Industry" value={orgForm.industry} onChange={(e) => setOrgForm({ ...orgForm, industry: e.target.value })} disabled={!canEditOrg(role)} />
              <Input label="Country" value={orgForm.country} onChange={(e) => setOrgForm({ ...orgForm, country: e.target.value })} disabled={!canEditOrg(role)} />
              <Input label="Timezone" value={orgForm.timezone} onChange={(e) => setOrgForm({ ...orgForm, timezone: e.target.value })} placeholder="Asia/Kolkata" disabled={!canEditOrg(role)} />
              {canEditOrg(role) && (
                <div className="flex justify-end">
                  <Button type="submit" loading={updateOrgMut.isPending}>Save Changes</Button>
                </div>
              )}
            </CardBody>
          </Card>
        </form>
      )}

      {tab === 'team' && (
        <div className="space-y-4">
          {canManageTeam(role) && (
            <Card>
              <CardHeader title="Invite Member" subtitle="Send an invite by sharing the token" />
              <CardBody>
                <form onSubmit={submitInvite} className="flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <Input label="Email" type="email" required value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} placeholder="teammate@company.com" />
                  </div>
                  <div className="min-w-[180px]">
                    <Select label="Role" value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value })}>
                      {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </Select>
                  </div>
                  <Button type="submit" loading={inviteMut.isPending}><Send size={14} /> Invite</Button>
                  {copied && <span className="text-xs font-semibold text-emerald2">Token copied to clipboard</span>}
                </form>
                {lastToken && (
                  <div className="mt-4 rounded-lg border border-line bg-canvas p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-navy">Invitation Token</span>
                      <button onClick={async () => { const ok = await copyToClipboard(lastToken); if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); } }} className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2 py-1 text-[11px] font-semibold text-navy hover:bg-gray-50"><Copy size={12} /> Copy</button>
                    </div>
                    <code className="block w-full overflow-x-auto rounded bg-white px-2 py-2 text-[11px] font-mono text-slate-600">{lastToken}</code>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader title="Team Members" subtitle={`${(members.data ?? []).length} active members`} />
            <CardBody className="divide-y divide-line">
              {(members.data ?? []).map((m: any) => (
                <div key={m.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.profile?.full_name} size={36} />
                    <div>
                      <div className="text-sm font-semibold text-navy">{m.profile?.full_name ?? '—'}</div>
                      <div className="text-[11px] text-slate-600">{m.profile?.email} · {roleLabel(m.role)}</div>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald2">{m.status ?? 'active'}</span>
                </div>
              ))}
            </CardBody>
          </Card>

          {canManageTeam(role) && (invites.data ?? []).length > 0 && (
            <Card>
              <CardHeader title="Pending Invitations" />
              <CardBody className="divide-y divide-line">
                {(invites.data ?? []).map((i: any) => (
                  <div key={i.id} className="flex items-center justify-between gap-3 py-2.5 text-xs">
                    <div className="font-semibold text-navy">{i.email}</div>
                    <div className="flex items-center gap-2 text-slate-600">
                      {roleLabel(i.role)} · {i.status}
                      {i.token && (
                        <button onClick={async () => { await copyToClipboard(i.token); }} className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2 py-0.5 hover:bg-gray-50"><Copy size={12} /> Copy Token</button>
                      )}
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {tab === 'notifications' && (
        <Card>
          <CardHeader title="Notification Preferences" subtitle="In-app notification settings" />
          <CardBody className="space-y-3">
            {['task_overdue', 'evidence_expiring', 'approval_pending', 'risk_escalation', 'new_invitation'].map((k) => (
              <label key={k} className="flex items-center justify-between rounded-lg border border-line bg-white px-4 py-3">
                <span className="text-xs font-semibold capitalize text-navy">{k.replace(/_/g, ' ')}</span>
                <input type="checkbox" checked={!!prefs[k]} onChange={(e) => setPrefs((p: any) => ({ ...p, [k]: e.target.checked }))} className="h-4 w-4 rounded border-line text-blue focus-ring" />
              </label>
            ))}
            <div className="flex justify-end pt-2">
              <Button onClick={() => updatePrefs.mutate()} loading={updatePrefs.isPending}>Save Preferences</Button>
            </div>
          </CardBody>
        </Card>
      )}

      {tab === 'integrations' && (
        <div className="space-y-4">
          <Card>
            <CardHeader title="Available Integrations" subtitle="Connect your product/tools to collect evidence automatically" action={<Button size="sm" onClick={() => setShowConnect(true)}><Plus size={14} /> New Connection</Button>} />
            <CardBody className="grid gap-3 sm:grid-cols-2">
              {(integrations.data ?? []).map((i: any) => (
                <div key={i.id} className="flex items-center justify-between rounded-lg border border-line bg-white px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-light text-blue"><Link2 size={16} /></div>
                    <div>
                      <div className="text-xs font-semibold text-navy">{i.name}</div>
                      <div className="text-[10px] text-slate-600">{i.description}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-emerald2">Available</span>
                </div>
              ))}
              {(integrations.data ?? []).length === 0 && <p className="py-3 text-center text-xs text-slate-600 col-span-full">No integrations found. Apply migration 0011_enable_all_connectors.sql in Supabase.</p>}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Connections" subtitle="Active connections for this organization" />
            <CardBody className="divide-y divide-line">
              {(connections.data ?? []).length === 0 && <p className="py-3 text-center text-xs text-slate-600">No connections yet. Click "New Connection" above.</p>}
              {(connections.data ?? []).map((c: any) => (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <div className="text-sm font-semibold text-navy">{c.name} <span className="text-xs text-slate-600">({c.integration?.name})</span></div>
                    <div className="text-[10px] text-slate-600">Last sync: {c.last_sync_at ? new Date(c.last_sync_at).toLocaleString() : 'Never'} • Status: {c.status}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setActiveConn(c)}>Configure Checks</Button>
                    <Button size="sm" onClick={() => runNow.mutate(c.id)} loading={runNow.isPending}><Play size={14} /> Run Now</Button>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Recent Runs" subtitle="Automated check history" />
            <CardBody className="divide-y divide-line">
              {(runs.data ?? []).length === 0 && <p className="py-3 text-center text-xs text-slate-600">No runs yet.</p>}
              {(runs.data ?? []).map((r: any) => (
                <div key={r.id} className="flex items-center justify-between py-2.5 text-xs">
                  <div>
                    <div className="font-semibold text-navy">{r.connection?.name}</div>
                    <div className="text-[10px] text-slate-600">{new Date(r.started_at).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald2">{r.summary?.passed || 0} passed</span>
                    <span className="text-crimson">{r.summary?.failed || 0} failed</span>
                    <span className="text-slate-600">{r.summary?.errors || 0} errors</span>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {showConnect && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-navy/40" onClick={() => setShowConnect(false)} />
              <div className="relative w-full max-w-lg rounded-card bg-white shadow-pop">
                <div className="border-b border-line px-5 py-3.5 text-sm font-bold text-navy">New Connection</div>
                <div className="space-y-3 p-5">
                  <Select label="Integration" value={connForm.integration_id} onChange={(e) => setConnForm({ ...connForm, integration_id: e.target.value })}>
                    <option value="">Select...</option>
                    {(integrations.data ?? []).map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </Select>
                  <Input label="Connection Name" value={connForm.name} onChange={(e) => setConnForm({ ...connForm, name: e.target.value })} placeholder="My Connection" />
                  <Input label="Base URL" value={connForm.base_url} onChange={(e) => setConnForm({ ...connForm, base_url: e.target.value })} placeholder="https://api.example.com" />
                  <Select label="Auth Type" value={connForm.auth_type} onChange={(e) => setConnForm({ ...connForm, auth_type: e.target.value })}>
                    <option value="api_key">API Key</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic</option>
                  </Select>
                  {connForm.auth_type === 'api_key' && (
                    <>
                      <Input label="API Key Header" value={connForm.api_key_header} onChange={(e) => setConnForm({ ...connForm, api_key_header: e.target.value })} />
                      <Input label="API Key Value" value={connForm.api_key_value} onChange={(e) => setConnForm({ ...connForm, api_key_value: e.target.value })} />
                    </>
                  )}
                  {connForm.auth_type === 'bearer' && (
                    <Input label="Bearer Token" value={connForm.bearer_token} onChange={(e) => setConnForm({ ...connForm, bearer_token: e.target.value })} />
                  )}
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="secondary" onClick={() => setShowConnect(false)}>Cancel</Button>
                    <Button onClick={() => createConn.mutate()} loading={createConn.isPending}>Create Connection</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeConn && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-navy/40" onClick={() => setActiveConn(null)} />
              <div className="relative w-full max-w-2xl rounded-card bg-white shadow-pop">
                <div className="border-b border-line px-5 py-3.5 text-sm font-bold text-navy">Configure Checks – {activeConn.name}</div>
                <div className="max-h-[70vh] overflow-y-auto p-5">
                  <div className="mb-4 grid gap-2 sm:grid-cols-2">
                    <Input label="Check Name" value={checkForm.name} onChange={(e) => setCheckForm({ ...checkForm, name: e.target.value })} />
                    <Input label="Endpoint" value={checkForm.endpoint} onChange={(e) => setCheckForm({ ...checkForm, endpoint: e.target.value })} />
                    <Input label="JSON Path" value={checkForm.path} onChange={(e) => setCheckForm({ ...checkForm, path: e.target.value })} placeholder="data.mfa_enabled" />
                    <div className="flex gap-2">
                      <Select label="Operator" value={checkForm.operator} onChange={(e) => setCheckForm({ ...checkForm, operator: e.target.value })}>
                        <option value="eq">equals</option>
                        <option value="truthy">is true</option>
                        <option value="exists">exists</option>
                      </Select>
                      <Input label="Expected" value={checkForm.value} onChange={(e) => setCheckForm({ ...checkForm, value: e.target.value })} />
                    </div>
                    <Input label="Map to Assessment ID (optional)" value={checkForm.map_to_assessment_id} onChange={(e) => setCheckForm({ ...checkForm, map_to_assessment_id: e.target.value })} />
                  </div>
                  <Button size="sm" onClick={() => addCheck.mutate()} loading={addCheck.isPending}><Plus size={14} /> Add Check</Button>
                  <div className="mt-4 divide-y divide-line">
                    {(checksQ.data ?? []).map((ch: any) => (
                      <div key={ch.id} className="flex items-center justify-between py-2.5 text-xs">
                        <div>
                          <div className="font-semibold text-navy">{ch.name}</div>
                          <div className="text-[10px] text-slate-600">{ch.method} {ch.endpoint} → {ch.rule?.path} {ch.rule?.operator} {ch.rule?.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end border-t border-line px-5 py-3">
                  <Button variant="secondary" onClick={() => setActiveConn(null)}>Close</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
