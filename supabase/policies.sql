-- Quadra CRM - RLS policies
-- Run after schema.sql

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.contact_phones enable row level security;
alter table public.opportunities enable row level security;
alter table public.projects enable row level security;
alter table public.activities enable row level security;
alter table public.followups enable row level security;
alter table public.notes enable row level security;
alter table public.tags enable row level security;
alter table public.entity_tags enable row level security;

create policy profiles_select_own on public.profiles
for select using (auth.uid() = id);

create policy profiles_insert_own on public.profiles
for insert with check (auth.uid() = id);

create policy profiles_update_own on public.profiles
for update using (auth.uid() = id);

create policy companies_all_own on public.companies
for all using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy contacts_all_own on public.contacts
for all using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy opportunities_all_own on public.opportunities
for all using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy projects_all_own on public.projects
for all using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy activities_all_own on public.activities
for all using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy followups_all_own on public.followups
for all using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy notes_all_own on public.notes
for all using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy tags_all_own on public.tags
for all using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy entity_tags_all_own on public.entity_tags
for all using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy contact_phones_all_through_contacts on public.contact_phones
for all using (
  exists (
    select 1
    from public.contacts c
    where c.id = contact_phones.contact_id
      and c.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.contacts c
    where c.id = contact_phones.contact_id
      and c.owner_id = auth.uid()
  )
);
