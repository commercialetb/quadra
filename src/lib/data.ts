import { createSupabaseServerClient } from './supabase-server';

export async function getDashboardData() {
  const supabase = await createSupabaseServerClient();

  const [companiesRes, opportunitiesRes, followupsTodayRes, activitiesWeekRes, followupsRes, openOpportunitiesRes] = await Promise.all([
    supabase.from('companies').select('id', { count: 'exact', head: true }).neq('status', 'inactive'),
    supabase.from('opportunities').select('id', { count: 'exact', head: true }).in('stage', ['new_lead', 'contacted', 'qualified', 'proposal', 'negotiation']),
    supabase.from('followups').select('id', { count: 'exact', head: true }).gte('due_at', new Date(new Date().setHours(0,0,0,0)).toISOString()).lt('due_at', new Date(new Date().setHours(23,59,59,999)).toISOString()).in('status', ['pending', 'in_progress', 'overdue']),
    supabase.from('activities').select('id', { count: 'exact', head: true }).gte('happened_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('followups').select('id,title,due_at,status,priority').in('status', ['pending', 'in_progress', 'overdue']).order('due_at', { ascending: true }).limit(6),
    supabase.from('v_open_opportunities').select('id,title,company_name,stage,value_estimate,next_action_due_at').limit(6),
  ]);

  return {
    stats: {
      activeCompanies: companiesRes.count ?? 0,
      openOpportunities: opportunitiesRes.count ?? 0,
      followupsToday: followupsTodayRes.count ?? 0,
      activitiesWeek: activitiesWeekRes.count ?? 0,
    },
    followups: followupsRes.data ?? [],
    openOpportunities: openOpportunitiesRes.data ?? [],
  };
}

export async function getCompanies() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('companies').select('id,name,status,city,province,website,email,phone,notes_summary,created_at').order('created_at', { ascending: false }).limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function getContacts() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('contacts')
    .select('id,first_name,last_name,role,email,whatsapp,preferred_contact_method,notes_summary,company_id,created_at,companies(name)')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function getOpportunities() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('opportunities')
    .select('id,title,stage,value_estimate,expected_close_date,next_action,next_action_due_at,company_id,primary_contact_id,companies(name)')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function getFollowups() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('followups')
    .select('id,title,due_at,status,priority,company_id,contact_id,opportunity_id')
    .order('due_at', { ascending: true })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}
