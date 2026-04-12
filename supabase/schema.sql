-- Quadra CRM - Base schema
-- Order: run schema.sql, then functions.sql, then views.sql, then policies.sql, then optionally seed.sql

create extension if not exists "pgcrypto";

-- =========================
-- Enums
-- =========================
create type public.company_status as enum (
  'lead',
  'prospect',
  'client',
  'partner',
  'inactive'
);

create type public.opportunity_stage as enum (
  'new_lead',
  'contacted',
  'qualified',
  'proposal',
  'negotiation',
  'won',
  'lost'
);

create type public.project_status as enum (
  'planned',
  'active',
  'on_hold',
  'completed',
  'cancelled'
);

create type public.activity_kind as enum (
  'call',
  'email',
  'meeting',
  'whatsapp',
  'note',
  'task_update',
  'status_change'
);

create type public.followup_status as enum (
  'pending',
  'in_progress',
  'completed',
  'cancelled',
  'overdue'
);

create type public.followup_priority as enum (
  'low',
  'medium',
  'high',
  'urgent'
);

create type public.note_entity_type as enum (
  'company',
  'contact',
  'opportunity',
  'project'
);

create type public.entity_tag_type as enum (
  'company',
  'contact',
  'opportunity',
  'project'
);

-- =========================
-- Tables
-- =========================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  legal_name text,
  vat_number text,
  tax_code text,
  website text,
  email text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  province text,
  postal_code text,
  country text default 'Italia',
  industry text,
  status public.company_status not null default 'lead',
  source text,
  notes_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_name_owner_unique unique (owner_id, name)
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  first_name text not null,
  last_name text not null,
  full_name text generated always as (trim(first_name || ' ' || last_name)) stored,
  role text,
  email text,
  whatsapp text,
  linkedin_url text,
  preferred_contact_method text,
  status text not null default 'active',
  last_contact_at timestamptz,
  next_followup_at timestamptz,
  notes_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contact_phones (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  phone_number text not null,
  label text not null default 'mobile',
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  primary_contact_id uuid references public.contacts(id) on delete set null,
  title text not null,
  description text,
  stage public.opportunity_stage not null default 'new_lead',
  value_estimate numeric(12,2),
  probability integer check (probability >= 0 and probability <= 100),
  source text,
  expected_close_date date,
  closed_at timestamptz,
  loss_reason text,
  win_reason text,
  last_activity_at timestamptz,
  next_action text,
  next_action_due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  title text not null,
  description text,
  status public.project_status not null default 'planned',
  budget numeric(12,2),
  start_date date,
  end_date date,
  priority text,
  project_manager text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  kind public.activity_kind not null,
  subject text,
  content text,
  happened_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activities_link_check check (
    company_id is not null
    or contact_id is not null
    or opportunity_id is not null
    or project_id is not null
  )
);

create table public.followups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  description text,
  due_at timestamptz not null,
  status public.followup_status not null default 'pending',
  priority public.followup_priority not null default 'medium',
  reminder_at timestamptz,
  completed_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint followups_link_check check (
    company_id is not null
    or contact_id is not null
    or opportunity_id is not null
    or project_id is not null
  )
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  entity_type public.note_entity_type not null,
  entity_id uuid not null,
  title text,
  body text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  constraint tags_owner_name_unique unique (owner_id, name)
);

create table public.entity_tags (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  entity_type public.entity_tag_type not null,
  entity_id uuid not null,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint entity_tags_unique unique (owner_id, entity_type, entity_id, tag_id)
);

-- =========================
-- Indexes
-- =========================
create index idx_companies_owner_id on public.companies(owner_id);
create index idx_companies_status on public.companies(status);
create index idx_companies_name on public.companies(name);
create index idx_contacts_owner_id on public.contacts(owner_id);
create index idx_contacts_company_id on public.contacts(company_id);
create index idx_contacts_full_name on public.contacts(full_name);
create index idx_contacts_email on public.contacts(email);
create index idx_contact_phones_contact_id on public.contact_phones(contact_id);
create index idx_opportunities_owner_id on public.opportunities(owner_id);
create index idx_opportunities_company_id on public.opportunities(company_id);
create index idx_opportunities_primary_contact_id on public.opportunities(primary_contact_id);
create index idx_opportunities_stage on public.opportunities(stage);
create index idx_opportunities_expected_close_date on public.opportunities(expected_close_date);
create index idx_projects_owner_id on public.projects(owner_id);
create index idx_projects_company_id on public.projects(company_id);
create index idx_projects_opportunity_id on public.projects(opportunity_id);
create index idx_projects_status on public.projects(status);
create index idx_activities_owner_id on public.activities(owner_id);
create index idx_activities_company_id on public.activities(company_id);
create index idx_activities_contact_id on public.activities(contact_id);
create index idx_activities_opportunity_id on public.activities(opportunity_id);
create index idx_activities_project_id on public.activities(project_id);
create index idx_activities_happened_at on public.activities(happened_at desc);
create index idx_followups_owner_id on public.followups(owner_id);
create index idx_followups_due_at on public.followups(due_at);
create index idx_followups_status on public.followups(status);
create index idx_followups_priority on public.followups(priority);
create index idx_followups_opportunity_id on public.followups(opportunity_id);
create index idx_notes_owner_id on public.notes(owner_id);
create index idx_notes_entity_type_id on public.notes(entity_type, entity_id);
create index idx_notes_created_at on public.notes(created_at desc);
create index idx_tags_owner_id on public.tags(owner_id);
create index idx_entity_tags_lookup on public.entity_tags(entity_type, entity_id);
create index idx_entity_tags_tag_id on public.entity_tags(tag_id);
