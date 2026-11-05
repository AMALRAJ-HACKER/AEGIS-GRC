import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { OrgContext } from '@/lib/types';

const EMPTY_ORG: OrgContext = { orgId: '', role: 'staff', org: null, profile: null, userId: '' };

/** Current user's active organization, role, and profile — the context every screen needs. */
export function useCurrentOrg() {
  const { session } = useAuth();
  const userId = session?.user?.id ?? '';

  return useQuery({
    queryKey: ['currentOrg', userId],
    queryFn: async (): Promise<OrgContext> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return EMPTY_ORG;

      const { data: membership } = await supabase
        .from('organization_memberships')
        .select('role, organization_id, organizations(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();

      return {
        orgId: membership?.organization_id ?? '',
        role: (membership?.role ?? 'staff') as OrgContext['role'],
        org: membership?.organizations ?? null,
        profile: profile ?? null,
        userId: user.id,
      };
    },
    // Don't query until we have a signed-in user.
    enabled: !!userId,
    staleTime: 60_000,
    retry: 1,
  });
}
