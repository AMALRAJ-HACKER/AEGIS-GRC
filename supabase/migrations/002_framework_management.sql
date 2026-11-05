-- AEGIS GRC: Framework Management extension (ADDITIVE ONLY).
-- Existing tables (frameworks, framework_controls, compliance_assessments) are NOT altered or dropped.
-- Apply manually in Supabase SQL editor when ready; the frontend degrades gracefully without these tables
-- (extended wizard data is stored locally until these tables exist).

create table if not exists public.framework_domains (
  id uuid primary key default gen_random_uuid(),
  framework_id uuid not null references public.frameworks(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz default now()
);
create table if not exists public.framework_evidence (
  id uuid primary key default gen_random_uuid(),
  framework_id uuid not null references public.frameworks(id) on delete cascade,
  control_id text,
  name text not null,
  evidence_type text,
  review_frequency text,
  retention_period text,
  mandatory boolean default false,
  created_at timestamptz default now()
);
create table if not exists public.framework_risks (
  id uuid primary key default gen_random_uuid(),
  framework_id uuid not null references public.frameworks(id) on delete cascade,
  control_id text,
  risk_name text not null,
  created_at timestamptz default now()
);
create table if not exists public.framework_assessments (
  id uuid primary key default gen_random_uuid(),
  framework_id uuid not null references public.frameworks(id) on delete cascade,
  control_id text,
  question text not null,
  answer_type text default 'Yes / No',
  created_at timestamptz default now()
);
create table if not exists public.framework_versions (
  id uuid primary key default gen_random_uuid(),
  framework_id uuid not null references public.frameworks(id) on delete cascade,
  version text not null,
  changed_by uuid,
  description text,
  created_at timestamptz default now()
);
create table if not exists public.framework_imports (
  id uuid primary key default gen_random_uuid(),
  framework_id uuid references public.frameworks(id) on delete set null,
  file_name text,
  row_count integer default 0,
  status text default 'pending',
  created_at timestamptz default now()
);

alter table public.framework_domains enable row level security;
alter table public.framework_evidence enable row level security;
alter table public.framework_risks enable row level security;
alter table public.framework_assessments enable row level security;
alter table public.framework_versions enable row level security;
alter table public.framework_imports enable row level security;

-- NOTE: add organization-scoped RLS policies matching your existing policy style
-- (these tables intentionally ship without permissive policies to avoid accidental exposure).
