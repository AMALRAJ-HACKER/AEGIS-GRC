import { describe, it, expect } from 'vitest';
import {
  canActivateFramework,
  canCreateRisk,
  canCreateTask,
  isAdmin,
  isReviewer,
  isAnalyst,
  canDeleteEvidence,
  canCreateFramework,
  ROLE_OPTIONS,
} from './permissions';

describe('AEGIS GRC RBAC Permissions', () => {
  it('correctly identifies super_admin and org_admin privileges', () => {
    expect(isAdmin('super_admin')).toBe(true);
    expect(isAdmin('org_admin')).toBe(true);
    expect(isAdmin('staff')).toBe(false);
    expect(isAdmin('auditor')).toBe(false);
  });

  it('validates framework activation permissions', () => {
    expect(canActivateFramework('super_admin')).toBe(true);
    expect(canActivateFramework('org_admin')).toBe(true);
    expect(canActivateFramework('grc_analyst')).toBe(false);
    expect(canActivateFramework('staff')).toBe(false);
  });

  it('validates risk creation permissions', () => {
    expect(canCreateRisk('super_admin')).toBe(true);
    expect(canCreateRisk('org_admin')).toBe(true);
    expect(canCreateRisk('grc_analyst')).toBe(true);
    expect(canCreateRisk('it_security')).toBe(true);
    expect(canCreateRisk('staff')).toBe(false);
    expect(canCreateRisk('management')).toBe(false);
  });

  it('validates task creation permissions', () => {
    expect(canCreateTask('super_admin')).toBe(true);
    expect(canCreateTask('grc_analyst')).toBe(true);
    expect(canCreateTask('auditor')).toBe(false);
  });

  it('validates reviewer and analyst role checks', () => {
    expect(isReviewer('auditor')).toBe(true);
    expect(isReviewer('staff')).toBe(false);
    expect(isAnalyst('grc_analyst')).toBe(true);
    expect(isAnalyst('staff')).toBe(false);
  });

  it('restricts evidence deletion to admins', () => {
    expect(canDeleteEvidence('super_admin')).toBe(true);
    expect(canDeleteEvidence('org_admin')).toBe(true);
    expect(canDeleteEvidence('it_security')).toBe(false);
  });

  it('verifies framework creation privileges', () => {
    expect(canCreateFramework('super_admin')).toBe(true);
    expect(canCreateFramework('org_admin')).toBe(true);
    expect(canCreateFramework('auditor')).toBe(false);
  });

  it('defines the standard roles in ROLE_OPTIONS', () => {
    const roleValues = ROLE_OPTIONS.map((r) => r.value);
    expect(roleValues).toContain('super_admin');
    expect(roleValues).toContain('org_admin');
    expect(roleValues).toContain('grc_analyst');
    expect(roleValues).toContain('it_security');
    expect(roleValues).toContain('auditor');
  });
});
