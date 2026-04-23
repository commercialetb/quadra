import { createClient } from '@/lib/supabase/server';

type ActivityTimelineRow = {
  id: string;
  kind: string;
  subject: string | null;
  content: string | null;
  happened_at: string;
};

type FollowupTimelineRow = {
  id: string;
  title: string | null;
  description: string | null;
  due_at: string;
  status: string | null;
  priority: string | null;
};

export type TimelineItem = {
  id: string;
  item_type: 'activity' | 'followup';
  kind: string;
  title: string | null;
  content: string | null;
  occurred_at: string;
  status?: string | null;
  priority?: string | null;
};

export async function getCompanyDetail(id: string) {
  const supabase = await createClient();

  const [{ data: company }, { data: contacts }, { data: opportunities }, { data: notes }] = await Promise.all([
    supabase.from('companies').select('*').eq('id', id).single(),
    supabase.from('contacts').select('id, full_name, email, role, last_contact_at').eq('company_id', id).order('full_name'),
    supabase.from('opportunities').select('id, title, stage, value_estimate, probability, next_action_due_at').eq('company_id', id).order('created_at', { ascending: false }),
    supabase.from('notes').select('id, title, body, created_at').eq('entity_type', 'company').eq('entity_id', id).order('created_at', { ascending: false }).limit(10),
  ]);

  return { company, contacts: contacts ?? [], opportunities: opportunities ?? [], notes: notes ?? [] };
}

export async function getContactDetail(id: string) {
  const supabase = await createClient();

  const [{ data: contact }, { data: phones }, { data: opportunities }, { data: notes }] = await Promise.all([
    supabase.from('contacts').select('*, company:companies(id, name)').eq('id', id).single(),
    supabase.from('contact_phones').select('*').eq('contact_id', id).order('is_primary', { ascending: false }),
    supabase.from('opportunities').select('id, title, stage, value_estimate, probability, next_action_due_at').eq('primary_contact_id', id).order('created_at', { ascending: false }),
    supabase.from('notes').select('id, title, body, created_at').eq('entity_type', 'contact').eq('entity_id', id).order('created_at', { ascending: false }).limit(10),
  ]);

  return { contact, phones: phones ?? [], opportunities: opportunities ?? [], notes: notes ?? [] };
}

export async function getOpportunityDetail(id: string) {
  const supabase = await createClient();

  const [{ data: opportunity }, { data: notes }] = await Promise.all([
    supabase.from('opportunities').select('*, company:companies(id, name), primary_contact:contacts(id, full_name, email)').eq('id', id).single(),
    supabase.from('notes').select('id, title, body, created_at').eq('entity_type', 'opportunity').eq('entity_id', id).order('created_at', { ascending: false }).limit(10),
  ]);

  return { opportunity, notes: notes ?? [] };
}


export async function getTimelineForEntity(args: {
  companyId?: string;
  contactId?: string;
  opportunityId?: string;
}) {
  const supabase = await createClient();
  let activityQuery = supabase.from('activities').select('id, kind, subject, content, happened_at');
  let followupQuery = supabase.from('followups').select('id, title, description, due_at, status, priority');

  if (args.companyId) {
    activityQuery = activityQuery.eq('company_id', args.companyId);
    followupQuery = followupQuery.eq('company_id', args.companyId);
  }
  if (args.contactId) {
    activityQuery = activityQuery.eq('contact_id', args.contactId);
    followupQuery = followupQuery.eq('contact_id', args.contactId);
  }
  if (args.opportunityId) {
    activityQuery = activityQuery.eq('opportunity_id', args.opportunityId);
    followupQuery = followupQuery.eq('opportunity_id', args.opportunityId);
  }

  const [{ data: activities }, { data: followups }] = await Promise.all([
    activityQuery.order('happened_at', { ascending: false }).limit(50),
    followupQuery.order('due_at', { ascending: false }).limit(50),
  ]);

  const mapped: TimelineItem[] = [
    ...(((activities ?? []) as ActivityTimelineRow[]).map((item) => ({
      id: item.id,
      item_type: 'activity' as const,
      kind: item.kind,
      title: item.subject,
      content: item.content,
      occurred_at: item.happened_at,
    }))),
    ...(((followups ?? []) as FollowupTimelineRow[]).map((item) => ({
      id: item.id,
      item_type: 'followup' as const,
      kind: 'followup',
      title: item.title,
      content: item.description,
      occurred_at: item.due_at,
      status: item.status,
      priority: item.priority,
    }))),
  ].sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());

  return mapped;
}
