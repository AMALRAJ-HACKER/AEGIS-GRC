import { supabase } from '@/lib/supabase';

export async function fetchIntegrations() {
  const { data, error } = await supabase.from('integrations').select('*').eq('is_enabled', true).order('name');
  if (error) throw error;
  return data ?? [];
}

export async function fetchConnections(orgId: string) {
  const { data, error } = await supabase
    .from('integration_connections')
    .select('*, integration:integrations(*), runs:integration_runs(id, status, summary, started_at, finished_at)')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createConnection(orgId: string, userId: string, payload: any) {
  const { data, error } = await supabase
    .from('integration_connections')
    .insert({
      organization_id: orgId,
      integration_id: payload.integration_id,
      name: payload.name,
      auth_type: payload.auth_type || 'api_key',
      credentials: payload.credentials || {},
      config: payload.config || {},
      created_by: userId,
      status: 'inactive',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchChecks(connectionId: string) {
  const { data, error } = await supabase
    .from('integration_checks')
    .select('*, assessment:map_to_assessment_id(id, framework_controls(control_id, title))')
    .eq('connection_id', connectionId)
    .order('created_at');
  if (error) throw error;
  return data ?? [];
}

export async function upsertCheck(payload: any) {
  const { data, error } = await supabase.from('integration_checks').upsert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function runConnection(connectionId: string) {
  const { data, error } = await supabase.functions.invoke('integration-runner', {
    body: { connection_id: connectionId },
  });
  if (error) throw error;
  return data;
}

export async function fetchRuns(orgId: string, limit = 10) {
  const { data, error } = await supabase
    .from('integration_runs')
    .select('*, connection:integration_connections(name, integration:integrations(name))')
    .eq('organization_id', orgId)
    .order('started_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function fetchResults(runId: string) {
  const { data, error } = await supabase
    .from('integration_results')
    .select('*, check:integration_checks(name, map_to_assessment_id)')
    .eq('run_id', runId)
    .order('created_at');
  if (error) throw error;
  return data ?? [];
}
