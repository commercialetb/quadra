-- Quadra CRM - Functions and triggers
-- Run after schema.sql

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger trg_companies_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

create trigger trg_contacts_updated_at
before update on public.contacts
for each row execute function public.set_updated_at();

create trigger trg_opportunities_updated_at
before update on public.opportunities
for each row execute function public.set_updated_at();


create trigger trg_activities_updated_at
before update on public.activities
for each row execute function public.set_updated_at();

create trigger trg_followups_updated_at
before update on public.followups
for each row execute function public.set_updated_at();

create trigger trg_notes_updated_at
before update on public.notes
for each row execute function public.set_updated_at();

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.sync_opportunity_last_activity()
returns trigger as $$
begin
  if new.opportunity_id is not null then
    update public.opportunities
    set last_activity_at = new.happened_at,
        updated_at = now()
    where id = new.opportunity_id;
  end if;
  return new;
end;
$$ language plpgsql;

create or replace function public.sync_contact_last_activity()
returns trigger as $$
begin
  if new.contact_id is not null then
    update public.contacts
    set last_contact_at = new.happened_at,
        updated_at = now()
    where id = new.contact_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_sync_opportunity_last_activity
after insert on public.activities
for each row execute function public.sync_opportunity_last_activity();

create trigger trg_sync_contact_last_activity
after insert on public.activities
for each row execute function public.sync_contact_last_activity();

create or replace function public.mark_overdue_followups()
returns void as $$
begin
  update public.followups
  set status = 'overdue',
      updated_at = now()
  where status in ('pending', 'in_progress')
    and due_at < now();
end;
$$ language plpgsql;
