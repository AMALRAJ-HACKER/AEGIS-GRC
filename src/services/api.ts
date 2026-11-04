import { supabase } from '@/lib/supabase';
import { severityFromScore, notify } from '@/lib/format';

// ============================================================
// Frameworks & Controls (PRD 2.3) — identical queries to the mobile app
// ============================================================

export interface FrameworkStat {
  id: string; name: string; slug: string; version: string; description: string; category: string;
  total: number; implemented: number; inProgress: number; notStarted: number; needsReview: number; nonCompliant: number;
  score: number; activated: boolean; lastAssessed: string | null;
}

export async function fetchFrameworkCatalog() {
  const { data, error } = await supabase.from('frameworks').select('*, framework_controls(id)').order('category');
  if (error) throw error;
  return (data ?? []).map((f: any) => ({ ...f, controlCount: f.framework_controls?.length ?? 0, framework_controls: undefined }));
}

/** Activated frameworks for the org with real compliance stats from compliance_assessments. */
export async function fetchFrameworkStats(orgId: string): Promise<FrameworkStat[]> {
  const [{ data: frameworks, error: fErr }, { data: assessments, error: aErr }] = await Promise.all([
    supabase.from('frameworks').select('*').order('category'),
    supabase.from('compliance_assessments').select('id, status, control_id, updated_at, framework_controls!inner(framework_id)').eq('organization_id', orgId),
  ]);
  if (fErr) throw fErr;
  if (aErr) throw aErr;

  return (frameworks ?? []).map((f: any) => {
    const mine = (assessments ?? []).filter((a: any) => a.framework_controls?.framework_id === f.id);
    const count = (s: string) => mine.filter((a: any) => a.status === s).length;
    const score = mine.length ? Math.round((count('implemented') / mine.length) * 100) : 0;
    const last = mine.map((a: any) => a.updated_at).filter(Boolean).sort().pop() ?? null;
    return {
      id: f.id, name: f.name, slug: f.slug, version: f.version, description: f.description, category: f.category,
      total: mine.length, implemented: count('implemented'), inProgress: count('in_progress'),
      notStarted: count('not_started'), needsReview: count('needs_review'), nonCompliant: count('non_compliant'),
      score, activated: mine.length > 0, lastAssessed: last,
    };
  });
}

/** Activate a framework for the org: seed a not_started assessment per control. */
export async function activateFramework(orgId: string, frameworkId: string) {
  const { data: controls, error } = await supabase.from('framework_controls').select('id').eq('framework_id', frameworkId);
  if (error) throw error;
  if (!controls?.length) return 0;
  const rows = controls.map((c) => ({ organization_id: orgId, control_id: c.id, status: 'not_started' }));
  const { error: insErr } = await supabase.from('compliance_assessments').upsert(rows, { onConflict: 'organization_id,control_id', ignoreDuplicates: true });
  if (insErr) throw insErr;
  return controls.length;
}

export interface ControlRow {
  assessmentId: string | null; controlId: string; controlCode: string; title: string; description: string;
  category: string; guidance: string; status: string; notes: string | null; updatedAt: string | null;
}

export async function fetchControls(orgId: string, frameworkId: string) {
  const [{ data: fw, error: fwErr }, { data: controls, error: cErr }, { data: assessments, error: aErr }] = await Promise.all([
    supabase.from('frameworks').select('*').eq('id', frameworkId).single(),
    supabase.from('framework_controls').select('*').eq('framework_id', frameworkId).order('control_id'),
    supabase.from('compliance_assessments').select('*').eq('organization_id', orgId),
  ]);
  if (fwErr) throw fwErr; if (cErr) throw cErr; if (aErr) throw aErr;
  const byControl = new Map((assessments ?? []).map((a: any) => [a.control_id, a]));
  const rows: ControlRow[] = (controls ?? []).map((c: any) => {
    const a = byControl.get(c.id) as any;
    return {
      assessmentId: a?.id ?? null, controlId: c.id, controlCode: c.control_id, title: c.title,
      description: c.description ?? '', category: c.category ?? 'General', guidance: c.implementation_guidance ?? '',
      status: a?.status ?? 'not_started', notes: a?.implementation_notes ?? null, updatedAt: a?.updated_at ?? null,
    };
  });
  return { framework: fw, controls: rows };
}

export async function setAssessmentStatus(assessmentId: string, status: string, notes?: string | null) {
  const { error } = await supabase.from('compliance_assessments')
    .update({ status, ...(notes !== undefined ? { implementation_notes: notes } : {}), last_assessed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', assessmentId);
  if (error) throw error;
}

export async function setAssessmentOwner(assessmentId: string, ownerId: string | null) {
  const { error } = await supabase.from('compliance_assessments').update({ owner_id: ownerId, updated_at: new Date().toISOString() }).eq('id', assessmentId);
  if (error) throw error;
}

// ============================================================
// Risks (PRD 2.4)
// ============================================================

export async function fetchRisks(orgId: string) {
  const { data, error } = await supabase.from('risks')
    .select('*, owner:profiles!risks_owner_id_fkey(full_name)')
    .eq('organization_id', orgId).order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchRiskHistory(riskId: string) {
  const { data, error } = await supabase.from('risk_history')
    .select('*, actor:profiles(full_name)').eq('risk_id', riskId).order('created_at', { ascending: false }).limit(20);
  if (error) throw error;
  return data ?? [];
}

export async function createRisk(orgId: string, userId: string, fields: any) {
  const inherent = fields.likelihood * fields.impact;
  const residual = fields.residual_likelihood && fields.residual_impact ? fields.residual_likelihood * fields.residual_impact : null;
  const { data, error } = await supabase.from('risks').insert({
    organization_id: orgId, title: fields.title, description: fields.description ?? null, category: fields.category ?? null,
    likelihood: fields.likelihood, impact: fields.impact, severity: severityFromScore(inherent),
    residual_likelihood: fields.residual_likelihood ?? null, residual_impact: fields.residual_impact ?? null,
    residual_score: residual, existing_safeguards: fields.existing_safeguards ?? null,
    mitigation_plan: fields.mitigation_plan ?? null, target_date: fields.target_date || null,
    status: fields.status ?? 'open', owner_id: userId,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function updateRisk(id: string, fields: any) {
  const patch: any = { ...fields, updated_at: new Date().toISOString() };
  if (fields.likelihood && fields.impact) {
    patch.severity = severityFromScore(fields.likelihood * fields.impact);
  }
  if (fields.residual_likelihood && fields.residual_impact) {
    patch.residual_score = fields.residual_likelihood * fields.residual_impact;
  }
  const { error } = await supabase.from('risks').update(patch).eq('id', id);
  if (error) throw error;
}

export async function addRiskHistory(riskId: string, userId: string, field: string, oldValue: any, newValue: any) {
  await supabase.from('risk_history').insert({
    risk_id: riskId, changed_by: userId, field_changed: field,
    old_value: oldValue == null ? null : String(oldValue), new_value: newValue == null ? null : String(newValue),
  });
}

// ============================================================
// Tasks & Approvals (PRD 2.7)
// ============================================================

export async function fetchTasks(orgId: string) {
  const { data, error } = await supabase.from('tasks').select(`
    *, assignee:profiles!tasks_assigned_to_fkey(full_name),
    risk:linked_risk_id(title), assessment:linked_control_id(id, framework_controls(id, framework_id, control_id, title))
  `).eq('organization_id', orgId).order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createTask(orgId: string, userId: string, fields: any) {
  const linked_control_id =
    fields.linked_control_id && String(fields.linked_control_id).trim() !== ''
      ? fields.linked_control_id
      : null;

  const linked_risk_id =
    fields.linked_risk_id && String(fields.linked_risk_id).trim() !== ''
      ? fields.linked_risk_id
      : null;

  const due_date =
    fields.due_date && String(fields.due_date).trim() !== '' ? fields.due_date : null;

  const assigned_to =
    fields.assigned_to && String(fields.assigned_to).trim() !== '' ? fields.assigned_to : userId;

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      organization_id: orgId,
      title: fields.title,
      description: fields.description ?? null,
      priority: fields.priority ?? 'medium',
      due_date,
      assigned_to,
      created_by: userId,
      linked_control_id,
      linked_risk_id,
    })
    .select()
    .single();
  if (error) throw error;

  if (assigned_to && assigned_to !== userId) {
    await notify(assigned_to, orgId, 'task', 'New task assigned', fields.title, 'task', data.id);
  }
  return data;
}

export async function updateTask(id: string, fields: any, ctx?: { orgId?: string; actorId?: string }) {
  // Fetch current task to detect assignee change
  let current: any = null;
  if (fields.assigned_to && ctx?.orgId) {
    const { data } = await supabase.from('tasks').select('assigned_to, title, organization_id').eq('id', id).single();
    current = data;
  }

  const { error } = await supabase.from('tasks').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;

  // Notify new assignee if reassigned
  if (fields.assigned_to && current && fields.assigned_to !== current.assigned_to && ctx?.orgId) {
    const orgId = ctx.orgId || current.organization_id;
    if (fields.assigned_to !== ctx.actorId) {
      await notify(fields.assigned_to, orgId, 'task', 'Task assigned to you', fields.title || current.title, 'task', id);
    }
  }
}

export async function fetchComments(taskId: string) {
  const { data, error } = await supabase.from('task_comments').select('*, user:profiles(full_name)').eq('task_id', taskId).order('created_at');
  if (error) throw error;
  return data ?? [];
}

export async function addComment(taskId: string, userId: string, comment: string) {
  const { error } = await supabase.from('task_comments').insert({ task_id: taskId, user_id: userId, comment });
  if (error) throw error;
}

// ============================================================
// Evidence (PRD 2.5)
// ============================================================

export async function fetchEvidence(orgId: string) {
  const { data, error } = await supabase.from('evidence')
    .select('*, uploader:profiles!evidence_owner_id_fkey(full_name), links:evidence_control_links(control_assessment_id)')
    .eq('organization_id', orgId).order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchEvidenceLinks(evidenceId: string) {
  const { data, error } = await supabase.from('evidence_control_links')
    .select('control_assessment_id, assessment:compliance_assessments(id, status, framework_controls(control_id, title, framework_id, frameworks(name)))')
    .eq('evidence_id', evidenceId);
  if (error) throw error;
  return data ?? [];
}

/** Upload binary to the private evidence bucket (path: orgId/timestamp_name), then insert the row. */
export async function uploadEvidence(
  orgId: string,
  userId: string,
  file: { uri?: string; blob?: Blob; name: string; mimeType?: string; size?: number },
  meta: { title: string; description?: string; expiry?: string; assessmentId?: string | null },
) {
  if (file.size && file.size > 25 * 1024 * 1024) throw new Error('File exceeds the 25 MB limit.');
  const path = `${orgId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const body: any = file.blob ?? file.uri;
  const contentType = file.mimeType || 'application/octet-stream';
  const { error: upErr } = await supabase.storage.from('evidence').upload(path, body, {
    contentType,
    upsert: false,
    cacheControl: '3600',
  });
  if (upErr) throw upErr;

  const { data, error } = await supabase.from('evidence').insert({
    organization_id: orgId, title: meta.title, description: meta.description ?? null,
    type: file.name.split('.').pop()?.toLowerCase() ?? null, file_path: path, file_size: file.size ?? null,
    mime_type: file.mimeType ?? null, expiry_date: meta.expiry || null, owner_id: userId,
  }).select().single();
  if (error) throw error;

  if (meta.assessmentId) {
    await supabase.from('evidence_control_links').insert({ evidence_id: data.id, control_assessment_id: meta.assessmentId });
    await supabase.from('compliance_assessments').update({ updated_at: new Date().toISOString() }).eq('id', meta.assessmentId);
  }
  return data;
}

export async function linkEvidenceToControl(evidenceId: string, assessmentId: string) {
  const { error } = await supabase.from('evidence_control_links').insert({ evidence_id: evidenceId, control_assessment_id: assessmentId });
  if (error && error.code !== '23505') throw error; // ignore already-linked
}

export async function signedEvidenceUrl(path: string) {
  const { data, error } = await supabase.storage.from('evidence').createSignedUrl(path, 60);
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteEvidence(id: string, path: string) {
  await supabase.storage.from('evidence').remove([path]);
  const { error } = await supabase.from('evidence').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================
// Team & Org (PRD 2.10)
// ============================================================

export async function fetchMembers(orgId: string) {
  const { data, error } = await supabase.from('organization_memberships')
    .select('*, profile:profiles(email, full_name, job_title)').eq('organization_id', orgId).order('created_at');
  if (error) throw error;
  return data ?? [];
}

export async function createInvitation(orgId: string, email: string, role: string, invitedBy: string) {
  const { data, error } = await supabase.from('invitations').upsert(
    { organization_id: orgId, email: email.toLowerCase().trim(), role, invited_by: invitedBy },
    { onConflict: 'organization_id,email' },
  ).select().single();
  if (error) throw error;
  return data;
}

export async function fetchInvitations(orgId: string) {
  const { data, error } = await supabase.from('invitations').select('*').eq('organization_id', orgId).order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Redeem an invite token (supabase/migrations/0007_accept_invitation.sql). */
export async function acceptInvitation(token: string) {
  const { data, error } = await supabase.rpc('accept_invitation', { invite_token: token });
  if (error) throw error;
  return data as { organization_id: string; role: string }[];
}

export async function updateOrg(orgId: string, fields: any) {
  const { error } = await supabase.from('organizations').update(fields).eq('id', orgId);
  if (error) throw error;
}

export async function updateProfile(userId: string, fields: any) {
  const { error } = await supabase.from('profiles').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', userId);
  if (error) throw error;
}

export async function uploadAvatar(userId: string, file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png';
  const path = `${userId}/avatar.${ext}`;
  const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type });
  if (upErr) throw upErr;
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  const url = `${data.publicUrl}?v=${Date.now()}`; // cache-buster
  await updateProfile(userId, { avatar_url: url });
  return url;
}

// ============================================================
// Notifications & Activity (PRD 2.9 / 2.8)
// ============================================================

export async function fetchNotifications(userId: string) {
  const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function markAllRead(userId: string) {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
  if (error) throw error;
}

export async function markRead(notificationId: string) {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
  if (error) throw error;
}

export async function fetchActivity(orgId: string) {
  const { data, error } = await supabase.from('activity_logs')
    .select('*, actor:profiles(full_name)').eq('organization_id', orgId).order('created_at', { ascending: false }).limit(30);
  if (error) throw error;
  return data ?? [];
}

// ============================================================
// AI Assistant (PRD 2.6) — via Edge Function, key never on client
// ============================================================

export async function askAI(orgId: string, query: string, context?: string): Promise<{ answer: string; sources: string[]; is_demo: boolean }> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-assistant', {
      body: { query, organization_id: orgId, context: context ?? 'general' },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return { answer: data.answer ?? 'No response.', sources: data.sources ?? [], is_demo: !!data.is_demo };
  } catch (e) {
    return {
      answer: `[DEMO — AI service unavailable] "${query}". General guidance: prioritise controls with missing evidence, review open critical risks weekly, and keep CERT-In 6-hour reporting and 180-day log retention automated. This is not legal advice.`,
      sources: ['DPDP Act 2023', 'CERT-In Directions', 'ISO 27001'],
      is_demo: true,
    };
  }
}
