import { createClient } from '@/lib/supabase/server';

type StageKey =
  | 'new_lead'
  | 'contacted'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost';

export async function getDashboardData() {
  const supabase = await createClient();

  const [
    openOpportunitiesRes,
    allOpportunitiesRes,
    overdueFollowupsRes,
    todayFollowupsRes,
    upcomingFollowupsRes,
    recentActivitiesRes,
    recentCompaniesRes,
    staleOpportunitiesRes,
  ] = await Promise.all([
    supabase
      .from('v_open_opportunities')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(12),

    supabase
      .from('opportunities')
      .select('id, title, stage, value_estimate, expected_close_date, company_id, created_at, updated_at')
      .in('stage', ['new_lead', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'])
      .order('updated_at', { ascending: false }),

    supabase
      .from('followups')
      .select('id, title, due_at, priority, status, company_id, contact_id, opportunity_id')
      .in('status', ['pending', 'in_progress', 'overdue'])
      .lt('due_at', new Date().toISOString())
      .order('due_at', { ascending: true })
      .limit(10),

    supabase
      .from('followups')
      .select('id, title, due_at, priority, status, company_id, contact_id, opportunity_id')
      .in('status', ['pending', 'in_progress'])
      .gte('due_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
      .lt('due_at', new Date(new Date().setHours(23, 59, 59, 999)).toISOString())
      .order('due_at', { ascending: true })
      .limit(10),

    supabase
      .from('followups')
      .select('id, title, due_at, priority, status, company_id, contact_id, opportunity_id')
      .in('status', ['pending', 'in_progress'])
      .gt('due_at', new Date(new Date().setHours(23, 59, 59, 999)).toISOString())
      .order('due_at', { ascending: true })
      .limit(10),

    supabase
      .from('activities')
      .select('id, kind, subject, content, happened_at, company_id, contact_id, opportunity_id')
      .order('happened_at', { ascending: false })
      .limit(12),

    supabase
      .from('companies')
      .select('id, name, city, status, created_at')
      .order('created_at', { ascending: false })
      .limit(8),

    supabase
      .from('opportunities')
      .select('id, title, stage, updated_at, next_action, next_action_due_at, company_id, value_estimate')
      .in('stage', ['new_lead', 'contacted', 'qualified', 'proposal', 'negotiation'])
      .lt('updated_at', new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString())
      .order('updated_at', { ascending: true })
      .limit(8),
  ]);

  const allOpportunities = allOpportunitiesRes.data ?? [];

  const pipelineCounts: Record<StageKey, number> = {
    new_lead: 0,
    contacted: 0,
    qualified: 0,
    proposal: 0,
    negotiation: 0,
    won: 0,
    lost: 0,
  };

  let pipelineValue = 0;
  for (const opp of allOpportunities) {
    const stage = opp.stage as StageKey;
    if (pipelineCounts[stage] !== undefined) pipelineCounts[stage] += 1;
    if (['new_lead', 'contacted', 'qualified', 'proposal', 'negotiation'].includes(stage)) {
      pipelineValue += Number(opp.value_estimate ?? 0);
    }
  }

  const openCount = (openOpportunitiesRes.data ?? []).length;
  const overdueCount = (overdueFollowupsRes.data ?? []).length;
  const todayCount = (todayFollowupsRes.data ?? []).length;
  const wonCount = pipelineCounts.won;

  return {
    kpis: {
      openCount,
      overdueCount,
      todayCount,
      pipelineValue,
      wonCount,
    },
    openOpportunities: openOpportunitiesRes.data ?? [],
    overdueFollowups: overdueFollowupsRes.data ?? [],
    todayFollowups: todayFollowupsRes.data ?? [],
    upcomingFollowups: upcomingFollowupsRes.data ?? [],
    recentActivities: recentActivitiesRes.data ?? [],
    recentCompanies: recentCompaniesRes.data ?? [],
    staleOpportunities: staleOpportunitiesRes.data ?? [],
    pipelineCounts,
  };
}
