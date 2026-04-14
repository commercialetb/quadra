import { createClient } from '@/lib/supabase/server'

export type ShortcutEntityKind = 'company' | 'contact' | 'opportunity'
export type ShortcutPriority = 'low' | 'medium' | 'high' | 'urgent'
export type CallOutcomeClassification = 'hot' | 'warm' | 'cold' | 'lost' | 'neutral'

type CompanyRow = { id: string; name: string; status?: string | null }
type ContactRow = { id: string; full_name: string; company_id?: string | null }
type OpportunityRow = { id: string; title: string; company_id?: string | null; stage?: string | null }
type TodayAgendaRow = { id: string; title: string; due_at: string; priority?: string | null; status?: string | null; company_id?: string | null; contact_id?: string | null; opportunity_id?: string | null }
type ShortcutReviewQueueRow = { id: string; action_key: string; status: string; query?: string | null; entity_type?: string | null; best_guess_kind?: string | null; best_guess_entity_id?: string | null; best_guess_title?: string | null; ambiguity_reason?: string | null; payload?: Record<string, unknown> | null; candidate_results?: ShortcutSearchResult[] | null; resolved_entity_type?: string | null; resolved_entity_id?: string | null; created_at: string; updated_at: string; processed_result?: Record<string, unknown> | null; resolution_confidence?: ShortcutResolutionConfidence | null; retry_count?: number | null; last_retry_at?: string | null; auto_resolved?: boolean | null; last_error?: string | null }

type ShortcutContext = {
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
  companies: CompanyRow[]
  contacts: ContactRow[]
  opportunities: OpportunityRow[]
}

export type ShortcutSearchResult = {
  kind: ShortcutEntityKind
  id: string
  title: string
  subtitle: string
  href: string
  openUrl: string
  score: number
}

export type ShortcutEntityResolution =
  | { status: 'resolved'; result: ShortcutSearchResult }
  | { status: 'ambiguous'; results: ShortcutSearchResult[] }
  | { status: 'missing' }

export type CallOutcomeInference = {
  classification: CallOutcomeClassification
  confidence: 'low' | 'medium' | 'high'
  suggestedPriority: ShortcutPriority
  suggestedFollowupTitle: string
  suggestedFollowupDate: string | null
  shouldCreateFollowup: boolean
  extractedSignals: string[]
}

export type OpportunityStageSuggestion = {
  stage: string | null
  changed: boolean
}


export type ShortcutReviewAction = 'add_note' | 'log_call_outcome' | 'log_interaction'

export type ShortcutResolutionConfidence = 'low' | 'medium' | 'high'

export type ShortcutReviewItem = {
  id: string
  actionKey: ShortcutReviewAction
  status: 'pending' | 'resolved' | 'dismissed'
  query: string | null
  entityType: ShortcutEntityKind | null
  bestGuessKind: ShortcutEntityKind | null
  bestGuessEntityId: string | null
  bestGuessTitle: string | null
  ambiguityReason: string | null
  payload: Record<string, unknown>
  candidateResults: ShortcutSearchResult[]
  resolvedEntityType: ShortcutEntityKind | null
  resolvedEntityId: string | null
  createdAt: string
  updatedAt: string
  processedResult?: Record<string, unknown> | null
  resolutionConfidence: ShortcutResolutionConfidence
  retryCount: number
  lastRetryAt: string | null
  autoResolved: boolean
  lastError: string | null
}

function normalize(value: string | null | undefined) {
  return (value || '').trim().toLowerCase()
}

function scoreCandidate(query: string, candidate: string) {
  const a = normalize(query)
  const b = normalize(candidate)
  if (!a || !b) return 0
  if (a === b) return 100
  if (b.startsWith(a) || a.startsWith(b)) return 88
  if (b.includes(a) || a.includes(b)) return 75

  const aWords = a.split(/\s+/).filter(Boolean)
  const bWords = b.split(/\s+/).filter(Boolean)
  const overlap = aWords.filter((word) => bWords.includes(word)).length
  return overlap > 0 ? overlap * 20 : 0
}

function scorePair(query: string, primary: string, secondary?: string | null) {
  return Math.max(scoreCandidate(query, primary), Math.max(0, scoreCandidate(query, secondary || '') - 8))
}

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(date)
}

function getAppOrigin() {
  return process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '') || ''
}

function toDueAtIso(input?: string | null) {
  const raw = String(input || '').trim()
  if (!raw) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return `${raw}T09:00:00.000Z`
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString()
}

function addDays(base: Date, days: number) {
  const result = new Date(base)
  result.setDate(result.getDate() + days)
  return result
}

function toLocalDateString(date: Date) {
  return date.toISOString().slice(0, 10)
}

function nextWeekday(targetDay: number) {
  const now = new Date()
  const currentDay = now.getDay()
  let delta = (targetDay - currentDay + 7) % 7
  if (delta === 0) delta = 7
  return toLocalDateString(addDays(now, delta))
}

function inferFollowupDateFromText(text: string): string | null {
  const normalized = normalize(text)
  if (!normalized) return null
  const now = new Date()

  const absolute = normalized.match(/\b(20\d{2}-\d{2}-\d{2})\b/)
  if (absolute) return absolute[1]
  if (normalized.includes('oggi')) return toLocalDateString(now)
  if (normalized.includes('domani')) return toLocalDateString(addDays(now, 1))
  if (normalized.includes('dopodomani')) return toLocalDateString(addDays(now, 2))
  if (normalized.includes('settimana prossima') || normalized.includes('prossima settimana')) return toLocalDateString(addDays(now, 7))
  if (normalized.includes('entro venerdi') || normalized.includes('venerdi')) return nextWeekday(5)
  if (normalized.includes('lunedi')) return nextWeekday(1)
  if (normalized.includes('martedi')) return nextWeekday(2)
  if (normalized.includes('mercoledi')) return nextWeekday(3)
  if (normalized.includes('giovedi')) return nextWeekday(4)
  return null
}

export function inferCallOutcome(outcome: string): CallOutcomeInference {
  const text = normalize(outcome)
  const signals: string[] = []

  const hotPatterns = ['interessato', 'molto interessato', 'vuole proposta', 'mandare proposta', 'preventivo', 'demo', 'richiamare presto', 'chiudere', 'partire']
  const warmPatterns = ['da ricontattare', 'sentiamoci', 'aggiorniamoci', 'richiamare', 'valuta', 'ne parla', 'prossima settimana']
  const coldPatterns = ['freddo', 'non ora', 'piu avanti', 'più avanti', 'rimandare', 'da capire', 'nessuna urgenza']
  const lostPatterns = ['non interessato', 'rifiutato', 'chiuso perso', 'perso', 'non risponde', 'annullato']

  let classification: CallOutcomeClassification = 'neutral'
  let confidence: 'low' | 'medium' | 'high' = 'low'
  let suggestedPriority: ShortcutPriority = 'medium'
  let shouldCreateFollowup = true

  const matchedHot = hotPatterns.filter((p) => text.includes(p))
  const matchedWarm = warmPatterns.filter((p) => text.includes(p))
  const matchedCold = coldPatterns.filter((p) => text.includes(p))
  const matchedLost = lostPatterns.filter((p) => text.includes(p))

  signals.push(...matchedHot, ...matchedWarm, ...matchedCold, ...matchedLost)

  if (matchedLost.length) {
    classification = 'lost'
    confidence = matchedLost.length > 1 ? 'high' : 'medium'
    suggestedPriority = 'low'
    shouldCreateFollowup = false
  } else if (matchedHot.length) {
    classification = 'hot'
    confidence = matchedHot.length > 1 ? 'high' : 'medium'
    suggestedPriority = text.includes('oggi') || text.includes('domani') ? 'urgent' : 'high'
  } else if (matchedWarm.length) {
    classification = 'warm'
    confidence = matchedWarm.length > 1 ? 'high' : 'medium'
    suggestedPriority = 'high'
  } else if (matchedCold.length) {
    classification = 'cold'
    confidence = matchedCold.length > 1 ? 'high' : 'medium'
    suggestedPriority = 'low'
  }

  const suggestedFollowupDate = shouldCreateFollowup
    ? inferFollowupDateFromText(text) || (classification === 'hot'
        ? toLocalDateString(addDays(new Date(), 1))
        : classification === 'warm'
          ? toLocalDateString(addDays(new Date(), 3))
          : classification === 'cold'
            ? toLocalDateString(addDays(new Date(), 14))
            : toLocalDateString(addDays(new Date(), 2)))
    : null

  const suggestedFollowupTitle = classification === 'hot'
    ? 'Inviare proposta e richiamare'
    : classification === 'warm'
      ? 'Ricontatto commerciale'
      : classification === 'cold'
        ? 'Ricontatto più avanti'
        : classification === 'lost'
          ? 'Archiviare esito chiamata'
          : 'Follow-up chiamata'

  return {
    classification,
    confidence,
    suggestedPriority,
    suggestedFollowupTitle,
    suggestedFollowupDate,
    shouldCreateFollowup,
    extractedSignals: Array.from(new Set(signals)).slice(0, 6),
  }
}


export function inferOpportunityStageFromClassification(classification: CallOutcomeClassification) {
  if (classification === 'hot') return 'proposal'
  if (classification === 'warm') return 'qualified'
  if (classification === 'cold') return 'contacted'
  if (classification === 'lost') return 'lost'
  return null
}

export async function updateShortcutOpportunityStage(opportunityId: string, classification: CallOutcomeClassification): Promise<OpportunityStageSuggestion> {
  const nextStage = inferOpportunityStageFromClassification(classification)
  if (!nextStage) return { stage: null, changed: false }

  const { supabase, userId } = await getShortcutContext()
  const { data: current, error: currentError } = await supabase
    .from('opportunities')
    .select('id, stage')
    .eq('owner_id', userId)
    .eq('id', opportunityId)
    .single()

  if (currentError || !current) {
    throw new Error(currentError?.message || 'Impossibile leggere l’opportunità')
  }

  const currentStage = String(current.stage || '').trim() || null
  if (currentStage === nextStage) return { stage: nextStage, changed: false }

  const { error: updateError } = await supabase
    .from('opportunities')
    .update({ stage: nextStage, updated_at: new Date().toISOString() })
    .eq('owner_id', userId)
    .eq('id', opportunityId)

  if (updateError) throw new Error(updateError.message)
  return { stage: nextStage, changed: true }
}

export function buildCallOutcomeSpokenResponse(params: {
  createdFollowupId?: string | null
  inference: CallOutcomeInference
  stageSuggestion?: OpportunityStageSuggestion | null
}) {
  const { createdFollowupId, inference, stageSuggestion } = params
  if (inference.classification === 'lost') {
    return 'Ho registrato l’esito chiamata come non interessato in Quadra.'
  }
  if (createdFollowupId) {
    if (inference.classification === 'hot') {
      return `Ho registrato l’esito chiamata.${stageSuggestion?.changed && stageSuggestion.stage ? ` Ho anche aggiornato l'opportunità a ${stageSuggestion.stage}.` : ''} Il lead sembra caldo e ho creato subito il follow-up in Quadra.`
    }
    if (inference.classification === 'warm') {
      return `Ho registrato l’esito chiamata.${stageSuggestion?.changed && stageSuggestion.stage ? ` Ho aggiornato anche lo stage a ${stageSuggestion.stage}.` : ''} Ho preparato il prossimo follow-up in Quadra.`
    }
    return `Ho registrato l’esito chiamata.${stageSuggestion?.changed && stageSuggestion.stage ? ` Ho aggiornato anche lo stage a ${stageSuggestion.stage}.` : ''} Ho creato anche il follow-up in Quadra.`
  }
  return `Ho registrato l’esito chiamata in Quadra.${stageSuggestion?.changed && stageSuggestion.stage ? ` Ho aggiornato anche lo stage a ${stageSuggestion.stage}.` : ''}`
}

export function buildEntityHref(kind: ShortcutEntityKind, id: string) {
  if (kind === 'company') return `/companies/${id}`
  if (kind === 'contact') return `/contacts/${id}`
  return `/opportunities/${id}`
}

export function toAbsoluteAppUrl(path: string) {
  const origin = getAppOrigin()
  return origin ? `${origin}${path}` : path
}

export async function getShortcutContext(): Promise<ShortcutContext> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) throw new Error('Utente non autenticato')

  const userId = data.user.id
  const [{ data: companies }, { data: contacts }, { data: opportunities }] = await Promise.all([
    supabase.from('companies').select('id, name, status').eq('owner_id', userId).limit(300),
    supabase.from('contacts').select('id, full_name, company_id').eq('owner_id', userId).limit(300),
    supabase.from('opportunities').select('id, title, company_id, stage').eq('owner_id', userId).limit(300),
  ])

  return {
    supabase,
    userId,
    companies: (companies ?? []) as CompanyRow[],
    contacts: (contacts ?? []) as ContactRow[],
    opportunities: (opportunities ?? []) as OpportunityRow[],
  }
}

export function buildCompanyLookup(companies: CompanyRow[]) {
  return new Map(companies.map((company) => [company.id, company.name]))
}

export function searchShortcutRecords(params: {
  query: string
  companies: CompanyRow[]
  contacts: ContactRow[]
  opportunities: OpportunityRow[]
  kind?: ShortcutEntityKind
}): ShortcutSearchResult[] {
  const { query, companies, contacts, opportunities, kind } = params
  const companyLookup = buildCompanyLookup(companies)
  const results: ShortcutSearchResult[] = []

  if (!kind || kind === 'company') {
    for (const company of companies) {
      const score = scorePair(query, company.name, company.status)
      if (score > 0) {
        const href = buildEntityHref('company', company.id)
        results.push({
          kind: 'company',
          id: company.id,
          title: company.name,
          subtitle: company.status ? `Azienda · ${company.status}` : 'Azienda',
          href,
          openUrl: toAbsoluteAppUrl(href),
          score,
        })
      }
    }
  }

  if (!kind || kind === 'contact') {
    for (const contact of contacts) {
      const companyName = contact.company_id ? companyLookup.get(contact.company_id) : null
      const score = scorePair(query, contact.full_name, companyName)
      if (score > 0) {
        const href = buildEntityHref('contact', contact.id)
        results.push({
          kind: 'contact',
          id: contact.id,
          title: contact.full_name,
          subtitle: companyName ? `Contatto · ${companyName}` : 'Contatto',
          href,
          openUrl: toAbsoluteAppUrl(href),
          score,
        })
      }
    }
  }

  if (!kind || kind === 'opportunity') {
    for (const opportunity of opportunities) {
      const companyName = opportunity.company_id ? companyLookup.get(opportunity.company_id) : null
      const score = scorePair(query, opportunity.title, companyName)
      if (score > 0) {
        const href = buildEntityHref('opportunity', opportunity.id)
        results.push({
          kind: 'opportunity',
          id: opportunity.id,
          title: opportunity.title,
          subtitle: companyName ? `Opportunità · ${companyName}` : 'Opportunità',
          href,
          openUrl: toAbsoluteAppUrl(href),
          score,
        })
      }
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 8)
}


export function chooseLikelyShortcutEntity(results: ShortcutSearchResult[]) {
  if (!results.length) return null
  const [first, second] = results
  if (!second) return first
  if (first.score >= 75 && first.score - second.score >= 8) return first
  return null
}

export function estimateShortcutResolutionConfidence(results: ShortcutSearchResult[]): ShortcutResolutionConfidence {
  if (!results.length) return 'low'
  const [first, second] = results
  if (!second) return first.score >= 88 ? 'high' : first.score >= 72 ? 'medium' : 'low'
  if (first.score >= 90 && first.score - second.score >= 15) return 'high'
  if (first.score >= 80 && first.score - second.score >= 8) return 'medium'
  return 'low'
}

export function resolveShortcutEntity(params: {
  query: string
  companies: CompanyRow[]
  contacts: ContactRow[]
  opportunities: OpportunityRow[]
  kind?: ShortcutEntityKind
}): ShortcutEntityResolution {
  const results = searchShortcutRecords(params)
  if (!results.length) return { status: 'missing' }
  if (results.length === 1) return { status: 'resolved', result: results[0] }

  const [first, second] = results
  if (first.score >= 88 && first.score - second.score >= 15) {
    return { status: 'resolved', result: first }
  }

  const likely = chooseLikelyShortcutEntity(results)
  if (likely && likely.score >= 90) {
    return { status: 'resolved', result: likely }
  }

  return { status: 'ambiguous', results: results.slice(0, 5) }
}

export async function createShortcutNote(params: {
  entityType: ShortcutEntityKind
  entityId: string
  title: string
  body: string
}) {
  const { supabase, userId } = await getShortcutContext()
  const entityType = params.entityType
  const noteTitle = params.title.trim() || 'Nota da Siri'
  const noteBody = params.body.trim()
  if (!noteBody) throw new Error('Testo nota mancante')

  const { data, error } = await supabase
    .from('notes')
    .insert({
      owner_id: userId,
      entity_type: entityType,
      entity_id: params.entityId,
      title: noteTitle,
      body: noteBody,
      created_by: userId,
    })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error(error?.message || 'Impossibile creare la nota')
  }

  return data.id as string
}

export async function createShortcutActivity(params: {
  entityType: ShortcutEntityKind
  entityId: string
  subject: string
  content: string
  kind?: 'call' | 'email' | 'meeting' | 'whatsapp' | 'note' | 'task_update' | 'status_change'
  happenedAt?: string | null
}) {
  const { supabase, userId } = await getShortcutContext()
  const subject = params.subject.trim() || 'Attività da Siri'
  const content = params.content.trim()
  if (!content) throw new Error('Contenuto attività mancante')

  const payload: Record<string, unknown> = {
    owner_id: userId,
    kind: params.kind || 'call',
    subject,
    content,
    happened_at: params.happenedAt || new Date().toISOString(),
    created_by: userId,
  }

  if (params.entityType === 'company') payload.company_id = params.entityId
  if (params.entityType === 'contact') payload.contact_id = params.entityId
  if (params.entityType === 'opportunity') payload.opportunity_id = params.entityId

  const { data, error } = await supabase.from('activities').insert(payload).select('id').single()
  if (error || !data) {
    throw new Error(error?.message || 'Impossibile creare l’attività')
  }

  return data.id as string
}

export async function createShortcutFollowup(params: {
  entityType: ShortcutEntityKind
  entityId: string
  title: string
  description?: string
  dueDate: string
  priority?: ShortcutPriority
}) {
  const { supabase, userId } = await getShortcutContext()
  const dueAt = toDueAtIso(params.dueDate)
  if (!dueAt) throw new Error('Data follow-up mancante o non valida')

  const payload: Record<string, unknown> = {
    owner_id: userId,
    title: params.title.trim() || 'Follow-up da Siri',
    description: params.description?.trim() || null,
    due_at: dueAt,
    priority: params.priority || 'medium',
    status: 'pending',
    created_by: userId,
  }

  if (params.entityType === 'company') payload.company_id = params.entityId
  if (params.entityType === 'contact') payload.contact_id = params.entityId
  if (params.entityType === 'opportunity') payload.opportunity_id = params.entityId

  const { data, error } = await supabase.from('followups').insert(payload).select('id').single()
  if (error || !data) {
    throw new Error(error?.message || 'Impossibile creare il follow-up')
  }

  return data.id as string
}

export async function getTodayShortcutAgenda() {
  const { supabase, userId, companies, contacts, opportunities } = await getShortcutContext()
  const companyLookup = buildCompanyLookup(companies)
  const contactLookup = new Map(contacts.map((contact) => [contact.id, contact.full_name]))
  const opportunityLookup = new Map(opportunities.map((opportunity) => [opportunity.id, opportunity.title]))

  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  const { data, error } = await supabase
    .from('followups')
    .select('id, title, due_at, priority, status, company_id, contact_id, opportunity_id')
    .eq('owner_id', userId)
    .gte('due_at', start.toISOString())
    .lt('due_at', end.toISOString())
    .order('due_at', { ascending: true })
    .limit(20)

  if (error) throw new Error(error.message)

  const items = ((data ?? []) as TodayAgendaRow[]).map((item: TodayAgendaRow) => ({
    id: item.id as string,
    title: item.title as string,
    dueAt: item.due_at as string,
    priority: (item.priority as string | null) || 'medium',
    status: (item.status as string | null) || 'pending',
    companyName: item.company_id ? companyLookup.get(item.company_id as string) || null : null,
    contactName: item.contact_id ? contactLookup.get(item.contact_id as string) || null : null,
    opportunityTitle: item.opportunity_id ? opportunityLookup.get(item.opportunity_id as string) || null : null,
    href: '/followups',
    openUrl: toAbsoluteAppUrl('/followups'),
  }))

  const highPriorityCount = items.filter((item: { priority: string }) => item.priority === 'high' || item.priority === 'urgent').length
  const spokenSummary = !items.length
    ? 'Oggi non hai follow-up programmati in Quadra.'
    : items.length === 1
      ? `Hai 1 follow-up oggi alle ${formatTime(items[0].dueAt)}: ${items[0].title}.`
      : `Hai ${items.length} follow-up oggi${highPriorityCount ? `, di cui ${highPriorityCount} ad alta priorità` : ''}. I primi sono ${items
          .slice(0, 3)
          .map((item: { title: string; dueAt: string }) => `${item.title}${formatTime(item.dueAt) ? ` alle ${formatTime(item.dueAt)}` : ''}`)
          .join(', ')}.`

  return {
    date: start.toISOString().slice(0, 10),
    count: items.length,
    highPriorityCount,
    items,
    openUrl: toAbsoluteAppUrl('/followups'),
    spokenSummary,
  }
}


export async function createShortcutReviewItem(params: {
  actionKey: ShortcutReviewAction
  query?: string | null
  entityType?: ShortcutEntityKind | null
  ambiguityReason: string
  payload: Record<string, unknown>
  candidateResults?: ShortcutSearchResult[]
}) {
  const { supabase, userId } = await getShortcutContext()
  const candidateResults = (params.candidateResults || []).slice(0, 5)
  const likely = chooseLikelyShortcutEntity(candidateResults)
  const resolutionConfidence = estimateShortcutResolutionConfidence(candidateResults)
  const { data, error } = await supabase
    .from('shortcut_review_queue')
    .insert({
      owner_id: userId,
      action_key: params.actionKey,
      query: params.query?.trim() || null,
      entity_type: params.entityType || null,
      best_guess_kind: likely?.kind || null,
      best_guess_entity_id: likely?.id || null,
      best_guess_title: likely?.title || null,
      ambiguity_reason: params.ambiguityReason,
      payload: params.payload,
      candidate_results: candidateResults,
      resolution_confidence: resolutionConfidence,
      retry_count: 0,
      auto_resolved: false,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error || !data) throw new Error(error?.message || 'Impossibile creare la review queue Siri')
  return data.id as string
}

export async function listShortcutReviewItems(limit = 20): Promise<ShortcutReviewItem[]> {
  const { supabase, userId } = await getShortcutContext()
  const { data, error } = await supabase
    .from('shortcut_review_queue')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)

  return ((data || []) as ShortcutReviewQueueRow[]).map((item: ShortcutReviewQueueRow) => ({
    id: item.id as string,
    actionKey: item.action_key as ShortcutReviewAction,
    status: item.status as 'pending' | 'resolved' | 'dismissed',
    query: (item.query as string | null) || null,
    entityType: (item.entity_type as ShortcutEntityKind | null) || null,
    bestGuessKind: (item.best_guess_kind as ShortcutEntityKind | null) || null,
    bestGuessEntityId: (item.best_guess_entity_id as string | null) || null,
    bestGuessTitle: (item.best_guess_title as string | null) || null,
    ambiguityReason: (item.ambiguity_reason as string | null) || null,
    payload: (item.payload as Record<string, unknown> | null) || {},
    candidateResults: ((item.candidate_results as ShortcutSearchResult[] | null) || []).slice(0, 5),
    resolvedEntityType: (item.resolved_entity_type as ShortcutEntityKind | null) || null,
    resolvedEntityId: (item.resolved_entity_id as string | null) || null,
    createdAt: item.created_at as string,
    updatedAt: item.updated_at as string,
    processedResult: (item.processed_result as Record<string, unknown> | null) || null,
    resolutionConfidence: ((item.resolution_confidence as ShortcutResolutionConfidence | null) || 'low'),
    retryCount: Number(item.retry_count || 0),
    lastRetryAt: (item.last_retry_at as string | null) || null,
    autoResolved: Boolean(item.auto_resolved),
    lastError: (item.last_error as string | null) || null,
  }))
}

export async function getShortcutReviewItem(id: string): Promise<ShortcutReviewItem | null> {
  const items = await listShortcutReviewItems(50)
  return items.find((item) => item.id === id) || null
}

export async function markShortcutReviewDismissed(id: string) {
  const { supabase, userId } = await getShortcutContext()
  const { error } = await supabase
    .from('shortcut_review_queue')
    .update({ status: 'dismissed', updated_at: new Date().toISOString(), resolved_at: new Date().toISOString() })
    .eq('owner_id', userId)
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function markShortcutReviewResolved(params: {
  id: string
  entityType: ShortcutEntityKind
  entityId: string
  result: Record<string, unknown>
  autoResolved?: boolean
}) {
  const { supabase, userId } = await getShortcutContext()
  const { error } = await supabase
    .from('shortcut_review_queue')
    .update({
      status: 'resolved',
      resolved_entity_type: params.entityType,
      resolved_entity_id: params.entityId,
      processed_result: params.result,
      auto_resolved: Boolean(params.autoResolved),
      updated_at: new Date().toISOString(),
      resolved_at: new Date().toISOString(),
      last_error: null,
    })
    .eq('owner_id', userId)
    .eq('id', params.id)
  if (error) throw new Error(error.message)
}

export async function retryShortcutReviewSearch(id: string) {
  const { supabase, userId, companies, contacts, opportunities } = await getShortcutContext()
  const { data: item, error } = await supabase
    .from('shortcut_review_queue')
    .select('*')
    .eq('owner_id', userId)
    .eq('id', id)
    .single()

  if (error || !item) throw new Error(error?.message || 'Review item non trovato')

  const query = String(item.query || '').trim()
  const entityType = (item.entity_type as ShortcutEntityKind | null) || undefined
  if (!query) throw new Error('Questo elemento non ha una query da ritentare')

  const results = searchShortcutRecords({ query, companies, contacts, opportunities, kind: entityType })
  const likely = chooseLikelyShortcutEntity(results.slice(0, 5))
  const resolutionConfidence = estimateShortcutResolutionConfidence(results.slice(0, 5))
  const ambiguityReason = !results.length
    ? 'Ancora nessun record trovato'
    : likely && resolutionConfidence === 'high'
      ? 'Best guess forte disponibile per auto-resolve'
      : 'Ambiguità ancora presente dopo retry'

  const updatePayload = {
    candidate_results: results.slice(0, 5),
    best_guess_kind: likely?.kind || null,
    best_guess_entity_id: likely?.id || null,
    best_guess_title: likely?.title || null,
    resolution_confidence: resolutionConfidence,
    ambiguity_reason: ambiguityReason,
    retry_count: Number(item.retry_count || 0) + 1,
    last_retry_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_error: !results.length ? 'Nessun record trovato anche dopo retry' : null,
  }

  const { error: updateError } = await supabase
    .from('shortcut_review_queue')
    .update(updatePayload)
    .eq('owner_id', userId)
    .eq('id', id)

  if (updateError) throw new Error(updateError.message)

  return {
    results: results.slice(0, 5),
    bestGuess: likely,
    resolutionConfidence,
    canAutoResolve: Boolean(likely && resolutionConfidence === 'high'),
    reviewOpenUrl: toAbsoluteAppUrl('/capture/siri/review'),
  }
}
