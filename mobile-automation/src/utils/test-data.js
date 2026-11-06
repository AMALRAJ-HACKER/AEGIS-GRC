// AEGIS GRC - Mobile Test Data & Fixture Registry
module.exports = {
  users: {
    superAdmin: {
      email: 'superadmin@aegis-grc.internal',
      password: 'AegisSecurePassword#2026',
      role: 'super_admin',
      fullName: 'Chief Compliance Officer',
      orgId: 'org-enterprise-01',
    },
    orgAdmin: {
      email: 'admin@aegis-grc.internal',
      password: 'AdminPassword#2026',
      role: 'org_admin',
      fullName: 'IT Director',
      orgId: 'org-enterprise-01',
    },
    analyst: {
      email: 'analyst@aegis-grc.internal',
      password: 'AnalystPassword#2026',
      role: 'grc_analyst',
      fullName: 'Lead GRC Analyst',
      orgId: 'org-enterprise-01',
    },
    itSecurity: {
      email: 'security@aegis-grc.internal',
      password: 'SecurityPassword#2026',
      role: 'it_security',
      fullName: 'SecOps Engineer',
      orgId: 'org-enterprise-01',
    },
    auditor: {
      email: 'auditor@external-audit.com',
      password: 'AuditorPassword#2026',
      role: 'auditor',
      fullName: 'External Auditor',
      orgId: 'org-enterprise-01',
    },
    invalidUser: {
      email: 'invalid.user@nonexistent.domain',
      password: 'WrongPassword123!',
    },
    lockedUser: {
      email: 'locked.account@aegis-grc.internal',
      password: 'LockedPassword#2026',
    },
  },
  frameworks: [
    { code: 'SOC2', name: 'SOC 2 Type II (2024)', totalControls: 64, category: 'Security & Availability' },
    { code: 'ISO27001', name: 'ISO/IEC 27001:2022', totalControls: 93, category: 'Information Security' },
    { code: 'HIPAA', name: 'HIPAA Security Rule', totalControls: 42, category: 'Healthcare Privacy' },
    { code: 'NIST_CSF', name: 'NIST CSF 2.0', totalControls: 106, category: 'Cybersecurity Framework' },
    { code: 'PCI_DSS', name: 'PCI-DSS v4.0', totalControls: 78, category: 'Payment Security' },
    { code: 'GDPR', name: 'EU GDPR Compliance', totalControls: 35, category: 'Data Privacy' },
  ],
  sampleRisks: [
    { id: 'RSK-001', title: 'Unencrypted S3 Bucket Backup', likelihood: 'Likely', impact: 'Critical', score: 20, severity: 'critical' },
    { id: 'RSK-002', title: 'Single Point of Failure in Production DB', likelihood: 'Possible', impact: 'Major', score: 12, severity: 'high' },
    { id: 'RSK-003', title: 'Delayed Security Patching on Bastion Hosts', likelihood: 'Unlikely', impact: 'Moderate', score: 6, severity: 'medium' },
  ],
  sampleTasks: [
    { id: 'TSK-101', title: 'Review Annual Access Permissions Matrix', priority: 'High', status: 'in_progress', dueDate: '2026-11-20' },
    { id: 'TSK-102', title: 'Upload Q3 Penetration Test Remediation Evidence', priority: 'Critical', status: 'needs_review', dueDate: '2026-11-15' },
    { id: 'TSK-103', title: 'Quarterly Vendor SOC 2 Attestation Review', priority: 'Medium', status: 'not_started', dueDate: '2026-11-30' },
  ],
  otpScenarios: {
    valid: '654321',
    invalid: '000000',
    expired: '111111',
  },
};
