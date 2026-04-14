import { createClient } from '@/lib/supabase/server'
import { extractSiriFollowup } from '@/lib/ai'

type Candidate = {
  id: string
  name: string
  companyId?: string | null
}

type ContactOption = { id: string; full_name: string; company_id?: string | null }
type OpportunityOption = { id: string; title: string; company_id?: string | null }
type CompanyOption = { id: string; name: string }

type ParsedVoiceFollowup = {
  personName: string | null
  companyName: string | null
  summary: string
  followUpTitle: string
  dueDateISO: string | null
  priority: 'low' | 'medium' | 'high'
  statusSignal: string | null
  reminderTitle: string
  reminderNotes: string
}

type MatchResult = {
  match: Candidate
  score: number
  ambiguous: boolean
  alternatives: Candidate[]
} | null

export type ProcessedVoiceResult = {
  parsed: ParsedVoiceFollowup
  canAutoCreate: boolean
  createdFollowupId: string | null
  reminder: {
    title: string
    dueDateISO: string | null
    notes: string
  }
  links: {
    companyId: string | null
    contactId: string | null
    opportunityId: string | null
  }
  needsConfirmation: boolean
  question: string | null
  matches: {
    contact: MatchResult
    opportunity: MatchResult
    company: MatchResult
  }
  options: {
    contacts: Array<{ id: string; label: string }>
    opportunities: Array<{ id: string; label: string }>
    companies: Array<{ id: string; label: string }>
  }
}

export type ConfirmVoiceFollowupInput = {
  note: string
  parsed: ParsedVoiceFollowup
  selectedContactId?: string | null
  selectedOpportunityId?: string | null
  selectedCompanyId?: string | null
}

export type ConfirmVoiceFollowupResult = {
  createdFollowupId: string
  reminder: {
    title: string
    dueDateISO: string | null
    notes: string
  }
  spokenResponse: string
  links: {
    companyId: string | null
    contactId: string | null
    opportunityId: string | null
  }
}

function normalize(value: string | null | undefined) {
  return (value || '').trim().toLowerCase()
}

function scoreCandidate(target: string, candidate: string) {
  const a = normalize(target)
  const b = normalize(candidate)
  if (!a || !b) return 0
  if (a === b) return 100
  if (b.includes(a) || a.includes(b)) return 70
  const aWords = a.split(/\s+/).filter(Boolean)
  const bWords = b.split(/\s+/).filter(Boolean)
  const overlap = aWords.filter((word) => bWords.includes(word)).length
  if (!overlap) return 0
  return overlap * 20
}

function bestMatch(target: string | null | undefined, candidates: Candidate[]): MatchResult {
  if (!target) return null

  const scored = candidates
    .map((candidate) => ({ candidate, score: scoreCandidate(target, candidate.name) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)

  if (!scored.length) return null

  const [first, second] = scored
  const ambiguous = !!second && first.score - second.score < 15

  return {
    match: first.candidate,
    score: first.score,
    ambiguous,
    alternatives: scored.slice(1, 4).map((item) => item.candidate),
  }
}

function toDueAt(input: string | null) {
  if (!input) return null
  const raw = input.trim()
  if (!raw) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return `${raw}T09:00:00.000Z`
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString()
}

function makeLabel(name: string, companyName?: string | null) {
  return companyName ? `${name} - ${companyName}` : name
}

async function getContext() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  const user = auth.user
  if (!user) throw new Error('Utente non autenticato')

  const [{ data: contacts }, { data: opportunities }, { data: companies }] = await Promise.all([
    supabase.from('contacts').select('id, full_name, company_id').eq('owner_id', user.id).limit(200),
    supabase.from('opportunities').select('id, title, company_id').eq('owner_id', user.id).limit(200),
    supabase.from('companies').select('id, name').eq('owner_id', user.id).limit(200),
  ])

  return {
    supabase,
    user,
    contacts: contacts ?? [],
    opportunities: opportunities ?? [],
    companies: companies ?? [],
  }
}

async function createFollowupAndNote(params: {
  userId: string
  supabase: Awaited<ReturnType<typeof createClient>>
  note: string
  parsed: ParsedVoiceFollowup
  companyId: string | null
  contactId: string | null
  opportunityId: string | null
}) {
  const { supabase, userId, note, parsed, companyId, contactId, opportunityId } = params
  const dueAt = toDueAt(parsed.dueDateISO)
  if (!dueAt) throw new Error('Data follow-up mancante o non valida')

  const { data: followup, error: followupError } = await supabase
    .from('followups')
    .insert({
      owner_id: userId,
      company_id: companyId,
      contact_id: contactId,
      opportunity_id: opportunityId,
      title: parsed.followUpTitle,
      description: parsed.summary,
      due_at: dueAt,
      priority: parsed.priority,
      status: 'pending',
      created_by: userId,
    })
    .select('id')
    .single()

  if (followupError || !followup) {
    throw new Error(followupError?.message || 'Impossibile creare il follow-up')
  }

  await supabase.from('notes').insert({
    owner_id: userId,
    entity_type: contactId ? 'contact' : opportunityId ? 'opportunity' : 'company',
    entity_id: contactId || opportunityId || companyId,
    title: parsed.followUpTitle,
    body: note,
    created_by: userId,
  })

  return followup.id as string
}

function buildQuestion(result: { contact: MatchResult; opportunity: MatchResult; company: MatchResult }) {
  if (result.contact?.ambiguous) return 'Ho trovato piu contatti compatibili. Quale contatto intendi?'
  if (result.opportunity?.ambiguous) return 'Ho trovato piu opportunita compatibili. Quale opportunita intendi?'
  if (result.company?.ambiguous) return 'Ho trovato piu aziende compatibili. Quale azienda intendi?'
  if (!result.contact && !result.opportunity && !result.company) {
    return 'Non ho trovato un collegamento chiaro. Scegli tu il record corretto.'
  }
  return 'Mi serve una conferma rapida prima di salvare.'
}

export async function processVoiceFollowup(note: string): Promise<ProcessedVoiceResult> {
  const parsed = (await extractSiriFollowup(note)).parsed as ParsedVoiceFollowup
  const dueAt = toDueAt(parsed.dueDateISO)
  const { supabase, user, contacts, opportunities, companies } = await getContext()

  const contactMatch = bestMatch(
    parsed.personName,
    contacts.map((item: ContactOption) => ({ id: item.id, name: item.full_name, companyId: item.company_id })),
  )

  const opportunityMatch = bestMatch(
    parsed.followUpTitle,
    opportunities.map((item: OpportunityOption) => ({ id: item.id, name: item.title, companyId: item.company_id })),
  )

  const companyMatch = bestMatch(
    parsed.companyName,
    companies.map((item: CompanyOption) => ({ id: item.id, name: item.name })),
  )

  const companyId = opportunityMatch?.match.companyId || contactMatch?.match.companyId || companyMatch?.match.id || null
  const contactId = contactMatch?.match.id || null
  const opportunityId = opportunityMatch?.match.id || null

  const ambiguous = Boolean(contactMatch?.ambiguous || opportunityMatch?.ambiguous || companyMatch?.ambiguous)
  const hasLink = Boolean(companyId || contactId || opportunityId)
  const canAutoCreate = Boolean(hasLink && dueAt && !ambiguous)

  let createdFollowupId: string | null = null
  if (canAutoCreate) {
    createdFollowupId = await createFollowupAndNote({
      supabase,
      userId: user.id,
      note,
      parsed,
      companyId,
      contactId,
      opportunityId,
    })
  }

  return {
    parsed,
    canAutoCreate,
    createdFollowupId,
    reminder: {
      title: parsed.reminderTitle || parsed.followUpTitle,
      dueDateISO: parsed.dueDateISO,
      notes: parsed.reminderNotes || parsed.summary,
    },
    links: { companyId, contactId, opportunityId },
    needsConfirmation: !canAutoCreate,
    question: canAutoCreate ? null : buildQuestion({ contact: contactMatch, opportunity: opportunityMatch, company: companyMatch }),
    matches: {
      contact: contactMatch,
      opportunity: opportunityMatch,
      company: companyMatch,
    },
    options: {
      contacts: contacts.map((item: ContactOption) => ({ id: item.id, label: makeLabel(item.full_name, companies.find((company: CompanyOption) => company.id === item.company_id)?.name) })),
      opportunities: opportunities.map((item: OpportunityOption) => ({ id: item.id, label: makeLabel(item.title, companies.find((company: CompanyOption) => company.id === item.company_id)?.name) })),
      companies: companies.map((item: CompanyOption) => ({ id: item.id, label: item.name })),
    },
  }
}

export async function confirmVoiceFollowup(input: ConfirmVoiceFollowupInput): Promise<ConfirmVoiceFollowupResult> {
  const { supabase, user } = await getContext()
  const companyId = input.selectedCompanyId || null
  const contactId = input.selectedContactId || null
  const opportunityId = input.selectedOpportunityId || null

  const createdFollowupId = await createFollowupAndNote({
    supabase,
    userId: user.id,
    note: input.note,
    parsed: input.parsed,
    companyId,
    contactId,
    opportunityId,
  })

  return {
    createdFollowupId,
    reminder: {
      title: input.parsed.reminderTitle || input.parsed.followUpTitle,
      dueDateISO: input.parsed.dueDateISO,
      notes: input.parsed.reminderNotes || input.parsed.summary,
    },
    spokenResponse: 'Ho creato il follow-up in Quadra.',
    links: { companyId, contactId, opportunityId },
  }
}
