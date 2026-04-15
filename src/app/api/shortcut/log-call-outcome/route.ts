import { NextResponse } from 'next/server'
import { isAuthenticatedAppRequest, verifyShortcutToken } from '@/lib/shortcut/auth'
import {
  buildCallOutcomeSpokenResponse,
  buildEntityHref,
  createShortcutActivity,
  createShortcutFollowup,
  createShortcutReviewItem,
  getShortcutContext,
  inferCallOutcome,
  resolveShortcutEntity,
  updateShortcutOpportunityStage,
  toAbsoluteAppUrl,
  type ShortcutEntityKind,
  type ShortcutPriority,
} from '@/lib/shortcut/quadra-shortcuts'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const authorizedShortcut = verifyShortcutToken(request, body?.shortcutToken)
    const authorizedApp = authorizedShortcut ? false : await isAuthenticatedAppRequest()
    if (!authorizedShortcut && !authorizedApp) {
      return NextResponse.json({ ok: false, error: 'Unauthorized shortcut request' }, { status: 401 })
    }

    const entityType = String(body?.entityType || '').trim() as ShortcutEntityKind
    let entityId = String(body?.entityId || '').trim()
    const query = String(body?.query || '').trim()
    const outcome = String(body?.outcome || body?.body || body?.note || '').trim()
    const subject = String(body?.subject || 'Esito chiamata').trim()
    const inference = inferCallOutcome(outcome)
    const requestedCreateFollowup = typeof body?.createFollowup === 'boolean' ? Boolean(body.createFollowup) : inference.shouldCreateFollowup
    const createFollowup = requestedCreateFollowup && inference.shouldCreateFollowup
    const followupTitle = String(body?.followupTitle || inference.suggestedFollowupTitle || 'Richiamo da Siri').trim()
    const followupDate = String(body?.followupDate || inference.suggestedFollowupDate || '').trim()
    const priority = String(body?.priority || inference.suggestedPriority || 'medium').trim() as ShortcutPriority

    if (!outcome) {
      return NextResponse.json({ ok: false, error: 'Missing outcome' }, { status: 400 })
    }

    let resolvedEntityType = entityType
    if (!entityId && query) {
      const context = await getShortcutContext()
      const resolution = resolveShortcutEntity({
        query,
        companies: context.companies,
        contacts: context.contacts,
        opportunities: context.opportunities,
        kind: entityType || undefined,
      })

      if (resolution.status === 'missing') {
        const reviewItemId = await createShortcutReviewItem({
          actionKey: 'log_call_outcome',
          query,
          entityType: entityType || null,
          ambiguityReason: 'Nessun record trovato per esito chiamata',
          payload: { entityType, query, outcome, subject, createFollowup, followupTitle, followupDate, priority },
          candidateResults: [],
        })
        return NextResponse.json(
          {
            ok: false,
            error: 'No matching record found',
            reviewItemId,
            spokenResponse: 'Non ho trovato il record giusto. Ho messo l’esito chiamata nella review Siri di Quadra.',
            openUrl: toAbsoluteAppUrl('/capture/siri/review'),
            inference,
          },
          { status: 404 },
        )
      }

      if (resolution.status === 'ambiguous') {
        const reviewItemId = await createShortcutReviewItem({
          actionKey: 'log_call_outcome',
          query,
          entityType: entityType || null,
          ambiguityReason: 'Più record possibili per esito chiamata',
          payload: { entityType, query, outcome, subject, createFollowup, followupTitle, followupDate, priority },
          candidateResults: resolution.results,
        })
        return NextResponse.json({
          ok: true,
          needsConfirmation: true,
          reviewItemId,
          results: resolution.results,
          spokenResponse: 'Ho trovato più record possibili. Ho salvato l’esito nella review Siri di Quadra.',
          openUrl: toAbsoluteAppUrl('/capture/siri/review'),
          inference,
        })
      }

      entityId = resolution.result.id
      resolvedEntityType = resolution.result.kind
    }

    if (!resolvedEntityType || !entityId) {
      return NextResponse.json({ ok: false, error: 'Missing entityType/entityId or query' }, { status: 400 })
    }

    const activityId = await createShortcutActivity({
      entityType: resolvedEntityType,
      entityId,
      subject,
      content: outcome,
      kind: 'call',
    })

    let createdFollowupId: string | null = null
    const stageSuggestion = resolvedEntityType === 'opportunity'
      ? await updateShortcutOpportunityStage(entityId, inference.classification)
      : { stage: null, changed: false }
    if (createFollowup && followupDate) {
      createdFollowupId = await createShortcutFollowup({
        entityType: resolvedEntityType,
        entityId,
        title: followupTitle,
        description: outcome,
        dueDate: followupDate,
        priority,
      })
    }

    const openUrl = toAbsoluteAppUrl(buildEntityHref(resolvedEntityType, entityId))
    const spokenResponse = buildCallOutcomeSpokenResponse({ createdFollowupId, inference, stageSuggestion })

    return NextResponse.json({
      ok: true,
      entityType: resolvedEntityType,
      entityId,
      activityId,
      createdFollowupId,
      followUpCreated: Boolean(createdFollowupId),
      openUrl,
      spokenResponse,
      inference,
      stageSuggestion,
      suggestedFollowup: {
        title: followupTitle,
        dueDate: followupDate || null,
        priority,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
