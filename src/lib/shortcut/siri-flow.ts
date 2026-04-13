import { createClient } from '@/lib/supabase/server'
import { extractSiriFollowup } from '@/lib/ai'

type Candidate = {
  id: string
  name: string
  companyId?: string | null
}

type ParsedVoiceFollowup = {
  personName: string | null
  projectName: string | null
  companyName: string | null
  summary: string
  followUpTitle: string
  dueDateISO: string | null
  priority: 'low' | 'medium' | 'high'
  statusSignal: string | null
  reminderTitle: string
  reminderNotes: string
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

function bestMatch(target: string | null | undefined, candidates: Candidate[]) {
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

export async function processVoiceFollowup(note: string) {
  const parsed = (await extractSiriFollowup(note)).parsed as ParsedVoiceFollowup
  const dueAt = toDueAt(parsed.dueDateISO)

  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  const user = auth.user
  if (!user) throw new Error('Utente non autenticato')

  const [{ data: contacts }, { data: opportunities }, { data: companies }] = await Promise.all([
    supabase.from('contacts').select('id, full_name, company_id').eq('owner_id', user.id).limit(200),
    supabase.from('opportunities').select('id, title, company_id').eq('owner_id', user.id).limit(200),
    supabase.from('companies').select('id, name').eq('owner_id', user.id).limit(200),
  ])

  const contactMatch = bestMatch(
    parsed.personName,
    (contacts ?? []).map((item) => ({ id: item.id, name: item.full_name, companyId: item.company_id }))
  )
  const opportunityMatch = bestMatch(
    parsed.projectName,
    (opportunities ?? []).map((item) => ({ id: item.id, name: item.title, companyId: item.company_id }))
  )
  const companyMatch = bestMatch(
    parsed.companyName,
    (companies ?? []).map((item) => ({ id: item.id, name: item.name }))
  )

  const companyId = opportunityMatch?.match.companyId || contactMatch?.match.companyId || companyMatch?.match.id || null
  const contactId = contactMatch?.match.id || null
  const opportunityId = opportunityMatch?.match.id || null

  const ambiguous = Boolean(contactMatch?.ambiguous || opportunityMatch?.ambiguous || companyMatch?.ambiguous)
  const hasLink = Boolean(companyId || contactId || opportunityId)
  const canAutoCreate = Boolean(hasLink && dueAt && !ambiguous)

  let createdFollowupId: string | null = null

  if (canAutoCreate) {
    const description = [
      parsed.summary,
      parsed.statusSignal ? `Segnale stato: ${parsed.statusSignal}` : null,
      `Dettato originale: ${note}`,
    ]
      .filter(Boolean)
      .join('\n\n')

    const { data: followup, error: followupError } = await supabase
      .from('followups')
      .insert({
        owner_id: user.id,
        company_id: companyId,
        contact_id: contactId,
        opportunity_id: opportunityId,
        title: parsed.followUpTitle,
        description,
        due_at: dueAt,
        status: 'pending',
        priority: parsed.priority,
        created_by: user.id,
      })
      .select('id')
      .single()

    if (followupError) throw new Error(followupError.message)
    createdFollowupId = followup.id

    if (opportunityId) {
      await supabase.from('notes').insert({
        owner_id: user.id,
        entity_type: 'opportunity',
        entity_id: opportunityId,
        title: 'Nota da Siri',
        body: `${parsed.summary}\n\nDettato originale: ${note}`,
        created_by: user.id,
      })
    } else if (contactId) {
      await supabase.from('notes').insert({
        owner_id: user.id,
        entity_type: 'contact',
        entity_id: contactId,
        title: 'Nota da Siri',
        body: `${parsed.summary}\n\nDettato originale: ${note}`,
        created_by: user.id,
      })
    } else if (companyId) {
      await supabase.from('notes').insert({
        owner_id: user.id,
        entity_type: 'company',
        entity_id: companyId,
        title: 'Nota da Siri',
        body: `${parsed.summary}\n\nDettato originale: ${note}`,
        created_by: user.id,
      })
    }
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
    links: {
      companyId,
      contactId,
      opportunityId,
    },
    matches: {
      contact: contactMatch,
      opportunity: opportunityMatch,
      company: companyMatch,
    },
  }
}
