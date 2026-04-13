import { createClient } from '@/lib/supabase/server';
import { runAiCompletion } from '@/lib/ai';

type QueryIntent = 'today_followups' | 'stale_opportunities' | 'company_recap' | 'contact_recap' | 'opportunity_recap' | 'pipeline_filter' | 'general';

type CrmQueryResult = {
  intent: QueryIntent;
  context: Record<string, unknown>;
  answer: string;
  provider: string;
  model: string;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function extractAmount(question: string) {
  const amountMatch = question.match(/(\d+[\d\.,]*)\s*(k|mila|€|euro)?/i);
  if (!amountMatch) return null;
  const raw = amountMatch[1].replace(/\./g, '').replace(',', '.');
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return null;
  const suffix = (amountMatch[2] || '').toLowerCase();
  if (suffix === 'k' || suffix === 'mila') return parsed * 1000;
  return parsed;
}

function detectIntent(question: string): QueryIntent {
  const q = normalize(question);
  if ((q.includes('oggi') || q.includes('adesso')) && (q.includes('follow') || q.includes('sentire') || q.includes('chiam') || q.includes('agenda'))) {
    return 'today_followups';
  }
  if (q.includes('ferm') || q.includes('stallo') || q.includes('blocc')) {
    return 'stale_opportunities';
  }
  if (q.includes('pipeline') || q.includes('sopra ') || q.includes('oltre ')) {
    return 'pipeline_filter';
  }
  if (q.includes('recap') || q.includes('riepilogo') || q.includes('dimmi di')) {
    return 'general';
  }
  return 'general';
}

async function getSnapshots() {
  const supabase = await createClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [companiesRes, contactsRes, opportunitiesRes, notesRes, followupsTodayRes, staleOpportunitiesRes] = await Promise.all([
    supabase.from('companies').select('id, name, city, status, notes_summary, updated_at').order('updated_at', { ascending: false }).limit(80),
    supabase.from('contacts').select('id, full_name, email, role, company_id, updated_at, companies(name)').order('updated_at', { ascending: false }).limit(120),
    supabase.from('opportunities').select('id, title, stage, value_estimate, probability, next_action, next_action_due_at, expected_close_date, company_id, primary_contact_id, updated_at, companies(name), contacts(full_name)').order('updated_at', { ascending: false }).limit(120),
    supabase.from('notes').select('id, entity_type, entity_id, title, body, created_at').order('created_at', { ascending: false }).limit(150),
    supabase.from('followups').select('id, title, due_at, status, priority, company_id, contact_id, opportunity_id').in('status', ['pending', 'in_progress', 'overdue']).gte('due_at', todayStart.toISOString()).lt('due_at', todayEnd.toISOString()).order('due_at', { ascending: true }).limit(40),
    supabase.from('opportunities').select('id, title, stage, value_estimate, next_action, next_action_due_at, updated_at, companies(name)').in('stage', ['new_lead', 'contacted', 'qualified', 'proposal', 'negotiation']).lt('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()).order('updated_at', { ascending: true }).limit(40),
  ]);

  return {
    companies: companiesRes.data ?? [],
    contacts: contactsRes.data ?? [],
    opportunities: opportunitiesRes.data ?? [],
    notes: notesRes.data ?? [],
    followupsToday: followupsTodayRes.data ?? [],
    staleOpportunities: staleOpportunitiesRes.data ?? [],
  };
}

function findByName<T>(items: T[], pick: (item: T) => string | null | undefined, question: string) {
  const q = normalize(question);
  return items.find((item) => {
    const value = normalize(pick(item) || '');
    return value.length >= 3 && q.includes(value);
  }) || null;
}

function buildContext(question: string, snapshots: Awaited<ReturnType<typeof getSnapshots>>) {
  const intent = detectIntent(question);
  const amount = extractAmount(question);

  const company = findByName(snapshots.companies, (item) => item.name, question);
  const contact = findByName(snapshots.contacts, (item) => item.full_name, question);
  const opportunity = findByName(snapshots.opportunities, (item) => item.title, question);

  if (company) {
    const companyContacts = snapshots.contacts.filter((item) => item.company_id === company.id).slice(0, 6);
    const companyOpportunities = snapshots.opportunities.filter((item) => item.company_id === company.id).slice(0, 6);
    const companyNotes = snapshots.notes.filter((item) => item.entity_type === 'company' && item.entity_id === company.id).slice(0, 5);
    return {
      intent: 'company_recap' as const,
      context: { question, company, contacts: companyContacts, opportunities: companyOpportunities, notes: companyNotes },
    };
  }

  if (contact) {
    const contactOpportunities = snapshots.opportunities.filter((item) => item.primary_contact_id === contact.id).slice(0, 6);
    const contactNotes = snapshots.notes.filter((item) => item.entity_type === 'contact' && item.entity_id === contact.id).slice(0, 5);
    return {
      intent: 'contact_recap' as const,
      context: { question, contact, opportunities: contactOpportunities, notes: contactNotes },
    };
  }

  if (opportunity) {
    const opportunityNotes = snapshots.notes.filter((item) => item.entity_type === 'opportunity' && item.entity_id === opportunity.id).slice(0, 5);
    const opportunityFollowups = snapshots.followupsToday.filter((item) => item.opportunity_id === opportunity.id).slice(0, 5);
    return {
      intent: 'opportunity_recap' as const,
      context: { question, opportunity, followups: opportunityFollowups, notes: opportunityNotes },
    };
  }

  if (intent === 'today_followups') {
    return {
      intent,
      context: {
        question,
        followupsToday: snapshots.followupsToday,
        staleOpportunities: snapshots.staleOpportunities.slice(0, 8),
      },
    };
  }

  if (intent === 'stale_opportunities') {
    return {
      intent,
      context: {
        question,
        staleOpportunities: snapshots.staleOpportunities,
      },
    };
  }

  if (intent === 'pipeline_filter') {
    const filtered = amount
      ? snapshots.opportunities.filter((item) => Number(item.value_estimate ?? 0) >= amount).slice(0, 12)
      : snapshots.opportunities.slice(0, 12);
    return {
      intent,
      context: {
        question,
        amount,
        opportunities: filtered,
      },
    };
  }

  return {
    intent: 'general' as const,
    context: {
      question,
      todayFollowups: snapshots.followupsToday.slice(0, 8),
      staleOpportunities: snapshots.staleOpportunities.slice(0, 8),
      recentOpportunities: snapshots.opportunities.slice(0, 8),
      recentCompanies: snapshots.companies.slice(0, 8),
    },
  };
}

export async function answerCrmQuery(question: string): Promise<CrmQueryResult> {
  const snapshots = await getSnapshots();
  const { intent, context } = buildContext(question, snapshots);

  const result = await runAiCompletion({
    task: 'query_crm',
    maxTokens: 420,
    messages: [
      {
        role: 'system',
        content:
          'Sei Quadra, assistente CRM. Rispondi solo usando il contesto JSON fornito. Se il contesto non basta, dillo in modo breve. Scrivi in italiano, tono operativo, massimo 8 righe o 6 bullet. Evidenzia sempre prossima azione o rischio se presente.',
      },
      {
        role: 'user',
        content: JSON.stringify({ intent, context }, null, 2),
      },
    ],
  });

  return {
    intent,
    context,
    answer: result.text,
    provider: result.provider,
    model: result.model,
  };
}
