import type { Role } from '@/lib/types';

// Permission matrix per the RBAC specification.
// Backend enforcement is via RLS; these helpers only shape the UI.

// Activate Frameworks: super_admin + org_admin only
export const canActivateFramework = (role: Role | string) =>
  ['super_admin', 'org_admin'].includes(
    String(role).trim().toLowerCase(),
  );

// Create Risks: super_admin + org_admin + grc_analyst + it_security
export const canCreateRisk = (role: Role | string) =>
  ['super_admin', 'org_admin', 'grc_analyst', 'it_security'].includes(role);

// Alias for existing imports
export const canAddRisk = canCreateRisk;

// Create Tasks: super_admin + org_admin + grc_analyst + it_security
export const canCreateTask = (role: Role | string) =>
  ['super_admin', 'org_admin', 'grc_analyst', 'it_security'].includes(role);

// Aliases for existing checks
export const isAdmin = (role: Role | string) => ['super_admin', 'org_admin'].includes(role);
export const isReviewer = (role: Role | string) => ['super_admin', 'org_admin', 'grc_analyst', 'auditor'].includes(role);
export const isAnalyst = (role: Role | string) => ['super_admin', 'org_admin', 'grc_analyst'].includes(role);
export const canDeleteEvidence = (role: Role | string) => ['super_admin', 'org_admin'].includes(role);
export const canDeleteTask = (role: Role | string) => ['super_admin', 'org_admin'].includes(role);
export const canViewAuditLog = (role: Role | string) => ['super_admin', 'org_admin', 'grc_analyst', 'auditor'].includes(role);
export const canManageTeam = (role: Role | string) => ['super_admin', 'org_admin'].includes(role);
export const canEditOrg = (role: Role | string) => ['super_admin', 'org_admin'].includes(role);
export const isReadOnly = (role: Role | string) => ['auditor', 'management'].includes(role);

// Role options — must include super_admin
export const ROLE_OPTIONS: { value: Role; label: string; description: string }[] = [
  { value: 'super_admin', label: 'Super Admin', description: 'Full platform access' },
  { value: 'org_admin', label: 'Administrator', description: 'Organization-level control' },
  { value: 'grc_analyst', label: 'GRC Analyst', description: 'Frameworks, controls, risks, tasks, evidence, reports' },
  { value: 'it_security', label: 'IT / Security', description: 'Add risks, complete assigned tasks, upload evidence' },
  { value: 'auditor', label: 'Auditor', description: 'Read-only access including the audit log' },
  { value: 'management', label: 'Management', description: 'Read-only oversight of dashboards and reports' },
  { value: 'staff', label: 'Staff / Control Owner', description: 'Own assigned tasks and evidence uploads' },
];
// Framework Management (Framework Library spec): Super Admin + Compliance Manager
// (mapped to org_admin in this codebase) may create/edit/publish/archive.
// Auditor stays read-only. Existing helpers above are unchanged.
export const canCreateFramework = (role: Role | string) => ['super_admin', 'org_admin'].includes(String(role).trim().toLowerCase());
export const canEditFramework = canCreateFramework;
export const canPublishFramework = canCreateFramework;
export const canArchiveFramework = canCreateFramework;
export const canCloneFramework = canCreateFramework;
export const canImportFramework = canCreateFramework;
