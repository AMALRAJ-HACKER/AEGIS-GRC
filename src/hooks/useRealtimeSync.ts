import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const TABLES = [
  'profiles', 'organizations', 'organization_memberships', 'frameworks', 'framework_controls',
  'compliance_assessments', 'risks', 'risk_history', 'evidence', 'evidence_versions',
  'evidence_control_links', 'tasks', 'task_comments', 'audits', 'audit_findings',
  'notifications', 'activity_logs', 'ai_conversations', 'ai_messages', 'invitations',
];

/**
 * Live cross-device sync: subscribes to Postgres changes on every workspace
 * table and refreshes cached queries. A change made on mobile shows up here
 * instantly, and vice versa. Same channel name as the mobile app.
 */
export function useRealtimeSync(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const channel = supabaseChannel();
    const invalidate = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => queryClient.invalidateQueries(), 400);
    };
    for (const table of TABLES) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, invalidate);
    }
    channel.subscribe();
    return () => {
      if (timer) clearTimeout(timer);
      supabaseRemove(channel);
    };
  }, [enabled, queryClient]);
}

// tiny indirection so the import stays in one place
import { supabase } from '@/lib/supabase';
function supabaseChannel() {
  return supabase.channel('aegis-workspace-sync');
}
function supabaseRemove(ch: any) {
  supabase.removeChannel(ch);
}
