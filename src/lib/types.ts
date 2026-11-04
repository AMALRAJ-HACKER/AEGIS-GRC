// Mirrors of the Postgres enums in supabase/migrations/0001_initial.sql (+ 0003_prd additions)

export type Role =
  | 'super_admin'
  | 'org_admin'
  | 'grc_analyst'
  | 'it_security'
  | 'auditor'
  | 'management'
  | 'staff';

export type ControlStatus = 'not_started' | 'in_progress' | 'implemented' | 'needs_review' | 'non_compliant';
export type RiskSeverity = 'critical' | 'high' | 'medium' | 'low';
export type EvidenceStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type TaskStatus = 'todo' | 'in_progress' | 'pending_review' | 'approved' | 'done' | 'blocked';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface OrgContext {
  orgId: string;
  role: Role;
  org: any;
  profile: any;
  userId: string;
}
