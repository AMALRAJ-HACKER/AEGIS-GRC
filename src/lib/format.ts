import { supabase } from '@/lib/supabase';

// ---------- Formatting & label helpers (shared logic with the mobile app) ----------

export const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const fmtDateTime = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' +
      new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : '—';

export const timeAgo = (iso: string) => {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
  return fmtDate(iso);
};

export const initials = (name?: string | null) =>
  (name || 'U')
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export const fmtBytes = (n?: number | null) => {
  if (!n) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

export const severityFromScore = (score: number): 'critical' | 'high' | 'medium' | 'low' =>
  score >= 17 ? 'critical' : score >= 10 ? 'high' : score >= 5 ? 'medium' : 'low';

export const severityLabel = (s: string) =>
  ({ critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' } as any)[s] ?? s;

// Control status (compliance_assessments.status)
export const controlLabel = (s: string) =>
  ({
    not_started: 'Not Started',
    in_progress: 'In Progress',
    implemented: 'Implemented',
    needs_review: 'Under Review',
    non_compliant: 'Non-Compliant',
  } as any)[s] ?? s;
export const controlTone = (s: string): 'success' | 'warning' | 'critical' | 'info' | 'default' =>
  s === 'implemented'
    ? 'success'
    : s === 'in_progress'
      ? 'warning'
      : s === 'needs_review'
        ? 'info'
        : s === 'non_compliant'
          ? 'critical'
          : 'default';

// Task status (task_status)
export const taskLabel = (s: string) =>
  ({
    todo: 'Open',
    in_progress: 'In Progress',
    pending_review: 'Pending Review',
    approved: 'Approved',
    done: 'Closed',
    blocked: 'Blocked',
  } as any)[s] ?? s;
export const taskTone = (s: string): 'success' | 'warning' | 'critical' | 'info' | 'default' =>
  s === 'done' || s === 'approved'
    ? 'success'
    : s === 'pending_review'
      ? 'info'
      : s === 'in_progress'
        ? 'warning'
        : s === 'blocked'
          ? 'critical'
          : 'default';

export const priorityLabel = (p: string) =>
  ({ critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' } as any)[p] ?? p;
export const priorityTone = (p: string): 'success' | 'warning' | 'critical' | 'info' | 'default' =>
  p === 'critical' ? 'critical' : p === 'high' ? 'warning' : p === 'medium' ? 'info' : 'default';

// Evidence health derived from expiry_date (PRD: Valid / Expiring ≤30d / Expired)
export const evidenceHealth = (expiry?: string | null): 'valid' | 'expiring' | 'expired' | 'none' => {
  if (!expiry) return 'none';
  const days = (new Date(expiry).getTime() - Date.now()) / 86400000;
  return days < 0 ? 'expired' : days <= 30 ? 'expiring' : 'valid';
};
export const healthLabel = (h: string) =>
  ({ valid: 'Valid', expiring: 'Expiring Soon', expired: 'Expired', none: 'No Expiry' } as any)[h] ?? h;
export const healthTone = (h: string): 'success' | 'warning' | 'critical' | 'default' =>
  h === 'valid' ? 'success' : h === 'expiring' ? 'warning' : h === 'expired' ? 'critical' : 'default';

export const roleLabel = (r: string) =>
  ({
    super_admin: 'Super Admin',
    org_admin: 'Administrator',
    grc_analyst: 'GRC Analyst',
    it_security: 'IT / Security',
    auditor: 'Auditor',
    management: 'Management',
    staff: 'Staff',
  } as any)[r] ?? r;

export const isOverdue = (due?: string | null) => !!due && new Date(due).getTime() < Date.now();

// ---------- Activity log (append-only audit trail) ----------

export async function logActivity(orgId: string, action: string, resourceType: string, resourceId?: string | null, metadata?: any) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from('activity_logs').insert({
      organization_id: orgId,
      actor_id: user?.id ?? null,
      action,
      resource_type: resourceType,
      resource_id: resourceId ?? null,
      metadata: metadata ?? null,
    });
  } catch (e) {
    console.warn('[AEGIS] logActivity failed:', (e as any)?.message);
  }
}

export async function notify(userId: string, orgId: string, type: string, title: string, body?: string, resourceType?: string, resourceId?: string) {
  try {
    // Try RPC first (bypasses RLS with security definer)
    try {
      const { error: rpcErr } = await supabase.rpc('create_notification' as any, {
        p_user_id: userId,
        p_organization_id: orgId,
        p_type: type,
        p_title: title,
        p_body: body ?? null,
        p_resource_type: resourceType ?? null,
        p_resource_id: resourceId ?? null,
      });
      if (!rpcErr) {
        return;
      }
      console.warn('[AEGIS] notify rpc failed:', rpcErr.message);
    } catch (rpcErr) {
      console.warn('[AEGIS] notify rpc threw:', (rpcErr as any)?.message);
    }

    // Fallback to direct insert
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      organization_id: orgId,
      type,
      title,
      body: body ?? null,
      resource_type: resourceType ?? null,
      resource_id: resourceId ?? null,
    });
    if (error) {
      console.warn('[AEGIS] notify insert failed:', error.message);
    }
  } catch (e) {
    console.warn('[AEGIS] notify failed:', (e as any)?.message);
  }
}

// ---------- CSV export helper (reports, audit log) ----------

export function downloadCsv(filename: string, rows: Record<string, any>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const esc = (v: any) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
