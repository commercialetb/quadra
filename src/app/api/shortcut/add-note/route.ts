import { NextResponse } from 'next/server'
import { isAuthenticatedAppRequest, verifyShortcutToken } from '@/lib/shortcut/auth'
import {
  buildEntityHref,
  createShortcutNote,
  createShortcutReviewItem,
  getShortcutContext,
  resolveShortcutEntity,
  toAbsoluteAppUrl,
} from '@/lib/shortcut/quadra-shortcuts'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const authorizedShortcut = verifyShortcutToken(request, body?.shortcutToken)
    const authorizedApp = authorizedShortcut ? false : await isAuthenticatedAppRequest()
    if (!authorizedShortcut && !authorizedApp) {
      return NextResponse.json({ ok: false, error: 'Unauthorized shortcut request' }, { status: 401 })
    }

    const entityType = String(body?.entityType || '').trim() as 'company' | 'contact' | 'opportunity'
    let entityId = String(body?.entityId || '').trim()
    const title = String(body?.title || 'Nota da Siri').trim()
    const bodyText = String(body?.body || body?.note || '').trim()
    const query = String(body?.query || '').trim()

    if (!bodyText) {
      return NextResponse.json({ ok: false, error: 'Missing body' }, { status: 400 })
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
          actionKey: 'add_note',
          query,
          entityType: entityType || null,
          ambiguityReason: 'Nessun record trovato',
          payload: { entityType, title, body: bodyText, query },
          candidateResults: [],
        })
        return NextResponse.json(
          {
            ok: false,
            error: 'No matching record found',
            reviewItemId,
            spokenResponse: 'Non ho trovato il record giusto. Ho messo la nota nella coda review di Siri in Quadra.',
            openUrl: toAbsoluteAppUrl('/capture/siri/review'),
          },
          { status: 404 },
        )
      }

      if (resolution.status === 'ambiguous') {
        const reviewItemId = await createShortcutReviewItem({
          actionKey: 'add_note',
          query,
          entityType: entityType || null,
          ambiguityReason: 'Più record possibili',
          payload: { entityType, title, body: bodyText, query },
          candidateResults: resolution.results,
        })
        return NextResponse.json({
          ok: true,
          needsConfirmation: true,
          reviewItemId,
          results: resolution.results,
          spokenResponse: 'Ho trovato più record possibili. Ho salvato tutto nella review Siri di Quadra.',
          openUrl: toAbsoluteAppUrl('/capture/siri/review'),
        })
      }

      entityId = resolution.result.id
      resolvedEntityType = resolution.result.kind
    }

    if (!resolvedEntityType || !entityId) {
      return NextResponse.json({ ok: false, error: 'Missing entityType/entityId or query' }, { status: 400 })
    }

    const noteId = await createShortcutNote({ entityType: resolvedEntityType, entityId, title, body: bodyText })
    return NextResponse.json({
      ok: true,
      noteId,
      entityType: resolvedEntityType,
      entityId,
      openUrl: toAbsoluteAppUrl(buildEntityHref(resolvedEntityType, entityId)),
      spokenResponse: 'Ho aggiunto la nota in Quadra.',
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
