import { NextResponse } from 'next/server'
import { isAuthenticatedAppRequest, verifyShortcutToken } from '@/lib/shortcut/auth'
import {
  buildEntityHref,
  createShortcutActivity,
  createShortcutFollowup,
  createShortcutReviewItem,
  getShortcutContext,
  inferCallOutcome,
  resolveShortcutEntity,
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
    const kind = String(body?.kind || 'meeting').trim() as 'email' | 'meeting' | 'whatsapp' | 'note' | 'task_update' | 'status_change'
    const content = String(body?.content || body?.summary || body?.note || '').trim()
    const subject = String(body?.subject || (kind === 'email' ? 'Esito email' : kind === 'meeting' ? 'Esito meeting' : 'Interazione registrata')).trim()
    if (!content) {
      return NextResponse.json({ ok: false, error: 'Missing content' }, { status: 400 })
    }

    let resolvedEntityType = entityType
    if (!entityId && query) {
      const context = await getShortcutContext()
      const resolution = resolveShortcutEntity({ query, companies: context.companies, contacts: context.contacts, opportunities: context.opportunities, kind: entityType || undefined })
      if (resolution.status === 'missing') {
        const reviewItemId = await createShortcutReviewItem({
          actionKey: 'log_interaction',
          query,
          entityType: entityType || null,
          ambiguityReason: 'Nessun record trovato per interazione',
          payload: { entityType, query, kind, content, subject, happenedAt: body?.happenedAt ? String(body.happenedAt) : null, createFollowup: body?.createFollowup, followupTitle: body?.followupTitle, followupDate: body?.followupDate, priority: body?.priority },
          candidateResults: [],
        })
        return NextResponse.json({ ok: false, error: 'No matching record found', reviewItemId, spokenResponse: 'Non ho trovato il record giusto. Ho messo l’interazione nella review Siri di Quadra.', openUrl: toAbsoluteAppUrl('/capture/siri/review') }, { status: 404 })
      }
      if (resolution.status === 'ambiguous') {
        const reviewItemId = await createShortcutReviewItem({
          actionKey: 'log_interaction',
          query,
          entityType: entityType || null,
          ambiguityReason: 'Più record possibili per interazione',
          payload: { entityType, query, kind, content, subject, happenedAt: body?.happenedAt ? String(body.happenedAt) : null, createFollowup: body?.createFollowup, followupTitle: body?.followupTitle, followupDate: body?.followupDate, priority: body?.priority },
          candidateResults: resolution.results,
        })
        return NextResponse.json({ ok: true, needsConfirmation: true, reviewItemId, results: resolution.results, spokenResponse: 'Ho trovato più record possibili. Ho salvato tutto nella review Siri di Quadra.', openUrl: toAbsoluteAppUrl('/capture/siri/review') })
      }
      entityId = resolution.result.id
      resolvedEntityType = resolution.result.kind
    }

    if (!resolvedEntityType || !entityId) {
      return NextResponse.json({ ok: false, error: 'Missing entityType/entityId or query' }, { status: 400 })
    }

    const activityId = await createShortcutActivity({ entityType: resolvedEntityType, entityId, subject, content, kind, happenedAt: body?.happenedAt ? String(body.happenedAt) : null })
    const inference = inferCallOutcome(content)
    const requestedCreateFollowup = typeof body?.createFollowup === 'boolean' ? Boolean(body.createFollowup) : (kind === 'meeting' || kind === 'email') && inference.shouldCreateFollowup
    const followupTitle = String(body?.followupTitle || (kind === 'email' ? 'Seguire email' : kind === 'meeting' ? 'Follow-up meeting' : inference.suggestedFollowupTitle) || 'Follow-up da Siri').trim()
    const followupDate = String(body?.followupDate || inference.suggestedFollowupDate || '').trim()
    const priority = String(body?.priority || inference.suggestedPriority || 'medium').trim() as ShortcutPriority
    let createdFollowupId: string | null = null
    if (requestedCreateFollowup && followupDate) {
      createdFollowupId = await createShortcutFollowup({ entityType: resolvedEntityType, entityId, title: followupTitle, description: content, dueDate: followupDate, priority })
    }

    return NextResponse.json({
      ok: true,
      entityType: resolvedEntityType,
      entityId,
      activityId,
      createdFollowupId,
      followUpCreated: Boolean(createdFollowupId),
      inference,
      suggestedFollowup: { title: followupTitle, dueDate: followupDate || null, priority },
      openUrl: toAbsoluteAppUrl(buildEntityHref(resolvedEntityType, entityId)),
      spokenResponse: createdFollowupId ? 'Ho registrato l’interazione e ho creato anche il follow-up in Quadra.' : 'Ho registrato l’interazione in Quadra.',
    })
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
