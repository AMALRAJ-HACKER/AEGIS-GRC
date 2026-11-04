import type { Role } from '@/lib/types';

// Permission tiers per PRD 2.1 / RBAC matrix. Backend enforcement is RLS;
// these helpers only shape the UI.

export const isAdmin = (role: Role | string) => ['super_admin', 'org_admin'].includes(role);
export const isReviewer = (role: Role | string) => ['super_admin', 'org_admin', 'grc_analyst', 'auditor'].includes(role);
export const isAnalyst = (role: Role | string) => ['super_admin', 'org_admin', 'grc_analyst'].includes(role);
export const canAddRisk = (role: Role | string) => ['super_admin', 'org_admin', 'grc_analyst', 'it_security'].includes(role);
export const canActivateFramework = (role: Role | string) => ['super_admin', 'org_admin', 'grc_analyst'].includes(role);
export const canDeleteEvidence = (role: Role | string) => ['super_admin', 'org_admin'].includes(role);
export const canDeleteTask = (role: Role | string) => ['super_admin', 'org_admin'].includes(role);
export const canViewAuditLog = (role: Role | string) => ['super_admin', 'org_admin', 'grc_analyst', 'auditor'].includes(role);
export const canManageTeam = (role: Role | string) => ['super_admin', 'org_admin'].includes(role);
export const canEditOrg = (role: Role | string) => ['super_admin', 'org_admin'].includes(role);
export const isReadOnly = (role: Role | string) => ['auditor', 'management'].includes(role);

export const ROLE_OPTIONS: { value: Role; label: string; description: string }[] = [
  { value: 'org_admin', label: 'Administrator', description: 'Full control including team, settings, and deletions' },
  { value: 'grc_analyst', label: 'GRC Analyst', description: 'Frameworks, controls, risks, tasks, evidence, reports' },
  { value: 'it_security', label: 'IT / Security', description: 'Add risks, complete assigned tasks, upload evidence' },
  { value: 'auditor', label: 'Auditor', description: 'Read-only access including the audit log' },
  { value: 'management', label: 'Management', description: 'Read-only oversight of dashboards and reports' },
  { value: 'staff', label: 'Staff / Control Owner', description: 'Own assigned tasks and evidence uploads' },
];
