-- ============================================================
-- PHASE 1: KNOWLEDGE BASE ENGINE — Additive only
-- New tables only. No existing tables modified.
-- ============================================================

-- ============================================================
-- control_guidance
-- Stores detailed guidance for each framework control
-- ============================================================
CREATE TABLE IF NOT EXISTS control_guidance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  framework VARCHAR(100) NOT NULL,
  control_id VARCHAR(100) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_control_guidance_tenant_framework_control UNIQUE (tenant_id, framework, control_id)
);

-- ============================================================
-- framework_guidance
-- Stores high-level framework overview and requirements
-- ============================================================
CREATE TABLE IF NOT EXISTS framework_guidance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  framework VARCHAR(100) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  version VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_framework_guidance_tenant_framework UNIQUE (tenant_id, framework)
);

-- ============================================================
-- evidence_requirements
-- Maps controls to required evidence types
-- ============================================================
CREATE TABLE IF NOT EXISTS evidence_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  framework VARCHAR(100) NOT NULL,
  control_id VARCHAR(100) NOT NULL,
  evidence_type VARCHAR(200) NOT NULL,
  description TEXT,
  frequency VARCHAR(100), -- e.g., "annual", "quarterly", "on-demand"
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_evidence_requirements_tenant_framework_control UNIQUE (tenant_id, framework, control_id, evidence_type)
);

-- ============================================================
-- risk_library
-- Predefined risk categories and descriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS risk_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_category VARCHAR(200) NOT NULL,
  description TEXT,
  severity VARCHAR(50) DEFAULT 'medium',
  related_controls TEXT[], -- JSON array of control IDs
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- remediation_library
-- Predefined remediation patterns for common gaps
-- ============================================================
CREATE TABLE IF NOT EXISTS remediation_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gap_title VARCHAR(500) NOT NULL,
  description TEXT,
  severity VARCHAR(50) DEFAULT 'medium',
  suggested_tasks TEXT[], -- JSON array of task descriptions
  related_controls TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- policy_templates
-- Policy template library (NO generative AI — template engine only)
-- ============================================================
CREATE TABLE IF NOT EXISTS policy_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_type VARCHAR(100) NOT NULL, -- e.g., "access_control", "vendor_security", "isms", "password_policy", "incident_response", "business_continuity", "disaster_recovery"
  title VARCHAR(500) NOT NULL,
  description TEXT,
  content_template TEXT NOT NULL, -- template with placeholders like {{org_name}}, {{review_date}}, etc.
  variables JSONB DEFAULT '{}', -- template variables: org_name, review_date, policy_owner, framework, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_policy_templates_tenant_type UNIQUE (tenant_id, policy_type, is_active)
);

-- ============================================================
-- regulatory_guidance
-- Regulatory framework guidance mappings
-- ============================================================
CREATE TABLE IF NOT EXISTS regulatory_guidance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  regulation VARCHAR(100) NOT NULL, -- e.g., "GDPR", "NIS2", "DORA", "ISO 27001", "SOC 2", "HIPAA", "PCI DSS"
  section VARCHAR(200),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  control_references TEXT[], -- JSON array of related control IDs
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- knowledge_embeddings
-- pgvector-based semantic search index
-- ============================================================
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS knowledge_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type VARCHAR(50) NOT NULL, -- e.g., "control", "framework", "risk", "policy", "evidence", "regulation"
  source_id UUID, -- references the source record ID
  content TEXT NOT NULL, -- the text content to embed
  embedding vector(384), -- all-MiniLM-L6-v2 produces 384-dim vectors
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_knowledge_embeddings_tenant_source UNIQUE (tenant_id, source_id, source_type)
);

-- Enable Row Level Security on all new tables
ALTER TABLE control_guidance ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_guidance ENABLE ROW LESECURITY;
ALTER TABLE evidence_requirements ENABLE ROW LESECURITY;
ALTER TABLE risk_library ENABLE ROW LESECURITY;
ALTER TABLE remediation_library ENABLE ROW LESECURITY;
ALTER TABLE policy_templates ENABLE ROW LESECURITY;
ALTER TABLE regulatory_guidance ENABLE ROW LESECURITY;
ALTER TABLE knowledge_embeddings ENABLE ROW LESECURITY;

-- ============================================================
-- Row Level Security Policies — Tenant Isolation
-- ============================================================
CREATE POLICY " tenants can CRUD their own control_guidance " ON control_guidance
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY " tenants can CRUD their own framework_guidance " ON framework_guidance
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY " tenants can CRUD their own evidence_requirements " ON evidence_requirements
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY " tenants can CRUD their own risk_library " ON risk_library
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY " tenants can CRUD their own remediation_library " ON remediation_library
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY " tenants can CRUD their own policy_templates " ON policy_templates
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY " tenants can CRUD their own regulatory_guidance " ON regulatory_guidance
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY " tenants can CRUD their own knowledge_embeddings " ON knowledge_embeddings
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
