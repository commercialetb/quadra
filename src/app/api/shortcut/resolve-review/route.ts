import { NextResponse } from 'next/server'
import { isAuthenticatedAppRequest, verifyShortcutToken } from '@/lib/shortcut/auth'
import {
  buildCallOutcomeSpokenResponse,
  buildEntityHref,
  createShortcutActivity,
  createShortcutFollowup,
  createShortcutNote,
  getShortcutReviewItem,
  inferCallOutcome,
  markShortcutReviewDismissed,
  markShortcutReviewResolved,
  retryShortcutReviewSearch,
  toAbsoluteAppUrl,
  type ShortcutEntityKind,
  type ShortcutPriority,
} from '@/lib/shortcut/quadra-shortcuts'

async function executeReviewItem(itemId: string, entityType: ShortcutEntityKind, entityId: string, autoResolved = false) {
  const item = await getShortcutReviewItem(itemId)
  if (!item) return { ok: false, status: 404, payload: { ok: false, error: 'Review item not found' } }

  const payload = item.payload || {}
  let result: Record<string, unknown> = { itemId }
  let spokenResponse = autoResolved ? 'Ho risolto automaticamente la review Siri in Quadra.' : 'Ho risolto la review Siri in Quadra.'

  if (item.actionKey === 'add_note') {
    const noteId = await createShortcutNote({
      entityType,
      entityId,
      title: String(payload.title || 'Nota da Siri').trim(),
      body: String(payload.body || payload.note || '').trim(),
    })
    result = { noteId, openUrl: toAbsoluteAppUrl(buildEntityHref(entityType, entityId)) }
    spokenResponse = autoResolved ? 'Ho risolto automaticamente la review e aggiunto la nota in Quadra.' : 'Ho risolto la review e aggiunto la nota in Quadra.'
  }

  if (item.actionKey === 'log_interaction') {
    const content = String(payload.content || '').trim()
    const subject = String(payload.subject || 'Interazione registrata').trim()
    const kind = String(payload.kind || 'meeting').trim() as 'email' | 'meeting' | 'whatsapp' | 'note' | 'task_update' | 'status_change'
    const activityId = await createShortcutActivity({ entityType, entityId, subject, content, kind, happenedAt: typeof payload.happenedAt === 'string' ? payload.happenedAt : null })
    const inference = inferCallOutcome(content)
    let createdFollowupId: string | null = null
    const requestedCreate = typeof payload.createFollowup === 'boolean' ? Boolean(payload.createFollowup) : (kind === 'meeting' || kind === 'email') && inference.shouldCreateFollowup
    const followupDate = String(payload.followupDate || inference.suggestedFollowupDate || '').trim()
    if (requestedCreate && followupDate) {
      createdFollowupId = await createShortcutFollowup({
        entityType,
        entityId,
        title: String(payload.followupTitle || (kind === 'email' ? 'Seguire email' : kind === 'meeting' ? 'Follow-up meeting' : inference.suggestedFollowupTitle) || 'Follow-up da Siri').trim(),
        description: content,
        dueDate: followupDate,
        priority: String(payload.priority || inference.suggestedPriority || 'medium').trim() as ShortcutPriority,
      })
    }
    result = { activityId, createdFollowupId, openUrl: toAbsoluteAppUrl(buildEntityHref(entityType, entityId)) }
    spokenResponse = createdFollowupId
      ? autoResolved
        ? 'Ho risolto automaticamente la review, registrato l’interazione e creato il follow-up in Quadra.'
        : 'Ho risolto la review, registrato l’interazione e creato il follow-up in Quadra.'
      : autoResolved
        ? 'Ho risolto automaticamente la review e registrato l’interazione in Quadra.'
        : 'Ho risolto la review e registrato l’interazione in Quadra.'
  }

  if (item.actionKey === 'log_call_outcome') {
    const outcome = String(payload.outcome || payload.body || payload.note || '').trim()
    const subject = String(payload.subject || 'Esito chiamata').trim()
    const inference = inferCallOutcome(outcome)
    const activityId = await createShortcutActivity({ entityType, entityId, subject, content: outcome, kind: 'call' })
    const createFollowup = (typeof payload.createFollowup === 'boolean' ? Boolean(payload.createFollowup) : inference.shouldCreateFollowup) && inference.shouldCreateFollowup
    const followupDate = String(payload.followupDate || inference.suggestedFollowupDate || '').trim()
    let createdFollowupId: string | null = null
    if (createFollowup && followupDate) {
      createdFollowupId = await createShortcutFollowup({
        entityType,
        entityId,
        title: String(payload.followupTitle || inference.suggestedFollowupTitle || 'Richiamo da Siri').trim(),
        description: outcome,
        dueDate: followupDate,
        priority: String(payload.priority || inference.suggestedPriority || 'medium').trim() as ShortcutPriority,
      })
    }
    result = { activityId, createdFollowupId, openUrl: toAbsoluteAppUrl(buildEntityHref(entityType, entityId)) }
    spokenResponse = buildCallOutcomeSpokenResponse({ createdFollowupId, inference, stageSuggestion: null })
    if (autoResolved) spokenResponse = `Auto-resolve riuscito. ${spokenResponse}`
  }

  await markShortcutReviewResolved({ id: itemId, entityType, entityId, result, autoResolved })
  return { ok: true, status: 200, payload: { ok: true, ...result, spokenResponse, autoResolved } }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const shortcutToken = typeof body?.shortcutToken === 'string' ? body.shortcutToken : ''
    const authorizedShortcut = verifyShortcutToken(request, shortcutToken)
    const authorizedApp = authorizedShortcut ? false : await isAuthenticatedAppRequest()
    if (!authorizedShortcut && !authorizedApp) {
      return NextResponse.json({ ok: false, error: 'Unauthorized shortcut request' }, { status: 401 })
    }

    const itemId = String(body?.itemId || '').trim()
    const mode = String(body?.mode || 'resolve').trim() as 'resolve' | 'dismiss' | 'retry' | 'auto_resolve'
    if (!itemId) return NextResponse.json({ ok: false, error: 'Missing itemId' }, { status: 400 })

    if (mode === 'dismiss') {
      await markShortcutReviewDismissed(itemId)
      return NextResponse.json({ ok: true, dismissed: true })
    }

    if (mode === 'retry') {
      const retryResult = await retryShortcutReviewSearch(itemId)
      if (retryResult.canAutoResolve && retryResult.bestGuess) {
        const execution = await executeReviewItem(itemId, retryResult.bestGuess.kind, retryResult.bestGuess.id, true)
        return NextResponse.json({ ...execution.payload, retried: true, resolutionConfidence: retryResult.resolutionConfidence })
      }
      return NextResponse.json({
        ok: true,
        retried: true,
        canAutoResolve: retryResult.canAutoResolve,
        resolutionConfidence: retryResult.resolutionConfidence,
        results: retryResult.results,
        openUrl: retryResult.reviewOpenUrl,
        spokenResponse: retryResult.canAutoResolve
          ? 'Ho trovato un best guess forte dopo il retry.'
          : retryResult.results.length
            ? 'Ho aggiornato la review queue con i candidati più recenti.'
            : 'Non ho ancora trovato un record abbastanza affidabile.',
      })
    }

    if (mode === 'auto_resolve') {
      const item = await getShortcutReviewItem(itemId)
      if (!item?.bestGuessKind || !item.bestGuessEntityId) {
        return NextResponse.json({ ok: false, error: 'Nessun best guess disponibile per auto-resolve' }, { status: 400 })
      }
      if (item.resolutionConfidence !== 'high') {
        return NextResponse.json({ ok: false, error: 'Confidence non abbastanza alta per auto-resolve' }, { status: 400 })
      }
      const execution = await executeReviewItem(itemId, item.bestGuessKind, item.bestGuessEntityId, true)
      return NextResponse.json(execution.payload, { status: execution.status })
    }

    const entityType = String(body?.entityType || '').trim() as ShortcutEntityKind
    const entityId = String(body?.entityId || '').trim()
    if (!entityType || !entityId) {
      return NextResponse.json({ ok: false, error: 'Missing entityType/entityId' }, { status: 400 })
    }

    const execution = await executeReviewItem(itemId, entityType, entityId, false)
    return NextResponse.json(execution.payload, { status: execution.status })
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
