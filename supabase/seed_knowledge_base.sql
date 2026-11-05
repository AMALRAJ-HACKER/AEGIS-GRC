-- ============================================================
-- SEED DATA: Knowledge Base Engine (Phase 1)
-- Additive only — inserts sample compliance data into new tables
-- ============================================================

-- ============================================================
-- control_guidance — Sample control guidance entries
-- ============================================================
INSERT INTO control_guidance (tenant_id, framework, control_id, title, description, content, category) VALUES
('00000000-0000-0000-0000-000000000001', 'SOC 2', 'CC6.1', 'Control Environment', 'Establish a control environment', 'The organization demonstrates a commitment to integrity and ethical values. This includes operating with integrity, establishing a code of conduct, and expecting employees to act in accordance with the code of conduct.', 'Control Environment'),
('00000000-0000-0000-0000-000000000001', 'SOC 2', 'CC6.2', 'Risk Assessment', 'Perform risk assessment to identify and analyze risk to the organization', 'The organization performs a risk assessment to identify and analyze risks to the achievement of objectives. This includes determining how risks relate to the internal control system, and the organization’s risk assessment is periodically repeated or updated.', 'Risk Assessment'),
('00000000-0000-0000-0000-000000000001', 'SOC 2', 'CC7.1', 'System Monitoring', 'Monitor the system and detect changes', 'The organization monitors the system and detects changes that may indicate a deficiency in the control environment or a change in the risk profile.', 'System Monitoring'),
('00000000-0000-0000-0000-000000000001', 'ISO 27001', 'A.5.15', 'Information transfer of information assets', 'Transfer of information assets', 'When transferring information assets to third parties or over networks, the organization shall protect the assets from unauthorized access, disclosure, modification, or destruction.', 'Information Transfer'),
('00000000-0000-0000-0000-000000000001', 'ISO 27001', 'A.8.1', 'Responsibilities of security management', 'Responsibilities of security management', 'Top management shall demonstrate leadership and commitment with respect to the information security management system by ensuring that the necessary resources are available for the information security management system.', 'Security Management'),
('00000000-0000-0000-0000-000000000001', 'GDPR', 'Art.32', 'Security of personal data', 'Security of personal data', 'Taking into account the nature, scope, context and purposes of processing as well as the risks of varying likelihood and severity for the rights and freedoms of natural persons, the controller and the processor shall implement appropriate technical and organisational measures to ensure a level of security appropriate to the risk.', 'GDPR Security'),

-- ============================================================
-- framework_guidance — Sample framework guidance entries
-- ============================================================
('00000000-0000-0000-0000-000000000001', 'SOC 2', 'SOC 2', 'SOC 2 Type II', 'Service Organization Control 2', 'SOC 2 Type II reports provide assurance over the controls at a service organization related to security, availability, processing integrity, confidentiality, and privacy. SOC 2 is based on the Trust Services Criteria.', 'SOC 2 Type II reports assess controls across five Trust Services Criteria: Security, Availability, Processing Integrity, Confidentiality, and Privacy. The report is valid for one year and must be issued by a CPA firm.'),
('00000000-0000-0000-0000-000000000001', 'ISO 27001', 'ISO 27001', 'ISO 27001', 'Information Security Management', 'ISO 27001 is an international standard for an Information Security Management System (ISMS). It provides a systematic approach to managing sensitive data so that it remains secure. Certification requires a formal audit by an accredited certification body.'),
('00000000-0000-0000-0000-000000000001', 'GDPR', 'GDPR', 'General Data Protection Regulation', 'EU General Data Protection Regulation', 'The GDPR is a regulation in EU law on data protection and privacy for all individual people within the European Union and the European Economic Area. It also addresses the transfer of personal data outside the EU and EEA areas. The GDPR aims to give control to individuals over their personal data.'),
('00000000-0000-0000-0000-000000000001', 'NIS2', 'NIS2', 'Network and Information Systems Security', 'Network and Information Systems Security Directive', 'The NIS2 Directive is the European Union''s cybersecurity directive. It aims to improve the level of cybersecurity across the EU. It covers essential services and important operators in critical sectors such as energy, transport, banking, and digital providers.'),
('00000000-0000-0000-0000-000000000001', 'PCI DSS', 'PCI DSS', 'Payment Card Industry Data Security Standard', 'PCI DSS', 'PCI DSS is a global information security standard for organizations that handle branded credit cards from the major card schemes. The standard is administered by the Payment Card Industry Security Standards Council.'),

-- ============================================================
-- evidence_requirements — Sample evidence mappings
-- ============================================================
('00000000-0000-0000-0000-000000000001', 'SOC 2', 'CC6.1', 'User Access Reviews', 'Periodic review of user access rights', 'Access control matrices, access review reports, user access logs, termination checklists', 'annual'),
('00000000-0000-0000-0000-000000000001', 'SOC 2', 'CC6.2', 'Risk Assessment Evidence', 'Risk assessment documentation', 'Risk assessment reports, threat models, risk registers, mitigation plans', 'annual'),
('00000000-0000-0000-0000-000000000001', 'ISO 27001', 'A.5.15', 'Information transfer agreements', 'Contracts and agreements for information transfer', 'Information transfer agreements, encryption standards, network security configurations', 'on-demand'),
('00000000-0000-0000-0000-000000000001', 'ISO 27001', 'A.8.1', 'Security management responsibilities', 'Documented roles and responsibilities', 'Job descriptions, security management meeting minutes, resource allocation records', 'annual'),
('00000000-0000-0000-0000-000000000001', 'GDPR', 'Art.32', 'Security measures documentation', 'Documentation of security measures', 'Technical/organizational measures documentation, breach notification procedures, audit logs', 'on-demand'),

-- ============================================================
-- risk_library — Sample risk definitions
-- ============================================================
('00000000-0000-0000-0000-000000000001', 'Third Party Security Risk', 'Third party security risk', 'Risk arising from third-party vendors, suppliers, or partners with access to systems or data', 'high', '["CC6.1", "CC6.2"]', now()),
('00000000-0000-0000-0000-000000000001', 'Data Breach Risk', 'Data breach risk', 'Risk of unauthorized access to or disclosure of sensitive data', 'critical', '["CC6.1", "A.5.15"]', now()),
('00000000-0000-0000-0000-000000000001', 'Operational Downtime Risk', 'Operational downtime risk', 'Risk of business disruption due to system outages or failures', 'medium', '["CC7.1"]', now()),
('00000000-0000-0000-0000-000000000001', 'Regulatory Fine Risk', 'Regulatory fine risk', 'Risk of financial penalties due to non-compliance with regulations', 'high', '["Art.32", "GDPR"]', now()),

-- ============================================================
-- remediation_library — Sample remediation patterns
-- ============================================================
('00000000-0000-0000-0000-000000000001', 'Missing Vendor Assessment', 'Complete Vendor Security Assessment', 'Remediate missing vendor security assessments by conducting thorough security reviews', 'high', '["Complete Vendor Security Assessment", "Review AWS Compliance Certifications", "Update Vendor Risk Profile"]', '["CC6.1", "CC6.2"]', now()),
('00000000-0000-0000-0000-000000000001', 'Inadequate Access Controls', 'Implement Enhanced Access Controls', 'Remediate inadequate access controls by implementing principle of least privilege and MFA', 'medium', '["Implement MFA for all accounts", "Review access matrix quarterly", "Revoke terminated user access immediately"]', '["CC6.1"]', now()),

-- ============================================================
-- policy_templates — Sample policy templates (template engine, no generative AI)
-- ============================================================
('00000000-0000-0000-0000-000000000001', 'access_control', 'Access Control Policy', 'Template for access control policy', 'Standard access control policy template for organizational use', 'Policy: {{policy_title}}\n\nOrganization: {{org_name}}\n\nReview Date: {{review_date}}\n\nPolicy Owner: {{policy_owner}}\n\nFramework: {{framework}}\n\n1. Purpose\n2. Scope\n3. Access Control Objectives\n4. Roles and Responsibilities\n5. Access Control Procedures\n5.1. User Provisioning\n5.2. Access Modification\n5.3. Access Termination\n5.4. Periodic Review\n6. Related Controls\n7. Related Risks', '{"org_name": "string", "review_date": "date", "policy_owner": "string", "framework": "string"}', now()),

('00000000-0000-0000-0000-000000000001', 'vendor_security', 'Vendor Security Policy', 'Template for vendor security policy', 'Standard vendor security policy template', 'Policy: {{policy_title}}\n\nOrganization: {{org_name}}\n\nReview Date: {{review_date}}\n\nPolicy Owner: {{policy_owner}}\n\nFramework: {{framework}}\n\n1. Purpose\n2. Scope\n3. Vendor Risk Assessment\n4. Security Requirements\n5. Monitoring and Review\n6. Related Controls\n7. Related Risks', '{"org_name": "string", "review_date": "date", "policy_owner": "string", "framework": "string"}', now()),

('00000000-0000-0000-0000-000000000001', 'isms', 'ISMS Policy', 'Template for Information Security Management System policy', 'Standard ISMS policy template', 'Policy: {{policy_title}}\n\nOrganization: {{org_name}}\n\nReview Date: {{review_date}}\n\nPolicy Owner: {{policy_owner}}\n\nFramework: {{framework}}\n\n1. Introduction\n2. Scope\n3. ISMS Objectives\n4. Leadership and Commitment\n5. Risk Assessment\n6. Control Implementation\n7. Monitoring and Measurement\n8. Related Controls\n9. Related Risks', '{"org_name": "string", "review_date": "date", "policy_owner": "string", "framework": "string"}', now()),

('00000000-0000-0000-0000-000000000001', 'password_policy', 'Password Policy', 'Template for password policy', 'Standard password policy template', 'Policy: {{policy_title}}\n\nOrganization: {{org_name}}\n\nReview Date: {{review_date}}\n\nPolicy Owner: {{policy_owner}}\n\nFramework: {{framework}}\n\n1. Purpose\n2. Password Complexity Requirements\n3. Password Expiration\n4. Multi-Factor Authentication\n5. Related Controls\n6. Related Risks', '{"org_name": "string", "review_date": "date", "policy_owner": "string", "framework": "string"}', now()),

('00000000-0000-0000-0000-000000000001', 'incident_response', 'Incident Response Policy', 'Template for incident response policy', 'Standard incident response policy template', 'Policy: {{policy_title}}\n\nOrganization: {{org_name}}\n\nReview Date: {{review_date}}\n\nPolicy Owner: {{policy_owner}}\n\nFramework: {{framework}}\n\n1. Purpose\n2. Scope\n3. Incident Classification\n4. Response Procedures\n5. Communication Plan\n6. Related Controls\n7. Related Risks', '{"org_name": "string", "review_date": "date", "policy_owner": "string", "framework": "string"}', now()),

('00000000-0000-0000-0000-000000000001', 'business_continuity', 'Business Continuity Policy', 'Template for business continuity policy', 'Standard business continuity policy template', 'Policy: {{policy_title}}\n\nOrganization: {{org_name}}\n\nReview Date: {{review_date}}\n\nPolicy Owner: {{policy_owner}}\n\nFramework: {{framework}}\n\n1. Purpose\n2. Scope\n3. Business Impact Analysis\n4. Recovery Strategies\n5. Plan Maintenance\n6. Related Controls\n7. Related Risks', '{"org_name": "string", "review_date": "date", "policy_owner": "string", "framework": "string"}', now()),

('00000000-0000-0000-0000-000000000001', 'disaster_recovery', 'Disaster Recovery Policy', 'Template for disaster recovery policy', 'Standard disaster recovery policy template', 'Policy: {{policy_title}}\n\nOrganization: {{org_name}}\n\nReview Date: {{review_date}}\n\nPolicy Owner: {{policy_owner}}\n\nFramework: {{framework}}\n\n1. Purpose\n2. Scope\n3. Disaster Classification\n4. Recovery Strategies\n5. Plan Maintenance\n6. Related Controls\n7. Related Risks', '{"org_name": "string", "review_date": "date", "policy_owner": "string", "framework": "string"}', now()),

-- ============================================================
-- regulatory_guidance — Sample regulatory mappings
-- ============================================================
('00000000-0000-0000-0000-000000000001', 'GDPR', 'Art.32', 'Security of personal data', 'Security of personal data under GDPR', 'Taking into account the nature, scope, context and purposes of processing as well as the risks of varying likelihood and severity for the rights and freedoms of natural persons, the controller and the processor shall implement appropriate technical and organisational measures to ensure a level of security appropriate to the risk.', '["Art.32"]', now()),
('00000000-0000-0000-0000-000000000001', 'SOC 2', 'Trust Services Criteria', 'Trust Services Criteria for SOC 2', 'The Trust Services Criteria form the basis of SOC 2 examinations', 'The Trust Services Criteria form the basis of SOC 2 examinations conducted by CPAs', now()),
('00000000-0000-0000-0000-000000000001', 'ISO 27001', 'A.5-A.18', 'ISMS Clauses', 'ISO 27001 clauses A.5 through A.18', 'ISO 27001 clauses A.5 through A.18 covering organizational context, leadership, planning, support, operation, performance evaluation, and improvement', now()),
('00000000-0000-0000-0000-000000000001', 'NIS2', 'Art.21', 'Security measures', 'Security measures under NIS2', 'Member States shall ensure that operators of essential services and important operators implement appropriate and proportionate technical and organisational measures to manage risks and ensure the continuity of essential services', now()),
('00000000-0000-0000-0000-000000000001', 'PCI DSS', 'All Requirements', 'PCI DSS Requirements', 'All PCI DSS requirements for card data protection', 'The 12 PCI DSS requirements covering network security, data protection, vulnerability management, and annual assessment', now()),

-- ============================================================
-- knowledge_embeddings — Sample vector embeddings
-- These are the texts that will be embedded using all-MiniLM-L6-v2
-- and stored for pgvector similarity search
-- ============================================================
('00000000-0000-0000-0000-000000000001', 'control', 'CC6.1', 'Control Environment: The organization demonstrates a commitment to integrity and ethical values. This includes operating with integrity, establishing a code of conduct, and expecting employees to act in accordance with the code of conduct.'),


('00000000-0000-0000-0000-000000000001', 'control', 'CC6.2', 'Risk Assessment: The organization performs a risk assessment to identify and analyze risks to the achievement of objectives. This includes determining how risks relate to the internal control system, and the organization''s risk assessment is periodically repeated or updated.'),


('00000000-0000-0000-0000-000000000001', 'framework', 'SOC 2', 'SOC 2 Type II reports assess controls across five Trust Services Criteria: Security, Availability, Processing Integrity, Confidentiality, and Privacy. The report is valid for one year and must be issued by a CPA firm.'),


('00000000-0000-0000-0000-000000000001', 'framework', 'ISO 27001', 'ISO 27001 is an international standard for an Information Security Management System (ISMS). It provides a systematic approach to managing sensitive data so that it remains secure. Certification requires a formal audit by an accredited certification body.'),


('00000000-0000-0000-0000-000000000001', 'risk', 'Third Party Security Risk', 'Risk arising from third-party vendors, suppliers, or partners with access to systems or data. This is a critical concern for organizations that rely on external parties for their operations.'),


('00000000-0000-0000-0000-000000000001', 'policy', 'Access Control Policy', 'Template for access control policy that includes user provisioning, access modification, access termination, and periodic review procedures with related controls and risks.'),
('00000000-0000-0000-0000-000000000001', 'regulation', 'GDPR Art.32', 'Security of personal data under GDPR: Taking into account the nature, scope, context and purposes of processing as well as the risks of varying likelihood and severity for the rights and freedoms of natural persons, the controller and the processor shall implement appropriate technical and organisational measures to ensure a level of security appropriate to the risk.'),

-- ============================================================
-- Final commit note
-- ============================================================
SELECT 'Knowledge base seeded successfully' as status;
