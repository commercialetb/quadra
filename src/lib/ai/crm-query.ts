import { createClient } from '@/lib/supabase/server';
import { runAiCompletion } from '@/lib/ai';

type QueryIntent =
  | 'count_query'
  | 'today_followups'
  | 'priority_query'
  | 'stale_opportunities'
  | 'company_recap'
  | 'contact_recap'
  | 'opportunity_recap'
  | 'pipeline_filter'
  | 'missing_followups'
  | 'general';

type CrmQueryResult = {
  intent: QueryIntent;
  context: Record<string, unknown>;
  answer: string;
  provider: string;
  model: string;
};

type CompanySnapshot = {
  id: string;
  name: string;
  city?: string | null;
  status?: string | null;
  notes_summary?: string | null;
  updated_at?: string | null;
};

type ContactSnapshot = {
  id: string;
  full_name: string;
  email?: string | null;
  role?: string | null;
  company_id?: string | null;
  updated_at?: string | null;
  companies?: { name?: string | null } | null;
};

type OpportunitySnapshot = {
  id: string;
  title: string;
  stage?: string | null;
  value_estimate?: number | null;
  probability?: number | null;
  next_action?: string | null;
  next_action_due_at?: string | null;
  expected_close_date?: string | null;
  company_id?: string | null;
  primary_contact_id?: string | null;
  updated_at?: string | null;
  companies?: { name?: string | null } | null;
  contacts?: { full_name?: string | null } | null;
};

type NoteSnapshot = {
  id: string;
  entity_type: string;
  entity_id: string;
  title?: string | null;
  body?: string | null;
  created_at: string;
};

type FollowupSnapshot = {
  id: string;
  title: string;
  due_at: string;
  status?: string | null;
  priority?: string | null;
  company_id?: string | null;
  contact_id?: string | null;
  opportunity_id?: string | null;
};

type CountsSnapshot = {
  totalCompanies: number;
  totalContacts: number;
  totalOpportunities: number;
  totalOpenOpportunities: number;
  totalPendingFollowups: number;
  totalOverdueFollowups: number;
};

type SnapshotBundle = {
  companies: CompanySnapshot[];
  contacts: ContactSnapshot[];
  opportunities: OpportunitySnapshot[];
  notes: NoteSnapshot[];
  followupsToday: FollowupSnapshot[];
  overdueFollowups: FollowupSnapshot[];
  staleOpportunities: OpportunitySnapshot[];
  counts: CountsSnapshot;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function compactWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
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

function extractCity(question: string) {
  const match = question.match(/\b(?:a|di|del|della|dello|in)\s+([A-ZÀ-Ý][\p{L}'\-]+(?:\s+[A-ZÀ-Ý][\p{L}'\-]+)*)/u);
  return match?.[1] ? compactWhitespace(match[1]) : null;
}

function daysSince(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const diff = Date.now() - date.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function formatCurrency(value?: number | null) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateLabel(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function detectIntent(question: string): QueryIntent {
  const q = normalize(question);

  if ((q.includes('quanti') || q.includes('quante') || q.includes('numero')) && (q.includes('contatt') || q.includes('aziend') || q.includes('opportunit') || q.includes('follow'))) {
    return 'count_query';
  }

  if ((q.includes('oggi') || q.includes('adesso') || q.includes('stamattina') || q.includes('priorit')) && (q.includes('follow') || q.includes('sentire') || q.includes('chiam') || q.includes('agenda') || q.includes('priorita'))) {
    return 'priority_query';
  }

  if (q.includes('oggi') && (q.includes('follow') || q.includes('sentire') || q.includes('chiam') || q.includes('agenda'))) {
    return 'today_followups';
  }

  if (q.includes('senza follow') || q.includes('nessun follow') || q.includes('non ho follow')) {
    return 'missing_followups';
  }

  if (q.includes('ferm') || q.includes('stallo') || q.includes('blocc')) {
    return 'stale_opportunities';
  }

  if (q.includes('pipeline') || q.includes('sopra ') || q.includes('oltre ')) {
    return 'pipeline_filter';
  }

  return 'general';
}

async function getSnapshots(): Promise<SnapshotBundle> {
  const supabase = await createClient();
  const now = new Date();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const sevenDaysAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    companiesRes,
    contactsRes,
    opportunitiesRes,
    notesRes,
    followupsTodayRes,
    overdueFollowupsRes,
    staleOpportunitiesRes,
    companiesCountRes,
    contactsCountRes,
    opportunitiesCountRes,
    openOpportunitiesCountRes,
    pendingFollowupsCountRes,
    overdueFollowupsCountRes,
  ] = await Promise.all([
    supabase.from('companies').select('id, name, city, status, notes_summary, updated_at').order('updated_at', { ascending: false }).limit(120),
    supabase.from('contacts').select('id, full_name, email, role, company_id, updated_at, companies(name)').order('updated_at', { ascending: false }).limit(160),
    supabase.from('opportunities').select('id, title, stage, value_estimate, probability, next_action, next_action_due_at, expected_close_date, company_id, primary_contact_id, updated_at, companies(name), contacts(full_name)').order('updated_at', { ascending: false }).limit(160),
    supabase.from('notes').select('id, entity_type, entity_id, title, body, created_at').order('created_at', { ascending: false }).limit(180),
    supabase.from('followups').select('id, title, due_at, status, priority, company_id, contact_id, opportunity_id').in('status', ['pending', 'in_progress', 'overdue']).gte('due_at', todayStart.toISOString()).lt('due_at', todayEnd.toISOString()).order('due_at', { ascending: true }).limit(40),
    supabase.from('followups').select('id, title, due_at, status, priority, company_id, contact_id, opportunity_id').in('status', ['pending', 'in_progress', 'overdue']).lt('due_at', now.toISOString()).order('due_at', { ascending: true }).limit(40),
    supabase.from('opportunities').select('id, title, stage, value_estimate, probability, next_action, next_action_due_at, updated_at, companies(name), contacts(full_name)').in('stage', ['new_lead', 'contacted', 'qualified', 'proposal', 'negotiation']).lt('updated_at', sevenDaysAgoIso).order('updated_at', { ascending: true }).limit(40),
    supabase.from('companies').select('*', { count: 'exact', head: true }),
    supabase.from('contacts').select('*', { count: 'exact', head: true }),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }),
    supabase.from('opportunities').select('*', { count: 'exact', head: true }).in('stage', ['new_lead', 'contacted', 'qualified', 'proposal', 'negotiation']),
    supabase.from('followups').select('*', { count: 'exact', head: true }).in('status', ['pending', 'in_progress', 'overdue']),
    supabase.from('followups').select('*', { count: 'exact', head: true }).in('status', ['pending', 'in_progress', 'overdue']).lt('due_at', now.toISOString()),
  ]);

  return {
    companies: (companiesRes.data ?? []) as CompanySnapshot[],
    contacts: (contactsRes.data ?? []) as ContactSnapshot[],
    opportunities: (opportunitiesRes.data ?? []) as OpportunitySnapshot[],
    notes: (notesRes.data ?? []) as NoteSnapshot[],
    followupsToday: (followupsTodayRes.data ?? []) as FollowupSnapshot[],
    overdueFollowups: (overdueFollowupsRes.data ?? []) as FollowupSnapshot[],
    staleOpportunities: (staleOpportunitiesRes.data ?? []) as OpportunitySnapshot[],
    counts: {
      totalCompanies: companiesCountRes.count ?? 0,
      totalContacts: contactsCountRes.count ?? 0,
      totalOpportunities: opportunitiesCountRes.count ?? 0,
      totalOpenOpportunities: openOpportunitiesCountRes.count ?? 0,
      totalPendingFollowups: pendingFollowupsCountRes.count ?? 0,
      totalOverdueFollowups: overdueFollowupsCountRes.count ?? 0,
    },
  };
}

function findByName<T>(items: T[], pick: (item: T) => string | null | undefined, question: string) {
  const q = normalize(question);
  return items.find((item) => {
    const value = normalize(pick(item) || '');
    return value.length >= 3 && q.includes(value);
  }) || null;
}

function buildCountAnswer(question: string, snapshots: SnapshotBundle) {
  const q = normalize(question);
  const { counts } = snapshots;

  if (q.includes('contatt')) {
    return `Hai ${counts.totalContacts} contatti registrati nel CRM.`;
  }
  if (q.includes('aziend')) {
    return `Hai ${counts.totalCompanies} aziende registrate nel CRM.`;
  }
  if (q.includes('opportunit')) {
    return `Hai ${counts.totalOpenOpportunities} opportunità aperte su ${counts.totalOpportunities} totali.`;
  }
  if (q.includes('follow')) {
    return `Hai ${counts.totalPendingFollowups} follow-up aperti, di cui ${counts.totalOverdueFollowups} in ritardo.`;
  }

  return `Nel CRM hai ${counts.totalCompanies} aziende, ${counts.totalContacts} contatti, ${counts.totalOpenOpportunities} opportunità aperte e ${counts.totalPendingFollowups} follow-up aperti.`;
}

function buildPriorityAnswer(snapshots: SnapshotBundle) {
  const overdueFirst = snapshots.overdueFollowups.slice(0, 3);
  const todayNext = snapshots.followupsToday.filter((item) => !overdueFirst.some((overdue) => overdue.id === item.id)).slice(0, 3);
  const staleTop = snapshots.staleOpportunities.slice(0, 3);

  const lines = [
    `Oggi hai ${snapshots.followupsToday.length} follow-up pianificati e ${snapshots.counts.totalOverdueFollowups} follow-up in ritardo.`,
  ];

  if (overdueFirst.length > 0) {
    lines.push(
      `Priorità immediata: ${overdueFirst
        .map((item) => `${item.title} (${formatDateLabel(item.due_at) ?? 'data non disponibile'})`)
        .join('; ')}.`
    );
  }

  if (todayNext.length > 0) {
    lines.push(
      `Da gestire oggi: ${todayNext.map((item) => item.title).join('; ')}.`
    );
  }

  if (staleTop.length > 0) {
    lines.push(
      `Rischio pipeline: ${staleTop
        .map((item) => `${item.title}${item.companies?.name ? ` / ${item.companies.name}` : ''}`)
        .join('; ')}.`
    );
  }

  return lines.join('\n');
}

function buildMissingFollowupsContext(question: string, snapshots: SnapshotBundle) {
  const city = extractCity(question);
  const q = normalize(question);
  const daysThreshold = q.includes('recent') ? 14 : 30;

  const candidates = snapshots.opportunities
    .filter((item) => ['new_lead', 'contacted', 'qualified', 'proposal', 'negotiation'].includes(item.stage ?? ''))
    .filter((item) => Number(item.value_estimate ?? 0) > 0)
    .filter((item) => {
      const companyName = item.companies?.name ?? '';
      if (!city) return true;
      const company = snapshots.companies.find((entry) => entry.id === item.company_id);
      return normalize(company?.city ?? '').includes(normalize(city));
    })
    .filter((item) => {
      const hasOpenFollowup = snapshots.followupsToday.some((followup) => followup.opportunity_id === item.id) || snapshots.overdueFollowups.some((followup) => followup.opportunity_id === item.id);
      return !hasOpenFollowup;
    })
    .filter((item) => (daysSince(item.updated_at) ?? 999) >= daysThreshold)
    .sort((a, b) => Number(b.value_estimate ?? 0) - Number(a.value_estimate ?? 0))
    .slice(0, 8)
    .map((item) => ({
      title: item.title,
      company: item.companies?.name ?? null,
      stage: item.stage ?? null,
      valueEstimate: item.value_estimate ?? null,
      probability: item.probability ?? null,
      daysWithoutUpdate: daysSince(item.updated_at),
      nextAction: item.next_action ?? null,
      primaryContact: item.contacts?.full_name ?? null,
    }));

  return {
    intent: 'missing_followups' as const,
    context: {
      question,
      city,
      daysThreshold,
      opportunities: candidates,
    },
  };
}

function buildContext(question: string, snapshots: SnapshotBundle) {
  const intent = detectIntent(question);
  const amount = extractAmount(question);
  const city = extractCity(question);

  const company = findByName(snapshots.companies, (item) => item.name, question);
  const contact = findByName(snapshots.contacts, (item) => item.full_name, question);
  const opportunity = findByName(snapshots.opportunities, (item) => item.title, question);

  if (company) {
    const companyContacts = snapshots.contacts.filter((item) => item.company_id === company.id).slice(0, 8);
    const companyOpportunities = snapshots.opportunities.filter((item) => item.company_id === company.id).slice(0, 8);
    const companyNotes = snapshots.notes.filter((item) => item.entity_type === 'company' && item.entity_id === company.id).slice(0, 6);
    const companyFollowups = [...snapshots.overdueFollowups, ...snapshots.followupsToday]
      .filter((item) => item.company_id === company.id)
      .slice(0, 6);

    return {
      intent: 'company_recap' as const,
      context: {
        question,
        company,
        contacts: companyContacts,
        opportunities: companyOpportunities,
        followups: companyFollowups,
        notes: companyNotes,
      },
    };
  }

  if (contact) {
    const contactOpportunities = snapshots.opportunities.filter((item) => item.primary_contact_id === contact.id).slice(0, 8);
    const contactNotes = snapshots.notes.filter((item) => item.entity_type === 'contact' && item.entity_id === contact.id).slice(0, 6);
    const contactFollowups = [...snapshots.overdueFollowups, ...snapshots.followupsToday]
      .filter((item) => item.contact_id === contact.id)
      .slice(0, 6);

    return {
      intent: 'contact_recap' as const,
      context: {
        question,
        contact,
        opportunities: contactOpportunities,
        followups: contactFollowups,
        notes: contactNotes,
      },
    };
  }

  if (opportunity) {
    const opportunityNotes = snapshots.notes.filter((item) => item.entity_type === 'opportunity' && item.entity_id === opportunity.id).slice(0, 6);
    const opportunityFollowups = [...snapshots.overdueFollowups, ...snapshots.followupsToday]
      .filter((item) => item.opportunity_id === opportunity.id)
      .slice(0, 6);
    return {
      intent: 'opportunity_recap' as const,
      context: { question, opportunity, followups: opportunityFollowups, notes: opportunityNotes },
    };
  }

  if (intent === 'count_query') {
    return {
      intent,
      context: {
        question,
        counts: snapshots.counts,
        deterministicAnswer: buildCountAnswer(question, snapshots),
      },
    };
  }

  if (intent === 'priority_query' || intent === 'today_followups') {
    return {
      intent,
      context: {
        question,
        counts: snapshots.counts,
        followupsToday: snapshots.followupsToday,
        overdueFollowups: snapshots.overdueFollowups.slice(0, 8),
        staleOpportunities: snapshots.staleOpportunities.slice(0, 8),
        deterministicAnswer: buildPriorityAnswer(snapshots),
      },
    };
  }

  if (intent === 'missing_followups') {
    return buildMissingFollowupsContext(question, snapshots);
  }

  if (intent === 'stale_opportunities') {
    const stale = snapshots.staleOpportunities
      .filter((item) => (amount ? Number(item.value_estimate ?? 0) >= amount : true))
      .filter((item) => {
        if (!city) return true;
        const company = snapshots.companies.find((entry) => entry.id === item.company_id);
        return normalize(company?.city ?? '').includes(normalize(city));
      })
      .slice(0, 12);

    return {
      intent,
      context: {
        question,
        amount,
        city,
        staleOpportunities: stale,
      },
    };
  }

  if (intent === 'pipeline_filter') {
    const filtered = snapshots.opportunities
      .filter((item) => (amount ? Number(item.value_estimate ?? 0) >= amount : true))
      .filter((item) => {
        if (!city) return true;
        const company = snapshots.companies.find((entry) => entry.id === item.company_id);
        return normalize(company?.city ?? '').includes(normalize(city));
      })
      .sort((a, b) => Number(b.value_estimate ?? 0) - Number(a.value_estimate ?? 0))
      .slice(0, 12);
    return {
      intent,
      context: {
        question,
        amount,
        city,
        opportunities: filtered,
      },
    };
  }

  return {
    intent: 'general' as const,
    context: {
      question,
      counts: snapshots.counts,
      todayFollowups: snapshots.followupsToday.slice(0, 8),
      overdueFollowups: snapshots.overdueFollowups.slice(0, 8),
      staleOpportunities: snapshots.staleOpportunities.slice(0, 8),
      recentOpportunities: snapshots.opportunities.slice(0, 8),
      recentCompanies: snapshots.companies.slice(0, 8),
      recentContacts: snapshots.contacts.slice(0, 8),
    },
  };
}

function buildDeterministicAnswer(intent: QueryIntent, context: Record<string, unknown>) {
  const deterministicAnswer = context.deterministicAnswer;
  if (typeof deterministicAnswer === 'string' && deterministicAnswer.trim()) {
    return deterministicAnswer.trim();
  }

  if (intent === 'missing_followups') {
    const opportunities = Array.isArray(context.opportunities)
      ? (context.opportunities as Array<{
          title?: string;
          company?: string | null;
          stage?: string | null;
          valueEstimate?: number | null;
          daysWithoutUpdate?: number | null;
        }>)
      : [];

    if (opportunities.length === 0) {
      return 'Non vedo opportunità aperte senza follow-up tra i record analizzati.';
    }

    const top = opportunities.slice(0, 4).map((item) => {
      const company = item.company ? ` / ${item.company}` : '';
      const stage = item.stage ? `, fase ${item.stage}` : '';
      const days = typeof item.daysWithoutUpdate === 'number' ? `, ferma da ${item.daysWithoutUpdate} giorni` : '';
      const value = item.valueEstimate ? `, ${formatCurrency(item.valueEstimate)}` : '';
      return `- ${item.title}${company}${stage}${value}${days}`;
    });

    return ['Le opportunità senza follow-up aperto da guardare prima sono:', ...top].join('\n');
  }

  return null;
}

export async function answerCrmQuery(question: string): Promise<CrmQueryResult> {
  const snapshots = await getSnapshots();
  const { intent, context } = buildContext(question, snapshots);
  const deterministicAnswer = buildDeterministicAnswer(intent, context);

  if (deterministicAnswer) {
    return {
      intent,
      context,
      answer: deterministicAnswer,
      provider: 'rule-engine',
      model: 'deterministic',
    };
  }

  const result = await runAiCompletion({
    task: 'query_crm',
    maxTokens: 420,
    messages: [
      {
        role: 'system',
        content:
          'Sei Quadra, assistente CRM. Rispondi solo usando il contesto JSON fornito. Non inventare numeri o record mancanti. Se il contesto non basta, dillo chiaramente. Scrivi in italiano, tono operativo, massimo 8 righe o 6 bullet. Quando possibile restituisci: 1) risposta diretta, 2) elementi ordinati per priorità, 3) prossima azione consigliata.',
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
