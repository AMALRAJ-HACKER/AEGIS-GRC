-- =========================================================================
-- AEGIS GRC — Security Hardening Migration
-- Migration: 0010_security_rls_hardening.sql
-- Remediates:
--   SEC-01: Client-Side Authorization Reliance & Incomplete RLS Role Gates
--   SEC-02: Cross-Tenant IDOR Scope Enforcement
--   SEC-07: Immutable Activity Logging for Destructive Actions
-- =========================================================================

-- 1. Helper function: Get calling user's active role in the organization
CREATE OR REPLACE FUNCTION public.get_auth_org_role(p_org_id UUID)
RETURNS TEXT AS $$
  SELECT role
  FROM public.organization_memberships
  WHERE organization_id = p_org_id
    AND user_id = auth.uid()
    AND status = 'active'
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Evidence Hardening: Deletions strictly restricted to Admins
DROP POLICY IF EXISTS "Strict evidence delete policy" ON public.evidence;
CREATE POLICY "Strict evidence delete policy"
ON public.evidence
FOR DELETE
TO authenticated
USING (
  public.get_auth_org_role(organization_id) IN ('super_admin', 'org_admin')
);

-- 3. Risk Management Hardening: Mutations restricted to Security & Analyst Roles
DROP POLICY IF EXISTS "Strict risk mutation policy" ON public.risks;
CREATE POLICY "Strict risk mutation policy"
ON public.risks
FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_memberships
    WHERE user_id = auth.uid() AND status = 'active'
  )
)
WITH CHECK (
  public.get_auth_org_role(organization_id) IN ('super_admin', 'org_admin', 'grc_analyst', 'it_security')
);

-- 4. Activity Logs Protection: Enforce Append-Only (Prevent Log Tampering / Repudiation)
REVOKE UPDATE, DELETE, TRUNCATE ON public.activity_logs FROM authenticated, anon, public;

-- 5. Automated Audit Logging Trigger for Evidence Purges
CREATE OR REPLACE FUNCTION public.audit_evidence_deletion()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.activity_logs (
    organization_id,
    actor_id,
    action,
    entity_type,
    entity_id,
    details,
    created_at
  ) VALUES (
    OLD.organization_id,
    auth.uid(),
    'EVIDENCE_DELETED',
    'evidence',
    OLD.id,
    jsonb_build_object(
      'title', OLD.title,
      'file_path', OLD.file_path,
      'deleted_by', auth.uid()
    ),
    now()
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_evidence_delete ON public.evidence;
CREATE TRIGGER trg_audit_evidence_delete
AFTER DELETE ON public.evidence
FOR EACH ROW EXECUTE FUNCTION public.audit_evidence_deletion();
