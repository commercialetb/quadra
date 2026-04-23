-- Quadra CRM - Views
-- Run after schema.sql

create or replace view public.v_open_opportunities as
select
  o.id,
  o.owner_id,
  o.title,
  o.stage,
  o.value_estimate,
  o.probability,
  o.expected_close_date,
  o.last_activity_at,
  o.next_action,
  o.next_action_due_at,
  c.id as company_id,
  c.name as company_name,
  ct.id as primary_contact_id,
  ct.full_name as primary_contact_name,
  o.created_at,
  o.updated_at
from public.opportunities o
join public.companies c on c.id = o.company_id
left join public.contacts ct on ct.id = o.primary_contact_id
where o.stage not in ('won', 'lost');

create or replace view public.v_today_followups as
select
  f.id,
  f.owner_id,
  f.title,
  f.description,
  f.due_at,
  f.status,
  f.priority,
  c.name as company_name,
  ct.full_name as contact_name,
  o.title as opportunity_title
from public.followups f
left join public.companies c on c.id = f.company_id
left join public.contacts ct on ct.id = f.contact_id
left join public.opportunities o on o.id = f.opportunity_id
where f.status in ('pending', 'in_progress', 'overdue')
  and f.due_at::date <= now()::date;


create or replace view public.v_shortcut_review_queue_pending as
select
  id,
  owner_id,
  action_key,
  status,
  query,
  entity_type,
  best_guess_kind,
  best_guess_entity_id,
  best_guess_title,
  ambiguity_reason,
  candidate_results,
  resolution_confidence,
  retry_count,
  last_retry_at,
  auto_resolved,
  last_error,
  created_at,
  updated_at
from public.shortcut_review_queue
where status = 'pending'
order by created_at desc;
