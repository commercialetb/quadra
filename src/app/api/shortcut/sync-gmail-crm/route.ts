import { NextResponse } from 'next/server'
import { isAuthenticatedAppRequest, verifyShortcutToken } from '@/lib/shortcut/auth'
import {
  buildEntityHref,
  createShortcutActivity,
  createShortcutFollowup,
  findOrCreateEmailSenderEntities,
  inferCallOutcome,
  toAbsoluteAppUrl,
  type ShortcutPriority,
} from '@/lib/shortcut/quadra-shortcuts'

type GmailSyncItem = {
  fromEmail?: string
  email?: string
  fromName?: string
  senderName?: string
  subject?: string
  snippet?: string
  summary?: string
  body?: string
  content?: string
  gmailLabels?: unknown
  labels?: unknown
  labelNames?: unknown
  threadId?: string
  messageId?: string
  receivedAt?: string
  internalDate?: string
}

type TriageBucket = 'sales' | 'followup' | 'informational' | 'ignore'
type TriageReason =
  | 'explicit_request'
  | 'commercial_interest'
  | 'needs_reply'
  | 'meeting_signal'
  | 'informational_only'
  | 'newsletter_or_automation'
  | 'already_closed'
  | 'missing_content'

function normalizeLabels(input: unknown) {
  if (Array.isArray(input)) {
    return input.map((item) => String(item || '').trim()).filter(Boolean)
  }
  if (typeof input === 'string') {
    return input.split(',').map((item) => item.trim()).filter(Boolean)
  }
  return [] as string[]
}

function hasRequiredLabel(labels: string[], requiredLabel: string) {
  const required = requiredLabel.trim().toLowerCase()
  return labels.some((label) => label.trim().toLowerCase() === required)
}

function normalizeItem(raw: GmailSyncItem) {
  const gmailLabels = normalizeLabels(raw.gmailLabels || raw.labels || raw.labelNames)
  return {
    fromEmail: String(raw.fromEmail || raw.email || '').trim(),
    fromName: String(raw.fromName || raw.senderName || '').trim() || null,
    subject: String(raw.subject || 'Email Gmail CRM').trim(),
    snippet: String(raw.snippet || raw.summary || '').trim(),
    content: String(raw.body || raw.content || raw.snippet || raw.summary || raw.subject || '').trim(),
    gmailLabels,
    threadId: String(raw.threadId || '').trim() || null,
    messageId: String(raw.messageId || '').trim() || null,
    receivedAt: String(raw.receivedAt || raw.internalDate || '').trim() || new Date().toISOString(),
  }
}

function triageEmail(item: ReturnType<typeof normalizeItem>) {
  const text = `${item.subject} ${item.snippet} ${item.content}`.toLowerCase()
  if (!text.trim()) {
    return { bucket: 'ignore' as const, reason: 'missing_content' as const, shouldCreateFollowup: false, urgencyScore: 0 }
  }

  const ignorePatterns = [
    'newsletter',
    'unsubscribe',
    'fattura allegata',
    'invoice attached',
    'noreply',
    'no-reply',
    'conferma automatica',
    'messaggio automatico',
    'automatic reply',
    'out of office',
    'fuori sede',
  ]
  if (ignorePatterns.some((token) => text.includes(token))) {
    return { bucket: 'ignore' as const, reason: 'newsletter_or_automation' as const, shouldCreateFollowup: false, urgencyScore: 0 }
  }

  const informationalPatterns = [
    'per conoscenza',
    'for your information',
    'in allegato il report',
    'ti inoltro',
    'as discussed',
    'solo aggiornamento',
    'just an update',
  ]
  if (informationalPatterns.some((token) => text.includes(token))) {
    return { bucket: 'informational' as const, reason: 'informational_only' as const, shouldCreateFollowup: false, urgencyScore: 1 }
  }

  const explicitRequestPatterns = [
    'preventivo',
    'proposta',
    'offerta',
    'richiesta',
    'quando possiamo sentirci',
    'call me',
    'can we talk',
    'schedule',
    'meeting',
    'demo',
    'presentazione',
    'interessato',
  ]
  if (explicitRequestPatterns.some((token) => text.includes(token))) {
    return { bucket: 'sales' as const, reason: 'explicit_request' as const, shouldCreateFollowup: true, urgencyScore: 3 }
  }

  const followupPatterns = [
    'fammi sapere',
    'attendo riscontro',
    'rispondimi',
    'reply',
    'risposta',
    'richiamami',
    'ricontattami',
    'sentiamoci',
    'ci aggiorniamo',
  ]
  if (followupPatterns.some((token) => text.includes(token))) {
    return { bucket: 'followup' as const, reason: 'needs_reply' as const, shouldCreateFollowup: true, urgencyScore: 2 }
  }

  const meetingPatterns = ['incontro', 'appuntamento', 'zoom', 'teams', 'meet', 'riunione']
  if (meetingPatterns.some((token) => text.includes(token))) {
    return { bucket: 'followup' as const, reason: 'meeting_signal' as const, shouldCreateFollowup: true, urgencyScore: 2 }
  }

  const closedPatterns = ['non interessato', 'closed lost', 'chiuso', 'annulla', 'cancelled']
  if (closedPatterns.some((token) => text.includes(token))) {
    return { bucket: 'informational' as const, reason: 'already_closed' as const, shouldCreateFollowup: false, urgencyScore: 0 }
  }

  return { bucket: 'informational' as const, reason: 'informational_only' as const, shouldCreateFollowup: false, urgencyScore: 1 }
}

function resolveFollowupTitle(bucket: TriageBucket, baseTitle: string) {
  switch (bucket) {
    case 'sales':
      return 'Seguire lead da Gmail CRM'
    case 'followup':
      return 'Rispondere a email CRM'
    default:
      return baseTitle
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const authorizedShortcut = verifyShortcutToken(request, body?.shortcutToken)
    const authorizedApp = authorizedShortcut ? false : await isAuthenticatedAppRequest()
    if (!authorizedShortcut && !authorizedApp) {
      return NextResponse.json({ ok: false, error: 'Unauthorized shortcut request' }, { status: 401 })
    }

    const requiredLabel = String(body?.requiredLabel || 'CRM').trim() || 'CRM'
    const itemsInput = Array.isArray(body?.emails) ? (body.emails as GmailSyncItem[]) : []
    const maxItems = Math.min(Math.max(Number(body?.maxItems || 20), 1), 100)
    const createCompanyIfMissing = typeof body?.createCompanyIfMissing === 'boolean' ? Boolean(body.createCompanyIfMissing) : true
    const createContactIfMissing = typeof body?.createContactIfMissing === 'boolean' ? Boolean(body.createContactIfMissing) : true
    const createFollowup = typeof body?.createFollowup === 'boolean' ? Boolean(body.createFollowup) : true
    const triageMode = String(body?.triageMode || 'smart').trim() || 'smart'
    const followupTitle = String(body?.followupTitle || 'Seguire email CRM').trim() || 'Seguire email CRM'
    const fallbackPriority = String(body?.priority || '').trim() as ShortcutPriority

    const candidates = itemsInput.slice(0, maxItems).map(normalizeItem)
    const results: Array<Record<string, unknown>> = []

    for (const item of candidates) {
      if (!item.fromEmail) {
        results.push({ ok: false, ignored: true, reason: 'missing_from_email', subject: item.subject })
        continue
      }
      if (!hasRequiredLabel(item.gmailLabels, requiredLabel)) {
        results.push({ ok: true, ignored: true, reason: 'missing_required_label', fromEmail: item.fromEmail, subject: item.subject, gmailLabels: item.gmailLabels })
        continue
      }

      const triage = triageEmail(item)
      if (triageMode === 'strict' && triage.bucket === 'ignore') {
        results.push({
          ok: true,
          ignored: true,
          reason: 'triage_ignored',
          fromEmail: item.fromEmail,
          subject: item.subject,
          gmailLabels: item.gmailLabels,
          triage,
        })
        continue
      }

      const provision = await findOrCreateEmailSenderEntities({
        fromEmail: item.fromEmail,
        fromName: item.fromName,
        createCompanyIfMissing,
        createContactIfMissing,
      })

      const entityType = provision.contactId ? 'contact' : provision.companyId ? 'company' : null
      const entityId = provision.contactId || provision.companyId || null
      if (!entityType || !entityId) {
        results.push({ ok: false, fromEmail: item.fromEmail, subject: item.subject, error: 'unable_to_link_entity', triage })
        continue
      }

      const inference = inferCallOutcome(`${item.subject} ${item.snippet} ${item.content}`)
      const activityBody = [
        `Gmail labels: ${item.gmailLabels.join(', ') || requiredLabel}`,
        `Triage: ${triage.bucket}`,
        `Reason: ${triage.reason}`,
        item.threadId ? `Thread ID: ${item.threadId}` : null,
        item.messageId ? `Message ID: ${item.messageId}` : null,
        item.snippet || null,
        item.content,
      ].filter(Boolean).join('\n\n')

      const activityId = await createShortcutActivity({
        entityType,
        entityId,
        kind: 'email',
        subject: item.subject,
        content: activityBody,
        happenedAt: item.receivedAt,
      })

      const suggestedDate = String(inference.suggestedFollowupDate || '').trim()
      const priority = (fallbackPriority || inference.suggestedPriority || (triage.urgencyScore >= 3 ? 'high' : triage.urgencyScore >= 2 ? 'medium' : 'low')) as ShortcutPriority
      const shouldCreateFollowup = createFollowup && triage.shouldCreateFollowup && Boolean(suggestedDate)
      let createdFollowupId: string | null = null
      if (shouldCreateFollowup) {
        createdFollowupId = await createShortcutFollowup({
          entityType,
          entityId,
          title: resolveFollowupTitle(triage.bucket, followupTitle),
          description: item.snippet || item.content,
          dueDate: suggestedDate,
          priority,
        })
      }

      results.push({
        ok: true,
        fromEmail: provision.email,
        fromName: item.fromName,
        subject: item.subject,
        gmailLabels: item.gmailLabels,
        entityType,
        entityId,
        companyId: provision.companyId,
        companyName: provision.companyName,
        contactId: provision.contactId,
        contactName: provision.contactName,
        createdCompany: provision.createdCompany,
        createdContact: provision.createdContact,
        activityId,
        createdFollowupId,
        followUpCreated: Boolean(createdFollowupId),
        triage,
        inference,
        openUrl: toAbsoluteAppUrl(buildEntityHref(entityType, entityId)),
      })
    }

    const processed = results.filter((item) => item.ok && !item.ignored)
    const ignored = results.filter((item) => item.ignored)
    const failed = results.filter((item) => item.ok === false && !item.ignored)
    const createdCompanies = processed.filter((item) => item.createdCompany).length
    const createdContacts = processed.filter((item) => item.createdContact).length
    const followupsCreated = processed.filter((item) => item.followUpCreated).length
    const getTriageBucket = (item: Record<string, unknown>) => {
      const triage = item.triage as { bucket?: string } | undefined
      return triage?.bucket || null
    }
    const triageCounts = {
      sales: processed.filter((item) => getTriageBucket(item) === 'sales').length,
      followup: processed.filter((item) => getTriageBucket(item) === 'followup').length,
      informational: processed.filter((item) => getTriageBucket(item) === 'informational').length,
      ignore: [...processed, ...ignored].filter((item) => getTriageBucket(item) === 'ignore').length,
    }

    const spokenResponse = processed.length
      ? `Ho sincronizzato ${processed.length} email Gmail con etichetta ${requiredLabel}. Sales: ${triageCounts.sales}. Da seguire: ${triageCounts.followup}. Informative: ${triageCounts.informational}.${createdCompanies ? ` Aziende create: ${createdCompanies}.` : ''}${createdContacts ? ` Contatti creati: ${createdContacts}.` : ''}${followupsCreated ? ` Follow-up creati: ${followupsCreated}.` : ''}${ignored.length ? ` Email ignorate: ${ignored.length}.` : ''}`
      : ignored.length
        ? `Nessuna email CRM nuova da sincronizzare. Email ignorate: ${ignored.length}.`
        : 'Nessuna email utile da sincronizzare.'

    return NextResponse.json({
      ok: true,
      requiredLabel,
      triageMode,
      received: candidates.length,
      processedCount: processed.length,
      ignoredCount: ignored.length,
      failedCount: failed.length,
      createdCompanies,
      createdContacts,
      followupsCreated,
      triageCounts,
      results,
      openUrl: toAbsoluteAppUrl('/capture/siri'),
      spokenResponse,
    })
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
